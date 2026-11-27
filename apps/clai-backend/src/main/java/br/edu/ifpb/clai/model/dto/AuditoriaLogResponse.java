package br.edu.ifpb.clai.model.dto;

import br.edu.ifpb.clai.model.AuditoriaLog;
import java.time.Instant;

/**
 * DTO de resposta para visualização de registros da trilha de auditoria.
 */
public record AuditoriaLogResponse(
        Long id,
        Instant timestamp,
        String usuarioEmail,
        String acao,
        String recurso,
        String identificadorRecurso,
        String ipOrigem,
        String detalhes) {

    public static AuditoriaLogResponse fromEntity(AuditoriaLog log) {
        return new AuditoriaLogResponse(
                log.getId(),
                log.getTimestamp(),
                log.getUsuarioEmail(),
                log.getAcao(),
                log.getRecurso(),
                log.getIdentificadorRecurso(),
                log.getIpOrigem(),
                log.getDetalhes());
    }
}
