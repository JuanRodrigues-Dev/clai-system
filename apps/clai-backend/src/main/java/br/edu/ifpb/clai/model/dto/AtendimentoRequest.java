package br.edu.ifpb.clai.model.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import java.time.LocalTime;

public record AtendimentoRequest(
    @NotBlank(message = "Matrícula do aluno é obrigatória")
    @Size(max = 50, message = "Matrícula deve ter no máximo 50 caracteres")
    String matriculaAluno,

    @NotNull(message = "Data do atendimento é obrigatória")
    LocalDate dataAtendimento,

    @NotNull(message = "Hora de início é obrigatória")
    LocalTime horaInicio,

    @NotNull(message = "Hora de fim é obrigatória")
    LocalTime horaFim,

    @Size(max = 200, message = "Modalidade/local deve ter no máximo 200 caracteres")
    String modalidadeLocal,

    @Size(max = 150, message = "Tipo deve ter no máximo 150 caracteres")
    String tipo,

    String profissionais,
    String participantes,
    String demanda,
    String descricao,
    String resultado,
    String encaminhamentos,
    String observacoes,
    LocalDate proximoAtendimento
) {}
