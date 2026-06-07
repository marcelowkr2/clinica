from django.db import models
from django.contrib.auth import get_user_model
from pets.models import Paciente

User = get_user_model()

class TipoExame(models.Model):
    nome = models.CharField(max_length=100)
    descricao = models.TextField(blank=True)
    valor = models.DecimalField(max_digits=10, decimal_places=2)
    tempo_resultado = models.IntegerField(help_text="Tempo para resultado em horas")
    ativo = models.BooleanField(default=True)
    
    def __str__(self):
        return self.nome
    
    class Meta:
        verbose_name = "Tipo de Exame"
        verbose_name_plural = "Tipos de Exames"

class Exame(models.Model):
    STATUS_CHOICES = [
        ('solicitado', 'Solicitado'),
        ('coletado', 'Coletado'),
        ('processando', 'Processando'),
        ('concluido', 'Concluído'),
        ('cancelado', 'Cancelado'),
    ]
    
    PRIORIDADE_CHOICES = [
        ('baixa', 'Baixa'),
        ('normal', 'Normal'),
        ('alta', 'Alta'),
        ('urgente', 'Urgente'),
    ]
    
    paciente = models.ForeignKey(Paciente, on_delete=models.CASCADE, related_name='exames')
    tipo_exame = models.ForeignKey(TipoExame, on_delete=models.CASCADE)
    medico_solicitante = models.ForeignKey(User, on_delete=models.CASCADE, related_name='exames_solicitados')
    data_solicitacao = models.DateTimeField(auto_now_add=True)
    data_coleta = models.DateTimeField(null=True, blank=True)
    data_resultado = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='solicitado')
    prioridade = models.CharField(max_length=20, choices=PRIORIDADE_CHOICES, default='normal')
    observacoes_solicitacao = models.TextField(blank=True)
    resultado = models.TextField(blank=True)
    observacoes_resultado = models.TextField(blank=True)
    arquivo_resultado = models.FileField(upload_to='exames/resultados/', null=True, blank=True)
    valor = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    data_atualizacao = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.tipo_exame.nome} - {self.paciente.nome} ({self.data_solicitacao.strftime('%d/%m/%Y')})"
    
    class Meta:
        verbose_name = "Exame"
        verbose_name_plural = "Exames"
        ordering = ['-data_solicitacao']

class ParametroExame(models.Model):
    exame = models.ForeignKey(Exame, on_delete=models.CASCADE, related_name='parametros')
    nome = models.CharField(max_length=100)
    valor = models.CharField(max_length=100)
    unidade = models.CharField(max_length=20, blank=True)
    valor_referencia = models.CharField(max_length=100, blank=True)
    observacoes = models.TextField(blank=True)
    
    def __str__(self):
        return f"{self.nome}: {self.valor} {self.unidade}"
    
    class Meta:
        verbose_name = "Parâmetro de Exame"
        verbose_name_plural = "Parâmetros de Exames"
