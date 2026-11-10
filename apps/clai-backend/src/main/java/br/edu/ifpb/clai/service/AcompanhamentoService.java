package br.edu.ifpb.clai.service;

import br.edu.ifpb.clai.model.Acompanhamento;
import br.edu.ifpb.clai.model.Aluno;
import br.edu.ifpb.clai.model.StatusAcompanhamento;
import br.edu.ifpb.clai.model.dto.AcompanhamentoRequest;
import br.edu.ifpb.clai.model.dto.AcompanhamentoResponse;
import br.edu.ifpb.clai.model.dto.AcompanhamentoUpdateRequest;
import br.edu.ifpb.clai.repository.AcompanhamentoRepository;
import br.edu.ifpb.clai.repository.AlunoRepository;
import br.edu.ifpb.clai.service.exception.ConflitoDeDadosException;
import br.edu.ifpb.clai.service.exception.RecursoNaoEncontradoException;
import java.time.LocalDate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AcompanhamentoService {

    private final AcompanhamentoRepository acompanhamentoRepository;
    private final AlunoRepository alunoRepository;

    public AcompanhamentoService(AcompanhamentoRepository acompanhamentoRepository, AlunoRepository alunoRepository) {
        this.acompanhamentoRepository = acompanhamentoRepository;
        this.alunoRepository = alunoRepository;
    }

    @Transactional
    public AcompanhamentoResponse criar(AcompanhamentoRequest request) {
        Aluno aluno = alunoRepository.findByMatriculaAndAtivoTrue(request.matriculaAluno())
                .orElseThrow(() -> new RecursoNaoEncontradoException("Aluno não encontrado ou inativo."));

        if (acompanhamentoRepository.existsByAlunoId(aluno.getId())) {
            throw new ConflitoDeDadosException("Já existe um acompanhamento cadastrado para este aluno.");
        }

        Acompanhamento acompanhamento = new Acompanhamento();
        acompanhamento.setAluno(aluno);
        acompanhamento.setStatus(request.status() != null ? request.status() : StatusAcompanhamento.EM_ANDAMENTO);
        acompanhamento.setDataInicio(request.dataInicio() != null ? request.dataInicio() : LocalDate.now());
        acompanhamento.setFrequencia(request.frequencia());
        acompanhamento.setProfissionaisResponsaveis(request.profissionaisResponsaveis());
        acompanhamento.setObjetivos(request.objetivos());
        acompanhamento.setObservacoes(request.observacoes());

        Acompanhamento salvo = acompanhamentoRepository.save(acompanhamento);
        return toResponse(salvo);
    }

    @Transactional(readOnly = true)
    public AcompanhamentoResponse buscarPorMatriculaAluno(String matricula) {
        Acompanhamento acompanhamento = acompanhamentoRepository.findByAlunoMatricula(matricula)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Acompanhamento não encontrado para a matrícula informada."));

        return toResponse(acompanhamento);
    }

    @Transactional
    public AcompanhamentoResponse atualizar(Long id, AcompanhamentoUpdateRequest request) {
        Acompanhamento acompanhamento = acompanhamentoRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Acompanhamento não encontrado."));

        acompanhamento.setStatus(request.status());
        if (request.dataInicio() != null) {
            acompanhamento.setDataInicio(request.dataInicio());
        }
        acompanhamento.setFrequencia(request.frequencia());
        acompanhamento.setProfissionaisResponsaveis(request.profissionaisResponsaveis());
        acompanhamento.setObjetivos(request.objetivos());
        acompanhamento.setObservacoes(request.observacoes());

        Acompanhamento salvo = acompanhamentoRepository.save(acompanhamento);
        return toResponse(salvo);
    }

    private AcompanhamentoResponse toResponse(Acompanhamento acompanhamento) {
        Aluno aluno = acompanhamento.getAluno();
        return new AcompanhamentoResponse(
                acompanhamento.getId(),
                aluno.getId(),
                aluno.getMatricula(),
                aluno.getNome(),
                acompanhamento.getStatus(),
                acompanhamento.getDataInicio(),
                acompanhamento.getFrequencia(),
                acompanhamento.getProfissionaisResponsaveis(),
                acompanhamento.getObjetivos(),
                acompanhamento.getObservacoes(),
                acompanhamento.getCriadoEm(),
                acompanhamento.getAtualizadoEm()
        );
    }
}
