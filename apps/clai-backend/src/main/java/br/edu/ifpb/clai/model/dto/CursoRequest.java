
package br.edu.ifpb.clai.model.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CursoRequest(

    @NotBlank(message = "Nome do curso é obrigatório")
    @Size(max = 160, message = "Nome deve ter no máximo 160 caracteres")
    String nome,

    @NotBlank(message = "Nível do curso é obrigatório")
    @Size(max = 60, message = "Nível deve ter no máximo 60 caracteres")
    String nivel

) {}
