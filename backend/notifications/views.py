from rest_framework import generics, permissions
from rest_framework.response import Response
from django.core.mail import send_mail
from django.conf import settings
from appointments.models import Agendamento
from .serializers import NotificationSerializer
from .tasks import send_appointment_reminder

class NotificationList(generics.ListAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return self.request.user.notifications.all()

class SendAppointmentReminder(generics.GenericAPIView):
    permission_classes = [permissions.IsAdminUser]
    
    def post(self, request, appointment_id):
        try:
            appointment = Agendamento.objects.get(id=appointment_id)
            send_appointment_reminder.delay(appointment.id)
            return Response({'status': 'Reminder sent'})
        except Agendamento.DoesNotExist:
            return Response({'error': 'Appointment not found'}, status=404)

class EmailTest(generics.GenericAPIView):
    permission_classes = [permissions.IsAdminUser]
    
    def post(self, request):
        send_mail(
            'Teste de Email - VetSaaS',
            'Este é um email de teste do sistema VetSaaS.',
            settings.DEFAULT_FROM_EMAIL,
            [request.user.email],
            fail_silently=False,
        )
        return Response({'status': 'Email sent'})