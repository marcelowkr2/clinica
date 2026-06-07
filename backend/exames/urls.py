from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TipoExameViewSet, ExameViewSet, ParametroExameViewSet

router = DefaultRouter()
router.register(r'tipos-exame', TipoExameViewSet)
router.register(r'exames', ExameViewSet)
router.register(r'parametros', ParametroExameViewSet)

urlpatterns = [
    path('', include(router.urls)),
]