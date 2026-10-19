# Plano de Desenvolvimento — CLAI (Fase 1)

Plano de execução do código da fase 1: administrador, autenticação e CRUD de alunos. Escopo, requisitos e cronograma estão em `docs/planejamento/`. Decisões técnicas estão em `docs/decisoes/`.

## Premissas técnicas

- Banco PostgreSQL hospedado no Supabase, acessado por variáveis de ambiente (ver `docs/decisoes/0002-banco-postgresql.md`).
- Migrações com Flyway. O schema nunca é alterado pelo painel do Supabase.
- Autenticação com JWT. Senhas com BCrypt.
- Exclusão lógica: o campo `ativo` é alterado, sem `DELETE`.
- Matrícula é única e é usada na rota (`/v1/aluno/{matricula}`).
- Backend organizado por camada, pacote base `br.edu.ifpb.clai` (ver `docs/decisoes/0001-arquitetura-por-camada.md`).

## Ordem de execução

```
[1] Infra ──> [2] Base Spring ──> [3] Flyway ──> [4] Admin ──> [5] Auth JWT
                                                                    │
                                        ┌───────────────────────────┼───────────────┐
                                        ▼                           ▼               ▼
                                   [6] POST                    [7] GET        [8] PUT / [9] PATCH
[2] ──> [10] Gateway ──> [11] Front login ──> [12] Front listagem ──> [13] Front cadastro/edição
                                                                   └──> [14] Front exclusão
[15] Testes de integração (após 6–9)     [16] README e ADRs (após 2)
```

## Tasks de código

### Task 1 — Infraestrutura de execução
Arquivos:
- `docker-compose-dev.yml`: serviços `backend` e, quando houver, `frontend` e `gateway`. Sem serviço de banco.
- `docker-compose-prod.yml`: mesmos serviços, sem portas do backend expostas ao host.
- `.env.example`: `DB_URL`, `DB_USER`, `DB_PASSWORD`, `SPRING_PROFILES_ACTIVE`, `JWT_SECRET`, `JWT_EXPIRATION_MINUTES`.

Pronto quando: `docker compose -f docker-compose-dev.yml --env-file .env.dev up -d` sobe a aplicação conectada ao Supabase de desenvolvimento.

### Task 2 — Base do Spring Boot
Arquivos:
- `apps/backend/pom.xml` (ou `build.gradle`): Spring Boot 4, Java 21, Web, Data JPA, Validation, Security, Flyway, driver PostgreSQL, Actuator.
- `apps/backend/Dockerfile`: build multi-stage (JDK 21 para compilar, JRE 21 para executar).
- Pacotes `controller`, `service`, `repository`, `model`, `config` com `package-info.java`.
- `application.properties` (comum), `application-dev.properties` e `application-prod.properties` (datasource via `${DB_URL}`, `${DB_USER}`, `${DB_PASSWORD}`).

Pronto quando: a aplicação sobe conectada ao Supabase e `GET /actuator/health` retorna `UP`.

### Task 3 — Migrações Flyway
Arquivos:
- `src/main/resources/db/migration/V1__cria_usuario_admin.sql`
- `src/main/resources/db/migration/V2__cria_aluno.sql`

Regras:
- `usuario_admin`: `id` (PK), `email` (UNIQUE), `senha_hash` (NOT NULL), `criado_em`, `ativo`.
- `aluno`: `id` (PK), `matricula` (UNIQUE NOT NULL), `nome`, `data_nascimento`, `email` (opcional), `ativo` (DEFAULT true NOT NULL), `criado_em`, `atualizado_em`.
- Índice em `aluno (ativo)`.
- Bloquear o acesso público às tabelas pela Data API do Supabase (RLS com políticas explícitas ou bloqueio), pois o acesso é feito só pela API.

Pronto quando: o Flyway aplica V1 e V2 no Supabase, sem alterações manuais.

### Task 4 — Administrador inicial
Arquivos:
- Classe `br.edu.ifpb.clai.config.GeradorSenha` (utilitário executado manualmente, sem `@Component`), que gera o hash BCrypt.
- Seção "Criar administrador" no `README.md`, com o `INSERT` e o procedimento. Não incluir senha ou hash real.

Pronto quando: o administrador pode ser criado seguindo somente o README.

