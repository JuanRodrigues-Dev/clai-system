package br.edu.ifpb.clai.service;

import br.edu.ifpb.clai.model.Usuario;
import br.edu.ifpb.clai.model.dto.LoginRequest;
import br.edu.ifpb.clai.model.dto.TokenResponse;
import br.edu.ifpb.clai.model.dto.UsuarioMeResponse;
import br.edu.ifpb.clai.repository.UsuarioRepository;
import java.util.List;
import java.util.Optional;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
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

        Usuario usuario = usuarioOpt.get();
        if (usuario.getId() != null) {
            List<String> roles = usuarioRepository.findRoleNamesByUsuarioId(usuario.getId());
            if (roles != null && !roles.isEmpty()) {
                usuario.setRoles(roles);
            }
        }

        String token = jwtService.gerarToken(usuario);
        return new TokenResponse(token);
    }

    public UsuarioMeResponse obterUsuarioLogado(Authentication authentication) {
        if (authentication == null
                || !authentication.isAuthenticated()
                || !(authentication.getPrincipal() instanceof String email)
                || email.isBlank()
                || "anonymousUser".equals(email)) {
            throw new CredenciaisInvalidasException();
        }

        List<String> rolesContexto = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .filter(role -> role != null && !role.isBlank())
                .toList();

        return usuarioRepository.findByEmail(email.trim())
                .map(usuario -> {
                    List<String> roles = rolesContexto;
                    if (roles.isEmpty() && usuario.getId() != null) {
                        roles = usuarioRepository.findRoleNamesByUsuarioId(usuario.getId());
                    }
                    if (roles == null || roles.isEmpty()) {
                        roles = usuario.getRoles();
                    }
                    return new UsuarioMeResponse(
                            usuario.getId(),
                            usuario.getEmail(),
                            usuario.isAtivo(),
                            usuario.getCriadoEm(),
                            roles);
                })
                .orElseGet(() -> new UsuarioMeResponse(
                        null,
                        email.trim(),
                        true,
                        null,
                        rolesContexto.isEmpty() ? List.of("ROLE_ADMIN") : rolesContexto));
    }
}