# AGENTS.md — Frontend do Sistema CLAI
 
Instruções e contexto para agentes de IA (Claude Code, Codex etc.) e para quem for
trabalhar no front. Este arquivo é versionado: entra por PR e **não pode conter
credenciais, senhas ou tokens**.
 
> Atualize a seção "Estado atual" sempre que uma task for concluída.
 
## 1. Sobre o projeto
 
Sistema de Acompanhamento da **CLAI** (Coordenação Local de Acessibilidade e
Inclusão) do IFPB Campus Cajazeiras. Centraliza informações de estudantes com
necessidades educacionais específicas, para apoiar a comunicação entre
profissionais autorizados.
 
- Disciplina: Programação para Web I (2026.2). Cada grupo faz a sua versão.
- Monorepo: backend (Spring Boot) e frontend em `apps/`, gateway (Nginx ou
  Traefik) e Docker Compose na raiz.
- Este arquivo vale para `apps/clai-frontend`, o frontend **desacoplado**
  (React), que consome a API em `/api` através do gateway.
- Na Sprint 1 o front tem: login, layout, página Início, lista e cadastro de
  estudantes.
## 2. Stack
 
- React + TypeScript, criado com Vite (template `react-ts`)
- Tailwind CSS v4 (plugin `@tailwindcss/vite`; sem arquivos CSS por componente)
- React Router (`react-router-dom`), Axios, `lucide-react` (ícones)
- Fonte: Plus Jakarta Sans (`@fontsource-variable/plus-jakarta-sans`)
- Versões exatas: conferir `package.json` (o README da raiz precisa listá-las)
## 3. Comandos
 
Rodar sempre dentro de `apps/clai-frontend`:
 
```bash
npm install
npm run dev      # script usa "vite --mode dev" e lê o .env.dev
npm run build
npm run lint
```
 
Reinicie o `npm run dev` ao mudar qualquer `.env`.
 
## 4. Variáveis de ambiente
 
| Variável        | Uso                                                              |
| --------------- | ---------------------------------------------------------------- |
| `VITE_API_URL`  | URL base da API. Usar `/api` (o gateway ou o proxy do Vite roteia) |
| `VITE_USE_MOCK` | `true` liga o login e a lista simulados enquanto o backend não existe |
 
- Versionar só `.env.example` (nomes das variáveis, sem valores reais).
- Os arquivos `.env.dev` e `.env.prod` **não são versionados**.
- O usuário e a senha do login simulado ficam apenas em
  `src/features/auth/authService.ts` (fictícios, só funcionam com o mock ligado).
## 5. Estrutura de pastas
 
Organização **por funcionalidade** (package by feature):
 
```plaintext
src/
├── api/
│   └── http.ts                 # cliente Axios: token no header e tratamento de 401
├── assets/                     # logos e imagens (clai-logo.svg, ilustracao.png)
├── features/
│   ├── auth/                   # LoginPage, authService, authContext, AuthProvider,
│   │                           # useAuth, ProtectedRoute
│   ├── inicio/                 # InicioPage
│   └── estudantes/             # EstudantesListPage, EstudanteFormPage, estudanteService,
│                               # formatadores
├── shared/
│   └── Layout.tsx              # sidebar + cabeçalho com título da página + <Outlet />
├── types/                      # auth.ts, estudante.ts
├── App.tsx                     # rotas
├── main.tsx                    # BrowserRouter + AuthProvider
└── index.css                   # Tailwind, @theme (cores e fonte)
```
 
Novas funcionalidades (estudo de caso, atendimento etc.) ganham a sua pasta em
`features/`. Código usado por mais de uma funcionalidade vai em `shared/`.
 
## 6. Rotas e autenticação
 
| Rota                | Acesso     | Observação                                  |
| ------------------- | ---------- | ------------------------------------------- |
| `/login`            | público    | quem já está logado vai para `/inicio`       |
| `/inicio`           | protegida  | destino padrão após o login                  |
| `/estudantes`       | protegida  | lista                                        |
| `/estudantes/novo`  | protegida  | cadastro                                     |
| `*`                 | —          | redireciona para `/inicio`                   |
 
