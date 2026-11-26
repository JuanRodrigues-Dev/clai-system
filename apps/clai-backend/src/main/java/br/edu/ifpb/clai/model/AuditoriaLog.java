package br.edu.ifpb.clai.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import java.time.Instant;
import org.hibernate.annotations.Immutable;

/**
 * Entidade JPA estritamente imutável que representa um registro na trilha de auditoria (LGPD).
 */
@Entity
@Immutable
@Table(name = "auditoria_log")
public class AuditoriaLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "timestamp", nullable = false, updatable = false)
    private Instant timestamp;

    @Column(name = "usuario_email", nullable = false, updatable = false, length = 255)
    private String usuarioEmail;

    @Column(name = "acao", nullable = false, updatable = false, length = 50)
    private String acao;

    @Column(name = "recurso", nullable = false, updatable = false, length = 50)
    private String recurso;

    @Column(name = "identificador_recurso", updatable = false, length = 100)
    private String identificadorRecurso;

    @Column(name = "ip_origem", updatable = false, length = 50)
    private String ipOrigem;

    @Column(name = "detalhes", updatable = false, columnDefinition = "text")
    private String detalhes;

    protected AuditoriaLog() {
        // construtor exigido pelo JPA
    }

    public AuditoriaLog(
            String usuarioEmail,
            String acao,
            String recurso,
            String identificadorRecurso,
            String ipOrigem,
            String detalhes) {
        this.usuarioEmail = usuarioEmail;
        this.acao = acao;
        this.recurso = recurso;
        this.identificadorRecurso = identificadorRecurso;
        this.ipOrigem = ipOrigem;
        this.detalhes = detalhes;
    }

    public AuditoriaLog(
            Instant timestamp,
            String usuarioEmail,
            String acao,
            String recurso,
            String identificadorRecurso,
            String ipOrigem,
            String detalhes) {
        this.timestamp = timestamp;
        this.usuarioEmail = usuarioEmail;
        this.acao = acao;
        this.recurso = recurso;
        this.identificadorRecurso = identificadorRecurso;
        this.ipOrigem = ipOrigem;
        this.detalhes = detalhes;
    }

    @PrePersist
    void prePersist() {
        if (this.timestamp == null) {
            this.timestamp = Instant.now();
        }
    }

    public Long getId() {
        return id;
    }

    public Instant getTimestamp() {
        return timestamp;
    }

    public String getUsuarioEmail() {
        return usuarioEmail;
    }

    public String getAcao() {
        return acao;
    }

    public String getRecurso() {
        return recurso;
    }

    public String getIdentificadorRecurso() {
        return identificadorRecurso;
    }

    public String getIpOrigem() {
        return ipOrigem;
    }

    public String getDetalhes() {
        return detalhes;
    }
}
