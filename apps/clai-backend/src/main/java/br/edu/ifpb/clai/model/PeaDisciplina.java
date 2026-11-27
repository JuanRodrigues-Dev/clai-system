package br.edu.ifpb.clai.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import java.time.Instant;

@Entity
@Table(name = "pea_disciplina")
public class PeaDisciplina {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "pei_id", nullable = false)
    private Pei pei;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "disciplina_id", nullable = false)
    private Disciplina disciplina;

    @Column(name = "nome_professor", nullable = false, length = 160)
    private String nomeProfessor;

    @Column(name = "adaptacoes_metodologicas", nullable = false, columnDefinition = "text")
    private String adaptacoesMetodologicas;

    @Column(name = "criterios_avaliacao", nullable = false, columnDefinition = "text")
    private String criteriosAvaliacao;

    @Column(columnDefinition = "text")
    private String observacoes;

    @Column(name = "criado_em", nullable = false, updatable = false)
    private Instant criadoEm;

    @Column(name = "atualizado_em", nullable = false)
    private Instant atualizadoEm;

    @PrePersist
    protected void aoCriar() {
        Instant agora = Instant.now();
        criadoEm = agora;
        atualizadoEm = agora;
    }

    @PreUpdate
    protected void aoAtualizar() {
        atualizadoEm = Instant.now();
    }

    public Long getId() { return id; }
    public Pei getPei() { return pei; }
    public void setPei(Pei pei) { this.pei = pei; }
    public Disciplina getDisciplina() { return disciplina; }
    public void setDisciplina(Disciplina disciplina) { this.disciplina = disciplina; }
    public String getNomeProfessor() { return nomeProfessor; }
    public void setNomeProfessor(String nomeProfessor) { this.nomeProfessor = nomeProfessor; }
    public String getAdaptacoesMetodologicas() { return adaptacoesMetodologicas; }
    public void setAdaptacoesMetodologicas(String adaptacoesMetodologicas) { this.adaptacoesMetodologicas = adaptacoesMetodologicas; }
    public String getCriteriosAvaliacao() { return criteriosAvaliacao; }
    public void setCriteriosAvaliacao(String criteriosAvaliacao) { this.criteriosAvaliacao = criteriosAvaliacao; }
    public String getObservacoes() { return observacoes; }
    public void setObservacoes(String observacoes) { this.observacoes = observacoes; }
    public Instant getCriadoEm() { return criadoEm; }
    public Instant getAtualizadoEm() { return atualizadoEm; }
}
