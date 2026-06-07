from django.contrib import admin
from .models import Especie, Raca, Tutor, Pet, Vacina, VacinaAplicada


admin.site.register(Especie)
admin.site.register(Raca)
admin.site.register(Tutor)
admin.site.register(Pet)
admin.site.register(Vacina)
admin.site.register(VacinaAplicada)
