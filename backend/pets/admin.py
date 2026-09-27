from django.contrib import admin
from .models import Convenio, Plano, Responsavel, Paciente, Vacina, VacinaAplicada, AgendamentoVacina


admin.site.register(Convenio)
admin.site.register(Plano)
admin.site.register(Responsavel)
admin.site.register(Paciente)
admin.site.register(Vacina)
admin.site.register(VacinaAplicada)
admin.site.register(AgendamentoVacina)
