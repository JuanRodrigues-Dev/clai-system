package br.edu.ifpb.clai.controller;

import br.edu.ifpb.clai.model.dto.LoginRequest;
import br.edu.ifpb.clai.model.dto.TokenResponse;
import br.edu.ifpb.clai.service.AuthService;
import br.edu.ifpb.clai.service.CredenciaisInvalidasException;
import jakarta.validation.Valid;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping({"/auth/login", "/v1/auth"})
    public ResponseEntity<TokenResponse> login(@Valid @RequestBody LoginRequest request) {
        TokenResponse response = authService.autenticar(request);
        return ResponseEntity.ok(response);
    }

    @ExceptionHandler({CredenciaisInvalidasException.class, MethodArgumentNotValidException.class})
    public ResponseEntity<Map<String, String>> tratarFalhaAutenticacao() {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("erro", "Credenciais inválidas."));
    }
}
