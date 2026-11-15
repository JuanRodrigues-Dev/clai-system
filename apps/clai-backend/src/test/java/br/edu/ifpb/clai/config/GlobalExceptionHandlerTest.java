package br.edu.ifpb.clai.config;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import br.edu.ifpb.clai.service.JwtService;
import br.edu.ifpb.clai.service.exception.ConflitoDeDadosException;
import br.edu.ifpb.clai.service.exception.RecursoNaoEncontradoException;
import br.edu.ifpb.clai.service.exception.RegraDeNegocioException;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@WebMvcTest(controllers = GlobalExceptionHandlerTest.TestErrorController.class)
@Import({SecurityConfig.class, GlobalExceptionHandler.class, JwtAuthenticationFilter.class, JwtService.class,
        GlobalExceptionHandlerTest.TestErrorController.class})
@WithMockUser
class GlobalExceptionHandlerTest {

    @Autowired
    private MockMvc mockMvc;

    @RestController
    static class TestErrorController {
        @GetMapping("/test-errors/not-found")
        void notFound() {
            throw new RecursoNaoEncontradoException("Item não encontrado.");
        }

        @GetMapping("/test-errors/conflict")
        void conflict() {
            throw new ConflitoDeDadosException("Item duplicado.");
        }

        @GetMapping("/test-errors/business-rule")
        void businessRule() {
            throw new RegraDeNegocioException("Regra não atendida.");
        }

        @GetMapping("/test-errors/integrity")
        void integrity() {
            throw new DataIntegrityViolationException("constraint");
        }

        @GetMapping("/test-errors/bad-request")
        void badRequest() {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Requisição inválida.");
        }
    }

    @Test
    void deveSerializarProblemaDeRecursoNaoEncontrado() throws Exception {
        mockMvc.perform(get("/test-errors/not-found"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.title").value("Recurso não encontrado"))
                .andExpect(jsonPath("$.detail").value("Item não encontrado."))
                .andExpect(jsonPath("$.type").value("https://clai.ifpb.edu.br/erros/recurso-nao-encontrado"));
    }

    @Test
    void deveSerializarProblemaDeConflito() throws Exception {
        mockMvc.perform(get("/test-errors/conflict"))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.status").value(409))
                .andExpect(jsonPath("$.title").value("Conflito de dados"))
                .andExpect(jsonPath("$.detail").value("Item duplicado."));
    }

    @Test
    void deveSerializarProblemaDeRegraDeNegocioEIntegridade() throws Exception {
        mockMvc.perform(get("/test-errors/business-rule"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.title").value("Regra de negócio violada"));

        mockMvc.perform(get("/test-errors/integrity"))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.status").value(409))
                .andExpect(jsonPath("$.title").value("Conflito de integridade"));
    }

    @Test
    void deveSerializarErroDeRequisicaoComoProblemDetail() throws Exception {
        mockMvc.perform(get("/test-errors/bad-request"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.detail").value("Requisição inválida."));
    }
}
