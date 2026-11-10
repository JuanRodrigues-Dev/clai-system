package br.edu.ifpb.clai.model.dto;

import br.edu.ifpb.clai.model.StatusAcompanhamento;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

public record AcompanhamentoRequest(
    @NotBlank(message = "Matrícula do aluno é obrigatória")
    @Size(max = 50, message = "Matrícula deve ter no máximo 50 caracteres")
    String matriculaAluno,

    StatusAcompanhamento status,

    LocalDate dataInicio,

    @NotBlank(message = "Frequência é obrigatória")
    @Size(max = 120, message = "Frequência deve ter no máximo 120 caracteres")
    String frequencia,

    @NotBlank(message = "Profissionais responsáveis são obrigatórios")
    @Size(max = 500, message = "Profissionais responsáveis deve ter no máximo 500 caracteres")
    String profissionaisResponsaveis,

    @NotBlank(message = "Objetivos são obrigatórios")
    @Size(max = 2000, message = "Objetivos deve ter no máximo 2000 caracteres")
    String objetivos,

    @Size(max = 2000, message = "Observações deve ter no máximo 2000 caracteres")
    String observacoes
) {}
