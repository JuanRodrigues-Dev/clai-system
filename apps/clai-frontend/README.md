# CLAI Frontend

Frontend web Single Page Application (SPA) do sistema **CLAI** (*Controle de Laboratório e Acesso Inteligente*), desenvolvido para a gestão de acessos, autenticação de administradores e cadastro de estudantes nos laboratórios do IFPB Campus Cajazeiras.

---

## 🚀 Tecnologias Utilizadas

A aplicação utiliza uma stack moderna focada em produtividade, segurança de tipos, acessibilidade e alta performance:

| Tecnologia | Versão | Finalidade |
| :--- | :--- | :--- |
| **React** | 19.x | Biblioteca para construção da interface declarativa em componentes funcionais. |
| **TypeScript** | ~6.0 | Tipagem estática rigorosa para prevenção de erros em tempo de compilação. |
| **Vite** | 8.x | Ferramenta de build e servidor de desenvolvimento ultra-rápido com HMR (*Hot Module Replacement*). |
| **Tailwind CSS** | 4.x | Framework utilitário de CSS para estilização moderna, responsiva e performática. |
| **React Router** | 7.x | Roteamento declarativo no cliente (SPA), suporte a rotas protegidas e navegação aninhada. |
| **Axios** | 1.x | Cliente HTTP para consumo da API REST com suporte a interceptors de autenticação. |
| **Lucide React** | 1.x | Conjunto de ícones consistentes e acessíveis. |
| **Oxlint** | 1.x | Linter em Rust ultrarrápido para garantia de boas práticas e padronização de código. |

---

## 📁 Organização de Pastas

A arquitetura do frontend é estruturada em torno de **Feature-Driven Development** (divisão orientada a funcionalidades de domínio), facilitando a manutenibilidade, coesão e escalabilidade do projeto:

```text
apps/clai-frontend/
├── public/                 # Arquivos estáticos servidos diretamente na raiz
├── src/
│   ├── api/                # Infraestrutura HTTP e clientes de comunicação
│   │   └── http.ts         # Instância centralizada do Axios com interceptors de JWT e 401
│   ├── assets/             # Imagens, ilustrações e logotipos da aplicação
│   ├── features/           # Módulos funcionais e de domínio do sistema
│   │   ├── auth/           # Módulo de Autenticação
│   │   │   ├── authContext.ts     # Tipos e contrato do contexto de autenticação
│   │   │   ├── AuthProvider.tsx   # Provedor de estado global de login e sessão
│   │   │   ├── authService.ts     # Integração com endpoints de autenticação (/v1/auth)
│   │   │   ├── LoginPage.tsx      # Página de login com formulário e validações
│   │   │   ├── ProtectedRoute.tsx # Guardião de rota (redireciona não autenticados)
│   │   │   └── useAuth.ts         # Hook customizado de acesso ao contexto de auth
│   │   ├── estudantes/     # Módulo de Gestão de Estudantes
│   │   │   ├── EstudanteFormPage.tsx # Criação e edição de dados de alunos
│   │   │   ├── estudantesListPage.tsx # Tabela/listagem com filtros e busca
│   │   │   ├── estudanteService.ts   # Chamadas aos endpoints de estudantes (/v1/alunos)
│   │   │   └── validacao.ts          # Regras e validações de dados cadastrais
│   │   └── inicio/         # Módulo da Página Inicial / Dashboard
│   │       └── InicioPage.tsx        # Visão geral de boas-vindas e atalhos rápidos
│   ├── shared/             # Recursos reutilizáveis compartilhados entre múltiplos módulos
│   │   ├── Layout.tsx      # Shell principal da aplicação (Navbar, Sidebar e container de rotas)
│   │   └── feedback/       # Componentes de feedback e notificação visual
│   │       ├── Mensagem.tsx       # Componente visual de alerta/notificação
│   │       ├── toastContext.ts    # Tipos e contexto para toasts
│   │       ├── ToastProvider.tsx  # Provedor global para disparo de alertas/notificações
│   │       └── useToast.ts        # Hook para invocar mensagens e toasts no app
│   ├── types/              # Modelos de dados e contratos TypeScript globais
│   │   ├── auth.ts         # Tipos de credenciais, usuário autenticado e tokens
│   │   └── estudante.ts    # Modelos da entidade Estudante/Aluno
│   ├── App.tsx             # Configuração principal das rotas e provedores da aplicação
│   ├── main.tsx            # Ponto de entrada da aplicação React
│   └── index.css           # Configuração de temas, fontes e importações do Tailwind CSS
├── .env.example            # Exemplo de configuração de variáveis de ambiente
├── Dockerfile              # Imagem Docker multi-stage (Node builder + Nginx Alpine)
├── nginx.conf              # Configuração do Nginx para roteamento SPA em produção
├── package.json            # Dependências e scripts de execução
├── tsconfig.json           # Configurações do compilador TypeScript
└── vite.config.ts          # Configurações do Vite, plugins e proxy reverso local
```

