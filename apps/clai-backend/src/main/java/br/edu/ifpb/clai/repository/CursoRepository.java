
package br.edu.ifpb.clai.repository;

import br.edu.ifpb.clai.model.Curso;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CursoRepository extends JpaRepository<Curso, Long> {

    List<Curso> findByAtivoTrue();

    Optional<Curso> findByIdAndAtivoTrue(Long id);

    boolean existsByNomeIgnoreCase(String nome);

    boolean existsByNomeIgnoreCaseAndIdNot(String nome, Long id);
}
