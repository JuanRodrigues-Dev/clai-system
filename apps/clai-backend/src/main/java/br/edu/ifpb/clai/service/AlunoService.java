package br.edu.ifpb.clai.service;

import br.edu.ifpb.clai.model.Aluno;
import br.edu.ifpb.clai.model.dto.AlunoRequest;
import br.edu.ifpb.clai.model.dto.AlunoResponse;
import br.edu.ifpb.clai.repository.AlunoRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AlunoService {

    private final AlunoRepository alunoRepository;

    public AlunoService(AlunoRepository alunoRepository) {
        this.alunoRepository = alunoRepository;
    }

    @Transactional
    public AlunoResponse criar(AlunoRequest request) {
        if (alunoRepository.existsByMatricula(request.matricula())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Já existe um aluno cadastrado com esta matrícula.");
        }

        Aluno aluno = new Aluno();
        aluno.setMatricula(request.matricula());
        aluno.setNome(request.nome());
        aluno.setCurso(request.curso());
        aluno.setOrigemIdentificacao(request.origemIdentificacao());

        Aluno salvo = alunoRepository.save(aluno);
        return AlunoResponse.fromEntity(salvo);
    }

    @Transactional(readOnly = true)
    public Page<AlunoResponse> listarAtivos(Pageable pageable) {
        return alunoRepository.findByAtivoTrue(pageable).map(AlunoResponse::fromEntity);
    }

    @Transactional(readOnly = true)
    public AlunoResponse buscarPorMatricula(String matricula) {
        Aluno aluno = alunoRepository.findByMatriculaAndAtivoTrue(matricula)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Aluno não encontrado ou inativo."));
        return AlunoResponse.fromEntity(aluno);
    }
}