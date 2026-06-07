from rest_framework import generics, permissions
from rest_framework.response import Response
from django.db.models import Count
from datetime import datetime, timedelta
from .models import Agendamento, Servico
from pets.models import Paciente, Responsavel, AgendamentoVacina
from .serializers import AgendamentoSerializer, ServicoSerializer

class ServicoList(generics.ListAPIView):
    queryset = Servico.objects.all()
    serializer_class = ServicoSerializer
    permission_classes = [permissions.IsAuthenticated]

class AgendamentoListCreate(generics.ListCreateAPIView):
    serializer_class = AgendamentoSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        start_date = self.request.query_params.get('start_date')
        end_date = self.request.query_params.get('end_date')

        queryset = Agendamento.objects.select_related('paciente', 'paciente__responsavel', 'paciente__responsavel__user', 'servico', 'medico')

        if start_date and end_date:
            queryset = queryset.filter(data_hora__date__range=[start_date, end_date])

        return queryset.order_by('data_hora')

    def list(self, request, *args, **kwargs):
        # Buscar agendamentos regulares
        agendamentos_regulares = self.get_queryset()

        # Buscar agendamentos de vacinação (Imunização)
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')

        agendamentos_vacina = AgendamentoVacina.objects.select_related(
            'paciente', 'paciente__responsavel', 'paciente__responsavel__user', 'vacina', 'medico'
        )

        if start_date and end_date:
            agendamentos_vacina = agendamentos_vacina.filter(
                data_agendamento__date__range=[start_date, end_date]
            )

        agendamentos_vacina = agendamentos_vacina.order_by('data_agendamento')

        # Serializar agendamentos regulares
        agendamentos_data = AgendamentoSerializer(agendamentos_regulares, many=True).data

        # Serializar agendamentos de vacinação no formato compatível
        for agendamento_vacina in agendamentos_vacina:
            agendamento_data = {
                'id': f"vacina_{agendamento_vacina.id}",
                'paciente': {
                    'id': agendamento_vacina.paciente.id,
                    'nome': agendamento_vacina.paciente.nome,
                    'responsavel': {
                        'user': {
                            'first_name': agendamento_vacina.paciente.responsavel.user.first_name,
                            'last_name': agendamento_vacina.paciente.responsavel.user.last_name,
                            'phone': agendamento_vacina.paciente.responsavel.user.phone,
                        }
                    }
                },
                'servico': {
                     'id': None,
                     'nome': f"Imunização - {agendamento_vacina.vacina.nome}",
                     'preco': 0
                 },
                 'data_hora': agendamento_vacina.data_agendamento.isoformat(),
                 'status': agendamento_vacina.status,
                 'valor': 0,
                'observacoes': agendamento_vacina.observacoes or '',
                'medico': {
                    'id': agendamento_vacina.medico.id if agendamento_vacina.medico else None,
                    'first_name': agendamento_vacina.medico.first_name if agendamento_vacina.medico else '',
                    'last_name': agendamento_vacina.medico.last_name if agendamento_vacina.medico else '',
                },
                'tipo': 'vacinacao'  # Campo para identificar o tipo
            }
            agendamentos_data.append(agendamento_data)

        # Ordenar todos os agendamentos por data
        agendamentos_data.sort(key=lambda x: x['data_hora'])

        return Response(agendamentos_data)

class AgendamentoDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Agendamento.objects.all()
    serializer_class = AgendamentoSerializer
    permission_classes = [permissions.IsAuthenticated]

class AgendamentoVacinaDetail(generics.RetrieveUpdateDestroyAPIView):
    """View para operações específicas de agendamentos de vacinação"""
    queryset = AgendamentoVacina.objects.all()
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        from pets.serializers import AgendamentoVacinaSerializer
        return AgendamentoVacinaSerializer

    def destroy(self, request, *args, **kwargs):
        """Sobrescrever para permitir exclusão de agendamentos de vacinação"""
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response(status=204)

    def update(self, request, *args, **kwargs):
        """Sobrescrever para permitir atualização de status"""
        partial = kwargs.pop('partial', False)
        instance = self.get_object()

        # Se o status está sendo alterado para 'aplicado', criar VacinaAplicada
        if request.data.get('status') == 'aplicado' and instance.status != 'aplicado':
            from pets.models import VacinaAplicada
            from django.utils import timezone

            vacina_aplicada = VacinaAplicada.objects.create(
                paciente=instance.paciente,
                vacina=instance.vacina,
                data_aplicacao=timezone.now().date(),
                medico=request.user,
                observacoes=request.data.get('observacoes', instance.observacoes)
            )
            instance.vacina_aplicada = vacina_aplicada
            instance.data_aplicacao = timezone.now()

        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        return Response(serializer.data)

