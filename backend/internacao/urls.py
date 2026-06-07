from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import InternacaoViewSet, EvolucoesInternacaoViewSet

router = DefaultRouter()
router.register(r'internacoes', InternacaoViewSet)
router.register(r'evolucoes', EvolucoesInternacaoViewSet)

urlpatterns = [
    path('', include(router.urls)),
]