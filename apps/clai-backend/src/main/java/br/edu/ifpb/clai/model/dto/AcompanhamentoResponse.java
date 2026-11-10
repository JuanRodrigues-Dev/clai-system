package br.edu.ifpb.clai.model.dto;

import br.edu.ifpb.clai.model.StatusAcompanhamento;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record AcompanhamentoResponse(
    Long id,
    UUID alunoId,
    String matriculaAluno,
    String nomeAluno,
    StatusAcompanhamento status,
    LocalDate dataInicio,
    String frequencia,
    String profissionaisResponsaveis,
    String objetivos,
    String observacoes,
    Instant criadoEm,
    Instant atualizadoEm
) {}
