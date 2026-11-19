# ADR 0003 — Gerenciamento de Schema com Flyway e Hibernate Validate

- **Status:** Aceita
- **Data:** 2026-10-27
- **Referência:** Issue #101 ([AP-01] Avaliação do professor), Issues #102, #103 e #104

## Contexto

Na Sprint 1, o schema do banco de dados PostgreSQL era atualizado automaticamente pelo Hibernate por meio de `spring.jpa.hibernate.ddl-auto: update`. Na avaliação da Sprint 1 (Issue #101), o professor recomendou adotar uma ferramenta de versionamento de schema (Flyway) com `ddl-auto: validate` em todos os perfis e utilizar migrações SQL para carga de dados de referência (seeds).

## Decisão

1. Adotar o **Flyway** (`spring-boot-starter-flyway` e `flyway-database-postgresql`) como única ferramenta responsável pela criação e evolução das tabelas em `src/main/resources/db/migration/`.
2. Configurar `spring.jpa.hibernate.ddl-auto: validate` no `application.yaml` base, valendo para todos os perfis (`dev` e `prod`).
3. Realizar a carga inicial de dados de referência (`roles`, `curso`, `disciplina`) por meio de migração versionada (`V2__dados_referencia.sql`).

## Consequências

- Qualquer criação ou alteração de entidade JPA exige uma migração SQL (`V{n}__{descricao}.sql`) correspondente.
- Divergências entre as entidades JPA e as tabelas do PostgreSQL são detectadas imediatamente na inicialização da aplicação.
- Todos os ambientes (desenvolvimento local, Docker e produção) executam exatamente o mesmo histórico de schema e seeds.
