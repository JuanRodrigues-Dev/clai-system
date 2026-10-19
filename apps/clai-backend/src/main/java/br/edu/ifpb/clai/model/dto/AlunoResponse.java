package br.edu.ifpb.clai.model.dto;

import br.edu.ifpb.clai.model.Aluno;
import java.time.Instant;
import java.util.UUID;

public record AlunoResponse(
    UUID id,
    String matricula,
    String nome,
    String curso,
    String origemIdentificacao,
    Instant dtCriacao,
    boolean ativo
) {
    public static AlunoResponse fromEntity(Aluno aluno) {
        return new AlunoResponse(
            aluno.getId(),
            aluno.getMatricula(),
            aluno.getNome(),
            aluno.getCurso(),
            aluno.getOrigemIdentificacao(),
            aluno.getDtCriacao(),
            aluno.isAtivo()
        );
    }
}