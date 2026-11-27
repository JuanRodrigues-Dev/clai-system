package br.edu.ifpb.clai.controller;

import br.edu.ifpb.clai.model.dto.PeiRequest;
import br.edu.ifpb.clai.model.dto.PeiResponse;
import br.edu.ifpb.clai.model.dto.PeiUpdateStatusRequest;
import br.edu.ifpb.clai.service.PeiService;
import jakarta.validation.Valid;
import java.net.URI;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.util.UriComponentsBuilder;

@RestController
@RequestMapping(value = "/peis", version = "1")
@PreAuthorize("hasAnyRole('CLAI', 'ADMIN', 'PEDAGOGICO')")
public class PeiController {

    private final PeiService peiService;

    public PeiController(PeiService peiService) {
        this.peiService = peiService;
    }

    @PostMapping
    public ResponseEntity<PeiResponse> criar(
            @RequestBody @Valid PeiRequest request,
            UriComponentsBuilder uriBuilder) {
        PeiResponse response = peiService.criar(request);
        URI uri = uriBuilder.path("/peis/aluno/{matricula}")
                .buildAndExpand(response.matriculaAluno())
                .toUri();
        return ResponseEntity.created(uri).body(response);
    }

    @GetMapping("/aluno/{matricula}")
    public ResponseEntity<PeiResponse> buscarPorMatriculaAluno(@PathVariable String matricula) {
        PeiResponse response = peiService.buscarPorMatriculaAluno(matricula);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<PeiResponse> atualizarStatus(
            @PathVariable Long id,
            @RequestBody @Valid PeiUpdateStatusRequest request) {
        PeiResponse response = peiService.atualizarStatus(id, request);
        return ResponseEntity.ok(response);
    }
}
