package br.edu.ifpb.clai.service;

import br.edu.ifpb.clai.config.Auditar;
import br.edu.ifpb.clai.model.Acompanhamento;
import br.edu.ifpb.clai.model.Aluno;
import br.edu.ifpb.clai.model.Pei;
import br.edu.ifpb.clai.model.StatusPei;
import br.edu.ifpb.clai.model.dto.PeiRequest;
import br.edu.ifpb.clai.model.dto.PeiResponse;
import br.edu.ifpb.clai.model.dto.PeiUpdateStatusRequest;
import br.edu.ifpb.clai.repository.AcompanhamentoRepository;
import br.edu.ifpb.clai.repository.AlunoRepository;
import br.edu.ifpb.clai.repository.PeiRepository;
import br.edu.ifpb.clai.service.exception.ConflitoDeDadosException;
import br.edu.ifpb.clai.service.exception.RecursoNaoEncontradoException;
import br.edu.ifpb.clai.service.exception.RegraDeNegocioException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PeiService {

    private final PeiRepository peiRepository;
    private final AcompanhamentoRepository acompanhamentoRepository;
    private final AlunoRepository alunoRepository;

    public PeiService(
            PeiRepository peiRepository,
            AcompanhamentoRepository acompanhamentoRepository,
            AlunoRepository alunoRepository) {
        this.peiRepository = peiRepository;
        this.acompanhamentoRepository = acompanhamentoRepository;
        this.alunoRepository = alunoRepository;
    }

    @Auditar(recurso = "PEI", acao = "CRIACAO")
    @Transactional
    public PeiResponse criar(PeiRequest request) {
        Aluno aluno = alunoRepository.findByMatricula(request.matriculaAluno())
                .orElseThrow(() -> new RecursoNaoEncontradoException(
                        "Aluno não encontrado para a matrícula informada."));

        if (!aluno.isAtivo()) {
            throw new RegraDeNegocioException(
                    "Não é possível emitir PEI para aluno inativo.");
        }

        Acompanhamento acompanhamento = acompanhamentoRepository.findByAlunoMatricula(aluno.getMatricula())
                .orElseThrow(() -> new RegraDeNegocioException(
                        "O aluno precisa possuir um acompanhamento cadastrado para emissão do PEI."));

        if (request.acompanhamentoId() != null && !request.acompanhamentoId().equals(acompanhamento.getId())) {
            throw new RegraDeNegocioException(
                    "O acompanhamento informado não pertence ao aluno indicado.");
        }

        if (peiRepository.existsByAcompanhamentoId(acompanhamento.getId())) {
            throw new ConflitoDeDadosException(
                    "Já existe um PEI cadastrado para este estudante.");
        }

        Pei pei = new Pei();
        pei.setAcompanhamento(acompanhamento);
        pei.setDiagnosticoPedagogico(request.diagnosticoPedagogico());
        pei.setRecursosTecnologiaAssistiva(request.recursosTecnologiaAssistiva());
        pei.setStatus(request.status() != null ? request.status() : StatusPei.EM_ELABORACAO);

        Pei salvo = peiRepository.save(pei);
        return toResponse(salvo);
    }

    @Auditar(recurso = "PEI", acao = "LEITURA")
    @Transactional(readOnly = true)
    public PeiResponse buscarPorMatriculaAluno(String matricula) {
        Pei pei = peiRepository.findByAcompanhamentoAlunoMatricula(matricula)
                .orElseThrow(() -> new RecursoNaoEncontradoException(
                        "PEI não encontrado para a matrícula informada."));

        return toResponse(pei);
    }

    @Auditar(recurso = "PEI", acao = "ATUALIZACAO")
    @Transactional
    public PeiResponse atualizarStatus(Long id, PeiUpdateStatusRequest request) {
        Pei pei = peiRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("PEI não encontrado."));

        if (!pei.getAcompanhamento().getAluno().isAtivo()) {
            throw new RegraDeNegocioException(
                    "Não é possível atualizar o status do PEI de um aluno inativo.");
        }

        validarTransicaoStatus(pei.getStatus(), request.status());
        pei.setStatus(request.status());

        Pei salvo = peiRepository.save(pei);
        return toResponse(salvo);
    }

    private void validarTransicaoStatus(StatusPei statusAtual, StatusPei novoStatus) {
        if (novoStatus == null) {
            throw new RegraDeNegocioException("O novo status do PEI é obrigatório.");
        }
        if (novoStatus.ordinal() < statusAtual.ordinal()) {
            throw new RegraDeNegocioException(
                    "Transição de status inválida: não é permitido retroceder o status do PEI de "
                            + statusAtual + " para " + novoStatus + ".");
        }
    }

    private PeiResponse toResponse(Pei pei) {
        Acompanhamento acompanhamento = pei.getAcompanhamento();
        Aluno aluno = acompanhamento.getAluno();
        return new PeiResponse(
                pei.getId(),
                acompanhamento.getId(),
                aluno.getMatricula(),
                aluno.getNome(),
                pei.getDiagnosticoPedagogico(),
                pei.getRecursosTecnologiaAssistiva(),
                pei.getStatus(),
                pei.getCriadoEm(),
                pei.getAtualizadoEm()
        );
    }
}
