package br.edu.ifpb.clai.model.dto;

import java.time.Instant;

public record PeaResponse(
    Long id,
    Long peiId,
    Long disciplinaId,
    String nomeProfessor,
    String adaptacoesMetodologicas,
    String criteriosAvaliacao,
    String observacoes,
    Instant criadoEm,
    Instant atualizadoEm
) {}
