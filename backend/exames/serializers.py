from rest_framework import serializers
from .models import TipoExame, Exame, ParametroExame
from pets.serializers import PacienteSerializer
from core.serializers import UserSerializer

class TipoExameSerializer(serializers.ModelSerializer):
    class Meta:
        model = TipoExame
        fields = '__all__'

class ParametroExameSerializer(serializers.ModelSerializer):
    class Meta:
        model = ParametroExame
        fields = '__all__'

class ExameSerializer(serializers.ModelSerializer):
    paciente_nome = serializers.CharField(source='paciente.nome', read_only=True)
    responsavel_nome = serializers.CharField(source='paciente.responsavel.user.get_full_name', read_only=True)
    responsavel_telefone = serializers.CharField(source='paciente.responsavel.user.phone', read_only=True)
    tipo_exame_nome = serializers.CharField(source='tipo_exame.nome', read_only=True)
    medico_nome = serializers.CharField(source='medico_solicitante.get_full_name', read_only=True)
    
    class Meta:
        model = Exame
        fields = '__all__'
        read_only_fields = ('data_solicitacao', 'data_atualizacao')

class ExameDetailSerializer(serializers.ModelSerializer):
    paciente = PacienteSerializer(read_only=True)
    tipo_exame = TipoExameSerializer(read_only=True)
    medico_solicitante = UserSerializer(read_only=True)
    parametros = ParametroExameSerializer(many=True, read_only=True)
    
    class Meta:
        model = Exame
        fields = '__all__'
        read_only_fields = ('data_solicitacao', 'data_atualizacao')