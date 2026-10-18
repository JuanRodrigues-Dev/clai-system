package br.edu.ifpb.clai_backend.config;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import br.edu.ifpb.clai_backend.model.Usuario;
import br.edu.ifpb.clai_backend.repository.UsuarioRepository;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.boot.DefaultApplicationArguments;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

class AdminInitializerTest {

    private UsuarioRepository usuarioRepository;
    private PasswordEncoder passwordEncoder;

    @BeforeEach
    void setUp() {
        usuarioRepository = mock(UsuarioRepository.class);
        passwordEncoder = new BCryptPasswordEncoder();
    }

    @Test
    void deveCriarAdminInicialComHashBCryptQuandoNaoExistir() {
        when(usuarioRepository.findByEmail("admin@ifpb.edu.br")).thenReturn(Optional.empty());

        AdminInitializer initializer = new AdminInitializer(
                usuarioRepository,
                passwordEncoder,
                "  admin@ifpb.edu.br  ",
                "SenhaSegura123!");

        initializer.run(new DefaultApplicationArguments());

        ArgumentCaptor<Usuario> captor = ArgumentCaptor.forClass(Usuario.class);
        verify(usuarioRepository).save(captor.capture());

        Usuario salvo = captor.getValue();
        assertThat(salvo.getEmail()).isEqualTo("admin@ifpb.edu.br");
        assertThat(salvo.isAtivo()).isTrue();
        assertThat(salvo.getSenhaHash()).isNotEqualTo("SenhaSegura123!");
        assertThat(passwordEncoder.matches("SenhaSegura123!", salvo.getSenhaHash())).isTrue();
    }

    @Test
    void naoDeveRecriarAdminQuandoJaExistirNoBanco() {
        Usuario existente = new Usuario("admin@ifpb.edu.br", "hash-existente");
        when(usuarioRepository.findByEmail("admin@ifpb.edu.br")).thenReturn(Optional.of(existente));

        AdminInitializer initializer = new AdminInitializer(
                usuarioRepository,
                passwordEncoder,
                "admin@ifpb.edu.br",
                "SenhaSegura123!");

        initializer.run(new DefaultApplicationArguments());

        verify(usuarioRepository, never()).save(any());
    }

    @Test
    void naoDeveCriarAdminQuandoVariaveisDeAmbienteEstiveremVazias() {
        AdminInitializer semEmail = new AdminInitializer(
                usuarioRepository,
                passwordEncoder,
                "   ",
                "SenhaSegura123!");
        AdminInitializer semSenha = new AdminInitializer(
                usuarioRepository,
                passwordEncoder,
                "admin@ifpb.edu.br",
                "");

        semEmail.run(new DefaultApplicationArguments());
        semSenha.run(new DefaultApplicationArguments());

        verifyNoInteractions(usuarioRepository);
    }
}
