# reset_senhas.py
import os
import django

# Configura o Django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")  # ajuste se o nome do seu projeto não for 'config'
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()

for user in User.objects.all():
    user.set_password("123456")
    user.save()
    print(f"Senha resetada para usuário: {user.username}")
