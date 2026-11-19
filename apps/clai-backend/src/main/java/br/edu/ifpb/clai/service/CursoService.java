
package br.edu.ifpb.clai.service;

import br.edu.ifpb.clai.model.Curso;
import br.edu.ifpb.clai.model.dto.CursoRequest;
import br.edu.ifpb.clai.model.dto.CursoResponse;
import br.edu.ifpb.clai.model.dto.CursoUpdateStatusRequest;
import br.edu.ifpb.clai.repository.CursoRepository;
import br.edu.ifpb.clai.service.exception.ConflitoDeDadosException;
import br.edu.ifpb.clai.service.exception.RecursoNaoEncontradoException;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CursoService {

    private final CursoRepository cursoRepository;

    public CursoService(CursoRepository cursoRepository) {
        this.cursoRepository = cursoRepository;
    }

    @Transactional
    public CursoResponse criar(CursoRequest request) {
        if (cursoRepository.existsByNomeIgnoreCase(request.nome())) {
            throw new ConflitoDeDadosException(
                "Já existe um curso cadastrado com este nome."
            );
        }

        Curso curso = new Curso();
        curso.setNome(request.nome());
        curso.setNivel(request.nivel());

        Curso salvo = cursoRepository.save(curso);
        return CursoResponse.fromEntity(salvo);
    }

    @Transactional(readOnly = true)
    public List<CursoResponse> listarAtivos() {
        return cursoRepository.findByAtivoTrue()
            .stream()
            .map(CursoResponse::fromEntity)
            .toList();
    }

    @Transactional(readOnly = true)
    public CursoResponse buscarPorId(Long id) {
        Curso curso = cursoRepository.findByIdAndAtivoTrue(id)
            .orElseThrow(() -> new RecursoNaoEncontradoException(
                "Curso não encontrado ou inativo."
            ));

        return CursoResponse.fromEntity(curso);
    }

    @Transactional
    public CursoResponse atualizar(Long id, CursoRequest request) {
        Curso curso = cursoRepository.findByIdAndAtivoTrue(id)
            .orElseThrow(() -> new RecursoNaoEncontradoException(
                "Curso não encontrado ou inativo."
            ));

        if (cursoRepository.existsByNomeIgnoreCaseAndIdNot(
                request.nome(), id)) {
            throw new ConflitoDeDadosException(
                "Já existe outro curso cadastrado com este nome."
            );
        }

        curso.setNome(request.nome());
        curso.setNivel(request.nivel());

        Curso atualizado = cursoRepository.save(curso);
        return CursoResponse.fromEntity(atualizado);
    }

    @Transactional
    public void atualizarStatus(Long id, CursoUpdateStatusRequest request) {
        Curso curso = cursoRepository.findById(id)
            .orElseThrow(() -> new RecursoNaoEncontradoException(
                "Curso não encontrado."
            ));

        curso.setAtivo(request.ativo());
        cursoRepository.save(curso);
    }
}
