package br.edu.ifpb.clai.model.dto;

import br.edu.ifpb.clai.model.StatusPei;
import jakarta.validation.constraints.NotNull;

public record PeiUpdateStatusRequest(
    @NotNull(message = "Status de homologação do PEI é obrigatório")
    StatusPei status
) {}
