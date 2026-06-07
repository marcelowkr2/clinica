from django.db import models
from django.core.validators import MinValueValidator
from decimal import Decimal

class Product(models.Model):
    STATUS_CHOICES = [
        ('ativo', 'Ativo'),
        ('inativo', 'Inativo'),
        ('descontinuado', 'Descontinuado'),
    ]
    
    UNIDADE_MEDIDA_CHOICES = [
        ('un', 'Unidade'),
        ('kg', 'Quilograma'),
        ('g', 'Grama'),
        ('l', 'Litro'),
        ('ml', 'Mililitro'),
        ('cx', 'Caixa'),
        ('pct', 'Pacote'),
    ]
    
    codigo = models.CharField(max_length=50, unique=True, verbose_name='Código')
    nome = models.CharField(max_length=200, verbose_name='Nome')
    categoria = models.CharField(max_length=100, verbose_name='Categoria')
    marca = models.CharField(max_length=100, verbose_name='Marca')
    
    # Preços
    preco_compra = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        validators=[MinValueValidator(Decimal('0.01'))],
        verbose_name='Preço de Compra'
    )
    preco_venda = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        validators=[MinValueValidator(Decimal('0.01'))],
        verbose_name='Preço de Venda'
    )
    
    # Estoque
    quantidade_atual = models.IntegerField(
        default=0,
        validators=[MinValueValidator(0)],
        verbose_name='Quantidade Atual'
    )
    quantidade_minima = models.IntegerField(
        default=0,
        validators=[MinValueValidator(0)],
        verbose_name='Quantidade Mínima'
    )
    unidade_medida = models.CharField(
        max_length=10,
        choices=UNIDADE_MEDIDA_CHOICES,
        default='un',
        verbose_name='Unidade de Medida'
    )
    
    # Informações adicionais
    data_validade = models.DateField(null=True, blank=True, verbose_name='Data de Validade')
    fornecedor = models.CharField(max_length=200, verbose_name='Fornecedor')
    localizacao = models.CharField(max_length=100, verbose_name='Localização')
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='ativo',
        verbose_name='Status'
    )
    observacoes = models.TextField(blank=True, verbose_name='Observações')
    
    # Campo de imagem
    imagem = models.ImageField(
        upload_to='produtos/',
        null=True,
        blank=True,
        verbose_name='Imagem do Produto'
    )
    
    # Timestamps
    data_cadastro = models.DateTimeField(auto_now_add=True, verbose_name='Data de Cadastro')
    data_atualizacao = models.DateTimeField(auto_now=True, verbose_name='Data de Atualização')
    
    class Meta:
        verbose_name = 'Produto'
        verbose_name_plural = 'Produtos'
        ordering = ['-data_cadastro']
    
    def __str__(self):
        return f"{self.codigo} - {self.nome}"
    
    @property
    def margem_lucro(self):
        """Calcula a margem de lucro em percentual"""
        if self.preco_compra > 0:
            return ((self.preco_venda - self.preco_compra) / self.preco_compra) * 100
        return 0
    
    @property
    def valor_total_estoque(self):
        """Calcula o valor total do produto em estoque"""
        return self.quantidade_atual * self.preco_compra
    
    @property
    def estoque_baixo(self):
        """Verifica se o estoque está baixo"""
        return self.quantidade_atual <= self.quantidade_minima
