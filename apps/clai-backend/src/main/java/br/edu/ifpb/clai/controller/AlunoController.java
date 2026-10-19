package br.edu.ifpb.clai.controller;

import br.edu.ifpb.clai.model.dto.AlunoRequest;
import br.edu.ifpb.clai.model.dto.AlunoResponse;
import br.edu.ifpb.clai.model.dto.AlunoUpdateRequest;
import br.edu.ifpb.clai.model.dto.AlunoUpdateStatusRequest;
import br.edu.ifpb.clai.service.AlunoService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;

@RestController
@RequestMapping("/v1/aluno")
public class AlunoController {

    private final AlunoService alunoService;

    public AlunoController(AlunoService alunoService) {
        this.alunoService = alunoService;
    }

    @PostMapping
    public ResponseEntity<AlunoResponse> criar(@RequestBody @Valid AlunoRequest request, UriComponentsBuilder uriBuilder) {
        AlunoResponse response = alunoService.criar(request);
        URI uri = uriBuilder.path("/v1/aluno/{matricula}").buildAndExpand(response.matricula()).toUri();
        return ResponseEntity.created(uri).body(response);
    }

    @GetMapping
    public ResponseEntity<Page<AlunoResponse>> listar(
            @PageableDefault(size = 10, sort = "nome", direction = Sort.Direction.ASC) Pageable pageable) {
        Page<AlunoResponse> alunos = alunoService.listarAtivos(pageable);
        return ResponseEntity.ok(alunos);
    }

    @GetMapping("/{matricula}")
    public ResponseEntity<AlunoResponse> buscarPorMatricula(@PathVariable String matricula) {
        AlunoResponse response = alunoService.buscarPorMatricula(matricula);
        return ResponseEntity.ok(response);
    }
    @PutMapping("/{matricula}")
    public ResponseEntity<AlunoResponse> atualizar(@PathVariable String matricula, @RequestBody @Valid AlunoUpdateRequest request) {
        AlunoResponse response = alunoService.atualizar(matricula, request);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{matricula}")
    public ResponseEntity<Void> atualizarStatus(@PathVariable String matricula, @RequestBody @Valid AlunoUpdateStatusRequest request) {
        alunoService.atualizarStatus(matricula, request);
        return ResponseEntity.noContent().build();
    }
}