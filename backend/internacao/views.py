from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q, Count, Sum, F
from django.utils import timezone
from .models import Internacao, EvolucoesInternacao
from .serializers import InternacaoSerializer, InternacaoDetailSerializer, EvolucoesInternacaoSerializer

class InternacaoViewSet(viewsets.ModelViewSet):
    queryset = Internacao.objects.all()
    serializer_class = InternacaoSerializer
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return InternacaoDetailSerializer
        return InternacaoSerializer
    
    def get_queryset(self):
        queryset = Internacao.objects.select_related('paciente', 'medico_responsavel').all()
        
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
                Q(motivo__icontains=search) |
                Q(diagnostico__icontains=search)
            )
        
        return queryset.order_by('-data_entrada')
    
    @action(detail=False, methods=['get'])
    def estatisticas(self, request):
        """Retorna estatísticas das internações"""
        total = Internacao.objects.count()
        ativas = Internacao.objects.filter(status='internado').count()
        alta_hoje = Internacao.objects.filter(
            data_alta__date=timezone.now().date()
        ).count()
        
        # Receita total das internações ativas (calculada manualmente)
        internacoes_ativas = Internacao.objects.filter(status='internado')
        receita_ativa = 0
        for internacao in internacoes_ativas:
            receita_ativa += float(internacao.valor_diaria) * internacao.dias_internado
        
        return Response({
            'total': total,
            'ativas': ativas,
            'alta_hoje': alta_hoje,
            'receita_ativa': receita_ativa
        })

class EvolucoesInternacaoViewSet(viewsets.ModelViewSet):
    queryset = EvolucoesInternacao.objects.all()
    serializer_class = EvolucoesInternacaoSerializer
    
    def get_queryset(self):
        internacao_id = self.request.query_params.get('internacao', None)
        if internacao_id:
            return self.queryset.filter(internacao_id=internacao_id)
        return self.queryset.order_by('-data_hora')
