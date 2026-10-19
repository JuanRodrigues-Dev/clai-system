package br.edu.ifpb.clai.model.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.constraints.NotBlank;

public record LoginRequest(
        @NotBlank @JsonAlias("username") String email,
        @NotBlank @JsonAlias("password") String senha) {
}
