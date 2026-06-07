from django.urls import path
from .views import RegisterView, LoginView, UserProfileView, CustomTokenRefreshView, UserListView, UserDetailView

urlpatterns = [
    # URLs com barra final
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('profile/', UserProfileView.as_view(), name='profile'),
    path('token/refresh/', CustomTokenRefreshView.as_view(), name='token_refresh'),
    path('users/', UserListView.as_view(), name='user-list'),
    path('users/<int:pk>/', UserDetailView.as_view(), name='user-detail'),

    # URLs sem barra final (compatibilidade frontend)
    path('register', RegisterView.as_view(), name='register-no-slash'),
    path('login', LoginView.as_view(), name='login-no-slash'),
    path('profile', UserProfileView.as_view(), name='profile-no-slash'),
    path('token/refresh', CustomTokenRefreshView.as_view(), name='token_refresh-no-slash'),
    path('users', UserListView.as_view(), name='user-list-no-slash'),
    path('users/<int:pk>', UserDetailView.as_view(), name='user-detail-no-slash'),
]
