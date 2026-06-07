from rest_framework import serializers
from .models import Venda, ItemVenda
from estoque.models import Product


class ItemVendaSerializer(serializers.ModelSerializer):
    produto_nome = serializers.CharField(source='produto.nome', read_only=True)
    produto_codigo = serializers.CharField(source='produto.codigo', read_only=True)
    produto_imagem = serializers.CharField(source='produto.imagem', read_only=True)
    subtotal = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    
    class Meta:
        model = ItemVenda
        fields = [
            'id', 'produto', 'produto_nome', 'produto_codigo', 'produto_imagem',
            'quantidade', 'preco_unitario', 'subtotal'
        ]


class VendaSerializer(serializers.ModelSerializer):
    itens = ItemVendaSerializer(many=True, read_only=True)
    subtotal = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    
    class Meta:
        model = Venda
        fields = [
            'id', 'numero_venda', 'cliente_nome', 'cliente_telefone', 'cliente_email',
            'data_venda', 'total', 'desconto', 'subtotal', 'status', 'forma_pagamento',
            'observacoes', 'itens', 'created_at', 'updated_at'
        ]
        read_only_fields = ('numero_venda', 'created_at', 'updated_at')


class CreateItemVendaSerializer(serializers.Serializer):
    produto_id = serializers.IntegerField()
    quantidade = serializers.IntegerField(min_value=1)
    preco_unitario = serializers.DecimalField(max_digits=10, decimal_places=2, min_value=0.01)
    
    def validate_produto_id(self, value):
        try:
            Product.objects.get(id=value)
        except Product.DoesNotExist:
            raise serializers.ValidationError("Produto não encontrado.")
        return value


class CreateVendaSerializer(serializers.Serializer):
    cliente_nome = serializers.CharField(max_length=200)
    cliente_telefone = serializers.CharField(max_length=20)
    cliente_email = serializers.EmailField(required=False, allow_blank=True)
    forma_pagamento = serializers.ChoiceField(choices=Venda.FORMA_PAGAMENTO_CHOICES)
    desconto = serializers.DecimalField(max_digits=10, decimal_places=2, required=False, min_value=0)
    observacoes = serializers.CharField(required=False, allow_blank=True)
    itens = CreateItemVendaSerializer(many=True)
    
    def validate_itens(self, value):
        if not value:
            raise serializers.ValidationError("Pelo menos um item deve ser informado.")
        return value


class UpdateVendaSerializer(serializers.ModelSerializer):
    itens = CreateItemVendaSerializer(many=True, required=False)
    
    class Meta:
        model = Venda
        fields = [
            'cliente_nome', 'cliente_telefone', 'cliente_email',
            'forma_pagamento', 'desconto', 'observacoes', 'itens'
        ]


class EstatisticasVendasSerializer(serializers.Serializer):
    totalVendas = serializers.IntegerField()
    vendasPagas = serializers.IntegerField()
    vendasPendentes = serializers.IntegerField()
    vendasCanceladas = serializers.IntegerField()
    faturamentoTotal = serializers.DecimalField(max_digits=15, decimal_places=2)
    faturamentoMes = serializers.DecimalField(max_digits=15, decimal_places=2)
    ticketMedio = serializers.DecimalField(max_digits=15, decimal_places=2)