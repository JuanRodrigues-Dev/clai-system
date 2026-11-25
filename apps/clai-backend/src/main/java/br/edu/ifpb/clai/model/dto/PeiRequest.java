package br.edu.ifpb.clai.model.dto;

import br.edu.ifpb.clai.model.StatusPei;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record PeiRequest(
    @NotBlank(message = "Matrícula do aluno é obrigatória")
    @Size(max = 50, message = "Matrícula deve ter no máximo 50 caracteres")
    String matriculaAluno,

    Long acompanhamentoId,

    @NotBlank(message = "Diagnóstico pedagógico é obrigatório")
    String diagnosticoPedagogico,

    String recursosTecnologiaAssistiva,

    StatusPei status
) {}