---

## ⚙️ Variáveis de Ambiente

Crie o arquivo `.env` (ou `.env.dev`) na raiz de `apps/clai-frontend/` copiando o modelo de `.env.example`:

```bash
cp .env.example .env
```

| Variável | Padrão | Descrição |
| :--- | :--- | :--- |
| `VITE_API_URL` | `/api` | Prefixo ou URL base para chamadas à API backend. Quando configurado como `/api`, utiliza o proxy reverso do Vite em desenvolvimento ou o Gateway Nginx em contêineres. |
| `VITE_USE_MOCK` | `false` | Flag booleana opcional para habilitar respostas mockadas em testes visuais locais isolados. |

### 🔄 Proxy Reverso Local (`vite.config.ts`)

Para evitar problemas de CORS (*Cross-Origin Resource Sharing*) em ambiente de desenvolvimento local, o Vite está configurado para redirecionar automaticamente requisições sob o caminho `/api` para o backend na porta `8080`:

```ts
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:8080',
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/api/, ''),
    },
  },
}
```

Dessa forma, qualquer requisição para `/api/v1/auth` é enviada internamente para `http://localhost:8080/v1/auth`.

---

## 💻 Instruções de Desenvolvimento Local

### Pré-requisitos

- **Node.js**: Versão 22 LTS ou superior.
- **npm**: Versão 10 ou superior.

### 1. Instalação das Dependências

Na raiz de `apps/clai-frontend/`:

```bash
npm install
```

### 2. Executar o Servidor de Desenvolvimento

Inicia o servidor de desenvolvimento do Vite com recarregamento instantâneo (HMR):

```bash
npm run dev
```

Acesse no navegador: **[http://localhost:5173](http://localhost:5173)**.

### 3. Verificação de Código e Boas Práticas (Lint)

Executa a validação estática de código com o Oxlint:

```bash
npm run lint
```

### 4. Build de Produção

Compila os tipos TypeScript e gera os arquivos estáticos otimizados na pasta `dist/`:

```bash
npm run build
```

### 5. Pré-visualizar a Build

Para testar localmente o pacote estático compilado:

```bash
npm run preview
```

---

## 🐳 Execução via Docker / Gateway

O frontend está integrado à orquestração de contêineres do projeto:

- **Build de Contêiner:** O arquivo `Dockerfile` utiliza compilação *multi-stage*: uma etapa inicial de build com Node 22 e uma etapa final leve com Nginx Alpine que entrega os arquivos estáticos configurados para SPA (`try_files $uri $uri/ /index.html;`).
- **Integração no Gateway:** Ao executar o ambiente completo via Docker Compose (`docker compose -f docker-compose-dev.yml up -d`), o serviço `gateway` unifica o tráfego na porta `80`, direcionando a interface do usuário para o contêiner do frontend e requisições `/api/` para o backend.

---

## ♿ Diretrizes de Acessibilidade (A11y)

O frontend do CLAI foi desenvolvido visando atender aos critérios de conformidade da **WCAG 2.1 nível AA**:

1. **HTML Semântico:**
   - Uso de tags estruturais nativas (`<header>`, `<nav>`, `<main>`, `<aside>`, `<section>`, `<button>`, `<form>`).
   - Botões e links são representados por seus elementos nativos, garantindo comportamento padrão do navegador.

2. **Navegação por Teclado:**
   - Todas as ações e controles interativos (campos, botões, modais, itens de menu) são plenamente acessíveis via tecla `Tab`.
   - Indicadores de foco visíveis e destacados em todos os elementos selecionáveis (`focus-visible`).
   - Fechamento de componentes contextuais e caixas de diálogo com a tecla `Esc`.

3. **Leitores de Tela e Atributos ARIA:**
   - Notificações de feedback, toasts e avisos de erro usam `role="alert"` e `aria-live="polite"` ou `aria-live="assertive"` para que mudanças de estado sejam anunciadas a tecnologias assistivas.
   - Campos de formulário vinculados aos respectivos rótulos com `htmlFor` e mensagens de erro descritas via `aria-describedby` e `aria-invalid`.

4. **Contraste de Cores:**
   - Paleta de cores selecionada garantindo contraste mínimo de `4.5:1` para texto normal e `3:1` para elementos gráficos e componentes de interface conforme WCAG AA.
