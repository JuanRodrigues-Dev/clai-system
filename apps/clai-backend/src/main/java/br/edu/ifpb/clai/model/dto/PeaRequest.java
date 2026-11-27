package br.edu.ifpb.clai.model.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record PeaRequest(
    @NotNull(message = "Disciplina é obrigatória")
    Long disciplinaId,

    @NotBlank(message = "Nome do professor é obrigatório")
    @Size(max = 160, message = "Nome do professor deve ter no máximo 160 caracteres")
    String nomeProfessor,

    @NotBlank(message = "Adaptações metodológicas são obrigatórias")
    String adaptacoesMetodologicas,

    @NotBlank(message = "Critérios de avaliação são obrigatórios")
    String criteriosAvaliacao,

    String observacoes
) {}