### Task 5 — Autenticação JWT
Arquivos:
- `config/SecurityConfig`: sessão stateless, `/v1/auth` público, demais rotas autenticadas, `BCryptPasswordEncoder`.
- `config/JwtProperties` (`@ConfigurationProperties`).
- `service/JwtService` (gera e valida o token).
- `config/JwtAuthenticationFilter` (lê `Authorization: Bearer`).
- `model/UsuarioAdmin` e `repository/UsuarioAdminRepository`.
- `service/AuthService` e `controller/AuthController` com `POST /v1/auth`.
- `model/dto/LoginRequest` e `model/dto/TokenResponse`.

Regras: erro de login genérico (`401`), sem indicar se o e-mail existe; usuário com `ativo = false` não autentica.

Pronto quando: login válido retorna token; login inválido retorna `401`; rota protegida sem token retorna `401`.

### Task 6 — Cadastro de aluno
Arquivos:
- `model/Aluno` e `repository/AlunoRepository`.
- `model/dto/AlunoRequest` (`@NotBlank`, `@Past` em `dataNascimento`, `@Email` opcional) e `model/dto/AlunoResponse`.
- `service/AlunoService.cadastrar(...)`: verifica matrícula duplicada.
- `controller/AlunoController`: `POST /v1/aluno`, retorna `201`.
- Tratamento global de exceções (`400`, `404`, `409`) com corpo padronizado.

Pronto quando: cadastro válido retorna `201`; matrícula repetida retorna `409`; campo inválido retorna `400`.

### Task 7 — Consulta de alunos
- `GET /v1/aluno`: paginado, ordenado por nome, somente ativos.
- `GET /v1/aluno/{matricula}`: retorna o aluno ou `404` (inclusive para inativo).

Pronto quando: a listagem traz apenas ativos com paginação, e a busca retorna um aluno ou `404`.

### Task 8 — Alteração de aluno
- `PUT /v1/aluno/{matricula}`.

Regras: a matrícula não pode ser alterada; aluno inativo retorna `404`; o `PUT` exige todos os campos.

Pronto quando: alteração válida retorna `200` e atualiza `atualizado_em`.

### Task 9 — Exclusão lógica
- `PATCH /v1/aluno/{matricula}/ativo`, com corpo `{ "ativo": boolean }`.

Regra: operação idempotente.

Pronto quando: o aluno some da listagem com `ativo: false` e volta com `ativo: true`.

### Task 10 — Gateway
Arquivos:
- `gateway/nginx.conf` (ou `gateway/traefik/`): `/api/` para o backend, `/` para o frontend.
- Serviço `gateway` em `docker-compose-prod.yml`. Somente o gateway expõe porta ao host.

Pronto quando: `http://localhost/api/actuator/health` responde pelo gateway.

### Tasks 11 a 14 — Frontend
- **11:** tela de login, cliente HTTP em `src/services/` que envia o token, guarda de rotas.
- **12:** listagem paginada e busca por matrícula.
- **13:** formulário único de cadastro e edição, com validação e mensagens em `role="alert"`.
- **14:** exclusão lógica com diálogo de confirmação, chamando `PATCH .../ativo` com `false`.

Critério: formulários com `label`, navegação por teclado, mensagens anunciadas. Ver `apps/frontend/AGENT.md`.

### Task 15 — Testes de integração
- Testes de auth (login, `401` sem token) e de CRUD (cadastro, matrícula duplicada, listagem sem inativos, atualização, exclusão lógica).
- Usar um projeto Supabase separado de desenvolvimento, ou Postgres local via Testcontainers com a mesma versão. Nunca apontar para produção. Remover os dados de teste ao final.

Pronto quando: os testes passam com banco real, sem H2.

### Task 16 — Documentação
- `README.md` com Sobre, Stack utilizada (com versões) e Guia de instalação.
- ADRs 0001 e 0002 em `docs/decisoes/`.

## Pendências

- [ ] Confirmar com o professor se o Supabase substitui o serviço de banco exigido no Docker Compose (seções 2.3 e 5).
- [ ] Definir o projeto Supabase de desenvolvimento e o de produção, separados.
- [ ] Revisar RLS e a exposição da Data API do Supabase antes do deploy.
- [ ] Definir como o deploy será feito, em fase posterior.

## Critério geral de conclusão

Uma task só vai para `Done` quando:
- o código compila e os testes da task passam;
- o PR tem base `development` e, quando um agente foi usado, registro em `docs/agentes/`;
- outro membro testou e registrou o parecer no card;
- nenhum segredo, `.env` real ou dado pessoal foi versionado.