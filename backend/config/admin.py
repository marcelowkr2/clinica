# backend/config/admin.py
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth.models import User
from .models import ConfiguracaoSistema, CustomUser

@admin.register(ConfiguracaoSistema, CustomUser)
class ConfiguracaoSistemaAdmin(admin.ModelAdmin):
    list_display = ('nome_site', 'email_contato', 'telefone_contato', 'data_atualizacao')
    fieldsets = (
        ('Informações do Site', {
            'fields': ('nome_site', 'descricao_site', 'email_contato', 'telefone_contato', 'endereco')
        }),

    )
