from rest_framework import viewsets, status, permissions
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q, Count
from django.utils import timezone
from .models import TipoExame, Exame, ParametroExame
from .serializers import TipoExameSerializer, ExameSerializer, ExameDetailSerializer, ParametroExameSerializer

class TipoExameViewSet(viewsets.ModelViewSet):
    queryset = TipoExame.objects.all()
    serializer_class = TipoExameSerializer
    permission_classes = [permissions.AllowAny]

class ExameViewSet(viewsets.ModelViewSet):
    queryset = Exame.objects.all()
    serializer_class = ExameSerializer
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return ExameDetailSerializer
        return ExameSerializer
    
    def get_queryset(self):
        queryset = Exame.objects.select_related('paciente', 'tipo_exame', 'medico_solicitante').all()
        
        # Filtros
        status_filter = self.request.query_params.get('status', None)
        search = self.request.query_params.get('search', None)
        prioridade = self.request.query_params.get('prioridade', None)
        
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        if prioridade:
            queryset = queryset.filter(prioridade=prioridade)
        
        if search:
            queryset = queryset.filter(
                Q(paciente__nome__icontains=search) |
                Q(paciente__responsavel__user__first_name__icontains=search) |
                Q(paciente__responsavel__user__last_name__icontains=search) |
                Q(tipo_exame__nome__icontains=search)
            )
        
        return queryset.order_by('-data_solicitacao')
    
    @action(detail=False, methods=['get'])
    def estatisticas(self, request):
        """Retorna estatísticas dos exames"""
        total = Exame.objects.count()
        pendentes = Exame.objects.filter(status='solicitado').count()
        coletados = Exame.objects.filter(status='coletado').count()
        concluidos = Exame.objects.filter(status='concluido').count()
        
        return Response({
            'total': total,
            'pendentes': pendentes,
            'coletados': coletados,
            'concluidos': concluidos
        })

class ParametroExameViewSet(viewsets.ModelViewSet):
    queryset = ParametroExame.objects.all()
    serializer_class = ParametroExameSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        exame_id = self.request.query_params.get('exame', None)
        if exame_id:
            return self.queryset.filter(exame_id=exame_id)
        return self.queryset
