package br.edu.ifpb.clai.repository;

import br.edu.ifpb.clai.model.Aluno;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface AlunoRepository extends JpaRepository<Aluno, UUID> {
    Optional<Aluno> findByMatriculaAndAtivoTrue(String matricula);
    Page<Aluno> findByAtivoTrue(Pageable pageable);
    boolean existsByMatricula(String matricula);
}