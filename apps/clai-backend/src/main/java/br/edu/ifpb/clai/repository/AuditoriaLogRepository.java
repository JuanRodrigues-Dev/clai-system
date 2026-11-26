package br.edu.ifpb.clai.repository;

import br.edu.ifpb.clai.model.AuditoriaLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

/**
 * Repositório de acesso aos registros imutáveis da trilha de auditoria.
 */
@Repository
public interface AuditoriaLogRepository
        extends JpaRepository<AuditoriaLog, Long>, JpaSpecificationExecutor<AuditoriaLog> {

    Page<AuditoriaLog> findAllByOrderByTimestampDesc(Pageable pageable);
}
