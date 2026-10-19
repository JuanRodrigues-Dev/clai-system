# AGENT.md — Backend (CLAI)

Backend do sistema da CLAI (IFPB Campus Cajazeiras): API REST em Java 21 com Spring Boot 4. Antes de alterar código, leia este arquivo.

## Stack e ferramentas

- Java 21, Spring Boot 4, [Maven | Gradle], [PostgreSQL | MySQL | MariaDB | MongoDB].
- Banco de dados roda como serviço do Docker Compose. Nunca use H2 ou SQLite, nem em testes.
- Comandos: teste `[./mvnw test | ./gradlew test]`, subir ambiente `docker compose -f docker-compose-dev.yml --env-file .env.dev up --build -d`.

## Arquitetura

Pacote base `br.edu.ifpb.clai`, organizado por camada:

```plaintext
br.edu.ifpb.clai
├── controller/   # endpoints REST; delega ao service
├── service/      # regras de negócio; único que chama o repository
├── repository/   # acesso ao banco
├── model/        # entidades e DTOs
└── config/       # configurações do Spring
```

- A dependência segue `controller` → `service` → `repository`. Nunca na direção contrária.
- O `controller` não retorna entidades; use DTOs.
- Nomes: `<Entidade>Controller`, `<Entidade>Service`, `<Entidade>Repository`.

## Regras de comportamento

- Siga o padrão das classes existentes na mesma camada antes de criar algo novo.
- Faça mudanças pequenas e focadas na task em andamento. Não refatore áreas não relacionadas sem pedido.
- Não adicione dependências sem justificativa. Se adicionar, explique no PR.
- Não altere nem desative testes para fazer o build passar.
- Se houver dúvida sobre regra de negócio ou arquitetura, pergunte antes de implementar.
- Ao concluir uma task, acrescente uma entrada em `docs/agentes/AAAA-MM.md` (crie o arquivo se não existir) com:
    - data e id da task;
    - arquivos alterados;
    - decisões tomadas por conta própria;
    - pontos pendentes de revisão.
- Se a mudança alterar a arquitetura ou uma decisão técnica, crie um novo ADR em `docs/decisoes/` com o próximo número. Nunca edite ou apague um ADR existente.
- Não registre dados pessoais de estudantes nem laudos em `docs/`.

## Segurança

- Nunca escreva credenciais em código ou em `application*.properties`. Use variáveis de ambiente.
- Não versione `.env*` reais. Ao criar uma variável nova, atualize o `.env.example` só com o nome.
- Não logue dados pessoais de estudantes nem laudos.
- Em exemplos, use dados fictícios.

## Git

- Nunca commite em `main` ou `development`. Trabalhe em `feature/task-{id}-{descrição}`, `fix/task-{id}-{descrição}` ou `docs/task-{id}-{descrição}`, criadas a partir da `development`.
- Não crie branch sem issue correspondente. `{id}` é o número da issue.
- Commits no formato `<tipo>: <mensagem>` (`feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `perf`).
- PR com base `development`. Mova a task para `In review` ao abrir o PR.