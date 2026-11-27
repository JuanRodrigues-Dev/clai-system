package br.edu.ifpb.clai.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import br.edu.ifpb.clai.config.GlobalExceptionHandler;
import br.edu.ifpb.clai.config.JwtAuthenticationFilter;
import br.edu.ifpb.clai.config.SecurityConfig;
import br.edu.ifpb.clai.model.dto.AuditoriaLogResponse;
import br.edu.ifpb.clai.service.AuditoriaService;
import br.edu.ifpb.clai.service.JwtService;
import java.time.Instant;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(controllers = AuditoriaController.class)
@Import({SecurityConfig.class, GlobalExceptionHandler.class, JwtAuthenticationFilter.class, JwtService.class})
class AuditoriaControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private AuditoriaService auditoriaService;

    @Test
    @WithMockUser(roles = "ADMIN")
    void deveRetornarLogsPaginadosParaAdministrador() throws Exception {
        AuditoriaLogResponse log = new AuditoriaLogResponse(
                1L,
                Instant.parse("2026-11-26T15:00:00Z"),
                "clai@ifpb.edu.br",
                "LEITURA",
                "ESTUDANTE",
                "2024001",
                "127.0.0.1",
                "Operação: AlunoService.buscarPorMatricula");
        when(auditoriaService.listar(
                eq("clai@ifpb.edu.br"),
                eq("ESTUDANTE"),
                eq("LEITURA"),
                eq("2026-11-01"),
                eq("2026-11-30"),
                any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(log)));

        mockMvc.perform(get("/auditoria")
                        .header("X-API-Version", "1")
                        .param("usuarioEmail", "clai@ifpb.edu.br")
                        .param("recurso", "ESTUDANTE")
                        .param("acao", "LEITURA")
                        .param("inicio", "2026-11-01")
                        .param("fim", "2026-11-30"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].id").value(1))
                .andExpect(jsonPath("$.content[0].usuarioEmail").value("clai@ifpb.edu.br"))
                .andExpect(jsonPath("$.content[0].acao").value("LEITURA"))
                .andExpect(jsonPath("$.content[0].recurso").value("ESTUDANTE"));
    }

    @Test
    @WithMockUser(roles = "CLAI")
    void deveRetornar403QuandoUsuarioNaoForAdmin() throws Exception {
        mockMvc.perform(get("/auditoria").header("X-API-Version", "1"))
                .andExpect(status().isForbidden());

        verifyNoInteractions(auditoriaService);
    }

    @Test
    void deveRetornar401QuandoNaoAutenticado() throws Exception {
        mockMvc.perform(get("/auditoria").header("X-API-Version", "1"))
                .andExpect(status().isUnauthorized());

        verifyNoInteractions(auditoriaService);
    }
}
