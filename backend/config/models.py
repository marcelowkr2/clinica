# backend/config/models.py
from django.db import models
from django.contrib.auth.models import AbstractUser

# Se você quiser um Custom User Model no futuro
class CustomUser(AbstractUser):
    # Campos adicionais podem ser adicionados aqui
    telefone = models.CharField(max_length=15, blank=True)
    data_nascimento = models.DateField(null=True, blank=True)

    def __str__(self):
        return self.username

    class Meta:
        verbose_name = 'Usuário'
        verbose_name_plural = 'Usuários'
