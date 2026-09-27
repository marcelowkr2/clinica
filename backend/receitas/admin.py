from django.contrib import admin
from .models import Medicamento, Receita, ItemReceita, ControleReceita

admin.site.register(Medicamento)
admin.site.register(Receita)
admin.site.register(ItemReceita)
admin.site.register(ControleReceita)
