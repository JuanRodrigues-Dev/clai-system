package br.edu.ifpb.clai.model.dto;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;

public record AtendimentoResponse(
    Long id,
    Long acompanhamentoId,
    String matriculaAluno,
    String nomeAluno,
    LocalDate dataAtendimento,
    LocalTime horaInicio,
    LocalTime horaFim,
    String modalidadeLocal,
    String tipo,
    String profissionais,
    String participantes,
    String demanda,
    String descricao,
    String resultado,
    String encaminhamentos,
    String observacoes,
    LocalDate proximoAtendimento,
    Instant criadoEm,
    Instant atualizadoEm
) {}
