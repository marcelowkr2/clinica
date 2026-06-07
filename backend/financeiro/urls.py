from django.urls import path
from .views import (
    TransacaoListCreate, 
    TransacaoDetail, 
    estatisticas_financeiras,
    criar_transacao_automatica
)

urlpatterns = [
    # URLs com barra final (padrão Django)
    path('transacoes/', TransacaoListCreate.as_view(), name='transacoes-list-create'),
    path('transacoes/<int:pk>/', TransacaoDetail.as_view(), name='transacao-detail'),
    path('estatisticas/', estatisticas_financeiras, name='estatisticas-financeiras'),
    path('transacao-automatica/', criar_transacao_automatica, name='criar-transacao-automatica'),
    
    # URLs sem barra final para compatibilidade com frontend
    path('transacoes', TransacaoListCreate.as_view(), name='transacoes-list-create-no-slash'),
    path('transacoes/<int:pk>', TransacaoDetail.as_view(), name='transacao-detail-no-slash'),
    path('estatisticas', estatisticas_financeiras, name='estatisticas-financeiras-no-slash'),
    path('transacao-automatica', criar_transacao_automatica, name='criar-transacao-automatica-no-slash'),
]