'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle, Calendar, Clock, Syringe } from 'lucide-react';
import PetsService, { AgendamentoVacina } from '@/services/pets';

interface AplicarVacinaModalProps {
  agendamento: AgendamentoVacina | null;
  onClose: () => void;
  onSuccess: () => void;
  isOpen?: boolean;
}

const AplicarVacinaModal: React.FC<AplicarVacinaModalProps> = ({
  agendamento,
  onClose,
  onSuccess,
  isOpen = true
}) => {
  const [formData, setFormData] = useState({
    data_aplicacao: '',
    observacoes: '',
    lote: '',
    veterinario: ''
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<any>({});

  React.useEffect(() => {
    if (agendamento && isOpen) {
      // Definir data e hora atual como padrão
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const currentDateTime = `${year}-${month}-${day}T${hours}:${minutes}`;

      setFormData({
        data_aplicacao: currentDateTime,
        observacoes: agendamento.observacoes || '',
        lote: '',
        veterinario: agendamento.veterinario_nome || ''
      });
    }
  }, [agendamento, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!agendamento) {
      alert('Erro: Agendamento não encontrado');
      return;
    }

    if (!formData.data_aplicacao) {
      alert('Por favor, informe a data e hora de aplicação');
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      // Converter datetime-local para apenas data (YYYY-MM-DD) para VacinaAplicada
      const dataAplicacaoDate = formData.data_aplicacao.split('T')[0];

      // 1. Atualizar o agendamento para status 'aplicado'
      await PetsService.updateAgendamentoVacina(agendamento.id, {
        status: 'aplicado',
        data_aplicacao: formData.data_aplicacao, // AgendamentoVacina aceita datetime
        observacoes: formData.observacoes
      });

      // 2. Criar registro de vacina aplicada
      await PetsService.createVacinaAplicada({
        pet: agendamento.pet,
        vacina: agendamento.vacina,
        data_aplicacao: dataAplicacaoDate, // VacinaAplicada aceita apenas data
        observacoes: formData.observacoes
      });

      // Sucesso
      resetForm();
      onSuccess();
    } catch (error: any) {
      if (error.response?.data) {
        setErrors(error.response.data);
      } else {
        alert('Erro ao aplicar vacina. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      data_aplicacao: '',
      observacoes: '',
      lote: '',
      veterinario: ''
    });
    setErrors({});
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  // Verificação de segurança
  if (!agendamento) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span>Aplicar Vacina</span>
          </DialogTitle>
        </DialogHeader>

        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">Detalhes do Agendamento</h4>
          <div className="space-y-1 text-sm text-gray-600">
            <p><strong>Pet:</strong> {agendamento?.pet_nome || 'Não informado'}</p>
            <p><strong>Tutor:</strong> {agendamento?.tutor_nome || 'Não informado'}</p>
            <p><strong>Vacina:</strong> {agendamento?.vacina_nome || 'Não informado'}</p>
            <p><strong>Veterinário:</strong> {agendamento?.veterinario_nome || 'Não informado'}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Data e Hora de Aplicação */}
          <div>
            <Label htmlFor="data_aplicacao" className="flex items-center space-x-1">
              <Calendar className="h-4 w-4" />
              <span>Data e Hora de Aplicação *</span>
            </Label>
            <Input
              id="data_aplicacao"
              type="datetime-local"
              value={formData.data_aplicacao}
              onChange={(e) => setFormData({ ...formData, data_aplicacao: e.target.value })}
              required
            />
            {errors.data_aplicacao && (
              <p className="text-red-500 text-sm mt-1">{errors.data_aplicacao[0]}</p>
            )}
          </div>

          {/* Veterinário */}
          <div>
            <Label htmlFor="veterinario" className="flex items-center space-x-1">
              <Syringe className="h-4 w-4" />
              <span>Veterinário Responsável</span>
            </Label>
            <Input
              id="veterinario"
              value={formData.veterinario}
              onChange={(e) => setFormData({ ...formData, veterinario: e.target.value })}
              placeholder="Nome do veterinário..."
            />
            {errors.veterinario && (
              <p className="text-red-500 text-sm mt-1">{errors.veterinario[0]}</p>
            )}
          </div>

          {/* Lote */}
          <div>
            <Label htmlFor="lote" className="flex items-center space-x-1">
              <Syringe className="h-4 w-4" />
              <span>Lote da Vacina</span>
            </Label>
            <Input
              id="lote"
              value={formData.lote}
              onChange={(e) => setFormData({ ...formData, lote: e.target.value })}
              placeholder="Número do lote..."
            />
            {errors.lote && (
              <p className="text-red-500 text-sm mt-1">{errors.lote[0]}</p>
            )}
          </div>

          {/* Observações */}
          <div>
            <Label htmlFor="observacoes" className="flex items-center space-x-1">
              <Syringe className="h-4 w-4" />
              <span>Observações da Aplicação</span>
            </Label>
            <Textarea
              id="observacoes"
              value={formData.observacoes}
              onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
              placeholder="Observações sobre a aplicação da vacina..."
              rows={3}
            />
            {errors.observacoes && (
              <p className="text-red-500 text-sm mt-1">{errors.observacoes[0]}</p>
            )}
          </div>

          {/* Botões */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex items-center space-x-2 bg-green-600 hover:bg-green-700"
            >
              {loading ? (
                <>
                  <Clock className="h-4 w-4 animate-spin" />
                  <span>Aplicando...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4" />
                  <span>Confirmar Aplicação</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AplicarVacinaModal;