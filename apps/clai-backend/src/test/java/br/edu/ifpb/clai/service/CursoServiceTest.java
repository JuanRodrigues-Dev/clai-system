
package br.edu.ifpb.clai.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import br.edu.ifpb.clai.model.Curso;
import br.edu.ifpb.clai.model.dto.CursoRequest;
import br.edu.ifpb.clai.model.dto.CursoUpdateStatusRequest;
import br.edu.ifpb.clai.repository.CursoRepository;
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
class CursoServiceTest {

    @Mock
    private CursoRepository cursoRepository;

    @InjectMocks
    private CursoService cursoService;

    @Test
    void deveCriarCursoComSucesso() {
        CursoRequest request = request();

        when(cursoRepository.existsByNomeIgnoreCase(request.nome()))
                .thenReturn(false);

        when(cursoRepository.save(any(Curso.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        var response = cursoService.criar(request);

        assertEquals(request.nome(), response.nome());
        assertEquals(request.nivel(), response.nivel());
        assertEquals(true, response.ativo());
        verify(cursoRepository).save(any(Curso.class));
    }

    @Test
    void deveRejeitarCriacaoQuandoCursoJaExistir() {
        CursoRequest request = request();

        when(cursoRepository.existsByNomeIgnoreCase(request.nome()))
                .thenReturn(true);

        assertThrows(
            ConflitoDeDadosException.class,
            () -> cursoService.criar(request)
        );

        verify(cursoRepository, never()).save(any(Curso.class));
    }

    @Test
    void deveListarCursosAtivos() {
        when(cursoRepository.findByAtivoTrue())
                .thenReturn(List.of(curso()));

        var response = cursoService.listarAtivos();

        assertEquals(1, response.size());
        assertEquals(
            "Análise e Desenvolvimento de Sistemas",
            response.get(0).nome()
        );
    }

    @Test
    void deveBuscarCursoPorId() {
        when(cursoRepository.findByIdAndAtivoTrue(1L))
                .thenReturn(Optional.of(curso()));

        var response = cursoService.buscarPorId(1L);

        assertEquals(1L, response.id());
        assertEquals(
            "Análise e Desenvolvimento de Sistemas",
            response.nome()
        );
    }

    @Test
    void deveLancarExcecaoQuandoCursoNaoForEncontrado() {
        when(cursoRepository.findByIdAndAtivoTrue(99L))
                .thenReturn(Optional.empty());

        assertThrows(
            RecursoNaoEncontradoException.class,
            () -> cursoService.buscarPorId(99L)
        );
    }

    @Test
    void deveAtualizarCursoComSucesso() {
        Curso curso = curso();
        CursoRequest atualizada = new CursoRequest(
            "Sistemas de Informação",
            "Graduação"
        );

        when(cursoRepository.findByIdAndAtivoTrue(1L))
                .thenReturn(Optional.of(curso));
        when(cursoRepository.existsByNomeIgnoreCaseAndIdNot(
                atualizada.nome(), 1L))
                .thenReturn(false);
        when(cursoRepository.save(curso)).thenReturn(curso);

        var response = cursoService.atualizar(1L, atualizada);

        assertEquals("Sistemas de Informação", response.nome());
        assertEquals("Graduação", response.nivel());
    }

    @Test
    void deveRejeitarAtualizacaoQuandoNomeJaEstiverEmUso() {
        Curso curso = curso();
        CursoRequest atualizada = new CursoRequest(
            "Sistemas de Informação",
            "Graduação"
        );

        when(cursoRepository.findByIdAndAtivoTrue(1L))
                .thenReturn(Optional.of(curso));
        when(cursoRepository.existsByNomeIgnoreCaseAndIdNot(
                atualizada.nome(), 1L))
                .thenReturn(true);

        assertThrows(
            ConflitoDeDadosException.class,
            () -> cursoService.atualizar(1L, atualizada)
        );

        verify(cursoRepository, never()).save(any(Curso.class));
    }

    @Test
    void deveAtualizarStatusDoCurso() {
        Curso curso = curso();

        when(cursoRepository.findById(1L))
                .thenReturn(Optional.of(curso));
        when(cursoRepository.save(curso)).thenReturn(curso);

        cursoService.atualizarStatus(
            1L,
            new CursoUpdateStatusRequest(false)
        );

        assertEquals(false, curso.isAtivo());
        verify(cursoRepository).save(curso);
    }

    private static CursoRequest request() {
        return new CursoRequest(
            "Análise e Desenvolvimento de Sistemas",
            "Graduação"
        );
    }

    private static Curso curso() {
        Curso curso = new Curso();
        ReflectionTestUtils.setField(curso, "id", 1L);
        curso.setNome("Análise e Desenvolvimento de Sistemas");
        curso.setNivel("Graduação");
        curso.setAtivo(true);
        return curso;
    }
}
