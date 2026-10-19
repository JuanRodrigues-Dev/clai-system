package br.edu.ifpb.clai.service;

import br.edu.ifpb.clai.model.Usuario;
import br.edu.ifpb.clai.model.dto.LoginRequest;
import br.edu.ifpb.clai.model.dto.TokenResponse;
import br.edu.ifpb.clai.repository.UsuarioRepository;
import java.util.Optional;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private static final String SENHA_FICTICIA = "clai-senha-ficticia-anti-enumeracao";

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final String hashFicticio;

    public AuthService(
            UsuarioRepository usuarioRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.hashFicticio = passwordEncoder.encode(SENHA_FICTICIA);
    }

    public TokenResponse autenticar(LoginRequest request) {
        if (request == null
                || request.email() == null
                || request.email().isBlank()
                || request.senha() == null
                || request.senha().isBlank()) {
            throw new CredenciaisInvalidasException();
        }

        String emailNormalizado = request.email().trim();
        Optional<Usuario> usuarioOpt = usuarioRepository.findByEmail(emailNormalizado);

        String hashParaComparar = usuarioOpt
                .map(Usuario::getSenhaHash)
                .orElse(hashFicticio);

        boolean senhaValida = passwordEncoder.matches(request.senha(), hashParaComparar);

        if (usuarioOpt.isEmpty() || !usuarioOpt.get().isAtivo() || !senhaValida) {
            throw new CredenciaisInvalidasException();
        }

        String token = jwtService.gerarToken(usuarioOpt.get());
        return new TokenResponse(token);
    }
}
