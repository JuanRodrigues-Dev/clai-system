package br.edu.ifpb.clai.repository;

import br.edu.ifpb.clai.model.Pei;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PeiRepository extends JpaRepository<Pei, Long> {
    Optional<Pei> findByAcompanhamentoAlunoMatricula(String matricula);
    boolean existsByAcompanhamentoId(Long acompanhamentoId);
}
