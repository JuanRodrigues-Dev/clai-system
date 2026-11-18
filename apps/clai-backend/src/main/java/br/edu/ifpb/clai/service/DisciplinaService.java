package br.edu.ifpb.clai.service;

import br.edu.ifpb.clai.model.Curso;
import br.edu.ifpb.clai.model.Disciplina;
import br.edu.ifpb.clai.model.dto.DisciplinaRequest;
import br.edu.ifpb.clai.model.dto.DisciplinaResponse;
import br.edu.ifpb.clai.model.dto.DisciplinaUpdateStatusRequest;
import br.edu.ifpb.clai.repository.CursoRepository;
import br.edu.ifpb.clai.repository.DisciplinaRepository;
import br.edu.ifpb.clai.service.exception.ConflitoDeDadosException;
import br.edu.ifpb.clai.service.exception.RecursoNaoEncontradoException;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class DisciplinaService {

    private final DisciplinaRepository disciplinaRepository;
    private final CursoRepository cursoRepository;

    public DisciplinaService(
            DisciplinaRepository disciplinaRepository,
            CursoRepository cursoRepository) {
        this.disciplinaRepository = disciplinaRepository;
        this.cursoRepository = cursoRepository;
    }

    @Transactional
    public DisciplinaResponse criar(DisciplinaRequest request) {
        Curso curso = buscarCursoAtivo(request.cursoId());

        if (disciplinaRepository.existsByNomeIgnoreCaseAndCursoId(
                request.nome(), curso.getId())) {
            throw new ConflitoDeDadosException(
                "Já existe uma disciplina com este nome neste curso."
            );
        }

        Disciplina disciplina = new Disciplina();
        disciplina.setNome(request.nome());
        disciplina.setCodigo(request.codigo());
        disciplina.setPeriodo(request.periodo());
        disciplina.setCargaHoraria(request.cargaHoraria());
        disciplina.setCurso(curso);

        Disciplina salva = disciplinaRepository.save(disciplina);
        return DisciplinaResponse.fromEntity(salva);
    }

    @Transactional(readOnly = true)
    public List<DisciplinaResponse> listarAtivas() {
        return disciplinaRepository.findByAtivoTrue()
            .stream()
            .map(DisciplinaResponse::fromEntity)
            .toList();
    }

    @Transactional(readOnly = true)
    public List<DisciplinaResponse> listarPorCurso(Long cursoId) {
        buscarCursoAtivo(cursoId);

        return disciplinaRepository.findByCursoIdAndAtivoTrue(cursoId)
            .stream()
            .map(DisciplinaResponse::fromEntity)
            .toList();
    }

    @Transactional(readOnly = true)
    public DisciplinaResponse buscarPorId(Long id) {
        Disciplina disciplina = disciplinaRepository.findByIdAndAtivoTrue(id)
            .orElseThrow(() -> new RecursoNaoEncontradoException(
                "Disciplina não encontrada ou inativa."
            ));

        return DisciplinaResponse.fromEntity(disciplina);
    }

    @Transactional
    public DisciplinaResponse atualizar(Long id, DisciplinaRequest request) {
        Disciplina disciplina = disciplinaRepository.findByIdAndAtivoTrue(id)
            .orElseThrow(() -> new RecursoNaoEncontradoException(
                "Disciplina não encontrada ou inativa."
            ));

        Curso curso = buscarCursoAtivo(request.cursoId());

        if (disciplinaRepository.existsByNomeIgnoreCaseAndCursoIdAndIdNot(
                request.nome(), curso.getId(), id)) {
            throw new ConflitoDeDadosException(
                "Já existe outra disciplina com este nome neste curso."
            );
        }

        disciplina.setNome(request.nome());
        disciplina.setCodigo(request.codigo());
        disciplina.setPeriodo(request.periodo());
        disciplina.setCargaHoraria(request.cargaHoraria());
        disciplina.setCurso(curso);

        Disciplina atualizada = disciplinaRepository.save(disciplina);
        return DisciplinaResponse.fromEntity(atualizada);
    }

    @Transactional
    public void atualizarStatus(
            Long id,
            DisciplinaUpdateStatusRequest request) {

        Disciplina disciplina = disciplinaRepository.findById(id)
            .orElseThrow(() -> new RecursoNaoEncontradoException(
                "Disciplina não encontrada."
            ));

        disciplina.setAtivo(request.ativo());
        disciplinaRepository.save(disciplina);
    }

    private Curso buscarCursoAtivo(Long cursoId) {
        return cursoRepository.findByIdAndAtivoTrue(cursoId)
            .orElseThrow(() -> new RecursoNaoEncontradoException(
                "Curso não encontrado ou inativo."
            ));
    }
}