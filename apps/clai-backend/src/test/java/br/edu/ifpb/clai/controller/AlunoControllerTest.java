package br.edu.ifpb.clai.controller;

import br.edu.ifpb.clai.config.GlobalExceptionHandler;
import br.edu.ifpb.clai.config.JwtAuthenticationFilter;
import br.edu.ifpb.clai.config.SecurityConfig;
import br.edu.ifpb.clai.model.dto.AlunoRequest;
import br.edu.ifpb.clai.model.dto.AlunoResponse;
import br.edu.ifpb.clai.model.dto.AlunoUpdateRequest;
import br.edu.ifpb.clai.model.dto.AlunoUpdateStatusRequest;
import br.edu.ifpb.clai.service.AlunoService;
import br.edu.ifpb.clai.service.JwtService;
import br.edu.ifpb.clai.service.exception.ConflitoDeDadosException;
import br.edu.ifpb.clai.service.exception.RecursoNaoEncontradoException;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import tools.jackson.databind.ObjectMapper;

import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = AlunoController.class)
@Import({SecurityConfig.class, GlobalExceptionHandler.class, JwtAuthenticationFilter.class, JwtService.class})
class AlunoControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private AlunoService alunoService;

    @Test
    @WithMockUser
    void deveListarAlunosComSucessoSemHeaderDeVersaoUsandoDefault() throws Exception {
        AlunoResponse aluno = new AlunoResponse(UUID.randomUUID(), "2024001", "João Silva", "TSI", "Demanda espontânea", java.time.Instant.now(), true);
        when(alunoService.listarAtivos(any(Pageable.class))).thenReturn(new PageImpl<>(List.of(aluno)));

        mockMvc.perform(get("/alunos"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].matricula").value("2024001"))
                .andExpect(jsonPath("$.content[0].nome").value("João Silva"));
    }

    @Test
    @WithMockUser
    void deveListarAlunosComHeaderXApiVersionExplicitandoVersao1() throws Exception {
        AlunoResponse aluno = new AlunoResponse(UUID.randomUUID(), "2024002", "Maria Santos", "Engenharia", "Coordenação", java.time.Instant.now(), true);
        when(alunoService.listarAtivos(any(Pageable.class))).thenReturn(new PageImpl<>(List.of(aluno)));

        mockMvc.perform(get("/alunos")
                        .header("X-API-Version", "1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].matricula").value("2024002"))
                .andExpect(jsonPath("$.content[0].nome").value("Maria Santos"));
    }

    @Test
    @WithMockUser
    void deveCadastrarAlunoComSucessoERetornarLocationNoPlural() throws Exception {
        AlunoRequest request = new AlunoRequest("2024003", "Carlos Lima", "Edificações", "Professor");
        AlunoResponse response = new AlunoResponse(UUID.randomUUID(), "2024003", "Carlos Lima", "Edificações", "Professor", java.time.Instant.now(), true);
        when(alunoService.criar(any(AlunoRequest.class))).thenReturn(response);

        mockMvc.perform(post("/alunos")
                        .header("X-API-Version", "1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(header().string("Location", org.hamcrest.Matchers.endsWith("/alunos/2024003")))
                .andExpect(jsonPath("$.matricula").value("2024003"))
                .andExpect(jsonPath("$.nome").value("Carlos Lima"));
    }

    @Test
    @WithMockUser
    void deveRetornar400ProblemDetailQuandoPayloadForInvalido() throws Exception {
        AlunoRequest requestInvalido = new AlunoRequest("", "", "", "");

        mockMvc.perform(post("/alunos")
                        .header("X-API-Version", "1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestInvalido)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.title").isNotEmpty());
    }

    @Test
    @WithMockUser
    void deveRetornar409ProblemDetailQuandoMatriculaJaExistir() throws Exception {
        AlunoRequest request = new AlunoRequest("2024001", "João Repetido", "TSI", "Demanda espontânea");
        when(alunoService.criar(any(AlunoRequest.class)))
                .thenThrow(new ConflitoDeDadosException("Já existe um aluno cadastrado com esta matrícula."));

        mockMvc.perform(post("/alunos")
                        .header("X-API-Version", "1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.status").value(409))
                .andExpect(jsonPath("$.title").value("Conflito de dados"))
                .andExpect(jsonPath("$.detail").value("Já existe um aluno cadastrado com esta matrícula."));
    }

    @Test
    @WithMockUser
    void deveBuscarAlunoPorMatriculaComSucesso() throws Exception {
        AlunoResponse aluno = new AlunoResponse(UUID.randomUUID(), "2024001", "João Silva", "TSI", "Demanda espontânea", java.time.Instant.now(), true);
        when(alunoService.buscarPorMatricula("2024001")).thenReturn(aluno);

        mockMvc.perform(get("/alunos/2024001")
                        .header("X-API-Version", "1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.matricula").value("2024001"));
    }

    @Test
    @WithMockUser
    void deveRetornar404ProblemDetailQuandoAlunoNaoForEncontrado() throws Exception {
        when(alunoService.buscarPorMatricula("999999"))
                .thenThrow(new RecursoNaoEncontradoException("Aluno não encontrado ou inativo."));

        mockMvc.perform(get("/alunos/999999")
                        .header("X-API-Version", "1"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.title").value("Recurso não encontrado"))
                .andExpect(jsonPath("$.detail").value("Aluno não encontrado ou inativo."));
    }

    @Test
    @WithMockUser
    void deveAtualizarAlunoComSucesso() throws Exception {
        AlunoUpdateRequest updateRequest = new AlunoUpdateRequest("João Silva Atualizado", "TSI Atualizado", "Coordenação");
        AlunoResponse response = new AlunoResponse(UUID.randomUUID(), "2024001", "João Silva Atualizado", "TSI Atualizado", "Coordenação", java.time.Instant.now(), true);
        when(alunoService.atualizar(eq("2024001"), any(AlunoUpdateRequest.class))).thenReturn(response);

        mockMvc.perform(put("/alunos/2024001")
                        .header("X-API-Version", "1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nome").value("João Silva Atualizado"));
    }

    @Test
    @WithMockUser
    void deveAtualizarStatusComSucessoRetornando204NoContent() throws Exception {
        AlunoUpdateStatusRequest statusRequest = new AlunoUpdateStatusRequest(false);
        doNothing().when(alunoService).atualizarStatus(eq("2024001"), any(AlunoUpdateStatusRequest.class));

        mockMvc.perform(patch("/alunos/2024001")
                        .header("X-API-Version", "1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(statusRequest)))
                .andExpect(status().isNoContent());
    }

    @Test
    @WithMockUser
    void deveRetornar404ProblemDetailAoAtualizarStatusDeAlunoInexistente() throws Exception {
        AlunoUpdateStatusRequest statusRequest = new AlunoUpdateStatusRequest(false);
        doThrow(new RecursoNaoEncontradoException("Aluno não encontrado."))
                .when(alunoService).atualizarStatus(eq("999999"), any(AlunoUpdateStatusRequest.class));

        mockMvc.perform(patch("/alunos/999999")
                        .header("X-API-Version", "1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(statusRequest)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.title").value("Recurso não encontrado"))
                .andExpect(jsonPath("$.detail").value("Aluno não encontrado."));
    }
}
