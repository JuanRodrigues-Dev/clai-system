package br.edu.ifpb.clai.controller;

import br.edu.ifpb.clai.model.dto.LoginRequest;
import br.edu.ifpb.clai.model.dto.TokenResponse;
import br.edu.ifpb.clai.model.dto.UsuarioMeResponse;
import br.edu.ifpb.clai.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping(value = {"/auth/login", "/v1/auth"}, version = "1")
    public ResponseEntity<TokenResponse> login(@Valid @RequestBody LoginRequest request) {
        TokenResponse response = authService.autenticar(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping(value = "/auth/me", version = "1")
    public ResponseEntity<UsuarioMeResponse> me(Authentication authentication) {
        return ResponseEntity.ok(authService.obterUsuarioLogado(authentication));
    }
}
