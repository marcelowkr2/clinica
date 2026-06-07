from django.contrib import admin
from .models import TipoExame, Exame, ParametroExame

admin.site.register(TipoExame)
admin.site.register(Exame)
admin.site.register(ParametroExame)

# Register your models here.
