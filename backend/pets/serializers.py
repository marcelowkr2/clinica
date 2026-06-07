from rest_framework import serializers
from .models import Paciente, Responsavel, Convenio, Plano, Vacina, VacinaAplicada, AgendamentoVacina
from django.core.validators import MinValueValidator, MaxValueValidator
from datetime import date

class ConvenioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Convenio
        fields = '__all__'

class PlanoSerializer(serializers.ModelSerializer):
    convenio_nome = serializers.CharField(source='convenio.nome', read_only=True)

    class Meta:
        model = Plano
        fields = ['id', 'nome', 'convenio', 'convenio_nome']

class VacinaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vacina
        fields = '__all__'

class VacinaAplicadaSerializer(serializers.ModelSerializer):
    paciente_nome = serializers.CharField(source='paciente.nome', read_only=True)
    vacina_nome = serializers.CharField(source='vacina.nome', read_only=True)
    medico_nome = serializers.CharField(source='medico.first_name', read_only=True)

    class Meta:
        model = VacinaAplicada
        fields = [
            'id', 'paciente', 'paciente_nome', 'vacina', 'vacina_nome',
            'medico', 'medico_nome', 'data_aplicacao',
            'data_proximo_reforco', 'observacoes'
        ]

class PacienteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Paciente
        fields = '__all__'
        extra_kwargs = {
            'peso': {
                'validators': [
                    MinValueValidator(0.1, message="O peso deve ser maior que zero"),
                    MaxValueValidator(250, message="Peso máximo é 250kg")
                ]
            }
        }

    def validate_data_nascimento(self, value):
        if value and value > date.today():
            raise serializers.ValidationError("Data de nascimento não pode ser no futuro")
        return value

    def validate(self, data):
        if data['sexo'] not in ['M', 'F']:
            raise serializers.ValidationError({"sexo": "Sexo deve ser M ou F"})

        if data.get('plano') and data['plano'].convenio != data['convenio']:
            raise serializers.ValidationError(
                {"plano": "O plano deve corresponder ao convênio selecionado"}
            )

        return data

class ResponsavelSerializer(serializers.ModelSerializer):
    class Meta:
        model = Responsavel
        fields = '__all__'

    def validate(self, data):
        user = data.get('user')
        if user and user.user_type != 4:
            raise serializers.ValidationError(
                {"user": "O usuário deve ser do tipo Responsável"}
            )
        return data

class AgendamentoVacinaSerializer(serializers.ModelSerializer):
    paciente_nome = serializers.CharField(source='paciente.nome', read_only=True)
    responsavel_nome = serializers.CharField(source='paciente.responsavel.user.get_full_name', read_only=True)
    responsavel_telefone = serializers.CharField(source='paciente.responsavel.user.phone', read_only=True)
    vacina_nome = serializers.CharField(source='vacina.nome', read_only=True)
    medico_nome = serializers.CharField(source='medico.get_full_name', read_only=True)
    is_atrasado = serializers.ReadOnlyField()

    class Meta:
        model = AgendamentoVacina
        fields = '__all__'
        read_only_fields = ('data_criacao', 'data_atualizacao')
        extra_kwargs = {
            'paciente': {'required': False},
            'vacina': {'required': False},
            'data_agendamento': {'required': False},
            'medico': {'required': False},
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Se é uma atualização (instance existe), tornar campos opcionais
        if self.instance:
            for field_name in ['paciente', 'vacina', 'data_agendamento', 'medico']:
                if field_name in self.fields:
                    self.fields[field_name].required = False

class PacienteComResponsavelSerializer(serializers.ModelSerializer):
    """Serializer para pacientes com informações completas do responsável para agendamentos"""
    convenio = serializers.CharField(source='convenio.nome', read_only=True)
    plano = serializers.CharField(source='plano.nome', read_only=True)
    responsavel = serializers.SerializerMethodField()

    class Meta:
        model = Paciente
        fields = ['id', 'nome', 'convenio', 'plano', 'responsavel']

    def get_responsavel(self, obj):
        return {
            'id': obj.responsavel.id,
            'user': {
                'first_name': obj.responsavel.user.first_name,
                'last_name': obj.responsavel.user.last_name,
                'phone': obj.responsavel.user.phone,
            }
        }
