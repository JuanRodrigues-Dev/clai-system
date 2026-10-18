# Estágio 1: Build da aplicação React com Node.js
FROM node:22-alpine AS builder

WORKDIR /app

# Copia manifestos de dependências
COPY package*.json ./

# Instala dependências de forma limpa e reprodutível
RUN npm ci

# Copia o código fonte e configurações
COPY . .

# Compila o projeto TypeScript + Vite (gera a pasta /app/dist)
RUN npm run build

# Estágio 2: Servidor web leve com Nginx para servir arquivos estáticos
FROM nginx:1.27-alpine AS runner

# Copia os arquivos estáticos gerados no build
COPY --from=builder /app/dist /usr/share/nginx/html

# Copia a configuração do Nginx com suporte a rotas do React Router
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
