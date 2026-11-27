package br.edu.ifpb.clai.model.dto;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.Test;
import tools.jackson.databind.ObjectMapper;

class PeaRequestTest {

    private static final ValidatorFactory VALIDATOR_FACTORY = Validation.buildDefaultValidatorFactory();
    private final Validator validator = VALIDATOR_FACTORY.getValidator();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @AfterAll
    static void fecharValidatorFactory() {
        VALIDATOR_FACTORY.close();
    }

    @Test
    void desserializaPayloadDoFrontendSemPeiId() throws Exception {
        String payload = """
            {
              "disciplinaId": 42,
              "nomeProfessor": "Ana Souza",
              "adaptacoesMetodologicas": "Material ampliado",
              "criteriosAvaliacao": "Avaliação oral",
              "observacoes": "Aplicar em sala"
            }
            """;

        PeaRequest request = objectMapper.readValue(payload, PeaRequest.class);

        assertEquals(42L, request.disciplinaId());
        assertEquals("Ana Souza", request.nomeProfessor());
        assertEquals("Material ampliado", request.adaptacoesMetodologicas());
        assertEquals("Avaliação oral", request.criteriosAvaliacao());
        assertEquals("Aplicar em sala", request.observacoes());
        assertTrue(validator.validate(request).isEmpty());
    }
}
