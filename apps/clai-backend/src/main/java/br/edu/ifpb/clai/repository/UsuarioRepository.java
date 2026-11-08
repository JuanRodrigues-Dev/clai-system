package br.edu.ifpb.clai.repository;

import br.edu.ifpb.clai.model.Usuario;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    Optional<Usuario> findByEmail(String email);

    @Query(
            value = """
                    SELECT r.nome
                    FROM roles r
                    INNER JOIN users_roles ur ON ur.role_id = r.id
                    WHERE ur.usuario_id = :usuarioId
                    ORDER BY r.nome
                    """,
            nativeQuery = true)
    List<String> findRoleNamesByUsuarioId(@Param("usuarioId") Long usuarioId);
}