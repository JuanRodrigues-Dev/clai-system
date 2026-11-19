package br.edu.ifpb.clai.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
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
@Table(name = "estudo_caso")
public class EstudoDeCaso {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "aluno_id", nullable = false, unique = true)
    private Aluno aluno;

    @Column(name = "data_realizacao", nullable = false)
    private LocalDate dataRealizacao;

    @Column(nullable = false, columnDefinition = "text")
    private String participantes;

    @Column(name = "historico_escolar", columnDefinition = "text")
    private String historicoEscolar;

    @Column(name = "historico_familiar", columnDefinition = "text")
    private String historicoFamiliar;

    @Column(name = "barreiras_dificuldades", columnDefinition = "text")
    private String barreirasDificuldades;

    @Column(columnDefinition = "text")
    private String potencialidades;

    @Column(name = "necessidades_suporte", columnDefinition = "text")
    private String necessidadesSuporte;

    @Column(name = "necessita_acompanhamento", nullable = false)
    private boolean necessitaAcompanhamento;

    @Column(name = "necessita_adaptacao_curricular", nullable = false)
    private boolean necessitaAdaptacaoCurricular;

    @Column(columnDefinition = "text")
    private String conclusoes;

    @Column(columnDefinition = "text")
    private String encaminhamentos;

    @Column(name = "criado_em", nullable = false, updatable = false)
    private Instant criadoEm;

    @Column(name = "atualizado_em", nullable = false)
    private Instant atualizadoEm;

    @PrePersist
    public void prePersist() {
        Instant agora = Instant.now();
        criadoEm = agora;
        atualizadoEm = agora;
    }

    @PreUpdate
    public void preUpdate() {
        atualizadoEm = Instant.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Aluno getAluno() { return aluno; }
    public void setAluno(Aluno aluno) { this.aluno = aluno; }
    public LocalDate getDataRealizacao() { return dataRealizacao; }
    public void setDataRealizacao(LocalDate dataRealizacao) { this.dataRealizacao = dataRealizacao; }
    public String getParticipantes() { return participantes; }
    public void setParticipantes(String participantes) { this.participantes = participantes; }
    public String getHistoricoEscolar() { return historicoEscolar; }
    public void setHistoricoEscolar(String historicoEscolar) { this.historicoEscolar = historicoEscolar; }
    public String getHistoricoFamiliar() { return historicoFamiliar; }
    public void setHistoricoFamiliar(String historicoFamiliar) { this.historicoFamiliar = historicoFamiliar; }
    public String getBarreirasDificuldades() { return barreirasDificuldades; }
    public void setBarreirasDificuldades(String barreirasDificuldades) { this.barreirasDificuldades = barreirasDificuldades; }
    public String getPotencialidades() { return potencialidades; }
    public void setPotencialidades(String potencialidades) { this.potencialidades = potencialidades; }
    public String getNecessidadesSuporte() { return necessidadesSuporte; }
    public void setNecessidadesSuporte(String necessidadesSuporte) { this.necessidadesSuporte = necessidadesSuporte; }
    public boolean isNecessitaAcompanhamento() { return necessitaAcompanhamento; }
    public void setNecessitaAcompanhamento(boolean necessitaAcompanhamento) { this.necessitaAcompanhamento = necessitaAcompanhamento; }
    public boolean isNecessitaAdaptacaoCurricular() { return necessitaAdaptacaoCurricular; }
    public void setNecessitaAdaptacaoCurricular(boolean necessitaAdaptacaoCurricular) { this.necessitaAdaptacaoCurricular = necessitaAdaptacaoCurricular; }
    public String getConclusoes() { return conclusoes; }
    public void setConclusoes(String conclusoes) { this.conclusoes = conclusoes; }
    public String getEncaminhamentos() { return encaminhamentos; }
    public void setEncaminhamentos(String encaminhamentos) { this.encaminhamentos = encaminhamentos; }
    public Instant getCriadoEm() { return criadoEm; }
    public void setCriadoEm(Instant criadoEm) { this.criadoEm = criadoEm; }
    public Instant getAtualizadoEm() { return atualizadoEm; }
    public void setAtualizadoEm(Instant atualizadoEm) { this.atualizadoEm = atualizadoEm; }
}
