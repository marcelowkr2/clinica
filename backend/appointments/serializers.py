from rest_framework import serializers
from .models import Agendamento, Servico
from pets.models import Paciente
from core.models import User

class ServicoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Servico
        fields = '__all__'

class AgendamentoSerializer(serializers.ModelSerializer):
    paciente_nome = serializers.CharField(source='paciente.nome', read_only=True)
    responsavel_nome = serializers.CharField(source='paciente.responsavel.user.first_name', read_only=True)
    responsavel_sobrenome = serializers.CharField(source='paciente.responsavel.user.last_name', read_only=True)
    medico_nome = serializers.CharField(source='medico.first_name', read_only=True)
    servico_nome = serializers.CharField(source='servico.nome', read_only=True)
    
    class Meta:
        model = Agendamento
        fields = [
            'id', 'paciente', 'paciente_nome', 'responsavel_nome', 'responsavel_sobrenome',
            'medico', 'medico_nome', 'servico', 'servico_nome',
            'data_hora', 'status', 'observacoes', 'valor',
            'data_criacao', 'data_atualizacao'
        ]
        
    def validate_data_hora(self, value):
        """Validar se a data/hora não é no passado"""
        from django.utils import timezone
        if value < timezone.now():
            raise serializers.ValidationError("Não é possível agendar para uma data/hora no passado.")
        return value