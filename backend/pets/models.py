from django.db import models
from core.models import User

class Convenio(models.Model):
    nome = models.CharField(max_length=100)
    
    def __str__(self):
        return self.nome

class Plano(models.Model):
    nome = models.CharField(max_length=100)
    convenio = models.ForeignKey(Convenio, on_delete=models.CASCADE)
    
    def __str__(self):
        return f"{self.nome} ({self.convenio})"

class Responsavel(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='responsavel')
    endereco = models.TextField(blank=True)
    data_cadastro = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name_plural = 'Responsáveis'
    
    def __str__(self):
        return str(self.user)

class Paciente(models.Model):
    SEXO_CHOICES = (
        ('M', 'Masculino'),
        ('F', 'Feminino'),
    )
    
    nome = models.CharField(max_length=100)
    responsavel = models.ForeignKey(Responsavel, on_delete=models.CASCADE, related_name='pacientes')
    convenio = models.ForeignKey(Convenio, on_delete=models.SET_NULL, null=True)
    plano = models.ForeignKey(Plano, on_delete=models.SET_NULL, null=True, blank=True)
    data_nascimento = models.DateField(null=True, blank=True)
    sexo = models.CharField(max_length=1, choices=SEXO_CHOICES)
    peso = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    foto = models.ImageField(upload_to='pacientes/', null=True, blank=True)
    observacoes = models.TextField(blank=True)
    
    def __str__(self):
        return f"{self.nome} ({self.responsavel})"

class Vacina(models.Model):
    nome = models.CharField(max_length=100)
    descricao = models.TextField(blank=True)
    periodo_reforco_meses = models.IntegerField(null=True, blank=True)
    
    def __str__(self):
        return self.nome

class VacinaAplicada(models.Model):
    paciente = models.ForeignKey(Paciente, on_delete=models.CASCADE, related_name='vacinas')
    vacina = models.ForeignKey(Vacina, on_delete=models.CASCADE)
    data_aplicacao = models.DateField()
    data_proximo_reforco = models.DateField(null=True, blank=True)
    medico = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    observacoes = models.TextField(blank=True)
    
    class Meta:
        verbose_name_plural = 'Vacinas Aplicadas'
    
    def __str__(self):
        return f"{self.vacina} - {self.paciente} ({self.data_aplicacao})"

class AgendamentoVacina(models.Model):
    STATUS_CHOICES = [
        ('agendado', 'Agendado'),
        ('aplicado', 'Aplicado'),
        ('cancelado', 'Cancelado'),
        ('atrasado', 'Atrasado'),
    ]
    
    paciente = models.ForeignKey(Paciente, on_delete=models.CASCADE, related_name='agendamentos_vacina')
    vacina = models.ForeignKey(Vacina, on_delete=models.CASCADE)
    data_agendamento = models.DateTimeField()
    medico = models.ForeignKey(User, on_delete=models.CASCADE, related_name='agendamentos_vacina')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='agendado')
    observacoes = models.TextField(blank=True)
    data_aplicacao = models.DateTimeField(null=True, blank=True)
    vacina_aplicada = models.OneToOneField(VacinaAplicada, on_delete=models.SET_NULL, null=True, blank=True)
    data_criacao = models.DateTimeField(auto_now_add=True)
    data_atualizacao = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.vacina.nome} - {self.paciente.nome} ({self.data_agendamento.strftime('%d/%m/%Y')})"
    
    @property
    def is_atrasado(self):
        from django.utils import timezone
        return self.status == 'agendado' and timezone.now() > self.data_agendamento
    
    class Meta:
        verbose_name = "Agendamento de Vacina"
        verbose_name_plural = "Agendamentos de Vacinas"
        ordering = ['-data_agendamento']