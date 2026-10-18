package br.edu.ifpb.clai_backend.config;

import br.edu.ifpb.clai_backend.model.Usuario;
import br.edu.ifpb.clai_backend.repository.UsuarioRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class AdminInitializer implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(AdminInitializer.class);

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final String adminEmail;
    private final String adminPassword;

    public AdminInitializer(
            UsuarioRepository usuarioRepository,
            PasswordEncoder passwordEncoder,
            @Value("${clai.admin.email:}") String adminEmail,
            @Value("${clai.admin.password:}") String adminPassword) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.adminEmail = adminEmail;
        this.adminPassword = adminPassword;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (adminEmail == null || adminEmail.isBlank() || adminPassword == null || adminPassword.isBlank()) {
            log.debug("Variáveis ADMIN_EMAIL/ADMIN_PASSWORD não definidas; criação de admin inicial ignorada.");
            return;
        }

        String emailNormalizado = adminEmail.trim();
        if (usuarioRepository.findByEmail(emailNormalizado).isPresent()) {
            log.debug("Usuário administrador inicial já cadastrado.");
            return;
        }

        String senhaHash = passwordEncoder.encode(adminPassword);
        Usuario admin = new Usuario(emailNormalizado, senhaHash);
        usuarioRepository.save(admin);
        log.info("Usuário administrador inicial criado com sucesso.");
    }
}
