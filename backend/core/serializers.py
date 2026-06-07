from rest_framework import serializers
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from .models import User

# Serializer de usuário
class UserSerializer(serializers.ModelSerializer):
    phone = serializers.CharField(allow_blank=True, required=False)
    cpf = serializers.CharField(allow_blank=True, required=False)
    crmv = serializers.CharField(allow_blank=True, required=False)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'user_type', 'phone', 'cpf', 'crmv']

# Serializer de registro
class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'first_name', 'last_name', 'user_type', 'phone', 'cpf', 'crmv']

    def create(self, validated_data):
        # Tratar campos opcionais
        cpf = validated_data.get('cpf') or None
        phone = validated_data.get('phone') or None
        crmv = validated_data.get('crmv') or None

        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            user_type=validated_data.get('user_type', 4),
            phone=phone,
            cpf=cpf,
            crmv=crmv,
        )
        return user

# Serializer de login
class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        user = authenticate(username=data['username'], password=data['password'])
        if not user or not user.is_active:
            raise serializers.ValidationError('Credenciais inválidas ou usuário inativo')

        refresh = RefreshToken.for_user(user)
        return {
            'user': UserSerializer(user).data,
            'tokens': {
                'access': str(refresh.access_token),
                'refresh': str(refresh),
            }
        }
