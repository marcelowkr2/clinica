from rest_framework import serializers
from .models import ServicoProcedimento, Procedimento, AvaliacaoProcedimento, FotoProcedimento
from pets.serializers import PacienteSerializer
from core.serializers import UserSerializer

class ServicoProcedimentoSerializer(serializers.ModelSerializer):
    preco = serializers.DecimalField(source='valor', max_digits=10, decimal_places=2, read_only=True)
    
    class Meta:
        model = ServicoProcedimento
        fields = ['id', 'nome', 'descricao', 'preco', 'tempo_estimado', 'ativo']

class FotoProcedimentoSerializer(serializers.ModelSerializer):
    class Meta:
        model = FotoProcedimento
        fields = '__all__'

class AvaliacaoProcedimentoSerializer(serializers.ModelSerializer):
    class Meta:
        model = AvaliacaoProcedimento
        fields = '__all__'

class ProcedimentoSerializer(serializers.ModelSerializer):
    paciente_nome = serializers.CharField(source='paciente.nome', read_only=True)
    responsavel_nome = serializers.CharField(source='paciente.responsavel.user.get_full_name', read_only=True)
    responsavel_telefone = serializers.CharField(source='paciente.responsavel.user.phone', read_only=True)
    profissional_nome = serializers.CharField(source='profissional.get_full_name', read_only=True)
    profissional_dados = serializers.SerializerMethodField()
    servicos_nomes = serializers.SerializerMethodField()
    
    class Meta:
        model = Procedimento
        fields = '__all__'
        read_only_fields = ('data_criacao', 'data_atualizacao')
    
    def get_servicos_nomes(self, obj):
        return [servico.nome for servico in obj.servicos.all()]
    
    def get_profissional_dados(self, obj):
        if obj.profissional:
            return {
                'id': obj.profissional.id,
                'first_name': obj.profissional.first_name,
                'last_name': obj.profissional.last_name,
                'nome_completo': obj.profissional.get_full_name()
            }
        return None

class ProcedimentoDetailSerializer(serializers.ModelSerializer):
    paciente = PacienteSerializer(read_only=True)
    profissional = UserSerializer(read_only=True)
    servicos = ServicoProcedimentoSerializer(many=True, read_only=True)
    fotos = FotoProcedimentoSerializer(many=True, read_only=True)
    avaliacao = AvaliacaoProcedimentoSerializer(read_only=True)
    
    class Meta:
        model = Procedimento
        fields = '__all__'
        read_only_fields = ('data_criacao', 'data_atualizacao')