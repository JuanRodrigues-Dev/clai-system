package br.edu.ifpb.clai.config;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import br.edu.ifpb.clai.model.Usuario;
import br.edu.ifpb.clai.model.dto.UsuarioResponse;
import jakarta.servlet.RequestDispatcher;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;
import tools.jackson.databind.ObjectMapper;

@WebMvcTest(controllers = SecurityConfigTest.TestEndpointsController.class)
@Import({SecurityConfig.class, SecurityConfigTest.TestEndpointsController.class})
class SecurityConfigTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private ObjectMapper objectMapper;

    @RestController
    static class TestEndpointsController {

        @PostMapping("/v1/auth")
        ResponseEntity<Void> publicAuth() {
            return ResponseEntity.ok().build();
        }

        @GetMapping("/actuator/health")
        ResponseEntity<String> publicHealth() {
            return ResponseEntity.ok("UP");
        }

        @GetMapping("/alunos")
        ResponseEntity<Void> protectedEndpoint() {
            return ResponseEntity.ok().build();
        }

        @GetMapping("/alunos/bad-request")
        ResponseEntity<Void> protectedBadRequestEndpoint() {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Dados inválidos");
        }

        @GetMapping("/alunos/not-found")
        ResponseEntity<Void> protectedNotFoundEndpoint() {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Recurso não encontrado");
        }

        @GetMapping("/alunos/conflict")
        ResponseEntity<Void> protectedConflictEndpoint() {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Recurso já existente");
        }
    }

    @Test
    void deveConfigurarBCryptPasswordEncoder() {
        assertThat(passwordEncoder).isInstanceOf(BCryptPasswordEncoder.class);

        String hash = passwordEncoder.encode("SenhaForte123!");
        assertThat(hash).isNotEqualTo("SenhaForte123!");
        assertThat(passwordEncoder.matches("SenhaForte123!", hash)).isTrue();
        assertThat(passwordEncoder.matches("OutraSenha", hash)).isFalse();
    }

    @Test
    void devePermitirAcessoPublicoAoEndpointDeAuthSemCsrfESemSessao() throws Exception {
        MvcResult result = mockMvc.perform(post("/v1/auth")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"admin@ifpb.edu.br\",\"senha\":\"123456\"}"))
                .andExpect(status().isOk())
                .andReturn();

        assertThat(result.getRequest().getSession(false)).isNull();
    }

    @Test
    void devePermitirAcessoPublicoAoActuatorHealth() throws Exception {
        mockMvc.perform(get("/actuator/health"))
                .andExpect(status().isOk());
    }

    @Test
    void devePermitirAcessoPublicoAoEndpointDeError() throws Exception {
        mockMvc.perform(get("/error")
                        .requestAttr(RequestDispatcher.ERROR_STATUS_CODE, 404))
                .andExpect(status().isNotFound());

        mockMvc.perform(get("/error")
                        .requestAttr(RequestDispatcher.ERROR_STATUS_CODE, 400))
                .andExpect(status().isBadRequest());

        mockMvc.perform(get("/error")
                        .requestAttr(RequestDispatcher.ERROR_STATUS_CODE, 409))
                .andExpect(status().isConflict());
    }

    @Test
    void deveRetornar401EmRotaProtegidaSemAutenticacao() throws Exception {
        MvcResult result = mockMvc.perform(get("/alunos"))
                .andExpect(status().isUnauthorized())
                .andReturn();

        assertThat(result.getRequest().getSession(false)).isNull();
    }

    @Test
    @WithMockUser
    void devePreservarCodigosDeErroOriginalEmRotasProtegidasAutenticadas() throws Exception {
        mockMvc.perform(get("/alunos/bad-request"))
                .andExpect(status().isBadRequest());

        mockMvc.perform(get("/alunos/not-found"))
                .andExpect(status().isNotFound());

        mockMvc.perform(get("/alunos/conflict"))
                .andExpect(status().isConflict());
    }

    @Test
    void deveConfigurarCorsRestringindoOrigensEBloqueandoAllowCredentialsComWildcard() throws Exception {
        mockMvc.perform(options("/v1/auth")
                        .header("Origin", "http://localhost:5173")
                        .header("Access-Control-Request-Method", "POST"))
                .andExpect(status().isOk())
                .andExpect(header().string("Access-Control-Allow-Origin", "http://localhost:5173"))
                .andExpect(header().doesNotExist("Access-Control-Allow-Credentials"));

        mockMvc.perform(options("/v1/auth")
                        .header("Origin", "http://malicious-site.com")
                        .header("Access-Control-Request-Method", "POST"))
                .andExpect(header().doesNotExist("Access-Control-Allow-Origin"));
    }

    @Test
    void deveOmitirSenhaNaSerializacaoDeUsuarioEUsuarioResponse() throws Exception {
        String hash = passwordEncoder.encode("Segredo123!");
        Usuario usuario = new Usuario("admin@ifpb.edu.br", hash);
        UsuarioResponse response = UsuarioResponse.from(usuario);

        String jsonEntidade = objectMapper.writeValueAsString(usuario);
        String jsonDto = objectMapper.writeValueAsString(response);

        assertThat(jsonEntidade)
                .contains("admin@ifpb.edu.br")
                .doesNotContain("senhaHash")
                .doesNotContain("senha_hash")
                .doesNotContain(hash);

        assertThat(jsonDto)
                .contains("admin@ifpb.edu.br")
                .doesNotContain("senha")
                .doesNotContain(hash);
    }
}
