# AGENT.md — Frontend (CLAI)

Frontend do sistema da CLAI (IFPB Campus Cajazeiras), que consome a API do backend. Antes de alterar código, leia este arquivo.

## Stack e ferramentas

- [React, TypeScript, Vite, Tailwind.
- Comandos: teste `[npm test]`, lint `[npm run lint]`, build `[npm run build]`.
- O build de produção deve passar antes de abrir PR.

## Integração com o backend

- Chame a API pelo prefixo `/api`. Nunca use URLs fixas como `http://localhost:8080`.
- Centralize as chamadas HTTP em `src/services/`, não dentro dos componentes.
- Não coloque segredos no frontend. Tudo que vai no bundle é público.
- Variáveis de ambiente: `.env.dev` e `.env.prod` não são versionados. Versione só o `.env.example`.

## Estrutura

Organização por funcionalidade:

```plaintext
src/
├── features/     # telas, componentes e chamadas de cada funcionalidade
├── components/   # componentes reutilizáveis entre funcionalidades
├── services/     # chamadas à API
└── shared/       # utilitários e tipos comuns
```

- Antes de criar um componente, procure um equivalente existente e reutilize.
- Mantenha o padrão visual já adotado.

## Acessibilidade

Requisito do projeto, não extra:

- HTML semântico. Todo campo tem `label`.
- Navegação completa por teclado e foco visível.
- Contraste mínimo WCAG AA. Não use só cor para transmitir informação.
- Mensagens de erro e sucesso com `role="alert"` ou `aria-live`.

## Regras de comportamento

- Faça mudanças pequenas e focadas na task em andamento. Não refatore áreas não relacionadas sem pedido.
- Não adicione bibliotecas sem justificativa. Se adicionar, explique no PR.
- Não deixe `console.log`, código comentado ou `TODO` sem issue no código commitado.
- Não desative testes para fazer o build passar.
- Se houver dúvida sobre regra de negócio ou fluxo de tela, pergunte antes de implementar.
- Ao concluir uma task, acrescente uma entrada em `docs/agentes/AAAA-MM.md` (crie o arquivo se não existir) com:
  - data e id da task;
  - arquivos alterados;
  - decisões tomadas por conta própria;
  - pontos pendentes de revisão.
- Se a mudança alterar a arquitetura ou uma decisão técnica, crie um novo ADR em `docs/decisoes/` com o próximo número. Nunca edite ou apague um ADR existente.
- Não registre dados pessoais de estudantes nem laudos em `docs/`.

## Git

- Nunca commite em `main` ou `development`. Trabalhe em `feature/task-{id}-{descrição}`, `fix/task-{id}-{descrição}` ou `docs/task-{id}-{descrição}`, criadas a partir da `development`.
- Não crie branch sem issue correspondente. `{id}` é o número da issue.
- Commits no formato `<tipo>: <mensagem>` (`feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `perf`).
- PR com base `development`. Mova a task para `In review` ao abrir o PR.