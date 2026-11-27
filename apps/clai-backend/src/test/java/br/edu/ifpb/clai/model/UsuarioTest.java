package br.edu.ifpb.clai.model;

import static org.assertj.core.api.Assertions.assertThat;

import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.Transient;
import java.lang.reflect.Field;
import org.junit.jupiter.api.Test;

class UsuarioTest {

    @Test
    void campoRolesDeveMapearUsersRolesSemTransientESemFallbackEstatico() throws NoSuchFieldException {
        Field rolesField = Usuario.class.getDeclaredField("roles");

        assertThat(rolesField.isAnnotationPresent(Transient.class)).isFalse();
        assertThat(rolesField.isAnnotationPresent(ManyToMany.class)).isTrue();
        JoinTable joinTable = rolesField.getAnnotation(JoinTable.class);
        assertThat(joinTable).isNotNull();
        assertThat(joinTable.name()).isEqualTo("users_roles");

        Usuario usuarioSemRole = new Usuario("novo@ifpb.edu.br", "hash");
        assertThat(usuarioSemRole.getRoles()).isEmpty();
    }
}
