package br.edu.ifpb.clai.model.dto;

import br.edu.ifpb.clai.model.StatusPei;
import java.time.Instant;

public record PeiResponse(
    Long id,
    Long acompanhamentoId,
    String matriculaAluno,
    String nomeAluno,
    String diagnosticoPedagogico,
    String recursosTecnologiaAssistiva,
    StatusPei status,
    Instant criadoEm,
    Instant atualizadoEm
) {}
