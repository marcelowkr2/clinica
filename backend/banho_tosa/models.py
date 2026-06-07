from django.db import models
from django.contrib.auth import get_user_model
from pets.models import Paciente

User = get_user_model()

class ServicoProcedimento(models.Model):
    nome = models.CharField(max_length=100)
    descricao = models.TextField(blank=True)
    valor = models.DecimalField(max_digits=10, decimal_places=2)
    tempo_estimado = models.IntegerField(help_text="Tempo estimado em minutos")
    ativo = models.BooleanField(default=True)
    
    def __str__(self):
        return self.nome
    
    class Meta:
        verbose_name = "Serviço de Procedimento"
        verbose_name_plural = "Serviços de Procedimento"

class Procedimento(models.Model):
    STATUS_CHOICES = [
        ('agendado', 'Agendado'),
        ('em_andamento', 'Em Andamento'),
        ('concluido', 'Concluído'),
        ('cancelado', 'Cancelado'),
    ]
    
    paciente = models.ForeignKey(Paciente, on_delete=models.CASCADE, related_name='procedimentos')
    profissional = models.ForeignKey(User, on_delete=models.CASCADE, related_name='procedimentos_realizados')
    data_agendamento = models.DateTimeField()
    data_realizacao = models.DateTimeField(null=True, blank=True)
    servicos = models.ManyToManyField(ServicoProcedimento, related_name='procedimentos')
    observacoes = models.TextField(blank=True)
    observacoes_profissional = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='agendado')
    valor_total = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    tempo_estimado = models.IntegerField(default=60, help_text="Tempo estimado em minutos")
    tempo_real = models.IntegerField(null=True, blank=True, help_text="Tempo real em minutos")
    data_criacao = models.DateTimeField(auto_now_add=True)
    data_atualizacao = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.paciente.nome} - {self.data_agendamento.strftime('%d/%m/%Y %H:%M')}"
    
    def save(self, *args, **kwargs):
        # Salvar primeiro para garantir que o objeto tenha um pk
        super().save(*args, **kwargs)
        
        # Calcular valor total baseado nos serviços após salvar
        if self.servicos.exists():
            self.valor_total = sum(servico.valor for servico in self.servicos.all())
            self.tempo_estimado = sum(servico.tempo_estimado for servico in self.servicos.all())
            # Salvar novamente apenas se houve mudança nos valores
            super().save(update_fields=['valor_total', 'tempo_estimado'])
    
    class Meta:
        verbose_name = "Procedimento"
        verbose_name_plural = "Procedimentos"
        ordering = ['-data_agendamento']

class AvaliacaoProcedimento(models.Model):
    procedimento = models.OneToOneField(Procedimento, on_delete=models.CASCADE, related_name='avaliacao')
    nota = models.IntegerField(choices=[(i, i) for i in range(1, 6)])  # 1 a 5 estrelas
    comentario = models.TextField(blank=True)
    data_avaliacao = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Avaliação {self.nota}/5 - {self.procedimento.paciente.nome}"
    
    class Meta:
        verbose_name = "Avaliação de Procedimento"
        verbose_name_plural = "Avaliações de Procedimento"

class FotoProcedimento(models.Model):
    procedimento = models.ForeignKey(Procedimento, on_delete=models.CASCADE, related_name='fotos')
    foto = models.ImageField(upload_to='procedimento/fotos/')
    descricao = models.CharField(max_length=200, blank=True)
    momento = models.CharField(max_length=20, choices=[
        ('antes', 'Antes'),
        ('durante', 'Durante'),
        ('depois', 'Depois'),
    ])
    data_upload = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Foto {self.momento} - {self.procedimento.paciente.nome}"
    
    class Meta:
        verbose_name = "Foto de Procedimento"
        verbose_name_plural = "Fotos de Procedimento"
