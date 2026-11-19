
package br.edu.ifpb.clai.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import br.edu.ifpb.clai.model.Curso;
import br.edu.ifpb.clai.model.Disciplina;
import br.edu.ifpb.clai.model.dto.DisciplinaRequest;
import br.edu.ifpb.clai.model.dto.DisciplinaUpdateStatusRequest;
import br.edu.ifpb.clai.repository.CursoRepository;
import br.edu.ifpb.clai.repository.DisciplinaRepository;
import br.edu.ifpb.clai.service.exception.ConflitoDeDadosException;
import br.edu.ifpb.clai.service.exception.RecursoNaoEncontradoException;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

@ExtendWith(MockitoExtension.class)
class DisciplinaServiceTest {

    @Mock
    private DisciplinaRepository disciplinaRepository;

    @Mock
    private CursoRepository cursoRepository;

    @InjectMocks
    private DisciplinaService disciplinaService;

    @Test
    void deveCriarDisciplinaAssociadaAoCurso() {
        DisciplinaRequest request = request();

        when(cursoRepository.findByIdAndAtivoTrue(1L))
                .thenReturn(Optional.of(curso()));
        when(disciplinaRepository.existsByNomeIgnoreCaseAndCursoId(
                request.nome(), 1L))
                .thenReturn(false);
        when(disciplinaRepository.save(any(Disciplina.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        var response = disciplinaService.criar(request);

        assertEquals(request.nome(), response.nome());
        assertEquals(1L, response.cursoId());
        assertEquals("ADS", response.cursoNome());
        verify(disciplinaRepository).save(any(Disciplina.class));
    }

    @Test
    void deveRejeitarCriacaoQuandoCursoNaoExistirOuEstiverInativo() {
        when(cursoRepository.findByIdAndAtivoTrue(1L))
                .thenReturn(Optional.empty());

        assertThrows(
            RecursoNaoEncontradoException.class,
            () -> disciplinaService.criar(request())
        );

        verify(disciplinaRepository, never()).save(any(Disciplina.class));
    }

    @Test
    void deveRejeitarDisciplinaDuplicadaNoMesmoCurso() {
        when(cursoRepository.findByIdAndAtivoTrue(1L))
                .thenReturn(Optional.of(curso()));
        when(disciplinaRepository.existsByNomeIgnoreCaseAndCursoId(
                "Programação", 1L))
                .thenReturn(true);

        assertThrows(
            ConflitoDeDadosException.class,
            () -> disciplinaService.criar(request())
        );

        verify(disciplinaRepository, never()).save(any(Disciplina.class));
    }

    @Test
    void deveListarDisciplinasAtivas() {
        when(disciplinaRepository.findByAtivoTrue())
                .thenReturn(List.of(disciplina()));

        var response = disciplinaService.listarAtivas();

        assertEquals(1, response.size());
        assertEquals("Programação", response.get(0).nome());
    }

    @Test
    void deveListarDisciplinasPorCurso() {
        when(cursoRepository.findByIdAndAtivoTrue(1L))
                .thenReturn(Optional.of(curso()));
        when(disciplinaRepository.findByCursoIdAndAtivoTrue(1L))
                .thenReturn(List.of(disciplina()));

        var response = disciplinaService.listarPorCurso(1L);

        assertEquals(1, response.size());
        assertEquals(1L, response.get(0).cursoId());
    }

    @Test
    void deveBuscarDisciplinaPorId() {
        when(disciplinaRepository.findByIdAndAtivoTrue(1L))
                .thenReturn(Optional.of(disciplina()));

        var response = disciplinaService.buscarPorId(1L);

        assertEquals(1L, response.id());
        assertEquals("Programação", response.nome());
    }

    @Test
    void deveLancarExcecaoQuandoDisciplinaNaoForEncontrada() {
        when(disciplinaRepository.findByIdAndAtivoTrue(99L))
                .thenReturn(Optional.empty());

        assertThrows(
            RecursoNaoEncontradoException.class,
            () -> disciplinaService.buscarPorId(99L)
        );
    }

    @Test
    void deveAtualizarDisciplinaComSucesso() {
        Disciplina disciplina = disciplina();
        DisciplinaRequest atualizacao = new DisciplinaRequest(
            "Banco de Dados", "BD01", 2, 60, 1L
        );

        when(disciplinaRepository.findByIdAndAtivoTrue(1L))
                .thenReturn(Optional.of(disciplina));
        when(cursoRepository.findByIdAndAtivoTrue(1L))
                .thenReturn(Optional.of(curso()));
        when(disciplinaRepository.existsByNomeIgnoreCaseAndCursoIdAndIdNot(
                "Banco de Dados", 1L, 1L))
                .thenReturn(false);
        when(disciplinaRepository.save(disciplina))
                .thenReturn(disciplina);

        var response = disciplinaService.atualizar(1L, atualizacao);

        assertEquals("Banco de Dados", response.nome());
        assertEquals("BD01", response.codigo());
    }

    @Test
    void deveRejeitarAtualizacaoQuandoDisciplinaJaExistirNoCurso() {
        DisciplinaRequest atualizacao = new DisciplinaRequest(
            "Banco de Dados", "BD01", 2, 60, 1L
        );

        when(disciplinaRepository.findByIdAndAtivoTrue(1L))
                .thenReturn(Optional.of(disciplina()));
        when(cursoRepository.findByIdAndAtivoTrue(1L))
                .thenReturn(Optional.of(curso()));
        when(disciplinaRepository.existsByNomeIgnoreCaseAndCursoIdAndIdNot(
                "Banco de Dados", 1L, 1L))
                .thenReturn(true);

        assertThrows(
            ConflitoDeDadosException.class,
            () -> disciplinaService.atualizar(1L, atualizacao)
        );

        verify(disciplinaRepository, never()).save(any(Disciplina.class));
    }

    @Test
    void deveAtualizarStatusDaDisciplina() {
        Disciplina disciplina = disciplina();

        when(disciplinaRepository.findById(1L))
                .thenReturn(Optional.of(disciplina));
        when(disciplinaRepository.save(disciplina))
                .thenReturn(disciplina);

        disciplinaService.atualizarStatus(
            1L,
            new DisciplinaUpdateStatusRequest(false)
        );

        assertEquals(false, disciplina.isAtivo());
        verify(disciplinaRepository).save(disciplina);
    }

    private static DisciplinaRequest request() {
        return new DisciplinaRequest(
            "Programação", "PRG01", 1, 60, 1L
        );
    }

    private static Curso curso() {
        Curso curso = new Curso();
        ReflectionTestUtils.setField(curso, "id", 1L);
        curso.setNome("ADS");
        curso.setNivel("Graduação");
        curso.setAtivo(true);
        return curso;
    }

    private static Disciplina disciplina() {
        Disciplina disciplina = new Disciplina();
        ReflectionTestUtils.setField(disciplina, "id", 1L);
        disciplina.setNome("Programação");
        disciplina.setCodigo("PRG01");
        disciplina.setPeriodo(1);
        disciplina.setCargaHoraria(60);
        disciplina.setCurso(curso());
        disciplina.setAtivo(true);
        return disciplina;
    }
}
