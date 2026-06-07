from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ServicoProcedimentoViewSet, ProcedimentoViewSet, AvaliacaoProcedimentoViewSet, FotoProcedimentoViewSet

router = DefaultRouter()
router.register(r'servicos', ServicoProcedimentoViewSet)
router.register(r'atendimentos', ProcedimentoViewSet)
router.register(r'avaliacoes', AvaliacaoProcedimentoViewSet)
router.register(r'fotos', FotoProcedimentoViewSet)

urlpatterns = [
    path('', include(router.urls)),
]