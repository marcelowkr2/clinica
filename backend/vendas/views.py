from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db import transaction
from django.utils import timezone
from django.db.models import Sum, Count, Q
from decimal import Decimal
from datetime import datetime
import csv
from django.http import HttpResponse

from .models import Venda, ItemVenda
from .serializers import (
    VendaSerializer, CreateVendaSerializer, UpdateVendaSerializer,
    EstatisticasVendasSerializer
)
from estoque.models import Product


class VendaViewSet(viewsets.ModelViewSet):
    queryset = Venda.objects.all().prefetch_related('itens__produto')
    serializer_class = VendaSerializer
    
    def get_serializer_class(self):
        if self.action == 'create':
            return CreateVendaSerializer
        elif self.action in ['update', 'partial_update']:
            return UpdateVendaSerializer
        return VendaSerializer
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        with transaction.atomic():
            # Criar a venda
            venda_data = serializer.validated_data.copy()
            itens_data = venda_data.pop('itens')
            
            # Gerar número da venda
            ultimo_numero = Venda.objects.count() + 1
            numero_venda = f"VND-{str(ultimo_numero).zfill(3)}"
            
            # Calcular total
            total_itens = sum(
                item['quantidade'] * item['preco_unitario'] 
                for item in itens_data
            )
            desconto = venda_data.get('desconto', Decimal('0.00'))
            total = total_itens - desconto
            
            venda = Venda.objects.create(
                numero_venda=numero_venda,
                data_venda=timezone.now(),
                total=total,
                **venda_data
            )
            
            # Criar itens da venda
            for item_data in itens_data:
                produto = Product.objects.get(id=item_data['produto_id'])
                ItemVenda.objects.create(
                    venda=venda,
                    produto=produto,
                    quantidade=item_data['quantidade'],
                    preco_unitario=item_data['preco_unitario']
                )
                
                # Atualizar estoque
                produto.quantidade_atual -= item_data['quantidade']
                produto.save()
        
        # Retornar a venda criada
        venda_serializer = VendaSerializer(venda)
        return Response(venda_serializer.data, status=status.HTTP_201_CREATED)
    
    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        
        with transaction.atomic():
            # Se há itens para atualizar
            if 'itens' in serializer.validated_data:
                # Restaurar estoque dos itens antigos
                for item in instance.itens.all():
                    produto = item.produto
                    produto.quantidade_atual += item.quantidade
                    produto.save()
                
                # Remover itens antigos
                instance.itens.all().delete()
                
                # Criar novos itens
                itens_data = serializer.validated_data.pop('itens')
                total_itens = Decimal('0.00')
                
                for item_data in itens_data:
                    produto = Product.objects.get(id=item_data['produto_id'])
                    ItemVenda.objects.create(
                        venda=instance,
                        produto=produto,
                        quantidade=item_data['quantidade'],
                        preco_unitario=item_data['preco_unitario']
                    )
                    
                    # Atualizar estoque
                    produto.quantidade_atual -= item_data['quantidade']
                    produto.save()
                    
                    total_itens += item_data['quantidade'] * item_data['preco_unitario']
                
                # Recalcular total
                desconto = serializer.validated_data.get('desconto', instance.desconto)
                instance.total = total_itens - desconto
            
            # Atualizar outros campos
            for attr, value in serializer.validated_data.items():
                setattr(instance, attr, value)
            
            instance.save()
        
        venda_serializer = VendaSerializer(instance)
        return Response(venda_serializer.data)
    
    @action(detail=True, methods=['patch'])
    def update_status(self, request, pk=None):
        venda = self.get_object()
        novo_status = request.data.get('status')
        
        if novo_status not in dict(Venda.STATUS_CHOICES):
            return Response(
                {'error': 'Status inválido'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        venda.status = novo_status
        venda.save()
        
        serializer = VendaSerializer(venda)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def estatisticas(self, request):
        vendas = Venda.objects.all()
        
        total_vendas = vendas.count()
        vendas_pagas = vendas.filter(status='pago').count()
        vendas_pendentes = vendas.filter(status='pendente').count()
        vendas_canceladas = vendas.filter(status='cancelado').count()
        
        faturamento_total = vendas.filter(status='pago').aggregate(
            total=Sum('total')
        )['total'] or Decimal('0.00')
        
        # Faturamento do mês atual
        current_month = timezone.now().month
        current_year = timezone.now().year
        faturamento_mes = vendas.filter(
            status='pago',
            data_venda__month=current_month,
            data_venda__year=current_year
        ).aggregate(total=Sum('total'))['total'] or Decimal('0.00')
        
        ticket_medio = faturamento_total / vendas_pagas if vendas_pagas > 0 else Decimal('0.00')
        
        data = {
            'totalVendas': total_vendas,
            'vendasPagas': vendas_pagas,
            'vendasPendentes': vendas_pendentes,
            'vendasCanceladas': vendas_canceladas,
            'faturamentoTotal': faturamento_total,
            'faturamentoMes': faturamento_mes,
            'ticketMedio': ticket_medio
        }
        
        serializer = EstatisticasVendasSerializer(data)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def exportar(self, request):
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = f'attachment; filename="vendas_{timezone.now().strftime("%Y%m%d")}.csv"'
        
        writer = csv.writer(response)
        writer.writerow([
            'Número da Venda', 'Cliente', 'Telefone', 'Email', 'Data da Venda',
            'Status', 'Forma de Pagamento', 'Subtotal', 'Desconto', 'Total', 'Observações'
        ])
        
        for venda in self.get_queryset():
            writer.writerow([
                venda.numero_venda,
                venda.cliente_nome,
                venda.cliente_telefone,
                venda.cliente_email or '',
                venda.data_venda.strftime('%d/%m/%Y %H:%M'),
                venda.get_status_display(),
                venda.get_forma_pagamento_display(),
                str(venda.subtotal),
                str(venda.desconto),
                str(venda.total),
                venda.observacoes or ''
            ])
        
        return response