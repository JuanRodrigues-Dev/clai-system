package br.edu.ifpb.clai.controller;

import br.edu.ifpb.clai.model.dto.AuditoriaLogResponse;
import br.edu.ifpb.clai.service.AuditoriaService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(value = "/auditoria", version = "1")
@PreAuthorize("hasRole('ADMIN')")
public class AuditoriaController {

    private final AuditoriaService auditoriaService;

    public AuditoriaController(AuditoriaService auditoriaService) {
        this.auditoriaService = auditoriaService;
    }

    @GetMapping
    public ResponseEntity<Page<AuditoriaLogResponse>> listar(
            @RequestParam(required = false) String usuarioEmail,
            @RequestParam(required = false) String recurso,
            @RequestParam(required = false) String acao,
            @RequestParam(required = false) String inicio,
            @RequestParam(required = false) String fim,
            @PageableDefault(size = 20, sort = "timestamp", direction = Sort.Direction.DESC) Pageable pageable) {
        Page<AuditoriaLogResponse> pagina = auditoriaService.listar(
                usuarioEmail, recurso, acao, inicio, fim, pageable);
        return ResponseEntity.ok(pagina);
    }
}
