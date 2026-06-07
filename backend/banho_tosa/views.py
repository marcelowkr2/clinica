from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q, Count, Sum
from django.utils import timezone
from .models import ServicoProcedimento, Procedimento, AvaliacaoProcedimento, FotoProcedimento
from .serializers import ServicoProcedimentoSerializer, ProcedimentoSerializer, ProcedimentoDetailSerializer, AvaliacaoProcedimentoSerializer, FotoProcedimentoSerializer

class ServicoProcedimentoViewSet(viewsets.ModelViewSet):
    queryset = ServicoProcedimento.objects.filter(ativo=True)
    serializer_class = ServicoProcedimentoSerializer

class ProcedimentoViewSet(viewsets.ModelViewSet):
    queryset = Procedimento.objects.all()
    serializer_class = ProcedimentoSerializer
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return ProcedimentoDetailSerializer
        return ProcedimentoSerializer
    
    def get_queryset(self):
        queryset = Procedimento.objects.select_related('paciente', 'profissional').all()
        
        # Filtros
        status_filter = self.request.query_params.get('status', None)
        search = self.request.query_params.get('search', None)
        data = self.request.query_params.get('data', None)
        
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        if data:
            queryset = queryset.filter(data_agendamento__date=data)
        
        if search:
            queryset = queryset.filter(
                Q(paciente__nome__icontains=search) |
                Q(paciente__responsavel__user__first_name__icontains=search) |
                Q(paciente__responsavel__user__last_name__icontains=search)
            )
        
        return queryset.order_by('-data_agendamento')
    
    @action(detail=False, methods=['get'])
    def estatisticas(self, request):
        """Retorna estatísticas dos procedimentos"""
        hoje = timezone.now().date()
        
        total = Procedimento.objects.count()
        agendados = Procedimento.objects.filter(status='agendado').count()
        em_andamento = Procedimento.objects.filter(status='em_andamento').count()
        concluidos = Procedimento.objects.filter(status='concluido').count()
        hoje_count = Procedimento.objects.filter(data_agendamento__date=hoje).count()
        
        # Receita total dos procedimentos concluídos
        receita_total = Procedimento.objects.filter(
            status='concluido'
        ).aggregate(total=Sum('valor_total'))['total'] or 0
        
        # Receita do dia
        receita_hoje = Procedimento.objects.filter(
            status='concluido',
            data_realizacao__date=hoje
        ).aggregate(total=Sum('valor_total'))['total'] or 0
        
        return Response({
            'total': total,
            'agendados': agendados,
            'em_andamento': em_andamento,
            'concluidos': concluidos,
            'hoje': hoje_count,
            'receita': receita_total,
            'receita_hoje': receita_hoje
        })

class AvaliacaoProcedimentoViewSet(viewsets.ModelViewSet):
    queryset = AvaliacaoProcedimento.objects.all()
    serializer_class = AvaliacaoProcedimentoSerializer

class FotoProcedimentoViewSet(viewsets.ModelViewSet):
    queryset = FotoProcedimento.objects.all()
    serializer_class = FotoProcedimentoSerializer
    
    def get_queryset(self):
        procedimento_id = self.request.query_params.get('procedimento', None)
        if procedimento_id:
            return self.queryset.filter(procedimento_id=procedimento_id)
        return self.queryset
