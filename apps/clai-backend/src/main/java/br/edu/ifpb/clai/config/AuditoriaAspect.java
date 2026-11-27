package br.edu.ifpb.clai.config;

import br.edu.ifpb.clai.service.AuditoriaService;
import jakarta.servlet.http.HttpServletRequest;
import java.lang.reflect.Method;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.AfterReturning;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

/**
 * Aspecto AOP responsável por interceptar métodos anotados com {@link Auditar}
 * e registrar usuário autenticado, origem e metadados seguros na trilha de auditoria.
 */
@Aspect
@Component
public class AuditoriaAspect {

    private static final String HEADER_X_FORWARDED_FOR = "X-Forwarded-For";
    private static final int MAX_TAMANHO_IDENTIFICADOR = 100;
    private static final int MAX_TAMANHO_DETALHES = 500;

    private final AuditoriaService auditoriaService;

    public AuditoriaAspect(AuditoriaService auditoriaService) {
        this.auditoriaService = auditoriaService;
    }

    @AfterReturning(pointcut = "@annotation(auditar)", returning = "resultado")
    public void registrarAuditoria(JoinPoint joinPoint, Auditar auditar, Object resultado) {
        String usuarioEmail = obterUsuarioAutenticado();
        String ipOrigem = obterIpOrigem();
        Object[] args = joinPoint.getArgs();

        String identificadorRecurso = extrairIdentificador(args, resultado);
        String detalhes = montarDetalhes(joinPoint, args, identificadorRecurso);

        auditoriaService.registrar(
                usuarioEmail,
                auditar.acao(),
                auditar.recurso(),
                identificadorRecurso,
                ipOrigem,
                detalhes);
    }

    private String obterUsuarioAutenticado() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null
                || !authentication.isAuthenticated()
                || authentication.getName() == null
                || authentication.getName().isBlank()
                || "anonymousUser".equals(authentication.getName())) {
            return "sistema";
        }
        return authentication.getName();
    }

    private String obterIpOrigem() {
        if (!(RequestContextHolder.getRequestAttributes() instanceof ServletRequestAttributes attrs)) {
            return null;
        }
        HttpServletRequest request = attrs.getRequest();
        String forwarded = request.getHeader(HEADER_X_FORWARDED_FOR);
        if (forwarded != null && !forwarded.isBlank()) {
            String primeiroIp = forwarded.split(",")[0].trim();
            return truncar(primeiroIp, 50);
        }
        return truncar(request.getRemoteAddr(), 50);
    }

    private String extrairIdentificador(Object[] args, Object resultado) {
        if (args != null) {
            for (Object arg : args) {
                if (arg instanceof String texto && !texto.isBlank()) {
                    return truncar(texto.trim(), MAX_TAMANHO_IDENTIFICADOR);
                }
                if (arg instanceof Long || arg instanceof UUID || arg instanceof Integer) {
                    return truncar(arg.toString(), MAX_TAMANHO_IDENTIFICADOR);
                }
                String extraidoArg = extrairIdentificadorPorMetodo(arg);
                if (extraidoArg != null) {
                    return truncar(extraidoArg, MAX_TAMANHO_IDENTIFICADOR);
                }
            }
        }
        String extraidoRetorno = extrairIdentificadorPorMetodo(resultado);
        return extraidoRetorno != null ? truncar(extraidoRetorno, MAX_TAMANHO_IDENTIFICADOR) : null;
    }

    private String extrairIdentificadorPorMetodo(Object objeto) {
        if (objeto == null) {
            return null;
        }
        for (String nomeMetodo : List.of("matriculaAluno", "matricula", "id", "getId")) {
            try {
                Method metodo = objeto.getClass().getMethod(nomeMetodo);
                Object valor = metodo.invoke(objeto);
                if (valor != null && !valor.toString().isBlank()) {
                    return valor.toString().trim();
                }
            } catch (ReflectiveOperationException ignored) {
                // método não presente neste tipo
            }
        }
        return null;
    }

    private String montarDetalhes(JoinPoint joinPoint, Object[] args, String identificadorRecurso) {
        String operacao = joinPoint.getSignature().getDeclaringType().getSimpleName()
                + "." + joinPoint.getSignature().getName();

        List<String> resumoArgs = new ArrayList<>();
        if (args != null) {
            for (Object arg : args) {
                if (arg == null) {
                    resumoArgs.add("null");
                } else if (arg instanceof String || arg instanceof Number || arg instanceof Boolean
                        || arg instanceof Enum<?> || arg instanceof UUID) {
                    resumoArgs.add(arg.toString());
                } else {
                    String idObjeto = extrairIdentificadorPorMetodo(arg);
                    resumoArgs.add(idObjeto != null
                            ? arg.getClass().getSimpleName() + "(ref=" + idObjeto + ")"
                            : arg.getClass().getSimpleName());
                }
            }
        }

        StringBuilder sb = new StringBuilder("Operação: ").append(operacao);
        if (identificadorRecurso != null) {
            sb.append(" | RecursoId: ").append(identificadorRecurso);
        }
        if (!resumoArgs.isEmpty()) {
            sb.append(" | Argumentos: ").append(resumoArgs);
        }
        return truncar(sb.toString(), MAX_TAMANHO_DETALHES);
    }

    private String truncar(String valor, int limite) {
        if (valor == null) {
            return null;
        }
        return valor.length() <= limite ? valor : valor.substring(0, limite);
    }
}
