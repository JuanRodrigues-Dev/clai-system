package br.edu.ifpb.clai.controller;

import br.edu.ifpb.clai.model.dto.AcompanhamentoRequest;
import br.edu.ifpb.clai.model.dto.AcompanhamentoResponse;
import br.edu.ifpb.clai.model.dto.AcompanhamentoUpdateRequest;
import br.edu.ifpb.clai.service.AcompanhamentoService;
import jakarta.validation.Valid;
import java.net.URI;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.util.UriComponentsBuilder;

@RestController
@RequestMapping(value = "/acompanhamentos", version = "1")
public class AcompanhamentoController {

    private final AcompanhamentoService acompanhamentoService;

    public AcompanhamentoController(AcompanhamentoService acompanhamentoService) {
        this.acompanhamentoService = acompanhamentoService;
    }

    @PostMapping
    public ResponseEntity<AcompanhamentoResponse> criar(
            @RequestBody @Valid AcompanhamentoRequest request,
            UriComponentsBuilder uriBuilder) {
        AcompanhamentoResponse response = acompanhamentoService.criar(request);
        URI uri = uriBuilder.path("/acompanhamentos/aluno/{matricula}")
                .buildAndExpand(response.matriculaAluno())
                .toUri();
        return ResponseEntity.created(uri).body(response);
    }

    @GetMapping("/aluno/{matricula}")
    public ResponseEntity<AcompanhamentoResponse> buscarPorMatriculaAluno(@PathVariable String matricula) {
        AcompanhamentoResponse response = acompanhamentoService.buscarPorMatriculaAluno(matricula);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<AcompanhamentoResponse> atualizar(
            @PathVariable Long id,
            @RequestBody @Valid AcompanhamentoUpdateRequest request) {
        AcompanhamentoResponse response = acompanhamentoService.atualizar(id, request);
        return ResponseEntity.ok(response);
    }
}
