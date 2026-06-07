from rest_framework import serializers
from .models import Internacao, EvolucoesInternacao
from pets.serializers import PacienteSerializer
from core.serializers import UserSerializer

class InternacaoSerializer(serializers.ModelSerializer):
    paciente_nome = serializers.CharField(source='paciente.nome', read_only=True)
    responsavel_nome = serializers.CharField(source='paciente.responsavel.user.get_full_name', read_only=True)
    responsavel_telefone = serializers.CharField(source='paciente.responsavel.user.phone', read_only=True)
    medico_nome = serializers.CharField(source='medico_responsavel.get_full_name', read_only=True)
    dias_internado = serializers.ReadOnlyField()
    
    class Meta:
        model = Internacao
        fields = '__all__'
        read_only_fields = ('data_criacao', 'data_atualizacao')

class InternacaoDetailSerializer(serializers.ModelSerializer):
    paciente = PacienteSerializer(read_only=True)
    medico_responsavel = UserSerializer(read_only=True)
    evolucoes = serializers.SerializerMethodField()
    dias_internado = serializers.ReadOnlyField()
    
    class Meta:
        model = Internacao
        fields = '__all__'
        read_only_fields = ('data_criacao', 'data_atualizacao')
    
    def get_evolucoes(self, obj):
        evolucoes = obj.evolucoes.all()[:5]  # Últimas 5 evoluções
        return EvolucoesInternacaoSerializer(evolucoes, many=True).data

class EvolucoesInternacaoSerializer(serializers.ModelSerializer):
    medico_nome = serializers.CharField(source='medico.get_full_name', read_only=True)
    
    class Meta:
        model = EvolucoesInternacao
        fields = '__all__'
        read_only_fields = ('data_hora',)