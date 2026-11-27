package br.edu.ifpb.clai.config;

import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;

import br.edu.ifpb.clai.service.AuditoriaService;
import java.util.List;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.aop.aspectj.annotation.AspectJProxyFactory;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

class AuditoriaAspectTest {

    private AuditoriaService auditoriaService;
    private ServicoAuditadoFake servicoProxy;

    record FakeDto(Long id, String matriculaAluno, String textoClinicoSensivel) {}

    static class ServicoAuditadoFake {

        @Auditar(recurso = "ESTUDANTE", acao = "LEITURA")
        public String buscarPorMatricula(String matricula) {
            return "ok-" + matricula;
        }

        @Auditar(recurso = "ESTUDO_CASO", acao = "CRIACAO")
        public FakeDto criar(FakeDto payload) {
            return payload;
        }
    }

    @BeforeEach
    void setUp() {
        auditoriaService = mock(AuditoriaService.class);
        AuditoriaAspect aspect = new AuditoriaAspect(auditoriaService);
        AspectJProxyFactory factory = new AspectJProxyFactory(new ServicoAuditadoFake());
        factory.addAspect(aspect);
        servicoProxy = factory.getProxy();
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
        RequestContextHolder.resetRequestAttributes();
    }

    @Test
    void deveCapturarUsuarioAutenticadoIpEIdentificadorAoExecutarMetodoAuditado() {
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(
                        "clai@ifpb.edu.br",
                        null,
                        List.of(new SimpleGrantedAuthority("ROLE_CLAI"))));

        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("X-Forwarded-For", "192.168.10.25, 10.0.0.1");
        RequestContextHolder.setRequestAttributes(new ServletRequestAttributes(request));

        servicoProxy.buscarPorMatricula("2024001");

        verify(auditoriaService).registrar(
                eq("clai@ifpb.edu.br"),
                eq("LEITURA"),
                eq("ESTUDANTE"),
                eq("2024001"),
                eq("192.168.10.25"),
                argThat(detalhes -> detalhes.contains("ServicoAuditadoFake.buscarPorMatricula")
                        && detalhes.contains("2024001")));
    }

    @Test
    void deveExtrairIdentificadorDeDtoSemExporCamposClinicosSensiveisNosDetalhes() {
        FakeDto payload = new FakeDto(99L, "2024009", "Historico clinico confidencial");

        servicoProxy.criar(payload);

        verify(auditoriaService).registrar(
                eq("sistema"),
                eq("CRIACAO"),
                eq("ESTUDO_CASO"),
                eq("2024009"),
                isNull(),
                argThat(detalhes -> detalhes.contains("ServicoAuditadoFake.criar")
                        && detalhes.contains("2024009")
                        && !detalhes.contains("Historico clinico confidencial")));
    }
}
