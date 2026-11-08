package br.edu.ifpb.clai.service.exception;

public class ConflitoDeDadosException extends RuntimeException {
    public ConflitoDeDadosException(String mensagem) {
        super(mensagem);
    }
}
