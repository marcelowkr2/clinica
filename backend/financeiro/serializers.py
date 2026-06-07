from rest_framework import serializers
from .models import Transacao

class TransacaoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transacao
        fields = [
            'id', 'tipo', 'categoria', 'descricao', 'valor', 'data',
            'forma_pagamento', 'status', 'observacoes', 'cliente_fornecedor',
            'agendamento_id', 'banho_tosa_id', 'internacao_id',
            'data_criacao', 'data_atualizacao'
        ]
        read_only_fields = ['data_criacao', 'data_atualizacao']
    
    def create(self, validated_data):
        validated_data['usuario'] = self.context['request'].user
        return super().create(validated_data)