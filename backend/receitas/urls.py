from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import MedicamentoViewSet, ReceitaViewSet, ItemReceitaViewSet, ControleReceitaViewSet

router = DefaultRouter()
router.register(r'medicamentos', MedicamentoViewSet)
router.register(r'receitas', ReceitaViewSet)
router.register(r'itens', ItemReceitaViewSet)
router.register(r'controles', ControleReceitaViewSet)

urlpatterns = [
    path('', include(router.urls)),
]