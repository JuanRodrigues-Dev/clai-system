
package br.edu.ifpb.clai.model.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public record DisciplinaRequest(

    @NotBlank(message = "Nome da disciplina é obrigatório")
    @Size(max = 160, message = "Nome deve ter no máximo 160 caracteres")
    String nome,

    @Size(max = 40, message = "Código deve ter no máximo 40 caracteres")
    String codigo,

    @Positive(message = "Período deve ser maior que zero")
    Integer periodo,

    @Positive(message = "Carga horária deve ser maior que zero")
    Integer cargaHoraria,

    @NotNull(message = "Curso é obrigatório")
    @Positive(message = "ID do curso deve ser maior que zero")
    Long cursoId

) {}