- Rotas protegidas usam `ProtectedRoute` e ficam dentro do `Layout`.
- O token fica em `localStorage` (chave `token`), gerenciado por `AuthProvider`
  (`signIn`, `signOut`). Isso é simples, mas vulnerável a XSS; registrar a
  decisão no README/docs e rever se o back passar a usar cookie `HttpOnly`.
- O `http.ts` anexa `Authorization: Bearer <token>` e, em resposta 401 fora do
  login, limpa o token e volta para `/login`.
- **O front só esconde telas; a autorização real é do backend.** Nunca tratar a
  ocultação de um botão como controle de acesso.
## 7. Contrato da API (proposta, alinhar com o backend)
 
- `POST /api/auth/login` com `{ username, password }`, retorna `200 { token }`
  ou `401` (sem revelar se o usuário existe).
- `GET /api/estudantes` retorna lista (vazia se não houver registros).
- `POST /api/estudantes` retorna `201` com o estudante, `400` com erros por
  campo, ou `409` em duplicidade.
- Busca e paginação (`?q=`, `?page=`, `?size=`) dependem de combinar com o back.
- Por enquanto a lista, a busca e a paginação (5 por página) funcionam no front,
  sobre o `GET /api/estudantes`, que devolve tudo. Quando o back tiver paginação,
  mover isso para o servidor e usar o total devolvido pela API no card do Início.
## 8. Dados do estudante: provisórios
 
Os campos de estudante usados no esboço e em `types/estudante.ts` são
**fictícios**, só para ilustrar o layout. Os campos reais ainda precisam ser
validados com a CLAI e com o backend. Por isso:
 
- Concentrar os campos em `types/estudante.ts`; formulário e tabela devem
  depender desse tipo para a troca ser fácil.
- Dados de exemplo (mock) devem ser claramente fictícios.
- Não assumir CPF, endereço ou outros dados pessoais como obrigatórios.
- Hoje `types/estudante.ts` tem: `id`, `nome`, `matricula`, `cpf` e
  `dataNascimento` (todos provisórios).
- As colunas da tabela ficam em uma lista no topo de `EstudantesListPage.tsx`.
  Trocar pelos campos reais = editar essa lista e `types/estudante.ts`.
- Com `VITE_USE_MOCK=true`, `estudanteService.ts` devolve 24 estudantes
  fictícios.
## 9. Regras de produto e privacidade
 
- Dados de saúde e necessidades são sensíveis (LGPD): coletar e exibir só o
  necessário. **Não existe laudo médico no sistema nesta versão.**
- Não colocar dados de estudantes, senhas ou tokens em `console.log`, logs ou
  mensagens de erro.
- Erro de login é sempre genérico ("Usuário ou senha inválidos.").
- Fora do escopo da Sprint 1: Relatórios, Configurações, notificações (sino),
  dados reais do dashboard, exclusão de estudante. Não criar esses itens sem
  combinar. Itens futuros ficam escondidos ou desabilitados ("em breve").
- Dashboard: mostrar apenas números que existam de verdade; nunca inventar
  indicadores.
- Na lista, o CPF aparece mascarado (`mascararCpf` em `formatadores.ts`):
  exibir só o necessário.
## 10. Convenções de código
 
- Componentes funcionais; páginas com `export default`.
- TypeScript **leve**: interfaces simples para dados da API e props. Evitar
  generics e tipos avançados. Usar `import type` ao importar só tipos.
- Estilo só com classes do Tailwind. Cores e fonte vêm do `@theme` em
  `index.css`; não repetir códigos hexadecimais soltos nos componentes quando
  houver token.
- Textos da interface em português do Brasil.
- Layout responsivo: a sidebar vira barra superior abaixo de `lg`.
- Acessibilidade (o sistema é de inclusão): `label` ligado a cada campo,
  `aria-label` em botões só com ícone, `role="alert"` em mensagens de erro,
  foco visível, ícones decorativos com `aria-hidden`, navegação possível só
  pelo teclado.
