# CLAI System

> Sistema de Gestão do Fluxo de Atendimento e Acompanhamento de Estudantes com Necessidades Educacionais Específicas do **IFPB - Campus Cajazeiras**.

[![Licença](https://img.shields.io/badge/licença-MIT-blue.svg)](LICENSE)
[![Java](https://img.shields.io/badge/Java-21_LTS-orange.svg)](https://www.oracle.com/java/)
[![Spring Boot](https://img.shields.io/badge/Spring_Boot-4.1.1-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-19.2-blue.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-~6.0-3178C6.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.3-646CFF.svg)](https://vitejs.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-17_Alpine-336791.svg)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker_Compose-v2-2496ED.svg)](https://www.docker.com/)

---

## 📌 Sobre o Projeto

O **CLAI System** é uma plataforma institucional desenvolvida para a **Coordenação Local de Acessibilidade e Inclusão (CLAI)** do **Instituto Federal da Paraíba (IFPB) - Campus Cajazeiras**. 

O sistema tem como objetivo centralizar e informatizar o processo de acompanhamento dos estudantes com necessidades educacionais específicas, substituindo o controle fragmentado por planilhas e relatórios impressos por uma base histórica unificada, transparente e segura. Ele facilita a comunicação multidisciplinar e gera indicadores para mitigar a evasão escolar e promover o êxito acadêmico dos alunos.

### 👥 Perfis de Acesso e Atores do Sistema

- **Equipe CLAI / Multiprofissional:** Acesso integral ao acompanhamento, estudos de caso, atendimentos e registros documentais.
- **Professores (Docentes):** Acesso restrito aos estudantes matriculados em suas respectivas turmas. Responsáveis pela elaboração do Relatório de Acompanhamento Individualizado (RAI) e coparticipantes na elaboração do PEI.
- **Coordenadores de Curso:** Acompanhamento de indicadores acadêmicos, alertas de evasão, estudantes matriculados em seu curso e Planos de Ação.
- **Equipe Pedagógica:** Gestão e acompanhamento dos Planos de Ação e apoio pedagógico no PEI.
- **Assistentes de Alunos:** Inserção de relatórios de observação e acompanhamento cotidiano.
- **DDE (Direção de Desenvolvimento do Ensino):** Visualização gerencial com dashboards consolidados e indicadores institucionais.

### 🔄 Escopo de Atendimento (Fases 01 a 04)

Conforme a regulamentação do IFPB, a plataforma cobre o ciclo das **Fases 01 a 04**:

1. **Fase 01 - Entrada e Identificação:** Registro da indicação do estudante e elaboração do Estudo de Caso multiprofissional.
2. **Fase 02 - Plano de Ação:** Elaboração do plano institucional da CLAI e encaminhamento para coordenações, docentes e setor pedagógico.
3. **Fase 03 - Planejamento Educacional Individualizado (PEI & PEA):** Construção colaborativa do PEI para estudantes que demandam adaptação curricular, gestão de assinaturas e Planos de Ensino Adaptados (PEA) por disciplina.
4. **Fase 04 - Acompanhamento dos Resultados (RAI):** Registro exclusivo pelos docentes do Relatório de Acompanhamento Individualizado para avaliar a eficácia das adaptações.

> **Nota de Escopo:** As etapas de certificação diferenciada (Fases 05 a 07) ocorrem fora da plataforma, tramitando via processos administrativos convencionais do SUAP.

---

## 🛠️ Stack Utilizada

O projeto é estruturado em arquitetura de monorepo desacoplado, utilizando tecnologias modernas e suporte a contêineres:

| Camada | Tecnologia | Versão | Descrição |
| :--- | :--- | :--- | :--- |
| **Backend** | Java | 21 LTS | Linguagem de programação tipada de alta performance. |
| | Spring Boot | 4.1.1 | Framework base (Spring WebMVC, Spring Data JPA, Spring Security, Validation). |
| | Spring Actuator | 4.1.1 | Monitoramento operacional e métricas de integridade (*Health Check*). |
| | Maven | 3.9+ | Gerenciador de dependências e ciclo de vida do build. |
| **Frontend** | React | 19.2 | Biblioteca declarativa baseada em componentes funcionais. |
| | TypeScript | ~6.0 | Tipagem estática rigorosa para segurança e previsibilidade. |
| | Vite | 8.3 | Build tool e dev server ultra-rápido com HMR (*Hot Module Replacement*). |
| | Tailwind CSS | 4.3 | Framework de estilização utilitária de alta performance. |
| | React Router | 7.18 | Roteamento dinâmico SPA com suporte a rotas protegidas por autenticação. |
| | Axios | 1.20 | Cliente HTTP com interceptors centralizados de token JWT. |
| | Oxlint | 1.81 | Linter de alta performance implementado em Rust. |
| **Banco de Dados** | PostgreSQL | 17 Alpine | Banco relacional robusto com persistência local em volume Docker nomeado. |
| **Gateway / Proxy**| Nginx | Alpine | Roteador e proxy reverso unificando a porta 80 (`/` -> frontend, `/api/` -> backend). |
| **Infraestrutura** | Docker & Compose | v2+ | Orquestração reproduzível de ambientes de desenvolvimento e produção. |

---

## 📂 Estrutura do Repositório (Monorepo)

```text
clai-system/
├── apps/
│   ├── clai-backend/           # API REST em Spring Boot (Java 21)
│   │   ├── src/main/java/      # Código-fonte (Controllers, Services, Repositories, Domain)
│   │   ├── src/main/resources/ # Configurações (application.yaml, migrations)
│   │   ├── Dockerfile          # Multi-stage build com Maven e Eclipse Temurin 21 JRE
│   │   └── pom.xml             # Dependências e plugins Maven
│   └── clai-frontend/          # Single Page Application (React 19 + TypeScript + Vite)
│       ├── src/                # Código-fonte (features/, shared/, api/, types/)
│       ├── Dockerfile          # Multi-stage build (Node 22 builder + Nginx runtime)
│       ├── nginx.conf          # Servidor Nginx para rotas SPA (fallback index.html)
│       └── package.json        # Dependências e scripts npm
├── gateway/                    # Reverse proxy central do monorepo
│   └── nginx.conf              # Unificação de tráfego (porta 80 -> frontend e /api/ -> backend)
├── .env.example                # Modelo de variáveis de ambiente do projeto
├── docker-compose-dev.yml      # Orquestração do ambiente de desenvolvimento (DB com porta exposta)
├── docker-compose-prod.yml     # Orquestração para produção (DB isolado na rede interna)
└── README.md                   # Documentação global do projeto
```

---

## 🚀 Guia de Instalação e Execução

### Pré-requisitos

Certifique-se de ter instalado em sua máquina:
- [Git](https://git-scm.com/)
- [Docker](https://docs.docker.com/get-docker/) (versão 24 ou superior)
- [Docker Compose](https://docs.docker.com/compose/) (versão 2 ou superior)

---

### Passo a Passo: Execução com Docker Compose (Recomendado)

Esta é a forma padrão e oficial para subir todo o ecossistema (PostgreSQL, Backend, Frontend e Gateway) com um único comando.

#### 1. Clonar o repositório

```bash
git clone https://github.com/JuanRodrigues-Dev/clai-system.git
cd clai-system
```

#### 2. Configurar o arquivo de ambiente

Crie o arquivo `.env.dev` na raiz do projeto com base no modelo `.env.example`:

```bash
cp .env.example .env.dev
```

As variáveis padrão já vêm preparadas para execução local:

```env
POSTGRES_DB=clai_db
POSTGRES_USER=clai_user
POSTGRES_PASSWORD=clai_password
POSTGRES_PORT=5432
SPRING_PROFILES_ACTIVE=dev
VITE_API_URL=/api
```

#### 3. Iniciar todos os serviços

Execute o build e inicialize os contêineres em segundo plano:

```bash
docker compose -f docker-compose-dev.yml --env-file .env.dev up --build -d
```

#### 4. Acessar a aplicação

Após a inicialização dos contêineres, os serviços estarão acessíveis nas seguintes URLs:

| Serviço | URL | Descrição |
| :--- | :--- | :--- |
| **Frontend Web** | [http://localhost](http://localhost) | Interface gráfica SPA do sistema (via Gateway Nginx na porta 80). |
| **Health Check API** | [http://localhost/api/actuator/health](http://localhost/api/actuator/health) | Verificação de integridade da API e conexão com o banco (`{ "status": "UP" }`). |
| **Backend API (Direto)** | [http://localhost:8080](http://localhost:8080) | Acesso direto ao servidor Tomcat do backend em ambiente dev. |
| **PostgreSQL** | `localhost:5432` | Conexão externa ao banco de dados (usuário `clai_user`, banco `clai_db`). |

#### 5. Parar os serviços

Para encerrar os contêineres preservando os dados do banco de dados:

```bash
docker compose -f docker-compose-dev.yml down
```

> **Dica:** Caso deseje limpar os volumes e reiniciar o banco do zero:
> ```bash
> docker compose -f docker-compose-dev.yml down -v
> ```

---

### Execução Individual para Desenvolvimento Local (Sem Docker para Apps)

Se preferir rodar os serviços localmente fora do Docker enquanto utiliza apenas o banco conteinerizado:

#### Subir apenas o PostgreSQL:
```bash
docker compose -f docker-compose-dev.yml up -d db
```

#### Executar o Backend (Spring Boot):
Pré-requisito: JDK 21 instalado.
```bash
cd apps/clai-backend
./mvnw spring-boot:run
```
O backend iniciará em `http://localhost:8080`.

#### Executar o Frontend (React + Vite):
Pré-requisito: Node.js 22 LTS instalado.
```bash
cd apps/clai-frontend
npm install
npm run dev
```
O frontend iniciará em `http://localhost:5173` com proxy automático redirecionando `/api` para `http://localhost:8080`.

---

## 🌿 Padrão de Versionamento e Fluxo Git

O projeto adota regras estritas de ciclo de desenvolvimento baseadas nas diretrizes de engenharia de software da instituição:

- **Branch Base:** `development` (toda nova funcionalidade parte da `development` e retorna para ela via Pull Request).
- **Proteção da `main`:** A branch `main` só recebe código por meio de PR vindo da `development` quando todas as tarefas de uma entrega estiverem em `Done`.
- **Nomenclatura de Branches:**
  - Novas funcionalidades: `feature/{id}-{descricao}`
  - Documentações: `docs/{id}-{descricao}`
  - Correções de bugs: `fix/{id}-{descricao}`
- **Mensagens de Commit:** Padrão **Conventional Commits**:
  - `feat:` Nova funcionalidade
  - `fix:` Correção de bug
  - `docs:` Alterações em documentação
  - `style:` Formatação ou ajustes de estilo sem alteração de lógica
  - `refactor:` Refatoração de código sem alteração de comportamento
  - `test:` Inclusão ou ajuste de testes
  - `chore:` Tarefas de manutenção ou dependências

---

## 👥 Autores e Contribuidores

Projeto acadêmico desenvolvido para a disciplina de Projeto de Desenvolvimento de Software do **IFPB Campus Cajazeiras**:

- **Coordenação do Projeto:** Coordenação Local de Acessibilidade e Inclusão (CLAI / IFPB)
- **Equipe de Desenvolvimento:** Alunos do Curso Superior de Tecnologia em Análise e Desenvolvimento de Sistemas / Bacharelado em Sistemas de Informação.