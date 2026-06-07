from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from . import views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('core.urls')),
    path('api/', include('pets.urls')),
    path('api/', include('appointments.urls')),
    path('api/', include('internacao.urls')),
    path('api/', include('exames.urls')),
    path('api/', include('receitas.urls')),
    path('api/procedimentos/', include('banho_tosa.urls')),
    path('api/financeiro/', include('financeiro.urls')),
    path('api/estoque/', include('estoque.urls')),
    path('', include('vendas.urls')),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/user/', views.UserDetailView.as_view(), name='user_detail'),
    path('api/register/', views.RegisterView.as_view(), name='register'),
]

# Servir arquivos de mídia em desenvolvimento
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
