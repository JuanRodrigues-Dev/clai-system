package br.edu.ifpb.clai.controller;

import br.edu.ifpb.clai.model.dto.DisciplinaRequest;
import br.edu.ifpb.clai.model.dto.DisciplinaResponse;
import br.edu.ifpb.clai.model.dto.DisciplinaUpdateStatusRequest;
import br.edu.ifpb.clai.service.DisciplinaService;
import jakarta.validation.Valid;
import java.net.URI;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.util.UriComponentsBuilder;

@RestController
@RequestMapping(value = "/disciplinas", version = "1")
public class DisciplinaController {

    private final DisciplinaService disciplinaService;

    public DisciplinaController(DisciplinaService disciplinaService) {
        this.disciplinaService = disciplinaService;
    }

    @PostMapping
    public ResponseEntity<DisciplinaResponse> criar(
            @RequestBody @Valid DisciplinaRequest request,
            UriComponentsBuilder uriBuilder) {

        DisciplinaResponse response = disciplinaService.criar(request);

        URI uri = uriBuilder.path("/disciplinas/{id}")
            .buildAndExpand(response.id())
            .toUri();

        return ResponseEntity.created(uri).body(response);
    }

    @GetMapping
    public ResponseEntity<List<DisciplinaResponse>> listar() {
        return ResponseEntity.ok(disciplinaService.listarAtivas());
    }

    @GetMapping("/{id}")
    public ResponseEntity<DisciplinaResponse> buscarPorId(
            @PathVariable Long id) {

        return ResponseEntity.ok(disciplinaService.buscarPorId(id));
    }

    @GetMapping("/curso/{cursoId}")
    public ResponseEntity<List<DisciplinaResponse>> listarPorCurso(
            @PathVariable Long cursoId) {

        return ResponseEntity.ok(
            disciplinaService.listarPorCurso(cursoId)
        );
    }

    @PutMapping("/{id}")
    public ResponseEntity<DisciplinaResponse> atualizar(
            @PathVariable Long id,
            @RequestBody @Valid DisciplinaRequest request) {

        return ResponseEntity.ok(
            disciplinaService.atualizar(id, request)
        );
    }

    @PatchMapping("/{id}")
    public ResponseEntity<Void> atualizarStatus(
            @PathVariable Long id,
            @RequestBody @Valid DisciplinaUpdateStatusRequest request) {

        disciplinaService.atualizarStatus(id, request);
        return ResponseEntity.noContent().build();
    }
}