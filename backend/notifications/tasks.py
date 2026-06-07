from celery import shared_task
from django.core.mail import send_mail
from django.conf import settings
from django.template.loader import render_to_string
from appointments.models import Agendamento

@shared_task
def send_appointment_reminder(appointment_id):
    try:
        appointment = Agendamento.objects.get(id=appointment_id)
        tutor_email = appointment.pet.tutor.user.email
        
        context = {
            'pet_name': appointment.pet.nome,
            'date': appointment.data.strftime('%d/%m/%Y'),
            'time': appointment.horario,
            'service': appointment.servico.nome,
        }
        
        html_message = render_to_string('emails/appointment_reminder.html', context)
        text_message = render_to_string('emails/appointment_reminder.txt', context)
        
        send_mail(
            f'Lembrete: Consulta para {appointment.pet.nome}',
            text_message,
            settings.DEFAULT_FROM_EMAIL,
            [tutor_email],
            html_message=html_message,
        )
        
        # Registrar notificação no sistema
        appointment.pet.tutor.user.notifications.create(
            title=f"Lembrete de consulta enviado para {tutor_email}",
            message=f"Consulta para {appointment.pet.nome} em {context['date']} às {context['time']}"
        )
        
        return True
    except Exception as e:
        # Logar o erro
        return False