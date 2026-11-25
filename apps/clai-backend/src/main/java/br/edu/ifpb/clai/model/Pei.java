package br.edu.ifpb.clai.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import java.time.Instant;

@Entity
@Table(name = "pei")
public class Pei {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "acompanhamento_id", nullable = false, unique = true)
    private Acompanhamento acompanhamento;

    @Column(name = "diagnostico_pedagogico", nullable = false, columnDefinition = "text")
    private String diagnosticoPedagogico;

    @Column(name = "recursos_tecnologia_assistiva", columnDefinition = "text")
    private String recursosTecnologiaAssistiva;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private StatusPei status = StatusPei.EM_ELABORACAO;

    @Column(name = "criado_em", nullable = false, updatable = false)
    private Instant criadoEm;

    @Column(name = "atualizado_em", nullable = false)
    private Instant atualizadoEm;

    @PrePersist
    public void prePersist() {
        Instant agora = Instant.now();
        if (this.status == null) {
            this.status = StatusPei.EM_ELABORACAO;
        }
        this.criadoEm = agora;
        this.atualizadoEm = agora;
    }

    @PreUpdate
    public void preUpdate() {
        this.atualizadoEm = Instant.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Acompanhamento getAcompanhamento() {
        return acompanhamento;
    }

    public void setAcompanhamento(Acompanhamento acompanhamento) {
        this.acompanhamento = acompanhamento;
    }

    public String getDiagnosticoPedagogico() {
        return diagnosticoPedagogico;
    }

    public void setDiagnosticoPedagogico(String diagnosticoPedagogico) {
        this.diagnosticoPedagogico = diagnosticoPedagogico;
    }

    public String getRecursosTecnologiaAssistiva() {
        return recursosTecnologiaAssistiva;
    }

    public void setRecursosTecnologiaAssistiva(String recursosTecnologiaAssistiva) {
        this.recursosTecnologiaAssistiva = recursosTecnologiaAssistiva;
    }

    public StatusPei getStatus() {
        return status;
    }

    public void setStatus(StatusPei status) {
        this.status = status;
    }

    public Instant getCriadoEm() {
        return criadoEm;
    }

    public void setCriadoEm(Instant criadoEm) {
        this.criadoEm = criadoEm;
    }

    public Instant getAtualizadoEm() {
        return atualizadoEm;
    }

    public void setAtualizadoEm(Instant atualizadoEm) {
        this.atualizadoEm = atualizadoEm;
    }
}
