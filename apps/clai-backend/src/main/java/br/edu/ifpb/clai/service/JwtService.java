package br.edu.ifpb.clai.service;

import br.edu.ifpb.clai.model.Usuario;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Base64;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Optional;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import tools.jackson.core.type.TypeReference;
import tools.jackson.databind.ObjectMapper;

@Service
public class JwtService {

    private static final String HMAC_ALGO = "HmacSHA256";
    private static final Base64.Encoder BASE64_URL_ENCODER = Base64.getUrlEncoder().withoutPadding();
    private static final Base64.Decoder BASE64_URL_DECODER = Base64.getUrlDecoder();

    private final byte[] secretBytes;
    private final long expirationMinutes;
    private final ObjectMapper objectMapper;

    public JwtService(
            @Value("${clai.jwt.secret}") String secret,
            @Value("${clai.jwt.expiration-minutes:60}") long expirationMinutes,
            ObjectMapper objectMapper) {
        if (secret == null || secret.isBlank()) {
            throw new IllegalArgumentException("JWT secret não pode ser vazio.");
        }
        this.secretBytes = secret.getBytes(StandardCharsets.UTF_8);
        this.expirationMinutes = expirationMinutes;
        this.objectMapper = objectMapper;
    }

    public String gerarToken(Usuario usuario) {
        Instant agora = Instant.now();
        Instant expiracao = agora.plus(expirationMinutes, ChronoUnit.MINUTES);

        Map<String, Object> header = new LinkedHashMap<>();
        header.put("alg", "HS256");
        header.put("typ", "JWT");

        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("sub", usuario.getEmail());
        if (usuario.getId() != null) {
            payload.put("uid", usuario.getId());
        }
        payload.put("iat", agora.getEpochSecond());
        payload.put("exp", expiracao.getEpochSecond());

        String headerEncoded = base64UrlEncode(objectMapper.writeValueAsBytes(header));
        String payloadEncoded = base64UrlEncode(objectMapper.writeValueAsBytes(payload));
        String signingInput = headerEncoded + "." + payloadEncoded;
        String signature = assinar(signingInput);

        return signingInput + "." + signature;
    }

    public Optional<String> validarEExtrairSubject(String token) {
        if (token == null || token.isBlank()) {
            return Optional.empty();
        }

        String[] partes = token.split("\\.");
        if (partes.length != 3) {
            return Optional.empty();
        }

        String signingInput = partes[0] + "." + partes[1];
        String assinaturaEsperada = assinar(signingInput);

        if (!MessageDigest.isEqual(
                assinaturaEsperada.getBytes(StandardCharsets.UTF_8),
                partes[2].getBytes(StandardCharsets.UTF_8))) {
            return Optional.empty();
        }

        try {
            byte[] payloadBytes = BASE64_URL_DECODER.decode(partes[1]);
            Map<String, Object> claims = objectMapper.readValue(
                    payloadBytes, new TypeReference<Map<String, Object>>() {});

            Object expObj = claims.get("exp");
            Object subObj = claims.get("sub");
            if (!(expObj instanceof Number expNumber) || !(subObj instanceof String sub) || sub.isBlank()) {
                return Optional.empty();
            }

            long exp = expNumber.longValue();
            if (Instant.now().getEpochSecond() >= exp) {
                return Optional.empty();
            }

            return Optional.of(sub);
        } catch (Exception e) {
            return Optional.empty();
        }
    }

    private String assinar(String conteudo) {
        try {
            Mac mac = Mac.getInstance(HMAC_ALGO);
            mac.init(new SecretKeySpec(secretBytes, HMAC_ALGO));
            byte[] rawHmac = mac.doFinal(conteudo.getBytes(StandardCharsets.UTF_8));
            return base64UrlEncode(rawHmac);
        } catch (Exception e) {
            throw new IllegalStateException("Erro ao assinar token JWT", e);
        }
    }

    private static String base64UrlEncode(byte[] bytes) {
        return BASE64_URL_ENCODER.encodeToString(bytes);
    }
}
