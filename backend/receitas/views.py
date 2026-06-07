from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q, Count
from django.utils import timezone
from .models import Medicamento, Receita, ItemReceita, ControleReceita
from .serializers import MedicamentoSerializer, ReceitaSerializer, ReceitaDetailSerializer, ItemReceitaSerializer, ControleReceitaSerializer

class MedicamentoViewSet(viewsets.ModelViewSet):
    queryset = Medicamento.objects.all()
    serializer_class = MedicamentoSerializer
    permission_classes = []  # Temporariamente removendo autenticação para teste
    
    def get_queryset(self):
        search = self.request.query_params.get('search', None)
        if search:
            return self.queryset.filter(
                Q(nome__icontains=search) |
                Q(principio_ativo__icontains=search)
            )
        return self.queryset

class ReceitaViewSet(viewsets.ModelViewSet):
    queryset = Receita.objects.all()
    serializer_class = ReceitaSerializer
    permission_classes = []  # Temporariamente removendo autenticação para teste
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return ReceitaDetailSerializer
        return ReceitaSerializer
    
    def get_queryset(self):
        queryset = Receita.objects.select_related('paciente', 'medico').all()
        
        # Filtros
        status_filter = self.request.query_params.get('status', None)
        search = self.request.query_params.get('search', None)
        
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        if search:
            queryset = queryset.filter(
                Q(paciente__nome__icontains=search) |
                Q(paciente__responsavel__user__first_name__icontains=search) |
                Q(paciente__responsavel__user__last_name__icontains=search) |
                Q(diagnostico__icontains=search)
            )
        
        return queryset.order_by('-data_prescricao')
    
    @action(detail=False, methods=['get'])
    def estatisticas(self, request):
        """Retorna estatísticas das receitas"""
        total = Receita.objects.count()
        ativas = Receita.objects.filter(status='ativa').count()
        finalizadas = Receita.objects.filter(status='finalizada').count()
        vencidas = Receita.objects.filter(
            data_validade__lt=timezone.now().date(),
            status='ativa'
        ).count()
        
        return Response({
            'total': total,
            'ativas': ativas,
            'finalizadas': finalizadas,
            'vencidas': vencidas
        })

class ItemReceitaViewSet(viewsets.ModelViewSet):
    queryset = ItemReceita.objects.all()
    serializer_class = ItemReceitaSerializer
    permission_classes = []  # Temporariamente removendo autenticação para teste
    
    def get_queryset(self):
        receita_id = self.request.query_params.get('receita', None)
        if receita_id:
            return self.queryset.filter(receita_id=receita_id)
        return self.queryset

class ControleReceitaViewSet(viewsets.ModelViewSet):
    queryset = ControleReceita.objects.all()
    serializer_class = ControleReceitaSerializer
    permission_classes = []  # Temporariamente removendo autenticação para teste
