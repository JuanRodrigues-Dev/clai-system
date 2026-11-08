package br.edu.ifpb.clai.model.dto;

import java.time.Instant;
import java.util.List;

public record UsuarioMeResponse(
        Long id,
        String email,
        boolean status,
        Instant createdAt,
        List<String> roles) {

    public UsuarioMeResponse {
        roles = (roles == null) ? List.of() : List.copyOf(roles);
    }
}