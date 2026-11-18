
package br.edu.ifpb.clai.model.dto;

import br.edu.ifpb.clai.model.Disciplina;
import java.time.Instant;

public record DisciplinaResponse(
    Long id,
    String nome,
    String codigo,
    Integer periodo,
    Integer cargaHoraria,
    Long cursoId,
    String cursoNome,
    boolean ativo,
    Instant criadoEm
) {

    public static DisciplinaResponse fromEntity(Disciplina disciplina) {
        return new DisciplinaResponse(
            disciplina.getId(),
            disciplina.getNome(),
            disciplina.getCodigo(),
            disciplina.getPeriodo(),
            disciplina.getCargaHoraria(),
            disciplina.getCurso().getId(),
            disciplina.getCurso().getNome(),
            disciplina.isAtivo(),
            disciplina.getCriadoEm()
        );
    }
}