class DashboardStats(generics.GenericAPIView):
    permission_classes = []

    def get(self, request):
        from django.utils import timezone
        from django.db.models import Count, Sum, F
        from banho_tosa.models import BanhoTosa
        from internacao.models import Internacao
        from decimal import Decimal

        hoje = timezone.now().date()

        # Estatísticas básicas
        total_pacientes = Paciente.objects.count()
        agendamentos_hoje = Agendamento.objects.filter(data_hora__date=hoje).count()
        atendimentos_hoje = Agendamento.objects.filter(
            data_hora__date=hoje,
            status__in=['concluido', 'em_andamento']
        ).count()

        # Receita do dia (agendamentos concluídos)
        receita_agendamentos = Agendamento.objects.filter(
            data_hora__date=hoje,
            status='concluido'
        ).aggregate(total=Sum('valor'))['total'] or 0

        # Receita do dia (procedimentos concluídos)
        receita_procedimentos = BanhoTosa.objects.filter(
            data_realizacao__date=hoje,
            status='concluido'
        ).aggregate(total=Sum('valor_total'))['total'] or 0

        # Receita do dia (altas de internação)
        receita_internacao = 0
        internacoes_alta_hoje = Internacao.objects.filter(
            data_alta__date=hoje,
            status='alta'
        )

        for internacao in internacoes_alta_hoje:
            if internacao.data_entrada and internacao.data_alta and internacao.valor_diaria:
                # Calcular dias de internação
                dias = (internacao.data_alta.date() - internacao.data_entrada.date()).days
                if dias < 1:
                    dias = 1  # Mínimo de 1 dia
                valor_total = float(internacao.valor_diaria) * dias
                receita_internacao += valor_total

        # Receita total do dia
        receita_diaria = float(receita_agendamentos) + float(receita_procedimentos) + receita_internacao

        # Próximos agendamentos (próximos 5)
        proximos_agendamentos = Agendamento.objects.filter(
            data_hora__gte=timezone.now(),
            status__in=['agendado', 'confirmado']
        ).select_related('paciente', 'paciente__responsavel', 'paciente__responsavel__user', 'servico').order_by('data_hora')[:5]

        # Serializar próximos agendamentos com dados necessários
        proximos_data = []
        for agendamento in proximos_agendamentos:
            proximos_data.append({
                'id': agendamento.id,
                'paciente_nome': agendamento.paciente.nome,
                'responsavel_nome': agendamento.paciente.responsavel.user.first_name,
                'responsavel_sobrenome': agendamento.paciente.responsavel.user.last_name,
                'data_hora': agendamento.data_hora.isoformat(),
                'status': agendamento.status,
                'servico_nome': agendamento.servico.nome
            })

        # Atividades recentes (últimos 5 agendamentos criados)
        atividades_recentes = Agendamento.objects.select_related(
            'paciente', 'paciente__responsavel', 'paciente__responsavel__user', 'servico'
        ).order_by('-id')[:5]

        atividades_data = []
        for agendamento in atividades_recentes:
            atividades_data.append({
                'id': agendamento.id,
                'tipo': 'agendamento',
                'descricao': f'Agendamento de {agendamento.servico.nome} para {agendamento.paciente.nome}',
                'data_hora': agendamento.data_hora.isoformat()
            })

        return Response({
            'total_pacientes': total_pacientes,
            'agendamentos_hoje': agendamentos_hoje,
            'servicos_hoje': atendimentos_hoje,
            'receita_diaria': receita_diaria,
            'receita_agendamentos': float(receita_agendamentos),
            'receita_procedimentos': float(receita_procedimentos),
            'receita_internacao': receita_internacao,
            'proximos_agendamentos': proximos_data,
            'atividades_recentes': atividades_data
        })
