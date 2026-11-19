
package br.edu.ifpb.clai.controller;

import br.edu.ifpb.clai.config.GlobalExceptionHandler;
import br.edu.ifpb.clai.config.JwtAuthenticationFilter;
import br.edu.ifpb.clai.config.SecurityConfig;
import br.edu.ifpb.clai.model.dto.CursoRequest;
import br.edu.ifpb.clai.model.dto.CursoResponse;
import br.edu.ifpb.clai.model.dto.CursoUpdateStatusRequest;
import br.edu.ifpb.clai.service.CursoService;
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

@WebMvcTest(controllers = CursoController.class)
@Import({
    SecurityConfig.class,
    GlobalExceptionHandler.class,
    JwtAuthenticationFilter.class,
    JwtService.class
})
class CursoControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private CursoService cursoService;

    @Test
    @WithMockUser
    void deveListarCursosAtivosComSucesso() throws Exception {
        CursoResponse curso = cursoResponse();
        when(cursoService.listarAtivos()).thenReturn(List.of(curso));

        mockMvc.perform(get("/cursos")
                        .header("X-API-Version", "1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].nome").value("Análise e Desenvolvimento de Sistemas"));
    }

    @Test
    @WithMockUser
    void deveCadastrarCursoComSucessoERetornarLocation() throws Exception {
        CursoRequest request = request();
        when(cursoService.criar(any(CursoRequest.class))).thenReturn(cursoResponse());

        mockMvc.perform(post("/cursos")
                        .header("X-API-Version", "1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(header().string(
                    "Location",
                    org.hamcrest.Matchers.endsWith("/cursos/1")
                ))
                .andExpect(jsonPath("$.nome").value("Análise e Desenvolvimento de Sistemas"));
    }

    @Test
    @WithMockUser
    void deveRetornar400QuandoPayloadForInvalido() throws Exception {
        CursoRequest request = new CursoRequest("", "");

        mockMvc.perform(post("/cursos")
                        .header("X-API-Version", "1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400));
    }

    @Test
    @WithMockUser
    void deveRetornar409QuandoCursoJaExistir() throws Exception {
        when(cursoService.criar(any(CursoRequest.class)))
                .thenThrow(new ConflitoDeDadosException(
                    "Já existe um curso cadastrado com este nome."
                ));

        mockMvc.perform(post("/cursos")
                        .header("X-API-Version", "1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request())))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.status").value(409));
    }

    @Test
    @WithMockUser
    void deveBuscarCursoPorIdComSucesso() throws Exception {
        when(cursoService.buscarPorId(1L)).thenReturn(cursoResponse());

        mockMvc.perform(get("/cursos/1")
                        .header("X-API-Version", "1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.ativo").value(true));
    }

    @Test
    @WithMockUser
    void deveRetornar404QuandoCursoNaoForEncontrado() throws Exception {
        when(cursoService.buscarPorId(99L))
                .thenThrow(new RecursoNaoEncontradoException(
                    "Curso não encontrado ou inativo."
                ));

        mockMvc.perform(get("/cursos/99")
                        .header("X-API-Version", "1"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404));
    }

    @Test
    @WithMockUser
    void deveAtualizarCursoComSucesso() throws Exception {
        CursoResponse atualizado = new CursoResponse(
            1L,
            "Sistemas de Informação",
            "Graduação",
            true,
            Instant.now()
        );

        when(cursoService.atualizar(eq(1L), any(CursoRequest.class)))
                .thenReturn(atualizado);

        mockMvc.perform(put("/cursos/1")
                        .header("X-API-Version", "1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nome").value("Sistemas de Informação"));
    }

    @Test
    @WithMockUser
    void deveAtualizarStatusDoCursoComSucesso() throws Exception {
        CursoUpdateStatusRequest request = new CursoUpdateStatusRequest(false);
        doNothing().when(cursoService)
                .atualizarStatus(eq(1L), any(CursoUpdateStatusRequest.class));

        mockMvc.perform(patch("/cursos/1")
                        .header("X-API-Version", "1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isNoContent());
    }

    @Test
    @WithMockUser
    void deveRetornar404AoAtualizarStatusDeCursoInexistente() throws Exception {
        CursoUpdateStatusRequest request = new CursoUpdateStatusRequest(false);

        doThrow(new RecursoNaoEncontradoException("Curso não encontrado."))
                .when(cursoService)
                .atualizarStatus(eq(99L), any(CursoUpdateStatusRequest.class));

        mockMvc.perform(patch("/cursos/99")
                        .header("X-API-Version", "1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404));
    }

    private static CursoRequest request() {
        return new CursoRequest(
            "Análise e Desenvolvimento de Sistemas",
            "Graduação"
        );
    }

    private static CursoResponse cursoResponse() {
        return new CursoResponse(
            1L,
            "Análise e Desenvolvimento de Sistemas",
            "Graduação",
            true,
            Instant.now()
        );
    }
}
