from rest_framework import serializers
from .models import Medicamento, Receita, ItemReceita, ControleReceita
from pets.serializers import PacienteSerializer
from core.serializers import UserSerializer

class MedicamentoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Medicamento
        fields = '__all__'

class ItemReceitaSerializer(serializers.ModelSerializer):
    medicamento_nome = serializers.CharField(source='medicamento.nome', read_only=True)
    medicamento = MedicamentoSerializer(read_only=True)
    medicamento_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = ItemReceita
        fields = '__all__'

class ControleReceitaSerializer(serializers.ModelSerializer):
    medicamento_nome = serializers.CharField(source='item_receita.medicamento.nome', read_only=True)
    
    class Meta:
        model = ControleReceita
        fields = '__all__'

class ReceitaSerializer(serializers.ModelSerializer):
    paciente_nome = serializers.CharField(source='paciente.nome', read_only=True)
    responsavel_nome = serializers.CharField(source='paciente.responsavel.user.get_full_name', read_only=True)
    responsavel_telefone = serializers.CharField(source='paciente.responsavel.user.phone', read_only=True)
    medico_nome = serializers.CharField(source='medico.get_full_name', read_only=True)
    is_vencida = serializers.ReadOnlyField()
    
    class Meta:
        model = Receita
        fields = '__all__'
        read_only_fields = ('data_prescricao', 'data_atualizacao')

class ReceitaDetailSerializer(serializers.ModelSerializer):
    paciente = PacienteSerializer(read_only=True)
    medico = UserSerializer(read_only=True)
    itens = ItemReceitaSerializer(many=True, read_only=True)
    is_vencida = serializers.ReadOnlyField()
    
    class Meta:
        model = Receita
        fields = '__all__'
        read_only_fields = ('data_prescricao', 'data_atualizacao')