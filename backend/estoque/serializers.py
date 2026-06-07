from rest_framework import serializers
from .models import Product

class ProductSerializer(serializers.ModelSerializer):
    margem_lucro = serializers.ReadOnlyField()
    valor_total_estoque = serializers.ReadOnlyField()
    estoque_baixo = serializers.ReadOnlyField()
    imagem = serializers.SerializerMethodField()
    
    def get_imagem(self, obj):
        if obj.imagem:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.imagem.url)
            return obj.imagem.url
        return None
    
    class Meta:
        model = Product
        fields = [
            'id',
            'codigo',
            'nome',
            'categoria',
            'marca',
            'preco_compra',
            'preco_venda',
            'quantidade_atual',
            'quantidade_minima',
            'unidade_medida',
            'data_validade',
            'fornecedor',
            'localizacao',
            'status',
            'observacoes',
            'imagem',
            'data_cadastro',
            'data_atualizacao',
            'margem_lucro',
            'valor_total_estoque',
            'estoque_baixo'
        ]
        read_only_fields = ['data_cadastro', 'data_atualizacao']

class ProductCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = [
            'codigo',
            'nome',
            'categoria',
            'marca',
            'preco_compra',
            'preco_venda',
            'quantidade_atual',
            'quantidade_minima',
            'unidade_medida',
            'data_validade',
            'fornecedor',
            'localizacao',
            'status',
            'observacoes',
            'imagem'
        ]