from django.urls import path
from .views import ServicoList, AgendamentoListCreate, AgendamentoDetail, AgendamentoVacinaDetail, DashboardStats

urlpatterns = [
    # URLs com barra final (padrão Django)
    path('servicos/', ServicoList.as_view(), name='servicos-list'),
    path('agendamentos/', AgendamentoListCreate.as_view(), name='agendamentos-list-create'),
    path('agendamentos/<int:pk>/', AgendamentoDetail.as_view(), name='agendamento-detail'),
    path('agendamentos-vacina/<int:pk>/', AgendamentoVacinaDetail.as_view(), name='agendamento-vacina-detail'),
    path('dashboard/stats/', DashboardStats.as_view(), name='dashboard-stats'),
    
    # URLs sem barra final para compatibilidade com frontend
    path('servicos', ServicoList.as_view(), name='servicos-list-no-slash'),
    path('agendamentos', AgendamentoListCreate.as_view(), name='agendamentos-list-create-no-slash'),
    path('agendamentos/<int:pk>', AgendamentoDetail.as_view(), name='agendamento-detail-no-slash'),
    path('agendamentos-vacina/<int:pk>', AgendamentoVacinaDetail.as_view(), name='agendamento-vacina-detail-no-slash'),
    path('dashboard/stats', DashboardStats.as_view(), name='dashboard-stats-no-slash'),
]