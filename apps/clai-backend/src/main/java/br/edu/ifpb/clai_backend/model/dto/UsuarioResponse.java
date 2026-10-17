package br.edu.ifpb.clai_backend.model.dto;

import java.time.Instant;

public record UsuarioResponse(
        Long id,
        String email,
        boolean ativo,
        Instant criadoEm) {

    public static UsuarioResponse from(Usuario usuario) {
        return new UsuarioResponse(
                usuario.getId(),
                usuario.getEmail(),
                usuario.isAtivo(),
                usuario.getCriadoEm());
    }
}
