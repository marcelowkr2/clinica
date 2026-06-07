from django.apps import AppConfig


class BanhoTosaConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'banho_tosa'
    
    def ready(self):
        import banho_tosa.signals
