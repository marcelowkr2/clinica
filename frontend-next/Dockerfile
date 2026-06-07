# frontend-next/Dockerfile
# ---------- STAGE 1: BUILD (alpine) ----------
FROM node:18-alpine AS builder
WORKDIR /app

# Dependências mínimas (não instala build-base por padrão)
RUN apk add --no-cache ca-certificates

# Copia package.json / package-lock.json (cache)
COPY package*.json ./

# IMPORTANTE: instalamos devDependencies para permitir "next build" (typescript, lint etc.)
RUN npm ci --prefer-offline --no-audit --progress=false

# Copia o código e faz o build
COPY . .
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

RUN npm run build

# ---------- STAGE 2: RUNNER (alpine) ----------
FROM node:18-alpine AS runner
WORKDIR /app

# Copia apenas o necessário do builder
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.* ./

# Cria usuário não-root
RUN addgroup -S nextgroup && adduser -S nextuser -G nextgroup
USER nextuser

ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

CMD ["npm", "run", "start"]
