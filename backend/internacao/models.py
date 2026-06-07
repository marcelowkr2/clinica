from django.db import models
from django.contrib.auth import get_user_model
from pets.models import Paciente

User = get_user_model()

class Internacao(models.Model):
    STATUS_CHOICES = [
        ('internado', 'Internado'),
        ('alta', 'Alta'),
        ('transferido', 'Transferido'),
        ('obito', 'Óbito'),
    ]
    
    MOTIVO_CHOICES = [
        ('cirurgia', 'Cirurgia'),
        ('tratamento', 'Tratamento'),
        ('observacao', 'Observação'),
        ('emergencia', 'Emergência'),
        ('pos_operatorio', 'Pós-operatório'),
        ('outros', 'Outros'),
    ]
    
    paciente = models.ForeignKey(Paciente, on_delete=models.CASCADE, related_name='internacoes')
    medico_responsavel = models.ForeignKey(User, on_delete=models.CASCADE, related_name='internacoes_responsavel')
    data_entrada = models.DateTimeField()
    data_alta = models.DateTimeField(null=True, blank=True)
    motivo = models.CharField(max_length=20, choices=MOTIVO_CHOICES)
    diagnostico = models.TextField()
    observacoes_entrada = models.TextField(blank=True)
    observacoes_alta = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='internado')
    valor_diaria = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    data_criacao = models.DateTimeField(auto_now_add=True)
    data_atualizacao = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.paciente.nome} - {self.data_entrada.strftime('%d/%m/%Y')}"
    
    @property
    def dias_internado(self):
        from django.utils import timezone
        if self.data_alta:
            return (self.data_alta.date() - self.data_entrada.date()).days
        return (timezone.now().date() - self.data_entrada.date()).days
    
    class Meta:
        verbose_name = "Internação"
        verbose_name_plural = "Internações"
        ordering = ['-data_entrada']

class EvolucoesInternacao(models.Model):
    internacao = models.ForeignKey(Internacao, on_delete=models.CASCADE, related_name='evolucoes')
    medico = models.ForeignKey(User, on_delete=models.CASCADE)
    data_hora = models.DateTimeField(auto_now_add=True)
    evolucao = models.TextField()
    temperatura = models.DecimalField(max_digits=4, decimal_places=1, null=True, blank=True)
    peso = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    observacoes = models.TextField(blank=True)
    
    def __str__(self):
        return f"{self.internacao.paciente.nome} - {self.data_hora.strftime('%d/%m/%Y %H:%M')}"
    
    class Meta:
        verbose_name = "Evolução de Internação"
        verbose_name_plural = "Evoluções de Internação"
        ordering = ['-data_hora']
