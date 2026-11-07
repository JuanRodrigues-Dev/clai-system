-- ============================================================================
-- V2: Dados de Referência (Seeds de Roles, Cursos e Disciplinas do Campus)
-- ============================================================================

INSERT INTO roles (nome, descricao) VALUES
                                        ('ROLE_ADMIN', 'Administrador geral do sistema'),
                                        ('ROLE_CLAI', 'Membro da Coordenação de Ações Inclusivas (CLAI)'),
                                        ('ROLE_PEDAGOGICO', 'Equipe multiprofissional e pedagógica (Psicopedagogia / Pedagogia)'),
                                        ('ROLE_ASSISTENTE', 'Assistência Estudantil (Psicologia / Serviço Social)'),
                                        ('ROLE_COORDENADOR', 'Coordenador de Curso'),
                                        ('ROLE_PROFESSOR', 'Docente de disciplina'),
                                        ('ROLE_DDE', 'Diretoria de Desenvolvimento do Ensino (DDE)')
    ON CONFLICT (nome) DO NOTHING;

INSERT INTO curso (nome, nivel, ativo) VALUES
                                           ('Análise e Desenvolvimento de Sistemas', 'SUPERIOR', TRUE),
                                           ('Engenharia Civil', 'SUPERIOR', TRUE),
                                           ('Engenharia de Controle e Automação', 'SUPERIOR', TRUE),
                                           ('Licenciatura em Matemática', 'SUPERIOR', TRUE),
                                           ('Licenciatura em Computação e Informática', 'SUPERIOR', TRUE),
                                           ('Técnico Integrado em Informática', 'TECNICO_INTEGRADO', TRUE),
                                           ('Técnico Integrado em Eletromecânica', 'TECNICO_INTEGRADO', TRUE),
                                           ('Técnico Integrado em Edificações', 'TECNICO_INTEGRADO', TRUE),
                                           ('Técnico Subsequente em Eletromecânica', 'TECNICO_SUBSEQUENTE', TRUE),
                                           ('Técnico Subsequente em Edificações', 'TECNICO_SUBSEQUENTE', TRUE)
    ON CONFLICT (nome) DO NOTHING;

INSERT INTO disciplina (nome, codigo, periodo, carga_horaria, curso_id, ativo)
SELECT 'Laboratório de Engenharia de Software', 'LES', 5, 67, c.id, TRUE
FROM curso c
WHERE c.nome = 'Análise e Desenvolvimento de Sistemas'
    ON CONFLICT (nome, curso_id) DO NOTHING;

INSERT INTO disciplina (nome, codigo, periodo, carga_horaria, curso_id, ativo)
SELECT 'Banco de Dados II', 'BD2', 3, 67, c.id, TRUE
FROM curso c
WHERE c.nome = 'Análise e Desenvolvimento de Sistemas'
    ON CONFLICT (nome, curso_id) DO NOTHING;

INSERT INTO disciplina (nome, codigo, periodo, carga_horaria, curso_id, ativo)
SELECT 'Programação para Web I', 'PW1', 4, 83, c.id, TRUE
FROM curso c
WHERE c.nome = 'Análise e Desenvolvimento de Sistemas'
    ON CONFLICT (nome, curso_id) DO NOTHING;