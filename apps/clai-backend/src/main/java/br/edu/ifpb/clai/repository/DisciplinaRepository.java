
package br.edu.ifpb.clai.repository;

import br.edu.ifpb.clai.model.Disciplina;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DisciplinaRepository extends JpaRepository<Disciplina, Long> {

    List<Disciplina> findByAtivoTrue();

    List<Disciplina> findByCursoIdAndAtivoTrue(Long cursoId);

    Optional<Disciplina> findByIdAndAtivoTrue(Long id);

    boolean existsByNomeIgnoreCaseAndCursoId(String nome, Long cursoId);

    boolean existsByNomeIgnoreCaseAndCursoIdAndIdNot(
        String nome,
        Long cursoId,
        Long id
    );
}
