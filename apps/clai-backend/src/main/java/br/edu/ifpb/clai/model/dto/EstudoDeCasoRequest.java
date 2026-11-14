package br.edu.ifpb.clai.model.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

public record EstudoDeCasoRequest(
    @NotBlank(message = "Matrícula do aluno é obrigatória")
    @Size(max = 50, message = "Matrícula deve ter no máximo 50 caracteres")
    String matriculaAluno,
    @NotNull(message = "Data de realização é obrigatória")
    LocalDate dataRealizacao,
    @NotBlank(message = "Participantes são obrigatórios")
    String participantes,
    String historicoEscolar,
    String historicoFamiliar,
    String barreirasDificuldades,
    String potencialidades,
    String necessidadesSuporte,
    boolean necessitaAcompanhamento,
    boolean necessitaAdaptacaoCurricular,
    String conclusoes,
    String encaminhamentos
) {}
