package br.edu.ifpb.clai.service;

import br.edu.ifpb.clai.model.AuditoriaLog;
import br.edu.ifpb.clai.model.dto.AuditoriaLogResponse;
import br.edu.ifpb.clai.repository.AuditoriaLogRepository;
import br.edu.ifpb.clai.service.exception.RegraDeNegocioException;
import jakarta.persistence.criteria.Predicate;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

/**
 * Serviço responsável pela gravação imutável e consulta administrativa da trilha de auditoria.
 */
@Service
public class AuditoriaService {

    private final AuditoriaLogRepository auditoriaLogRepository;

    public AuditoriaService(AuditoriaLogRepository auditoriaLogRepository) {
        this.auditoriaLogRepository = auditoriaLogRepository;
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void registrar(
            String usuarioEmail,
            String acao,
            String recurso,
            String identificadorRecurso,
            String ipOrigem,
            String detalhes) {
        String emailSeguro = (usuarioEmail == null || usuarioEmail.isBlank()) ? "sistema" : usuarioEmail.trim();
        AuditoriaLog log = new AuditoriaLog(
                emailSeguro,
                acao,
                recurso,
                identificadorRecurso,
                ipOrigem,
                detalhes);
        auditoriaLogRepository.save(log);
    }

    @Transactional(readOnly = true)
    public Page<AuditoriaLogResponse> listar(
            String usuarioEmail,
            String recurso,
            String acao,
            String inicio,
            String fim,
            Pageable pageable) {
        Instant inicioInstant = parseDataOuInstante(inicio, false);
        Instant fimInstant = parseDataOuInstante(fim, true);

        if (inicioInstant != null && fimInstant != null && fimInstant.isBefore(inicioInstant)) {
            throw new RegraDeNegocioException("A data final do filtro não pode ser anterior à data inicial.");
        }

        Specification<AuditoriaLog> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (usuarioEmail != null && !usuarioEmail.isBlank()) {
                predicates.add(cb.like(
                        cb.lower(root.get("usuarioEmail")),
                        "%" + usuarioEmail.trim().toLowerCase() + "%"));
            }
            if (recurso != null && !recurso.isBlank()) {
                predicates.add(cb.equal(
                        cb.upper(root.get("recurso")),
                        recurso.trim().toUpperCase()));
            }
            if (acao != null && !acao.isBlank()) {
                predicates.add(cb.equal(
                        cb.upper(root.get("acao")),
                        acao.trim().toUpperCase()));
            }
            if (inicioInstant != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("timestamp"), inicioInstant));
            }
            if (fimInstant != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("timestamp"), fimInstant));
            }

            return cb.and(predicates.toArray(Predicate[]::new));
        };

        return auditoriaLogRepository.findAll(spec, pageable)
                .map(AuditoriaLogResponse::fromEntity);
    }

    private Instant parseDataOuInstante(String valor, boolean fimDoDia) {
        if (valor == null || valor.isBlank()) {
            return null;
        }
        String texto = valor.trim();
        try {
            return Instant.parse(texto);
        } catch (DateTimeParseException ignored) {
            try {
                LocalDate data = LocalDate.parse(texto);
                return fimDoDia
                        ? data.plusDays(1).atStartOfDay(ZoneOffset.UTC).minusNanos(1).toInstant()
                        : data.atStartOfDay(ZoneOffset.UTC).toInstant();
            } catch (DateTimeParseException ex) {
                throw new RegraDeNegocioException(
                        "Formato de data inválido para filtro de auditoria: " + texto);
            }
        }
    }
}
