package br.edu.ifpb.clai.model.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AlunoUpdateRequest(
    @NotBlank(message = "Nome é obrigatório")
    @Size(max = 255, message = "Nome deve ter no máximo 255 caracteres")
    String nome,

    @NotBlank(message = "Curso é obrigatório")
    @Size(max = 150, message = "Curso deve ter no máximo 150 caracteres")
    String curso,

    @NotBlank(message = "Origem da identificação é obrigatória")
    @Size(max = 100, message = "Origem deve ter no máximo 100 caracteres")
    String origemIdentificacao
) {}
