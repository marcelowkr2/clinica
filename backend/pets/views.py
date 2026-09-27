from rest_framework import generics, permissions, viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q, Count
from django.utils import timezone
from .models import Convenio, Plano, Responsavel, Paciente, Vacina, VacinaAplicada, AgendamentoVacina
from .serializers import (
    ConvenioSerializer, PlanoSerializer, ResponsavelSerializer,
    PacienteSerializer, VacinaSerializer, VacinaAplicadaSerializer,
    PacienteComResponsavelSerializer, AgendamentoVacinaSerializer
)

class ConvenioList(generics.ListCreateAPIView):
    queryset = Convenio.objects.all()
    serializer_class = ConvenioSerializer
    permission_classes = [permissions.IsAuthenticated]

class PlanoList(generics.ListCreateAPIView):
    serializer_class = PlanoSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        convenio_id = self.request.query_params.get('convenio')
        if convenio_id:
            return Plano.objects.filter(convenio_id=convenio_id)
        return Plano.objects.all()

class ResponsavelList(generics.ListCreateAPIView):
    serializer_class = ResponsavelSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = Responsavel.objects.all()
        telefone = self.request.query_params.get('telefone')
        if telefone:
            # Buscar pelo telefone do usuário associado
            queryset = queryset.filter(user__phone=telefone)
        return queryset

class ResponsavelDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Responsavel.objects.all()
    serializer_class = ResponsavelSerializer
    permission_classes = [permissions.IsAuthenticated]

class PacienteListCreate(generics.ListCreateAPIView):
    serializer_class = PacienteSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Otimização com select_related para evitar N+1 no banco
        queryset = Paciente.objects.select_related('responsavel__user', 'convenio', 'plano').all()

        # Filtra pacientes pelo responsável (se usuário for responsável)
        user = self.request.user
        if user.user_type == 4:  # Responsável
            queryset = queryset.filter(responsavel__user=user)
        return queryset

    def perform_create(self, serializer):
        serializer.save()

class PacienteDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Paciente.objects.all()
    serializer_class = PacienteSerializer
    permission_classes = [permissions.IsAuthenticated]

class VacinaList(generics.ListCreateAPIView):
    queryset = Vacina.objects.all()
    serializer_class = VacinaSerializer
    permission_classes = [permissions.IsAuthenticated]

class VacinaAplicadaCreate(generics.CreateAPIView):
    queryset = VacinaAplicada.objects.all()
    serializer_class = VacinaAplicadaSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(medico=self.request.user)

class AgendamentoVacinaViewSet(viewsets.ModelViewSet):
    queryset = AgendamentoVacina.objects.all()
    serializer_class = AgendamentoVacinaSerializer

    def get_queryset(self):
        queryset = AgendamentoVacina.objects.select_related('paciente', 'vacina', 'medico').all()

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
                Q(paciente__responsavel__user__last_name__icontains=search) |
                Q(vacina__nome__icontains=search)
            )

        return queryset.order_by('data_agendamento')

    @action(detail=False, methods=['get'])
    def estatisticas(self, request):
        """Retorna estatísticas das vacinações"""
        aplicadas = VacinaAplicada.objects.count()
        agendadas = AgendamentoVacina.objects.filter(
            data_agendamento__gte=timezone.now().date()
        ).count()
        vencidas = AgendamentoVacina.objects.filter(
            data_agendamento__lt=timezone.now().date()
        ).count()
        total = aplicadas + agendadas + vencidas

        return Response({
            'aplicadas': aplicadas,
            'agendadas': agendadas,
            'vencidas': vencidas,
            'total': total
        })

class PacienteParaAgendamentoList(generics.ListAPIView):
    """View específica para listar pacientes com informações do responsável para agendamentos"""
    serializer_class = PacienteComResponsavelSerializer
    permission_classes = []

    def get_queryset(self):
        return Paciente.objects.select_related('responsavel__user', 'convenio', 'plano').all()
