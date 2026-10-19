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
| `VITE_API_URL`  | URL base da API. Padrão `/api` (o gateway ou o proxy do Vite roteia) |
| `VITE_USE_MOCK` | `false` por padrão; se `true`, liga apenas o login simulado em `authService.ts` |
 
- Versionar só `.env.example` (nomes das variáveis, sem credenciais).
- Os arquivos `.env.dev` e `.env.prod` **não são versionados**.
- O usuário e a senha do login simulado ficam apenas em
  `src/features/auth/authService.ts` (fictícios, só funcionam com `VITE_USE_MOCK=true`).
## 5. Estrutura de pastas
 
Organização **por funcionalidade** (package by feature):
 
```plaintext
src/
├── api/
│   └── http.ts                 # cliente Axios (baseURL '/api'): token no header e tratamento de 401
├── assets/                     # logos e imagens (clai-logo.svg, ilustracao.png)
├── features/
│   ├── auth/                   # LoginPage, authService, authContext, AuthProvider,
│   │                           # useAuth, ProtectedRoute
│   ├── inicio/                 # InicioPage
│   └── estudantes/             # EstudantesListPage, EstudanteFormPage, estudanteService,
│                               # validacao
├── shared/
│   ├── Layout.tsx              # sidebar + cabeçalho com título da página + <Outlet />
│   └── feedback/               # Mensagem, ToastProvider, toastContext, useToast
├── types/                      # auth.ts, estudante.ts
├── App.tsx                     # rotas
├── main.tsx                    # BrowserRouter + AuthProvider + ToastProvider
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
## 7. Contrato da API (integrado com o backend)
 
- `POST /api/auth/login` com `{ username, password }` (`username` recebe o e-mail e é aceito via `@JsonAlias` no backend), retorna `200 { token }` ou `401` (sem revelar se o usuário existe).
- `GET /api/v1/aluno?page={p}&size={s}` retorna página do Spring (`content`, metadados em `page` ou na raiz), ordenada por `nome` e contendo apenas estudantes com `ativo = true`. A tela usa página iniciando em `1` e converte para `0-based` na chamada.
- `POST /api/v1/aluno` com `{ matricula, nome, curso, origemIdentificacao }` retorna `201` com o estudante criado, `400` para dados inválidos ou `409` em duplicidade de matrícula (lança `EstudanteDuplicadoError`).
- `InicioPage` consulta `listarEstudantes(1, 1)` para exibir o total real (`totalElements`) retornado pelo backend.
- Endpoints já disponíveis no backend para próximas telas: `GET /api/v1/aluno/{matricula}`, `PUT /api/v1/aluno/{matricula}` e `PATCH /api/v1/aluno/{matricula}`.
## 8. Dados do estudante
 
Os campos em `types/estudante.ts` seguem o contrato do backend (`AlunoResponse` e `AlunoRequest`):
 
- `Estudante`: `id` (`string`, UUID), `matricula` (`string`), `nome` (`string`), `curso` (`string`), `origemIdentificacao` (`string`), `dtCriacao` (`string`, ISO Instant) e `ativo` (`boolean`).
- `NovoEstudante`: `Pick<Estudante, 'matricula' | 'nome' | 'curso' | 'origemIdentificacao'>`.
- `Pagina<T>`: `{ itens, total, totalPaginas, pagina, tamanho }`.
- Validação no front (`validacao.ts`) espelha os limites do backend (`matricula` ≤ 50, `nome` ≤ 255, `curso` ≤ 150, `origemIdentificacao` ≤ 100), mantendo o backend como autoridade final.
- As colunas da tabela ficam concentradas no topo de `EstudantesListPage.tsx` e os campos do formulário no topo de `EstudanteFormPage.tsx`.
## 9. Regras de produto e privacidade
 
- Dados de saúde e necessidades são sensíveis (LGPD): coletar e exibir só o
  necessário. **Não existe laudo médico no sistema nesta versão.**
- Não colocar dados de estudantes, senhas ou tokens em `console.log`, logs ou
  mensagens de erro.
- Erro de login é sempre genérico ("Usuário ou senha inválidos.").
- Fora do escopo da Sprint 1: Relatórios, Configurações, notificações (sino),
  dados reais do dashboard além do total de estudantes, exclusão de estudante.
  Não criar esses itens sem combinar. Itens futuros ficam escondidos ou
  desabilitados ("em breve").
- Dashboard: mostrar apenas números que existam de verdade; nunca inventar
  indicadores.
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
- F03: cliente HTTP (`api/http.ts`) com fallback `/api` e variáveis de ambiente
- F04: tela de login com o design da CLAI (Tailwind), ajustada para login com e-mail
- F05: contexto de autenticação, rota protegida, `Layout` com sidebar,
  cabeçalho e botão Sair, página Início com ações rápidas
- F06: lista de estudantes com estados de carregando, erro e vazio e card
  "Total de estudantes" no Início
- F07: formulário de cadastro de estudante (`EstudanteFormPage.tsx`,
  `validacao.ts`) e componentes reutilizáveis de feedback (`Mensagem`,
  `ToastProvider`, `useToast`)
- F08: `Dockerfile` multi-stage (build + Nginx) e `nginx.conf` integrados ao
  gateway e ao Docker Compose
- Issue #91: integração do frontend com a API real (`/auth/login` e
  `/v1/aluno`), paginação no servidor, contagem real no Início, remoção dos
  dados fictícios de estudantes e tratamento de matrícula duplicada (`409`)

Próximos passos:
 
- Telas/ações de visualizar, editar (`PUT /v1/aluno/{matricula}`) e inativar
  estudante (`PATCH /v1/aluno/{matricula}`) quando entrarem no escopo
- Busca por matrícula/nome na listagem (`GET /v1/aluno/{matricula}` ou filtro)

Em aberto:
 
- Fonte única do app (Inter ou Plus Jakarta Sans)
- Testes automatizados do front (ainda não há)