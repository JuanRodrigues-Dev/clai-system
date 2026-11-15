# ADR 0004 — Versionamento da API por cabeçalho

- **Status:** Aceita
- **Data:** 2026-11-14
- **Referência:** Issue #108

## Contexto

Os endpoints da API precisam evoluir sem depender de versões no caminho da URL. O backend utiliza Spring MVC e precisa oferecer uma versão padrão para clientes que ainda não enviam uma versão explicitamente.

## Decisão

1. Usar o cabeçalho HTTP `X-API-Version` como mecanismo de seleção da versão da API, configurado em `spring.mvc.apiversion.use.header`.
2. Definir a versão `1` como padrão em `spring.mvc.apiversion.default`.
3. Declarar a versão compatível (`version = "1"`) nos mappings dos controllers versionados.
4. Os clientes podem enviar `X-API-Version: 1`; chamadas sem o cabeçalho continuam resolvendo para a versão padrão.

## Consequências

- A evolução para uma nova versão pode coexistir com mappings anteriores sem alterar o formato das URLs.
- O gateway e as configurações de CORS precisam permitir o cabeçalho `X-API-Version`.
- Testes de controller verificam tanto a versão padrão quanto o envio explícito do cabeçalho.
