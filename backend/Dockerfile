# backend/Dockerfile
FROM python:3.11-slim

WORKDIR /app

# Instalar dependências do sistema
RUN apt-get update && apt-get install -y \
    postgresql-client \
    gcc \
    g++ \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copiar requirements.txt primeiro para cache
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiar código da aplicação
COPY . .

# Criar diretório para arquivos de mídia
RUN mkdir -p /app/media && chmod 755 /app/media

EXPOSE 8000

# Usamos entrypoint.sh para migrar + criar superuser automaticamente
# (o entrypoint é chamado via docker-compose -> entrypoint)
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
