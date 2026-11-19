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
import java.time.LocalDate;

@Entity
@Table(name = "acompanhamento")
public class Acompanhamento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "aluno_id", nullable = false, unique = true)
    private Aluno aluno;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private StatusAcompanhamento status = StatusAcompanhamento.EM_ANDAMENTO;

    @Column(name = "data_inicio", nullable = false)
    private LocalDate dataInicio;

    @Column(nullable = false, length = 120)
    private String frequencia;

    @Column(name = "profissionais_responsaveis", nullable = false, length = 500)
    private String profissionaisResponsaveis;

    @Column(nullable = false, length = 2000)
    private String objetivos;

    @Column(length = 2000)
    private String observacoes;

    @Column(name = "criado_em", nullable = false, updatable = false)
    private Instant criadoEm;

    @Column(name = "atualizado_em", nullable = false)
    private Instant atualizadoEm;

    @PrePersist
    public void prePersist() {
        Instant agora = Instant.now();
        if (this.status == null) {
            this.status = StatusAcompanhamento.EM_ANDAMENTO;
        }
        if (this.dataInicio == null) {
            this.dataInicio = LocalDate.now();
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

    public Aluno getAluno() {
        return aluno;
    }

    public void setAluno(Aluno aluno) {
        this.aluno = aluno;
    }

    public StatusAcompanhamento getStatus() {
        return status;
    }

    public void setStatus(StatusAcompanhamento status) {
        this.status = status;
    }

    public LocalDate getDataInicio() {
        return dataInicio;
    }

    public void setDataInicio(LocalDate dataInicio) {
        this.dataInicio = dataInicio;
    }

    public String getFrequencia() {
        return frequencia;
    }

    public void setFrequencia(String frequencia) {
        this.frequencia = frequencia;
    }

    public String getProfissionaisResponsaveis() {
        return profissionaisResponsaveis;
    }

    public void setProfissionaisResponsaveis(String profissionaisResponsaveis) {
        this.profissionaisResponsaveis = profissionaisResponsaveis;
    }

    public String getObjetivos() {
        return objetivos;
    }

    public void setObjetivos(String objetivos) {
        this.objetivos = objetivos;
    }

    public String getObservacoes() {
        return observacoes;
    }

    public void setObservacoes(String observacoes) {
        this.observacoes = observacoes;
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