- Cada página tem um único `h1`, que fica no cabeçalho do `Layout` (mapa de
  rota para título em `Layout.tsx`). Ao criar uma rota nova, acrescente o título
  nesse mapa. O conteúdo da página usa `h2`/`h3`.
- Antes de qualquer código novo para backend inexistente, usar mock isolado em
  um serviço (como `authService.ts`), nunca espalhado pelos componentes.
## 11. Identidade visual
 
- Login: painel institucional azul à esquerda e formulário à direita (tokens
  `clai-*` no `@theme`: 950, 900, 800, 700, 600, 300, 100).
- Telas internas (esboço): azul primário `#2563EB` (`blue-600` do Tailwind),
  fundo `#F8FAFC`, superfícies brancas, erro `#EF4444`, sucesso `#10B981`.
- Sidebar escura (`clai-950`), item ativo em `blue-600`, cards brancos com
  borda `slate-200`.
- Ícones: `lucide-react` (Home, Users, Plus, Eye, Pencil, LogOut etc.).
- Pendente decidir: usar Inter (como no esboço) ou manter Plus Jakarta Sans em
  todo o app, para ficar consistente com o login.
## 12. Fluxo de trabalho do time
 
- Cada task é uma issue no repositório, com os labels do projeto (`frontend`,
  `design`, `QA`, `fix`, `integração`, `infraestrutura`, `backend`).
- Quadro no GitHub Projects: `Backlog` → `Ready` → `In progress` → `In review`
  → `To test` → `Done`. `Estimate` e `Actual` em horas (1 dia = 4 h).
- Branches a partir da `development`: `feature/task-{id}-{descrição}`,
  `fix/task-{id}-{descrição}`, `docs/task-{id}-{descrição}`. Ninguém faz commit
  direto na `main` nem na `development`.
- Commits em Conventional Commits: `feat:`, `fix:`, `docs:`, `style:`,
  `refactor:`, `test:`, `chore:`, `perf:`.
- PR para a `development` com título claro e descrição com a referência da
  task (`#id`). Precisa da revisão de outro membro e de teste por outro membro
  antes de ir para `Done`.
- Código gerado por agente é de responsabilidade de quem abriu o PR e passa
  pela mesma revisão e pelo mesmo teste.
- Testar localmente antes do `push`.
## 13. Estado atual
 
Concluído (entregue no código):
 
- F01: projeto Vite + React + TypeScript criado em `apps/clai-frontend`
- F02: estrutura de pastas e rotas
- F03: cliente HTTP (`api/http.ts`) e variáveis de ambiente
- F04: tela de login com o design da CLAI (Tailwind), com mock
- F05: contexto de autenticação, rota protegida, `Layout` com sidebar,
  cabeçalho e botão Sair, página Início com ações rápidas
- F06: lista de estudantes (busca, paginação de 5 em 5, estados de carregando,
  erro e vazio), serviço com dados fictícios e card "Total de estudantes" no
  Início
Próximos passos:
 
- F07: formulário de cadastro de estudante (campos provisórios), com validação e
  cadastro simulado
- Componentes de feedback reutilizáveis: mensagem de sucesso, de erro e de
  carregamento (hoje só a lista tem os seus estados próprios)
- Ver, editar e excluir estudante: fora da Sprint 1 (ver e editar quando houver
  as telas; excluir só se virar requisito)
- F08: Dockerfile do front (build + Nginx) para entrar no Compose
- Depois: integrar com a API real (desligar o mock) e atualizar o contrato
Em aberto:
 
- Campos reais do estudante (validar com a CLAI e com o backend)
- Busca e paginação no servidor (depende do contrato com o backend)
- Estratégia de autenticação definida pelo backend (JWT?) e dados extras no
  login (nome, perfil, expiração)
- Fonte única do app (Inter ou Plus Jakarta Sans)
- Teste automatizado do front (ainda não há)