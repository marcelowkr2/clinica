#!/bin/sh
set -e

echo "Aguardando o banco de dados..."
until pg_isready -h "${POSTGRES_HOST:-db}" -p "${POSTGRES_PORT:-5432}" -U "${POSTGRES_USER:-postgres}"; do
  sleep 2
done

echo "Executando migrations..."
python manage.py migrate --noinput

# cria superuser se as variáveis existirem e o usuário não existir
if [ -n "${DJANGO_SUPERUSER_USERNAME}" ] && [ -n "${DJANGO_SUPERUSER_EMAIL}" ] && [ -n "${DJANGO_SUPERUSER_PASSWORD}" ]; then
  echo "Criando superuser se não existir..."
  python manage.py shell <<'PY'
from django.contrib.auth import get_user_model
User = get_user_model()
username = "${DJANGO_SUPERUSER_USERNAME}"
email = "${DJANGO_SUPERUSER_EMAIL}"
password = "${DJANGO_SUPERUSER_PASSWORD}"

if not User.objects.filter(username=username).exists():
    User.objects.create_superuser(username=username, email=email, password=password)
    print("Superuser criado:", username)
else:
    print("Superuser já existe:", username)
PY
fi

echo "Coletando static files..."
python manage.py collectstatic --noinput || true

echo "Iniciando servidor..."
exec python manage.py runserver 0.0.0.0:8000
