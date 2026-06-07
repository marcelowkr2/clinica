from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from .serializers import UserSerializer, RegisterSerializer

class UserDetailView(APIView):
    """
    View para obter detalhes do usuário autenticado
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            serializer = UserSerializer(request.user)
            return Response(serializer.data)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class RegisterView(APIView):
    """
    View para registro de novos usuários
    """
    def post(self, request):
        try:
            serializer = RegisterSerializer(data=request.data)
            if serializer.is_valid():
                user = serializer.save()

                # Autenticar o usuário após o registro
                authenticated_user = authenticate(
                    username=request.data.get('username'),
                    password=request.data.get('password')
                )

                if authenticated_user:
                    return Response({
                        'user': UserSerializer(user).data,
                        'message': 'Usuário criado com sucesso'
                    }, status=status.HTTP_201_CREATED)
                else:
                    return Response({
                        'message': 'Usuário criado, mas falha na autenticação automática'
                    }, status=status.HTTP_201_CREATED)

            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            return Response(
                {'error': f'Erro no registro: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
