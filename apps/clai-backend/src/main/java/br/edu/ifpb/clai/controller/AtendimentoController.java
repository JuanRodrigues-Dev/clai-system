package br.edu.ifpb.clai.controller;

import br.edu.ifpb.clai.model.dto.AtendimentoRequest;
import br.edu.ifpb.clai.model.dto.AtendimentoResponse;
import br.edu.ifpb.clai.model.dto.AtendimentoUpdateRequest;
import br.edu.ifpb.clai.service.AtendimentoService;
import jakarta.validation.Valid;
import java.net.URI;
import java.util.List;
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
@RequestMapping(value = "/atendimentos", version = "1")
@PreAuthorize("hasAnyRole('CLAI', 'ADMIN', 'PEDAGOGICO')")
public class AtendimentoController {

    private final AtendimentoService atendimentoService;

    public AtendimentoController(AtendimentoService atendimentoService) {
        this.atendimentoService = atendimentoService;
    }

    @PostMapping
    public ResponseEntity<AtendimentoResponse> criar(
            @RequestBody @Valid AtendimentoRequest request,
            UriComponentsBuilder uriBuilder) {

        AtendimentoResponse response = atendimentoService.criar(request);

        URI uri = uriBuilder.path("/atendimentos/{id}")
                .buildAndExpand(response.id())
                .toUri();

        return ResponseEntity.created(uri).body(response);
    }

    @GetMapping("/aluno/{matricula}")
    public ResponseEntity<List<AtendimentoResponse>> buscarPorMatriculaAluno(
            @PathVariable String matricula) {

        List<AtendimentoResponse> response =
                atendimentoService.buscarPorMatriculaAluno(matricula);

        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<AtendimentoResponse> atualizar(
            @PathVariable Long id,
            @RequestBody @Valid AtendimentoUpdateRequest request) {

        AtendimentoResponse response = atendimentoService.atualizar(id, request);

        return ResponseEntity.ok(response);
    }
}
