from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ConvenioList, ResponsavelList, ResponsavelDetail, PacienteListCreate, PacienteDetail, 
    VacinaAplicadaCreate, PlanoList, VacinaList, PacienteParaAgendamentoList,
    AgendamentoVacinaViewSet
)

router = DefaultRouter()
router.register(r'agendamentos-vacina', AgendamentoVacinaViewSet)

urlpatterns = [
    # Router URLs
    path('', include(router.urls)),
    
    # URLs com barra final (padrão Django)
    path('convenios/', ConvenioList.as_view(), name='convenios-list'),
    path('planos/', PlanoList.as_view(), name='planos-list'),
    path('responsaveis/', ResponsavelList.as_view(), name='responsaveis-list'),
    path('responsaveis/<int:pk>/', ResponsavelDetail.as_view(), name='responsavel-detail'),
    path('pacientes/', PacienteListCreate.as_view(), name='pacientes-list-create'),
    path('pacientes/<int:pk>/', PacienteDetail.as_view(), name='paciente-detail'),
    path('pacientes-agendamento/', PacienteParaAgendamentoList.as_view(), name='pacientes-agendamento-list'),
    path('vacinas/', VacinaList.as_view(), name='vacinas-list'),
    path('vacinas-aplicadas/', VacinaAplicadaCreate.as_view(), name='vacinas-aplicadas-create'),
    
    # URLs sem barra final para compatibilidade com frontend
    path('convenios', ConvenioList.as_view(), name='convenios-list-no-slash'),
    path('planos', PlanoList.as_view(), name='planos-list-no-slash'),
    path('responsaveis', ResponsavelList.as_view(), name='responsaveis-list-no-slash'),
    path('responsaveis/<int:pk>', ResponsavelDetail.as_view(), name='responsavel-detail-no-slash'),
    path('pacientes', PacienteListCreate.as_view(), name='pacientes-list-create-no-slash'),
    path('pacientes/<int:pk>', PacienteDetail.as_view(), name='paciente-detail-no-slash'),
    path('pacientes-agendamento', PacienteParaAgendamentoList.as_view(), name='pacientes-agendamento-list-no-slash'),
    path('vacinas', VacinaList.as_view(), name='vacinas-list-no-slash'),
    path('vacinas-aplicadas', VacinaAplicadaCreate.as_view(), name='vacinas-aplicadas-create-no-slash'),
]