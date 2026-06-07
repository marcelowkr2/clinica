from django.db import models
from django.core.validators import MinValueValidator
from decimal import Decimal
from estoque.models import Product


class Venda(models.Model):
    STATUS_CHOICES = [
        ('pendente', 'Pendente'),
        ('pago', 'Pago'),
        ('cancelado', 'Cancelado'),
    ]
    
    FORMA_PAGAMENTO_CHOICES = [
        ('dinheiro', 'Dinheiro'),
        ('cartao_credito', 'Cartão de Crédito'),
        ('cartao_debito', 'Cartão de Débito'),
        ('pix', 'PIX'),
        ('transferencia', 'Transferência'),
    ]
    
    numero_venda = models.CharField(max_length=20, unique=True, verbose_name='Número da Venda')
    cliente_nome = models.CharField(max_length=200, verbose_name='Nome do Cliente')
    cliente_telefone = models.CharField(max_length=20, verbose_name='Telefone do Cliente')
    cliente_email = models.EmailField(blank=True, null=True, verbose_name='Email do Cliente')
    
    data_venda = models.DateTimeField(verbose_name='Data da Venda')
    total = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        validators=[MinValueValidator(Decimal('0.00'))],
        verbose_name='Total'
    )
    desconto = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        default=Decimal('0.00'),
        validators=[MinValueValidator(Decimal('0.00'))],
        verbose_name='Desconto'
    )
    
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pendente', verbose_name='Status')
    forma_pagamento = models.CharField(max_length=20, choices=FORMA_PAGAMENTO_CHOICES, verbose_name='Forma de Pagamento')
    observacoes = models.TextField(blank=True, null=True, verbose_name='Observações')
    
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Criado em')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Atualizado em')
    
    class Meta:
        ordering = ['-data_venda']
        verbose_name = 'Venda'
        verbose_name_plural = 'Vendas'
    
    def __str__(self):
        return f"{self.numero_venda} - {self.cliente_nome}"
    
    @property
    def subtotal(self):
        """Calcula o subtotal antes do desconto"""
        return sum(item.subtotal for item in self.itens.all())


class ItemVenda(models.Model):
    venda = models.ForeignKey(Venda, on_delete=models.CASCADE, related_name='itens', verbose_name='Venda')
    produto = models.ForeignKey(Product, on_delete=models.CASCADE, verbose_name='Produto')
    
    quantidade = models.IntegerField(
        validators=[MinValueValidator(1)],
        verbose_name='Quantidade'
    )
    preco_unitario = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        validators=[MinValueValidator(Decimal('0.01'))],
        verbose_name='Preço Unitário'
    )
    
    class Meta:
        verbose_name = 'Item da Venda'
        verbose_name_plural = 'Itens da Venda'
    
    def __str__(self):
        return f"{self.produto.nome} - {self.quantidade}x"
    
    @property
    def subtotal(self):
        """Calcula o subtotal do item"""
        return self.quantidade * self.preco_unitario