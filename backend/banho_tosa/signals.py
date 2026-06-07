from django.db.models.signals import m2m_changed
from django.dispatch import receiver
from .models import BanhoTosa

@receiver(m2m_changed, sender=BanhoTosa.servicos.through)
def update_valor_total(sender, instance, action, **kwargs):
    """
    Atualiza o valor_total quando os serviços são alterados
    """
    if action in ['post_add', 'post_remove', 'post_clear']:
        if instance.servicos.exists():
            instance.valor_total = sum(servico.valor for servico in instance.servicos.all())
            instance.tempo_estimado = sum(servico.tempo_estimado for servico in instance.servicos.all())
        else:
            instance.valor_total = 0
            instance.tempo_estimado = 0
        
        # Salvar sem chamar o método save() para evitar recursão
        BanhoTosa.objects.filter(pk=instance.pk).update(
            valor_total=instance.valor_total,
            tempo_estimado=instance.tempo_estimado
        )