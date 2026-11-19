
package br.edu.ifpb.clai.controller;

import br.edu.ifpb.clai.model.dto.CursoRequest;
import br.edu.ifpb.clai.model.dto.CursoResponse;
import br.edu.ifpb.clai.model.dto.CursoUpdateStatusRequest;
import br.edu.ifpb.clai.service.CursoService;
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
@RequestMapping(value = "/cursos", version = "1")
public class CursoController {

    private final CursoService cursoService;

    public CursoController(CursoService cursoService) {
        this.cursoService = cursoService;
    }

    @PostMapping
    public ResponseEntity<CursoResponse> criar(
            @RequestBody @Valid CursoRequest request,
            UriComponentsBuilder uriBuilder) {

        CursoResponse response = cursoService.criar(request);

        URI uri = uriBuilder.path("/cursos/{id}")
            .buildAndExpand(response.id())
            .toUri();

        return ResponseEntity.created(uri).body(response);
    }

    @GetMapping
    public ResponseEntity<List<CursoResponse>> listar() {
        return ResponseEntity.ok(cursoService.listarAtivos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<CursoResponse> buscarPorId(
            @PathVariable Long id) {

        return ResponseEntity.ok(cursoService.buscarPorId(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CursoResponse> atualizar(
            @PathVariable Long id,
            @RequestBody @Valid CursoRequest request) {

        return ResponseEntity.ok(cursoService.atualizar(id, request));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<Void> atualizarStatus(
            @PathVariable Long id,
            @RequestBody @Valid CursoUpdateStatusRequest request) {

        cursoService.atualizarStatus(id, request);
        return ResponseEntity.noContent().build();
    }
}
