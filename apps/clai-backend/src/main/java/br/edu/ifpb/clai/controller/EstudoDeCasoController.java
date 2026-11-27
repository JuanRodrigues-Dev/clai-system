package br.edu.ifpb.clai.controller;

import br.edu.ifpb.clai.model.dto.EstudoDeCasoRequest;
import br.edu.ifpb.clai.model.dto.EstudoDeCasoResponse;
import br.edu.ifpb.clai.service.EstudoDeCasoService;
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
@RequestMapping(value = "/estudos-caso", version = "1")
@PreAuthorize("hasAnyRole('CLAI', 'ADMIN', 'PEDAGOGICO')")
public class EstudoDeCasoController {

    private final EstudoDeCasoService estudoService;

    public EstudoDeCasoController(EstudoDeCasoService estudoService) {
        this.estudoService = estudoService;
    }

    @PostMapping
    public ResponseEntity<EstudoDeCasoResponse> criar(
            @RequestBody @Valid EstudoDeCasoRequest request,
            UriComponentsBuilder uriBuilder) {
        EstudoDeCasoResponse response = estudoService.criar(request);
        URI uri = uriBuilder.path("/estudos-caso/aluno/{matricula}")
                .buildAndExpand(response.matriculaAluno())
                .toUri();

        return ResponseEntity.created(uri).body(response);
    }

    @GetMapping("/aluno/{matricula}")
    public ResponseEntity<EstudoDeCasoResponse> buscarPorMatricula(
            @PathVariable String matricula) {
        return ResponseEntity.ok(estudoService.buscarPorMatricula(matricula));
    }

    @PutMapping("/aluno/{matricula}")
    public ResponseEntity<EstudoDeCasoResponse> atualizar(
            @PathVariable String matricula,
            @RequestBody @Valid EstudoDeCasoRequest request) {
        return ResponseEntity.ok(estudoService.atualizar(matricula, request));
    }
}
