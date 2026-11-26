package br.edu.ifpb.clai.model;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import jakarta.persistence.PreUpdate;
import java.lang.reflect.Method;
import java.time.Instant;
import java.util.Arrays;
import org.hibernate.annotations.Immutable;
import org.junit.jupiter.api.Test;

class AuditoriaLogTest {

    @Test
    void prePersistInicializaTimestampQuandoAusente() {
        AuditoriaLog log = new AuditoriaLog(
                "admin@ifpb.edu.br",
                "LEITURA",
                "ESTUDANTE",
                "2024001",
                "127.0.0.1",
                "Consulta de prontuário");

        log.prePersist();

        assertNotNull(log.getTimestamp());
        assertEquals("admin@ifpb.edu.br", log.getUsuarioEmail());
        assertEquals("LEITURA", log.getAcao());
        assertEquals("ESTUDANTE", log.getRecurso());
        assertEquals("2024001", log.getIdentificadorRecurso());
        assertEquals("127.0.0.1", log.getIpOrigem());
        assertEquals("Consulta de prontuário", log.getDetalhes());
    }

    @Test
    void prePersistPreservaTimestampQuandoInformado() {
        Instant timestampFixo = Instant.parse("2026-11-26T10:15:30Z");
        AuditoriaLog log = new AuditoriaLog(
                timestampFixo,
                "admin@ifpb.edu.br",
                "CRIACAO",
                "PEI",
                "42",
                "127.0.0.1",
                "PEI criado");

        log.prePersist();

        assertEquals(timestampFixo, log.getTimestamp());
    }

    @Test
    void entidadeDeveSerEstritamenteImutavelSemSettersOuPreUpdate() {
        assertTrue(AuditoriaLog.class.isAnnotationPresent(Immutable.class));

        Method[] metodos = AuditoriaLog.class.getDeclaredMethods();
        boolean possuiSetter = Arrays.stream(metodos)
                .anyMatch(m -> m.getName().startsWith("set"));
        boolean possuiPreUpdate = Arrays.stream(metodos)
                .anyMatch(m -> m.isAnnotationPresent(PreUpdate.class));

        assertFalse(possuiSetter, "AuditoriaLog não deve expor métodos setters");
        assertFalse(possuiPreUpdate, "AuditoriaLog não deve possuir callback @PreUpdate");
    }
}
