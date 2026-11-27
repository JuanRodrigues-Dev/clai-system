package br.edu.ifpb.clai.config;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Marca métodos de serviço que devem registrar eventos na trilha de auditoria imutável.
 */
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface Auditar {

    String recurso();

    String acao();
}
