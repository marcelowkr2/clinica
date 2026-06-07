from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from django.db.models import Sum, Q
from django.utils import timezone
from datetime import datetime, timedelta
from .models import Transacao
from .serializers import TransacaoSerializer

class TransacaoListCreate(generics.ListCreateAPIView):
    serializer_class = TransacaoSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = Transacao.objects.all()
        
        # Filtros
        tipo = self.request.query_params.get('tipo')
        status_filter = self.request.query_params.get('status')
        data_inicio = self.request.query_params.get('data_inicio')
        data_fim = self.request.query_params.get('data_fim')
        categoria = self.request.query_params.get('categoria')
        
        if tipo:
            queryset = queryset.filter(tipo=tipo)
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        if categoria:
            queryset = queryset.filter(categoria__icontains=categoria)
        if data_inicio and data_fim:
            queryset = queryset.filter(data__date__range=[data_inicio, data_fim])
        
        return queryset.order_by('-data')

class TransacaoDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Transacao.objects.all()
    serializer_class = TransacaoSerializer
    permission_classes = [permissions.IsAuthenticated]

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def estatisticas_financeiras(request):
    """Retorna estatísticas financeiras"""
    hoje = timezone.now().date()
    inicio_mes = hoje.replace(day=1)
    
    # Receitas e despesas do mês
    receitas_mes = Transacao.objects.filter(
        tipo='receita',
        status='pago',
        data__date__gte=inicio_mes,
        data__date__lte=hoje
    ).aggregate(total=Sum('valor'))['total'] or 0
    
    despesas_mes = Transacao.objects.filter(
        tipo='despesa',
        status='pago',
        data__date__gte=inicio_mes,
        data__date__lte=hoje
    ).aggregate(total=Sum('valor'))['total'] or 0
    
    # Receitas e despesas do dia
    receitas_hoje = Transacao.objects.filter(
        tipo='receita',
        status='pago',
        data__date=hoje
    ).aggregate(total=Sum('valor'))['total'] or 0
    
    despesas_hoje = Transacao.objects.filter(
        tipo='despesa',
        status='pago',
        data__date=hoje
    ).aggregate(total=Sum('valor'))['total'] or 0
    
    # Transações pendentes
    pendentes = Transacao.objects.filter(status='pendente').count()
    
    # Saldo líquido
    saldo_mes = float(receitas_mes) - float(despesas_mes)
    saldo_hoje = float(receitas_hoje) - float(despesas_hoje)
    
    return Response({
        'receitas_mes': float(receitas_mes),
        'despesas_mes': float(despesas_mes),
        'saldo_mes': saldo_mes,
        'receitas_hoje': float(receitas_hoje),
        'despesas_hoje': float(despesas_hoje),
        'saldo_hoje': saldo_hoje,
        'pendentes': pendentes,
    })

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def criar_transacao_automatica(request):
    """Cria uma transação automaticamente a partir de uma alta de internação"""
    data = request.data
    
    try:
        transacao = Transacao.objects.create(
            tipo='receita',
            categoria='Internação',
            descricao=data.get('descricao', ''),
            valor=data.get('valor', 0),
            data=timezone.now(),
            forma_pagamento=data.get('forma_pagamento', 'dinheiro'),
            status='pago',
            cliente_fornecedor=data.get('cliente_fornecedor', ''),
            internacao_id=data.get('internacao_id'),
            usuario=request.user
        )
        
        serializer = TransacaoSerializer(transacao)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    except Exception as e:
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_400_BAD_REQUEST
        )