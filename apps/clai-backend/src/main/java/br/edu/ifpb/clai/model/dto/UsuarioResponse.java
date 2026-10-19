package br.edu.ifpb.clai.model.dto;

import br.edu.ifpb.clai.model.Usuario;
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
