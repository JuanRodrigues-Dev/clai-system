package br.edu.ifpb.clai.model;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

import java.time.Instant;
import org.junit.jupiter.api.Test;

class EstudoDeCasoTest {

    @Test
    void prePersistInicializaAuditoria() {
        EstudoDeCaso estudo = new EstudoDeCaso();

        estudo.prePersist();

        assertNotNull(estudo.getCriadoEm());
        assertEquals(estudo.getCriadoEm(), estudo.getAtualizadoEm());
    }

    @Test
    void preUpdateAtualizaTimestampSemAlterarCriacao() {
        EstudoDeCaso estudo = new EstudoDeCaso();
        Instant criadoEm = Instant.parse("2026-01-01T00:00:00Z");
        estudo.setCriadoEm(criadoEm);

        estudo.preUpdate();

        assertEquals(criadoEm, estudo.getCriadoEm());
        assertNotNull(estudo.getAtualizadoEm());
    }
}
