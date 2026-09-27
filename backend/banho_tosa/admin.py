from django.contrib import admin
from .models import ServicoProcedimento, Procedimento, AvaliacaoProcedimento, FotoProcedimento


admin.site.register(ServicoProcedimento)
admin.site.register(Procedimento)
admin.site.register(AvaliacaoProcedimento)
admin.site.register(FotoProcedimento)
