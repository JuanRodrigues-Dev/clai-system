package br.edu.ifpb.clai.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.spy;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import br.edu.ifpb.clai.model.Role;
import br.edu.ifpb.clai.model.Usuario;
import br.edu.ifpb.clai.model.dto.LoginRequest;
import br.edu.ifpb.clai.model.dto.TokenResponse;
import br.edu.ifpb.clai.model.dto.UsuarioMeResponse;
import br.edu.ifpb.clai.repository.UsuarioRepository;
import java.lang.reflect.Field;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import tools.jackson.databind.ObjectMapper;

class AuthServiceTest {

    private UsuarioRepository usuarioRepository;
    private PasswordEncoder passwordEncoder;
    private JwtService jwtService;
    private AuthService authService;

    @BeforeEach
    void setUp() {
        usuarioRepository = mock(UsuarioRepository.class);
        passwordEncoder = spy(new BCryptPasswordEncoder());
        jwtService = new JwtService(
                "chave_secreta_de_teste_com_tamanho_suficiente_256_bits",
                60,
                new ObjectMapper());
        authService = new AuthService(usuarioRepository, passwordEncoder, jwtService);
    }

    @Test
    void deveExecutarComparacaoBCryptMesmoQuandoUsuarioNaoExisteParaEvitarEnumeracao() {
        when(usuarioRepository.findByEmail("naoexiste@ifpb.edu.br")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> authService.autenticar(new LoginRequest("naoexiste@ifpb.edu.br", "QualquerSenha123")))
                .isInstanceOf(CredenciaisInvalidasException.class)
                .hasMessage("Credenciais inválidas.");

        verify(passwordEncoder).matches(eq("QualquerSenha123"), anyString());
    }

    @Test
    void deveRetornarExatamenteAMesmaExcecaoParaEmailInexistenteSenhaIncorretaEUsuarioInativo() throws Exception {
        Usuario existente = new Usuario("admin@ifpb.edu.br", passwordEncoder.encode("SenhaCorreta!"));
        Usuario inativo = new Usuario("inativo@ifpb.edu.br", passwordEncoder.encode("SenhaCorreta!"));
        Field campoAtivo = Usuario.class.getDeclaredField("ativo");
        campoAtivo.setAccessible(true);
        campoAtivo.set(inativo, false);

        when(usuarioRepository.findByEmail("inexistente@ifpb.edu.br")).thenReturn(Optional.empty());
        when(usuarioRepository.findByEmail("admin@ifpb.edu.br")).thenReturn(Optional.of(existente));
        when(usuarioRepository.findByEmail("inativo@ifpb.edu.br")).thenReturn(Optional.of(inativo));

        Throwable erroInexistente = org.assertj.core.api.Assertions.catchThrowable(
                () -> authService.autenticar(new LoginRequest("inexistente@ifpb.edu.br", "SenhaCorreta!")));
        Throwable erroSenhaIncorreta = org.assertj.core.api.Assertions.catchThrowable(
                () -> authService.autenticar(new LoginRequest("admin@ifpb.edu.br", "SenhaErrada!")));
        Throwable erroUsuarioInativo = org.assertj.core.api.Assertions.catchThrowable(
                () -> authService.autenticar(new LoginRequest("inativo@ifpb.edu.br", "SenhaCorreta!")));

        assertThat(erroInexistente)
                .isInstanceOf(CredenciaisInvalidasException.class)
                .hasMessage("Credenciais inválidas.");
        assertThat(erroSenhaIncorreta)
                .isInstanceOf(CredenciaisInvalidasException.class)
                .hasMessage(erroInexistente.getMessage());
        assertThat(erroUsuarioInativo)
                .isInstanceOf(CredenciaisInvalidasException.class)
                .hasMessage(erroInexistente.getMessage());
    }

    @Test
    void deveIncluirRolesAssociadasAoUsuarioNoTokenJwt() {
        Usuario docente = new Usuario("docente@ifpb.edu.br", passwordEncoder.encode("SenhaCorreta!"));
        docente.adicionarRole(new Role("ROLE_PROFESSOR", "Docente"));
        when(usuarioRepository.findByEmail("docente@ifpb.edu.br")).thenReturn(Optional.of(docente));

        TokenResponse token = authService.autenticar(new LoginRequest("docente@ifpb.edu.br", "SenhaCorreta!"));

        assertThat(jwtService.extrairRoles(token.token()))
                .containsExactly("ROLE_PROFESSOR")
                .doesNotContain("ROLE_ADMIN");
    }

    @Test
    void deveRetornarRolesDoUsuarioSemFallbackEstaticoEmObterUsuarioLogado() {
        Usuario pedagogo = new Usuario("pedagogico@ifpb.edu.br", "hash");
        pedagogo.adicionarRole(new Role("ROLE_PEDAGOGICO", "Setor Pedagógico"));
        when(usuarioRepository.findByEmail("pedagogico@ifpb.edu.br")).thenReturn(Optional.of(pedagogo));

        var auth = new UsernamePasswordAuthenticationToken(
                "pedagogico@ifpb.edu.br",
                null,
                List.of(new SimpleGrantedAuthority("ROLE_PEDAGOGICO")));

        UsuarioMeResponse me = authService.obterUsuarioLogado(auth);
        assertThat(me.roles()).containsExactly("ROLE_PEDAGOGICO");

        when(usuarioRepository.findByEmail("semrole@ifpb.edu.br")).thenReturn(Optional.empty());
        var authSemRoles = new UsernamePasswordAuthenticationToken("semrole@ifpb.edu.br", null, List.of());
        UsuarioMeResponse meSemRoles = authService.obterUsuarioLogado(authSemRoles);
        assertThat(meSemRoles.roles()).isEmpty();
    }
}
