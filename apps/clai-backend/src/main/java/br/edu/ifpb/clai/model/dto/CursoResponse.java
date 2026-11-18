
package br.edu.ifpb.clai.model.dto;

import br.edu.ifpb.clai.model.Curso;
import java.time.Instant;

public record CursoResponse(
    Long id,
    String nome,
    String nivel,
    boolean ativo,
    Instant criadoEm
) {
    public static CursoResponse fromEntity(Curso curso) {
        return new CursoResponse(
            curso.getId(),
            curso.getNome(),
            curso.getNivel(),
            curso.isAtivo(),
            curso.getCriadoEm()
        );
    }
}
