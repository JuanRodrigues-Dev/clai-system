package br.edu.ifpb.clai.repository;

import br.edu.ifpb.clai.model.Acompanhamento;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AcompanhamentoRepository extends JpaRepository<Acompanhamento, Long> {
    Optional<Acompanhamento> findByAlunoMatricula(String matricula);
    boolean existsByAlunoId(UUID alunoId);
}
