package br.edu.ifpb.clai.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import br.edu.ifpb.clai.model.AuditoriaLog;
import br.edu.ifpb.clai.model.dto.AuditoriaLogResponse;
import br.edu.ifpb.clai.repository.AuditoriaLogRepository;
import br.edu.ifpb.clai.service.exception.RegraDeNegocioException;
import java.time.Instant;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;

class AuditoriaServiceTest {

    private AuditoriaLogRepository auditoriaLogRepository;
    private AuditoriaService auditoriaService;

    @BeforeEach
    void setUp() {
        auditoriaLogRepository = mock(AuditoriaLogRepository.class);
        auditoriaService = new AuditoriaService(auditoriaLogRepository);
    }

    @Test
    void deveRegistrarAuditoriaComUsuarioEAtributos() {
        auditoriaService.registrar(
                "clai@ifpb.edu.br",
                "LEITURA",
                "ESTUDANTE",
                "2024001",
                "10.0.0.1",
                "Operação: AlunoService.buscarPorMatricula");

        ArgumentCaptor<AuditoriaLog> captor = ArgumentCaptor.forClass(AuditoriaLog.class);
        verify(auditoriaLogRepository).save(captor.capture());

        AuditoriaLog salvo = captor.getValue();
        assertThat(salvo.getUsuarioEmail()).isEqualTo("clai@ifpb.edu.br");
        assertThat(salvo.getAcao()).isEqualTo("LEITURA");
        assertThat(salvo.getRecurso()).isEqualTo("ESTUDANTE");
        assertThat(salvo.getIdentificadorRecurso()).isEqualTo("2024001");
        assertThat(salvo.getIpOrigem()).isEqualTo("10.0.0.1");
        assertThat(salvo.getDetalhes()).contains("AlunoService.buscarPorMatricula");
    }

    @Test
    void deveUsarSistemaQuandoUsuarioEstiverEmBranco() {
        auditoriaService.registrar("  ", "CRIACAO", "PEI", "1", null, "detalhes");

        ArgumentCaptor<AuditoriaLog> captor = ArgumentCaptor.forClass(AuditoriaLog.class);
        verify(auditoriaLogRepository).save(captor.capture());
        assertThat(captor.getValue().getUsuarioEmail()).isEqualTo("sistema");
    }

    @Test
    @SuppressWarnings("unchecked")
    void deveConsultarRegistrosPaginadosComFiltros() {
        AuditoriaLog registro = new AuditoriaLog(
                Instant.parse("2026-11-26T12:00:00Z"),
                "admin@ifpb.edu.br",
                "CRIACAO",
                "PEI",
                "2024001",
                "127.0.0.1",
                "Operação: PeiService.criar");
        Pageable pageable = PageRequest.of(0, 20);
        when(auditoriaLogRepository.findAll(any(Specification.class), eq(pageable)))
                .thenReturn(new PageImpl<>(List.of(registro)));

        Page<AuditoriaLogResponse> pagina = auditoriaService.listar(
                "admin@ifpb.edu.br",
                "PEI",
                "CRIACAO",
                "2026-11-01",
                "2026-11-30",
                pageable);

        assertThat(pagina.getTotalElements()).isEqualTo(1);
        assertThat(pagina.getContent().getFirst().usuarioEmail()).isEqualTo("admin@ifpb.edu.br");
        assertThat(pagina.getContent().getFirst().recurso()).isEqualTo("PEI");
    }

    @Test
    void deveRejeitarIntervaloDeDatasInvalidoOuFormatoIncorreto() {
        Pageable pageable = PageRequest.of(0, 10);

        assertThatThrownBy(() -> auditoriaService.listar(
                null, null, null, "2026-11-20", "2026-11-10", pageable))
                .isInstanceOf(RegraDeNegocioException.class);

        assertThatThrownBy(() -> auditoriaService.listar(
                null, null, null, "data-invalida", null, pageable))
                .isInstanceOf(RegraDeNegocioException.class);
    }
}
