package br.edu.ifpb.clai.config;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import br.edu.ifpb.clai.model.Usuario;
import br.edu.ifpb.clai.service.JwtService;
import java.security.Principal;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.ResponseEntity;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@WebMvcTest(controllers = JwtAuthenticationFilterTest.ProtectedTestController.class)
@Import({SecurityConfig.class, JwtAuthenticationFilterTest.ProtectedTestController.class})
class JwtAuthenticationFilterTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JwtService jwtService;

    @RestController
    static class ProtectedTestController {

        @GetMapping("/v1/aluno")
        ResponseEntity<String> listarAlunos(Principal principal) {
            return ResponseEntity.ok(principal.getName());
        }
    }

    @Test
    void devePermitirAcessoARotaProtegidaComTokenBearerValido() throws Exception {
        Usuario usuario = new Usuario("admin@ifpb.edu.br", "hash-bcrypt");
        String token = jwtService.gerarToken(usuario);

        MvcResult result = mockMvc.perform(get("/v1/aluno")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(content().string("admin@ifpb.edu.br"))
                .andReturn();

        assertThat(result.getRequest().getSession(false)).isNull();
    }

    @Test
    void deveRejeitarCom401RotaProtegidaSemCabecalhoAuthorization() throws Exception {
        mockMvc.perform(get("/v1/aluno"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void deveRejeitarCom401RotaProtegidaComTokenBearerInvalido() throws Exception {
        mockMvc.perform(get("/v1/aluno")
                        .header("Authorization", "Bearer token.invalido.adulterado"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void deveRejeitarCom401RotaProtegidaComEsquemaDiferenteDeBearer() throws Exception {
        mockMvc.perform(get("/v1/aluno")
                        .header("Authorization", "Basic YWRtaW46MTIzNDU2"))
                .andExpect(status().isUnauthorized());
    }
}
