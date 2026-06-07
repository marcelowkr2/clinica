from django.db import models
from django.contrib.auth import get_user_model
from pets.models import Paciente

User = get_user_model()

class Medicamento(models.Model):
    nome = models.CharField(max_length=100)
    principio_ativo = models.CharField(max_length=100, blank=True)
    concentracao = models.CharField(max_length=50, blank=True)
    forma_farmaceutica = models.CharField(max_length=50, blank=True)  # comprimido, xarope, etc.
    fabricante = models.CharField(max_length=100, blank=True)
    ativo = models.BooleanField(default=True)
    
    def __str__(self):
        return f"{self.nome} {self.concentracao}"
    
    class Meta:
        verbose_name = "Medicamento"
        verbose_name_plural = "Medicamentos"

class Receita(models.Model):
    STATUS_CHOICES = [
        ('ativa', 'Ativa'),
        ('finalizada', 'Finalizada'),
        ('cancelada', 'Cancelada'),
        ('vencida', 'Vencida'),
    ]
    
    paciente = models.ForeignKey(Paciente, on_delete=models.CASCADE, related_name='receitas')
    medico = models.ForeignKey(User, on_delete=models.CASCADE, related_name='receitas_prescritas')
    data_prescricao = models.DateTimeField(auto_now_add=True)
    data_validade = models.DateField()
    diagnostico = models.TextField()
    observacoes = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='ativa')
    data_atualizacao = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Receita {self.id} - {self.paciente.nome} ({self.data_prescricao.strftime('%d/%m/%Y')})"
    
    @property
    def is_vencida(self):
        from django.utils import timezone
        return timezone.now().date() > self.data_validade
    
    class Meta:
        verbose_name = "Receita"
        verbose_name_plural = "Receitas"
        ordering = ['-data_prescricao']

class ItemReceita(models.Model):
    receita = models.ForeignKey(Receita, on_delete=models.CASCADE, related_name='itens')
    medicamento = models.ForeignKey(Medicamento, on_delete=models.CASCADE)
    dosagem = models.CharField(max_length=100)
    frequencia = models.CharField(max_length=100)  # Ex: "2x ao dia", "8/8h"
    duracao = models.CharField(max_length=100)  # Ex: "7 dias", "até acabar"
    quantidade = models.CharField(max_length=50)  # Ex: "1 caixa", "30 comprimidos"
    via_administracao = models.CharField(max_length=50, blank=True)  # oral, tópica, etc.
    observacoes = models.TextField(blank=True)
    
    def __str__(self):
        return f"{self.medicamento.nome} - {self.dosagem}"
    
    class Meta:
        verbose_name = "Item da Receita"
        verbose_name_plural = "Itens da Receita"

class ControleReceita(models.Model):
    """Controle de dispensação/administração da receita"""
    item_receita = models.ForeignKey(ItemReceita, on_delete=models.CASCADE, related_name='controles')
    data_administracao = models.DateTimeField()
    administrado_por = models.CharField(max_length=100, blank=True)  # paciente, clínica, etc.
    observacoes = models.TextField(blank=True)
    
    def __str__(self):
        return f"{self.item_receita.medicamento.nome} - {self.data_administracao.strftime('%d/%m/%Y %H:%M')}"
    
    class Meta:
        verbose_name = "Controle de Receita"
        verbose_name_plural = "Controles de Receitas"
        ordering = ['-data_administracao']
