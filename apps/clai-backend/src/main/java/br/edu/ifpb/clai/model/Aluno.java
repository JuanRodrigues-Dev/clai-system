package br.edu.ifpb.clai.model;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "aluno")
public class Aluno {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, unique = true, length = 50)
    private String matricula;

    @Column(nullable = false)
    private String nome;

    @Column(nullable = false)
    private String curso;

    @Column(name = "origem_identificacao", nullable = false, length = 100)
    private String origemIdentificacao;

    @Column(name = "dt_criacao", nullable = false, updatable = false)
    private Instant dtCriacao;

    @Column(nullable = false)
    private boolean ativo = true;

    @PrePersist
    public void prePersist() {
        this.dtCriacao = Instant.now();
        this.ativo = true;
    }

    // Getters e Setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public String getMatricula() { return matricula; }
    public void setMatricula(String matricula) { this.matricula = matricula; }
    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }
    public String getCurso() { return curso; }
    public void setCurso(String curso) { this.curso = curso; }
    public String getOrigemIdentificacao() { return origemIdentificacao; }
    public void setOrigemIdentificacao(String origemIdentificacao) { this.origemIdentificacao = origemIdentificacao; }
    public Instant getDtCriacao() { return dtCriacao; }
    public void setDtCriacao(Instant dtCriacao) { this.dtCriacao = dtCriacao; }
    public boolean isAtivo() { return ativo; }
    public void setAtivo(boolean ativo) { this.ativo = ativo; }
}