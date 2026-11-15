package br.edu.ifpb.clai.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import br.edu.ifpb.clai.model.Acompanhamento;
import br.edu.ifpb.clai.model.Aluno;
import br.edu.ifpb.clai.model.StatusAcompanhamento;
import br.edu.ifpb.clai.model.dto.AcompanhamentoRequest;
import br.edu.ifpb.clai.model.dto.AcompanhamentoUpdateRequest;
import br.edu.ifpb.clai.repository.AcompanhamentoRepository;
import br.edu.ifpb.clai.repository.AlunoRepository;
import br.edu.ifpb.clai.service.exception.ConflitoDeDadosException;
import br.edu.ifpb.clai.service.exception.RecursoNaoEncontradoException;
import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class AcompanhamentoServiceTest {

    @Mock
    private AcompanhamentoRepository acompanhamentoRepository;

    @Mock
    private AlunoRepository alunoRepository;

    @InjectMocks
    private AcompanhamentoService acompanhamentoService;

    @Test
    void deveCriarAcompanhamentoComValoresPadraoEAssociarAluno() {
        Aluno aluno = aluno();
        when(alunoRepository.findByMatriculaAndAtivoTrue(aluno.getMatricula())).thenReturn(Optional.of(aluno));
        when(acompanhamentoRepository.existsByAlunoId(aluno.getId())).thenReturn(false);
        when(acompanhamentoRepository.save(any(Acompanhamento.class))).thenAnswer(invocation -> {
            Acompanhamento salvo = invocation.getArgument(0);
            salvo.setId(10L);
            return salvo;
        });

        var response = acompanhamentoService.criar(request());

        ArgumentCaptor<Acompanhamento> captor = ArgumentCaptor.forClass(Acompanhamento.class);
        verify(acompanhamentoRepository).save(captor.capture());
        assertEquals(aluno, captor.getValue().getAluno());
        assertEquals(StatusAcompanhamento.EM_ANDAMENTO, response.status());
        assertNotNull(response.dataInicio());
        assertEquals(aluno.getMatricula(), response.matriculaAluno());
    }

    @Test
    void deveRejeitarCriacaoQuandoAlunoNaoExisteOuEstaInativo() {
        when(alunoRepository.findByMatriculaAndAtivoTrue("2024001")).thenReturn(Optional.empty());

        assertThrows(RecursoNaoEncontradoException.class, () -> acompanhamentoService.criar(request()));

        verify(acompanhamentoRepository, never()).save(any());
    }

    @Test
    void deveRejeitarSegundoAcompanhamentoParaMesmoAluno() {
        Aluno aluno = aluno();
        when(alunoRepository.findByMatriculaAndAtivoTrue(aluno.getMatricula())).thenReturn(Optional.of(aluno));
        when(acompanhamentoRepository.existsByAlunoId(aluno.getId())).thenReturn(true);

        assertThrows(ConflitoDeDadosException.class, () -> acompanhamentoService.criar(request()));

        verify(acompanhamentoRepository, never()).save(any());
    }

    @Test
    void deveRetornarAcompanhamentoAtualizado() {
        Acompanhamento acompanhamento = acompanhamento();
        when(acompanhamentoRepository.findById(10L)).thenReturn(Optional.of(acompanhamento));
        when(acompanhamentoRepository.save(acompanhamento)).thenReturn(acompanhamento);
        AcompanhamentoUpdateRequest request = new AcompanhamentoUpdateRequest(
                StatusAcompanhamento.PAUSADO, LocalDate.of(2026, 2, 1),
                "Mensal", "Equipe CLAI", "Revisar objetivos", "Revisão solicitada");

        var response = acompanhamentoService.atualizar(10L, request);

        assertEquals(StatusAcompanhamento.PAUSADO, response.status());
        assertEquals(LocalDate.of(2026, 2, 1), response.dataInicio());
        assertEquals("Mensal", response.frequencia());
    }

    @Test
    void deveRetornarNaoEncontradoAoConsultarOuAtualizarAcompanhamentoAusente() {
        when(acompanhamentoRepository.findByAlunoMatricula("inexistente")).thenReturn(Optional.empty());
        when(acompanhamentoRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(RecursoNaoEncontradoException.class,
                () -> acompanhamentoService.buscarPorMatriculaAluno("inexistente"));
        assertThrows(RecursoNaoEncontradoException.class,
                () -> acompanhamentoService.atualizar(99L, new AcompanhamentoUpdateRequest(
                        StatusAcompanhamento.PAUSADO, null, "Mensal", "Equipe", "Objetivos", null)));
    }

    private static AcompanhamentoRequest request() {
        return new AcompanhamentoRequest("2024001", null, null, "Semanal", "Equipe CLAI", "Acompanhar adaptação", null);
    }

    private static Aluno aluno() {
        Aluno aluno = new Aluno();
        aluno.setId(UUID.randomUUID());
        aluno.setMatricula("2024001");
        aluno.setNome("Estudante de Teste");
        aluno.setCurso("Curso de Teste");
        return aluno;
    }

    private static Acompanhamento acompanhamento() {
        Acompanhamento acompanhamento = new Acompanhamento();
        acompanhamento.setId(10L);
        acompanhamento.setAluno(aluno());
        acompanhamento.setStatus(StatusAcompanhamento.EM_ANDAMENTO);
        acompanhamento.setDataInicio(LocalDate.of(2026, 1, 1));
        acompanhamento.setFrequencia("Semanal");
        acompanhamento.setProfissionaisResponsaveis("Equipe CLAI");
        acompanhamento.setObjetivos("Acompanhar adaptação");
        return acompanhamento;
    }
}
