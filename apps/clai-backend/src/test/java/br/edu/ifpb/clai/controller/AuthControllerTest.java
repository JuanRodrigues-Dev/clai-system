package br.edu.ifpb.clai.controller;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import br.edu.ifpb.clai.config.GlobalExceptionHandler;
import br.edu.ifpb.clai.config.SecurityConfig;
import br.edu.ifpb.clai.model.Usuario;
import br.edu.ifpb.clai.model.dto.TokenResponse;
import br.edu.ifpb.clai.repository.UsuarioRepository;
import br.edu.ifpb.clai.service.AuthService;
import br.edu.ifpb.clai.service.JwtService;
import java.lang.reflect.Field;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import tools.jackson.databind.ObjectMapper;

@WebMvcTest(controllers = AuthController.class)
@Import({SecurityConfig.class, AuthService.class, JwtService.class, GlobalExceptionHandler.class})
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private UsuarioRepository usuarioRepository;

    @Test
    void deveAutenticarComEmailESenhaERetornarTokenJwtValido() throws Exception {
        Usuario usuario = new Usuario("admin@ifpb.edu.br", passwordEncoder.encode("Senha123!"));
        when(usuarioRepository.findByEmail("admin@ifpb.edu.br")).thenReturn(Optional.of(usuario));

        MvcResult result = mockMvc.perform(post("/auth/login")
                        .header("X-API-Version", "1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"admin@ifpb.edu.br\",\"senha\":\"Senha123!\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andReturn();

        TokenResponse response = objectMapper.readValue(
                result.getResponse().getContentAsString(), TokenResponse.class);
        assertThat(jwtService.validarEExtrairSubject(response.token()))
                .contains("admin@ifpb.edu.br");
    }

    @Test
    void deveAutenticarComUsernameEPasswordDoFrontend() throws Exception {
        Usuario usuario = new Usuario("admin@ifpb.edu.br", passwordEncoder.encode("Senha123!"));
        when(usuarioRepository.findByEmail("admin@ifpb.edu.br")).thenReturn(Optional.of(usuario));

        mockMvc.perform(post("/auth/login")
                        .header("X-API-Version", "1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"username\":\"admin@ifpb.edu.br\",\"password\":\"Senha123!\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty());
    }

    @Test
    void deveRetornar401ProblemDetailQuandoEmailNaoExistir() throws Exception {
        when(usuarioRepository.findByEmail("inexistente@ifpb.edu.br")).thenReturn(Optional.empty());

        mockMvc.perform(post("/auth/login")
                        .header("X-API-Version", "1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"inexistente@ifpb.edu.br\",\"senha\":\"Senha123!\"}"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401))
                .andExpect(jsonPath("$.detail").value("Credenciais inválidas."))
                .andExpect(jsonPath("$.erro").value("Credenciais inválidas."));
    }

    @Test
    void deveRetornar401ProblemDetailQuandoSenhaEstiverIncorreta() throws Exception {
        Usuario usuario = new Usuario("admin@ifpb.edu.br", passwordEncoder.encode("SenhaCorreta!"));
        when(usuarioRepository.findByEmail("admin@ifpb.edu.br")).thenReturn(Optional.of(usuario));

        mockMvc.perform(post("/auth/login")
                        .header("X-API-Version", "1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"admin@ifpb.edu.br\",\"senha\":\"SenhaErrada\"}"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401))
                .andExpect(jsonPath("$.detail").value("Credenciais inválidas."))
                .andExpect(jsonPath("$.erro").value("Credenciais inválidas."));
    }

    @Test
    void deveRetornar401QuandoUsuarioEstiverInativo() throws Exception {
        Usuario usuarioInativo = new Usuario("inativo@ifpb.edu.br", passwordEncoder.encode("Senha123!"));
        Field campoAtivo = Usuario.class.getDeclaredField("ativo");
        campoAtivo.setAccessible(true);
        campoAtivo.set(usuarioInativo, false);

        when(usuarioRepository.findByEmail("inativo@ifpb.edu.br")).thenReturn(Optional.of(usuarioInativo));

        mockMvc.perform(post("/auth/login")
                        .header("X-API-Version", "1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"inativo@ifpb.edu.br\",\"senha\":\"Senha123!\"}"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401))
                .andExpect(jsonPath("$.detail").value("Credenciais inválidas."));
    }

    @Test
    void deveRejeitarTokenJwtAdulterado() {
        Usuario usuario = new Usuario("admin@ifpb.edu.br", passwordEncoder.encode("Senha123!"));
        String token = jwtService.gerarToken(usuario);
        String tokenAdulterado = token.substring(0, token.length() - 2) + "ab";

        assertThat(jwtService.validarEExtrairSubject(tokenAdulterado)).isEmpty();
    }

    @Test
    void deveRetornar400ProblemDetailParaBodyInvalidoSemMascararComo401() throws Exception {
        mockMvc.perform(post("/auth/login")
                        .header("X-API-Version", "1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"\",\"senha\":\"\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400));
    }

    @Test
    void deveRetornarCorpo401IdenticoSemRevelarSeUsuarioExiste() throws Exception {
        Usuario usuario = new Usuario("admin@ifpb.edu.br", passwordEncoder.encode("SenhaCorreta!"));
        when(usuarioRepository.findByEmail("admin@ifpb.edu.br")).thenReturn(Optional.of(usuario));
        when(usuarioRepository.findByEmail("inexistente@ifpb.edu.br")).thenReturn(Optional.empty());

        String respostaInexistente = mockMvc.perform(post("/auth/login")
                        .header("X-API-Version", "1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"inexistente@ifpb.edu.br\",\"senha\":\"SenhaQualquer\"}"))
                .andExpect(status().isUnauthorized())
                .andReturn()
                .getResponse()
                .getContentAsString();

        String respostaSenhaErrada = mockMvc.perform(post("/auth/login")
                        .header("X-API-Version", "1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"admin@ifpb.edu.br\",\"senha\":\"SenhaErrada\"}"))
                .andExpect(status().isUnauthorized())
                .andReturn()
                .getResponse()
                .getContentAsString();

        assertThat(respostaInexistente)
                .isEqualTo(respostaSenhaErrada)
                .doesNotContain("inexistente@ifpb.edu.br")
                .doesNotContain("admin@ifpb.edu.br");
    }
}
