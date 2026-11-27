package br.edu.ifpb.clai.service;

import br.edu.ifpb.clai.config.Auditar;
import br.edu.ifpb.clai.model.Acompanhamento;
import br.edu.ifpb.clai.model.Atendimento;
import br.edu.ifpb.clai.model.Aluno;
import br.edu.ifpb.clai.model.dto.AtendimentoRequest;
import br.edu.ifpb.clai.model.dto.AtendimentoResponse;
import br.edu.ifpb.clai.model.dto.AtendimentoUpdateRequest;
import br.edu.ifpb.clai.repository.AcompanhamentoRepository;
import br.edu.ifpb.clai.repository.AtendimentoRepository;
import br.edu.ifpb.clai.service.exception.RecursoNaoEncontradoException;
import br.edu.ifpb.clai.service.exception.RegraDeNegocioException;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AtendimentoService {

    private final AtendimentoRepository atendimentoRepository;
    private final AcompanhamentoRepository acompanhamentoRepository;

    public AtendimentoService(
            AtendimentoRepository atendimentoRepository,
            AcompanhamentoRepository acompanhamentoRepository) {
        this.atendimentoRepository = atendimentoRepository;
        this.acompanhamentoRepository = acompanhamentoRepository;
    }

    @Auditar(recurso = "ATENDIMENTO", acao = "CRIACAO")
    @Transactional
    public AtendimentoResponse criar(AtendimentoRequest request) {
        validarHorario(request.horaInicio(), request.horaFim());

        Acompanhamento acompanhamento = acompanhamentoRepository
                .findByAlunoMatricula(request.matriculaAluno())
                .orElseThrow(() -> new RecursoNaoEncontradoException(
                        "Acompanhamento não encontrado para a matrícula informada."));

        Aluno aluno = acompanhamento.getAluno();

        if (!aluno.isAtivo()) {
            throw new RegraDeNegocioException(
                    "Não é possível cadastrar atendimento para aluno inativo.");
        }

        Atendimento atendimento = new Atendimento();
        atendimento.setAcompanhamento(acompanhamento);
        preencherDados(
                atendimento,
                request.dataAtendimento(),
                request.horaInicio(),
                request.horaFim(),
                request.modalidadeLocal(),
                request.tipo(),
                request.profissionais(),
                request.participantes(),
                request.demanda(),
                request.descricao(),
                request.resultado(),
                request.encaminhamentos(),
                request.observacoes(),
                request.proximoAtendimento()
        );

        Atendimento salvo = atendimentoRepository.save(atendimento);
        return toResponse(salvo);
    }

    @Auditar(recurso = "ATENDIMENTO", acao = "LEITURA")
    @Transactional(readOnly = true)
    public List<AtendimentoResponse> buscarPorMatriculaAluno(String matricula) {
        if (!acompanhamentoRepository.findByAlunoMatricula(matricula).isPresent()) {
            throw new RecursoNaoEncontradoException(
                    "Acompanhamento não encontrado para a matrícula informada.");
        }

        return atendimentoRepository
                .findByAcompanhamentoAlunoMatriculaOrderByDataAtendimentoDescHoraInicioDesc(matricula)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Auditar(recurso = "ATENDIMENTO", acao = "ATUALIZACAO")
    @Transactional
    public AtendimentoResponse atualizar(Long id, AtendimentoUpdateRequest request) {
        validarHorario(request.horaInicio(), request.horaFim());

        Atendimento atendimento = atendimentoRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException(
                        "Atendimento não encontrado."));

        preencherDados(
                atendimento,
                request.dataAtendimento(),
                request.horaInicio(),
                request.horaFim(),
                request.modalidadeLocal(),
                request.tipo(),
                request.profissionais(),
                request.participantes(),
                request.demanda(),
                request.descricao(),
                request.resultado(),
                request.encaminhamentos(),
                request.observacoes(),
                request.proximoAtendimento()
        );

        Atendimento atualizado = atendimentoRepository.save(atendimento);
        return toResponse(atualizado);
    }

    private void validarHorario(
            java.time.LocalTime horaInicio,
            java.time.LocalTime horaFim) {

        if (!horaFim.isAfter(horaInicio)) {
            throw new RegraDeNegocioException(
                    "A hora de fim deve ser posterior à hora de início.");
        }
    }

    private void preencherDados(
            Atendimento atendimento,
            java.time.LocalDate dataAtendimento,
            java.time.LocalTime horaInicio,
            java.time.LocalTime horaFim,
            String modalidadeLocal,
            String tipo,
            String profissionais,
            String participantes,
            String demanda,
            String descricao,
            String resultado,
            String encaminhamentos,
            String observacoes,
            java.time.LocalDate proximoAtendimento) {

        atendimento.setDataAtendimento(dataAtendimento);
        atendimento.setHoraInicio(horaInicio);
        atendimento.setHoraFim(horaFim);
        atendimento.setModalidadeLocal(modalidadeLocal);
        atendimento.setTipo(tipo);
        atendimento.setProfissionais(profissionais);
        atendimento.setParticipantes(participantes);
        atendimento.setDemanda(demanda);
        atendimento.setDescricao(descricao);
        atendimento.setResultado(resultado);
        atendimento.setEncaminhamentos(encaminhamentos);
        atendimento.setObservacoes(observacoes);
        atendimento.setProximoAtendimento(proximoAtendimento);
    }

    private AtendimentoResponse toResponse(Atendimento atendimento) {
        Aluno aluno = atendimento.getAcompanhamento().getAluno();

        return new AtendimentoResponse(
                atendimento.getId(),
                atendimento.getAcompanhamento().getId(),
                aluno.getMatricula(),
                aluno.getNome(),
                atendimento.getDataAtendimento(),
                atendimento.getHoraInicio(),
                atendimento.getHoraFim(),
                atendimento.getModalidadeLocal(),
                atendimento.getTipo(),
                atendimento.getProfissionais(),
                atendimento.getParticipantes(),
                atendimento.getDemanda(),
                atendimento.getDescricao(),
                atendimento.getResultado(),
                atendimento.getEncaminhamentos(),
                atendimento.getObservacoes(),
                atendimento.getProximoAtendimento(),
                atendimento.getCriadoEm(),
                atendimento.getAtualizadoEm()
        );
    }
}
