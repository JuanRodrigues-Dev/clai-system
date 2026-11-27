package br.edu.ifpb.clai.config;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import br.edu.ifpb.clai.model.Role;
import br.edu.ifpb.clai.model.Usuario;
import br.edu.ifpb.clai.repository.RoleRepository;
import br.edu.ifpb.clai.repository.UsuarioRepository;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.boot.DefaultApplicationArguments;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

class AdminInitializerTest {

    private UsuarioRepository usuarioRepository;
    private RoleRepository roleRepository;
    private PasswordEncoder passwordEncoder;

    @BeforeEach
    void setUp() {
        usuarioRepository = mock(UsuarioRepository.class);
        roleRepository = mock(RoleRepository.class);
        passwordEncoder = new BCryptPasswordEncoder();
    }

    @Test
    void deveCriarAdminInicialComHashBCryptERoleAdminQuandoNaoExistir() {
        when(usuarioRepository.findByEmail("admin@ifpb.edu.br")).thenReturn(Optional.empty());
        when(roleRepository.findByNome("ROLE_ADMIN"))
                .thenReturn(Optional.of(new Role("ROLE_ADMIN", "Administrador geral do sistema")));

        AdminInitializer initializer = new AdminInitializer(
                usuarioRepository,
                roleRepository,
                passwordEncoder,
                "  admin@ifpb.edu.br  ",
                "SenhaSegura123!");

        initializer.run(new DefaultApplicationArguments());

        ArgumentCaptor<Usuario> captor = ArgumentCaptor.forClass(Usuario.class);
        verify(usuarioRepository).save(captor.capture());

        Usuario salvo = captor.getValue();
        assertThat(salvo.getEmail()).isEqualTo("admin@ifpb.edu.br");
        assertThat(salvo.isAtivo()).isTrue();
        assertThat(salvo.getRoles()).containsExactly("ROLE_ADMIN");
        assertThat(salvo.getSenhaHash()).isNotEqualTo("SenhaSegura123!");
        assertThat(passwordEncoder.matches("SenhaSegura123!", salvo.getSenhaHash())).isTrue();
    }

    @Test
    void naoDeveRecriarAdminQuandoJaExistirNoBanco() {
        Usuario existente = new Usuario("admin@ifpb.edu.br", "hash-existente");
        when(usuarioRepository.findByEmail("admin@ifpb.edu.br")).thenReturn(Optional.of(existente));

        AdminInitializer initializer = new AdminInitializer(
                usuarioRepository,
                roleRepository,
                passwordEncoder,
                "admin@ifpb.edu.br",
                "SenhaSegura123!");

        initializer.run(new DefaultApplicationArguments());

        verify(usuarioRepository, never()).save(any());
        verifyNoInteractions(roleRepository);
    }

    @Test
    void naoDeveCriarAdminQuandoVariaveisDeAmbienteEstiveremVazias() {
        AdminInitializer semEmail = new AdminInitializer(
                usuarioRepository,
                roleRepository,
                passwordEncoder,
                "   ",
                "SenhaSegura123!");
        AdminInitializer semSenha = new AdminInitializer(
                usuarioRepository,
                roleRepository,
                passwordEncoder,
                "admin@ifpb.edu.br",
                "");

        semEmail.run(new DefaultApplicationArguments());
        semSenha.run(new DefaultApplicationArguments());

        verifyNoInteractions(usuarioRepository);
        verifyNoInteractions(roleRepository);
    }
}
