package br.edu.ifpb.clai.controller;

import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import br.edu.ifpb.clai.config.GlobalExceptionHandler;
import br.edu.ifpb.clai.config.JwtAuthenticationFilter;
import br.edu.ifpb.clai.config.SecurityConfig;
import br.edu.ifpb.clai.model.dto.EstudoDeCasoResponse;
import br.edu.ifpb.clai.service.EstudoDeCasoService;
import br.edu.ifpb.clai.service.JwtService;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(controllers = EstudoDeCasoController.class)
@Import({SecurityConfig.class, GlobalExceptionHandler.class, JwtAuthenticationFilter.class, JwtService.class})
class EstudoDeCasoControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private EstudoDeCasoService estudoService;

    @Test
    @WithMockUser(roles = "PEDAGOGICO")
    void devePermitirConsultaDeEstudoDeCasoParaPerfilAutorizado() throws Exception {
        EstudoDeCasoResponse response = new EstudoDeCasoResponse(
                1L,
                UUID.randomUUID(),
                "2024001",
                "Estudante Teste",
                LocalDate.of(2026, 11, 10),
                "Equipe CLAI",
                null,
                null,
                null,
                null,
                null,
                true,
                false,
                null,
                null,
                Instant.now(),
                Instant.now());
        when(estudoService.buscarPorMatricula("2024001")).thenReturn(response);

        mockMvc.perform(get("/estudos-caso/aluno/2024001").header("X-API-Version", "1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.matriculaAluno").value("2024001"));
    }

    @Test
    @WithMockUser(roles = "PROFESSOR")
    void deveNegarCom403AcessoAoEstudoDeCasoParaDocente() throws Exception {
        mockMvc.perform(get("/estudos-caso/aluno/2024001").header("X-API-Version", "1"))
                .andExpect(status().isForbidden());

        verifyNoInteractions(estudoService);
    }
}
