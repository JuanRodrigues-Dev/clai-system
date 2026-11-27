package br.edu.ifpb.clai.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import br.edu.ifpb.clai.config.GlobalExceptionHandler;
import br.edu.ifpb.clai.config.JwtAuthenticationFilter;
import br.edu.ifpb.clai.config.SecurityConfig;
import br.edu.ifpb.clai.model.StatusAcompanhamento;
import br.edu.ifpb.clai.model.dto.AcompanhamentoRequest;
import br.edu.ifpb.clai.model.dto.AcompanhamentoResponse;
import br.edu.ifpb.clai.model.dto.AcompanhamentoUpdateRequest;
import br.edu.ifpb.clai.service.AcompanhamentoService;
import br.edu.ifpb.clai.service.JwtService;
import br.edu.ifpb.clai.service.exception.RecursoNaoEncontradoException;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import tools.jackson.databind.ObjectMapper;

@WebMvcTest(controllers = AcompanhamentoController.class)
@Import({SecurityConfig.class, GlobalExceptionHandler.class, JwtAuthenticationFilter.class, JwtService.class})
class AcompanhamentoControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private AcompanhamentoService acompanhamentoService;

    @Test
    @WithMockUser(roles = "CLAI")
    void deveCriarAcompanhamentoEUsarVersaoPadraoDoHeader() throws Exception {
        when(acompanhamentoService.criar(any(AcompanhamentoRequest.class))).thenReturn(response());

        mockMvc.perform(post("/acompanhamentos")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request())))
                .andExpect(status().isCreated())
                .andExpect(header().string("Location", org.hamcrest.Matchers.endsWith("/acompanhamentos/aluno/2024001")))
                .andExpect(jsonPath("$.matriculaAluno").value("2024001"))
                .andExpect(jsonPath("$.status").value("EM_ANDAMENTO"));
    }

    @Test
    @WithMockUser(roles = "CLAI")
    void deveRetornar400ProblemDetailParaPayloadInvalido() throws Exception {
        AcompanhamentoRequest requestInvalido = new AcompanhamentoRequest("", null, null, "", "", "", null);

        mockMvc.perform(post("/acompanhamentos")
                        .header("X-API-Version", "1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestInvalido)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.title").isNotEmpty());
    }

    @Test
    @WithMockUser(roles = "PEDAGOGICO")
    void deveBuscarPorMatriculaComVersaoExplicitaNoHeader() throws Exception {
        when(acompanhamentoService.buscarPorMatriculaAluno("2024001")).thenReturn(response());

        mockMvc.perform(get("/acompanhamentos/aluno/2024001").header("X-API-Version", "1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nomeAluno").value("Estudante de Teste"));
    }

    @Test
    @WithMockUser(roles = "PROFESSOR")
    void deveRetornar403QuandoUsuarioNaoPossuirRoleAutorizada() throws Exception {
        mockMvc.perform(get("/acompanhamentos/aluno/2024001").header("X-API-Version", "1"))
                .andExpect(status().isForbidden());

        verifyNoInteractions(acompanhamentoService);
    }

    @Test
    @WithMockUser(roles = "CLAI")
    void deveRetornar404ProblemDetailQuandoAcompanhamentoNaoExistir() throws Exception {
        when(acompanhamentoService.buscarPorMatriculaAluno("999999"))
                .thenThrow(new RecursoNaoEncontradoException("Acompanhamento não encontrado para a matrícula informada."));

        mockMvc.perform(get("/acompanhamentos/aluno/999999").header("X-API-Version", "1"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.title").value("Recurso não encontrado"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void deveAtualizarAcompanhamentoComVersaoExplicitaNoHeader() throws Exception {
        AcompanhamentoUpdateRequest request = new AcompanhamentoUpdateRequest(
                StatusAcompanhamento.PAUSADO, LocalDate.of(2026, 2, 1), "Mensal", "Equipe CLAI", "Objetivos", null);
        when(acompanhamentoService.atualizar(eq(10L), any(AcompanhamentoUpdateRequest.class))).thenReturn(response());

        mockMvc.perform(put("/acompanhamentos/10")
                        .header("X-API-Version", "1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(10));
    }

    private static AcompanhamentoRequest request() {
        return new AcompanhamentoRequest("2024001", null, null, "Semanal", "Equipe CLAI", "Acompanhar adaptação", null);
    }

    private static AcompanhamentoResponse response() {
        return new AcompanhamentoResponse(10L, UUID.randomUUID(), "2024001", "Estudante de Teste",
                StatusAcompanhamento.EM_ANDAMENTO, LocalDate.of(2026, 1, 1), "Semanal", "Equipe CLAI",
                "Acompanhar adaptação", null, Instant.parse("2026-01-01T00:00:00Z"), Instant.parse("2026-01-01T00:00:00Z"));
    }
}
