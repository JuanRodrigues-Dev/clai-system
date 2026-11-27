package br.edu.ifpb.clai.service;

import br.edu.ifpb.clai.config.Auditar;
import br.edu.ifpb.clai.model.Aluno;
import br.edu.ifpb.clai.model.EstudoDeCaso;
import br.edu.ifpb.clai.model.dto.EstudoDeCasoRequest;
import br.edu.ifpb.clai.model.dto.EstudoDeCasoResponse;
import br.edu.ifpb.clai.repository.AlunoRepository;
import br.edu.ifpb.clai.repository.EstudoDeCasoRepository;
import br.edu.ifpb.clai.service.exception.ConflitoDeDadosException;
import br.edu.ifpb.clai.service.exception.RecursoNaoEncontradoException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class EstudoDeCasoService {

    private final EstudoDeCasoRepository estudoRepository;
    private final AlunoRepository alunoRepository;

    public EstudoDeCasoService(
            EstudoDeCasoRepository estudoRepository,
            AlunoRepository alunoRepository) {
        this.estudoRepository = estudoRepository;
        this.alunoRepository = alunoRepository;
    }

    @Auditar(recurso = "ESTUDO_CASO", acao = "CRIACAO")
    @Transactional
    public EstudoDeCasoResponse criar(EstudoDeCasoRequest request) {
        Aluno aluno = alunoRepository.findByMatriculaAndAtivoTrue(request.matriculaAluno())
                .orElseThrow(() -> new RecursoNaoEncontradoException(
                        "Aluno nao encontrado ou inativo."));

        if (estudoRepository.existsByAlunoId(aluno.getId())) {
            throw new ConflitoDeDadosException(
                    "Ja existe um estudo de caso cadastrado para este aluno.");
        }

        EstudoDeCaso estudo = new EstudoDeCaso();
        estudo.setAluno(aluno);
        aplicarDados(estudo, request);

        return EstudoDeCasoResponse.fromEntity(estudoRepository.save(estudo));
    }

    @Auditar(recurso = "ESTUDO_CASO", acao = "LEITURA")
    @Transactional(readOnly = true)
    public EstudoDeCasoResponse buscarPorMatricula(String matricula) {
        EstudoDeCaso estudo = estudoRepository.findByAlunoMatricula(matricula)
                .orElseThrow(() -> new RecursoNaoEncontradoException(
                        "Estudo de caso nao encontrado para a matricula informada."));

        return EstudoDeCasoResponse.fromEntity(estudo);
    }

    @Auditar(recurso = "ESTUDO_CASO", acao = "ATUALIZACAO")
    @Transactional
    public EstudoDeCasoResponse atualizar(
            String matricula,
            EstudoDeCasoRequest request) {
        EstudoDeCaso estudo = estudoRepository.findByAlunoMatricula(matricula)
                .orElseThrow(() -> new RecursoNaoEncontradoException(
                        "Estudo de caso nao encontrado."));

        aplicarDados(estudo, request);

        return EstudoDeCasoResponse.fromEntity(estudoRepository.save(estudo));
    }

    private void aplicarDados(EstudoDeCaso estudo, EstudoDeCasoRequest request) {
        estudo.setDataRealizacao(request.dataRealizacao());
        estudo.setParticipantes(request.participantes());
        estudo.setHistoricoEscolar(request.historicoEscolar());
        estudo.setHistoricoFamiliar(request.historicoFamiliar());
        estudo.setBarreirasDificuldades(request.barreirasDificuldades());
        estudo.setPotencialidades(request.potencialidades());
        estudo.setNecessidadesSuporte(request.necessidadesSuporte());
        estudo.setNecessitaAcompanhamento(request.necessitaAcompanhamento());
        estudo.setNecessitaAdaptacaoCurricular(request.necessitaAdaptacaoCurricular());
        estudo.setConclusoes(request.conclusoes());
        estudo.setEncaminhamentos(request.encaminhamentos());
    }
}
