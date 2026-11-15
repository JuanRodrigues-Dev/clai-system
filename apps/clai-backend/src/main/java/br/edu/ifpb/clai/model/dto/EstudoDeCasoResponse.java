package br.edu.ifpb.clai.model.dto;

import br.edu.ifpb.clai.model.EstudoDeCaso;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record EstudoDeCasoResponse(
    Long id,
    UUID alunoId,
    String matriculaAluno,
    String nomeAluno,
    LocalDate dataRealizacao,
    String participantes,
    String historicoEscolar,
    String historicoFamiliar,
    String barreirasDificuldades,
    String potencialidades,
    String necessidadesSuporte,
    boolean necessitaAcompanhamento,
    boolean necessitaAdaptacaoCurricular,
    String conclusoes,
    String encaminhamentos,
    Instant criadoEm,
    Instant atualizadoEm
) {
    public static EstudoDeCasoResponse fromEntity(EstudoDeCaso estudo) {
        return new EstudoDeCasoResponse(
            estudo.getId(), estudo.getAluno().getId(), estudo.getAluno().getMatricula(),
            estudo.getAluno().getNome(), estudo.getDataRealizacao(), estudo.getParticipantes(),
            estudo.getHistoricoEscolar(), estudo.getHistoricoFamiliar(), estudo.getBarreirasDificuldades(),
            estudo.getPotencialidades(), estudo.getNecessidadesSuporte(), estudo.isNecessitaAcompanhamento(),
            estudo.isNecessitaAdaptacaoCurricular(), estudo.getConclusoes(), estudo.getEncaminhamentos(),
            estudo.getCriadoEm(), estudo.getAtualizadoEm()
        );
    }
}
