package br.edu.ifpb.clai.repository;

import br.edu.ifpb.clai.model.EstudoDeCaso;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EstudoDeCasoRepository extends JpaRepository<EstudoDeCaso, Long> {
    Optional<EstudoDeCaso> findByAlunoMatricula(String matricula);
    boolean existsByAlunoId(UUID alunoId);
}
