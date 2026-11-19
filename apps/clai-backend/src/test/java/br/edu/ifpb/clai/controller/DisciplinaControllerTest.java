
package br.edu.ifpb.clai.controller;

import br.edu.ifpb.clai.config.GlobalExceptionHandler;
import br.edu.ifpb.clai.config.JwtAuthenticationFilter;
import br.edu.ifpb.clai.config.SecurityConfig;
import br.edu.ifpb.clai.model.dto.DisciplinaRequest;
import br.edu.ifpb.clai.model.dto.DisciplinaResponse;
import br.edu.ifpb.clai.model.dto.DisciplinaUpdateStatusRequest;
import br.edu.ifpb.clai.service.DisciplinaService;
import br.edu.ifpb.clai.service.JwtService;
import br.edu.ifpb.clai.service.exception.ConflitoDeDadosException;
import br.edu.ifpb.clai.service.exception.RecursoNaoEncontradoException;
import java.time.Instant;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import tools.jackson.databind.ObjectMapper;

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

@WebMvcTest(controllers = DisciplinaController.class)
@Import({
    SecurityConfig.class,
    GlobalExceptionHandler.class,
    JwtAuthenticationFilter.class,
    JwtService.class
})
class DisciplinaControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private DisciplinaService disciplinaService;

    @Test
    @WithMockUser
    void deveListarDisciplinasAtivasComSucesso() throws Exception {
        when(disciplinaService.listarAtivas())
                .thenReturn(List.of(disciplinaResponse()));

        mockMvc.perform(get("/disciplinas")
                        .header("X-API-Version", "1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].nome").value("Programação"));
    }

    @Test
    @WithMockUser
    void deveCadastrarDisciplinaComSucessoERetornarLocation() throws Exception {
        when(disciplinaService.criar(any(DisciplinaRequest.class)))
                .thenReturn(disciplinaResponse());

        mockMvc.perform(post("/disciplinas")
                        .header("X-API-Version", "1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request())))
                .andExpect(status().isCreated())
                .andExpect(header().string(
                    "Location",
                    org.hamcrest.Matchers.endsWith("/disciplinas/1")
                ))
                .andExpect(jsonPath("$.nome").value("Programação"));
    }

    @Test
    @WithMockUser
    void deveRetornar400QuandoPayloadForInvalido() throws Exception {
        DisciplinaRequest request = new DisciplinaRequest(
            "", null, 0, 0, null
        );

        mockMvc.perform(post("/disciplinas")
                        .header("X-API-Version", "1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400));
    }

    @Test
    @WithMockUser
    void deveRetornar409QuandoDisciplinaJaExistirNoCurso() throws Exception {
        when(disciplinaService.criar(any(DisciplinaRequest.class)))
                .thenThrow(new ConflitoDeDadosException(
                    "Já existe uma disciplina com este nome neste curso."
                ));

        mockMvc.perform(post("/disciplinas")
                        .header("X-API-Version", "1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request())))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.status").value(409));
    }

    @Test
    @WithMockUser
    void deveListarDisciplinasPorCursoComSucesso() throws Exception {
        when(disciplinaService.listarPorCurso(1L))
                .thenReturn(List.of(disciplinaResponse()));

        mockMvc.perform(get("/disciplinas/curso/1")
                        .header("X-API-Version", "1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].cursoId").value(1));
    }

    @Test
    @WithMockUser
    void deveBuscarDisciplinaPorIdComSucesso() throws Exception {
        when(disciplinaService.buscarPorId(1L))
                .thenReturn(disciplinaResponse());

        mockMvc.perform(get("/disciplinas/1")
                        .header("X-API-Version", "1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.nome").value("Programação"));
    }

    @Test
    @WithMockUser
    void deveRetornar404QuandoDisciplinaNaoForEncontrada() throws Exception {
        when(disciplinaService.buscarPorId(99L))
                .thenThrow(new RecursoNaoEncontradoException(
                    "Disciplina não encontrada ou inativa."
                ));

        mockMvc.perform(get("/disciplinas/99")
                        .header("X-API-Version", "1"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404));
    }

    @Test
    @WithMockUser
    void deveAtualizarDisciplinaComSucesso() throws Exception {
        DisciplinaResponse atualizada = new DisciplinaResponse(
            1L, "Banco de Dados", "BD01", 2, 60,
            1L, "ADS", true, Instant.now()
        );

        when(disciplinaService.atualizar(eq(1L), any(DisciplinaRequest.class)))
                .thenReturn(atualizada);

        mockMvc.perform(put("/disciplinas/1")
                        .header("X-API-Version", "1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nome").value("Banco de Dados"));
    }

    @Test
    @WithMockUser
    void deveAtualizarStatusDaDisciplinaComSucesso() throws Exception {
        DisciplinaUpdateStatusRequest request =
                new DisciplinaUpdateStatusRequest(false);

        doNothing().when(disciplinaService)
                .atualizarStatus(eq(1L), any(DisciplinaUpdateStatusRequest.class));

        mockMvc.perform(patch("/disciplinas/1")
                        .header("X-API-Version", "1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isNoContent());
    }

    @Test
    @WithMockUser
    void deveRetornar404AoAtualizarStatusDeDisciplinaInexistente() throws Exception {
        DisciplinaUpdateStatusRequest request =
                new DisciplinaUpdateStatusRequest(false);

        doThrow(new RecursoNaoEncontradoException("Disciplina não encontrada."))
                .when(disciplinaService)
                .atualizarStatus(eq(99L), any(DisciplinaUpdateStatusRequest.class));

        mockMvc.perform(patch("/disciplinas/99")
                        .header("X-API-Version", "1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404));
    }

    private static DisciplinaRequest request() {
        return new DisciplinaRequest(
            "Programação", "PRG01", 1, 60, 1L
        );
    }

    private static DisciplinaResponse disciplinaResponse() {
        return new DisciplinaResponse(
            1L,
            "Programação",
            "PRG01",
            1,
            60,
            1L,
            "ADS",
            true,
            Instant.now()
        );
    }
}
