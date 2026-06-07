'use client';

import { useState } from 'react';
import { X, Calendar, FileText } from 'lucide-react';
import InternacaoService, { Internacao } from '@/services/internacao';
import { useToast } from '@/components/ui/use-toast';

interface AltaInternacaoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
  internacao: Internacao | null;
}

export function AltaInternacaoModal({ isOpen, onClose, onUpdate, internacao }: AltaInternacaoModalProps) {
  const [formData, setFormData] = useState({
    data_alta: new Date().toISOString().slice(0, 16), // formato datetime-local
    observacoes_alta: '',
    status: 'alta' as const
  });
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!internacao) {
      toast({
        title: 'Erro',
        description: 'Internação não encontrada',
        variant: 'destructive',
      });
      return;
    }
    
    if (!formData.data_alta) {
      toast({
        title: 'Erro',
        description: 'A data de alta é obrigatória',
        variant: 'destructive',
      });
      return;
    }

    try {
      setSaving(true);
      
      // Converter a data para o formato ISO que o Django espera
      const dataAltaISO = new Date(formData.data_alta).toISOString();
      
      const dadosAlta = {
        data_alta: dataAltaISO,
        observacoes_alta: formData.observacoes_alta,
        status: formData.status
      };
      
      console.log('Dados sendo enviados para alta:', dadosAlta);
      console.log('ID da internação:', internacao.id);
      
      const internacaoAtualizada = await InternacaoService.updateInternacao(internacao.id, dadosAlta);
      
      // Criar transação financeira automaticamente
      try {
        const valorTotal = calcularValorTotal();
        const transacaoData = {
          internacao_id: internacao.id,
          valor: parseFloat(valorTotal),
          descricao: `Alta de internação - ${internacao.pet_nome}`,
          data_alta: dataAltaISO
        };
        
        await fetch('http://127.0.0.1:8000/api/financeiro/transacao-automatica', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          },
          body: JSON.stringify(transacaoData),
        });
      } catch (transacaoError) {
        console.warn('Erro ao criar transação automática:', transacaoError);
        // Não bloqueia o processo de alta se houver erro na transação
      }
      
      toast({
        title: 'Sucesso',
        description: 'Alta registrada com sucesso',
      });
      
      onUpdate();
      onClose();
    } catch (error: any) {
      console.error('Erro ao registrar alta:', error);
      console.error('Resposta do erro:', error.response?.data);
      console.error('Status do erro:', error.response?.status);
      
      let errorMessage = 'Erro ao registrar alta';
      if (error.response?.data) {
        if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        } else if (error.response.data.detail) {
          errorMessage = error.response.data.detail;
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        }
      }
      
      toast({
        title: 'Erro',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const calcularDiasInternacao = () => {
    if (!internacao) return 0;
    const entrada = new Date(internacao.data_entrada);
    const alta = new Date(formData.data_alta);
    const diffTime = Math.abs(alta.getTime() - entrada.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const calcularValorTotal = () => {
    if (!internacao) return '0.00';
    const dias = calcularDiasInternacao();
    const valorDiaria = parseFloat(internacao.valor_diaria) || 0;
    return (dias * valorDiaria).toFixed(2);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold">Dar Alta - {internacao?.pet_nome || 'Paciente'}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <div className="p-6">
          {/* Informações da Internação */}
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <h3 className="font-medium mb-3">Informações da Internação</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Paciente:</span> {internacao.pet_nome}
              </div>
              <div>
                <span className="font-medium">Tutor:</span> {internacao.tutor_nome}
              </div>
              <div>
                <span className="font-medium">Data de Entrada:</span>{' '}
                {new Date(internacao.data_entrada).toLocaleString('pt-BR')}
              </div>
              <div>
                <span className="font-medium">Motivo:</span> {internacao.motivo}
              </div>
              <div>
                <span className="font-medium">Veterinário:</span> {internacao.veterinario_nome}
              </div>
              <div>
                <span className="font-medium">Valor Diária:</span> R$ {internacao.valor_diaria}
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="data_alta" className="block text-sm font-medium text-gray-700 mb-1">
                  <Calendar className="inline h-4 w-4 mr-1" />
                  Data e Hora da Alta*
                </label>
                <input
                  id="data_alta"
                  type="datetime-local"
                  value={formData.data_alta}
                  onChange={(e) => setFormData({ ...formData, data_alta: e.target.value })}
                  required
                  className="w-full border rounded-md px-3 py-2"
                />
              </div>
              
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Alta*
                </label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  required
                  className="w-full border rounded-md px-3 py-2"
                >
                  <option value="alta">Alta Médica</option>
                  <option value="transferido">Transferido</option>
                  <option value="obito">Óbito</option>
                </select>
              </div>
            </div>
            
            <div>
              <label htmlFor="observacoes_alta" className="block text-sm font-medium text-gray-700 mb-1">
                <FileText className="inline h-4 w-4 mr-1" />
                Observações da Alta
              </label>
              <textarea
                id="observacoes_alta"
                value={formData.observacoes_alta}
                onChange={(e) => setFormData({ ...formData, observacoes_alta: e.target.value })}
                rows={4}
                className="w-full border rounded-md px-3 py-2"
                placeholder="Descreva as condições da alta, medicações prescritas, cuidados especiais, etc..."
              />
            </div>

            {/* Resumo Financeiro */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Resumo Financeiro</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-medium">Dias de Internação:</span>
                  <div className="text-lg font-bold text-blue-600">{calcularDiasInternacao()}</div>
                </div>
                <div>
                  <span className="font-medium">Valor por Dia:</span>
                  <div className="text-lg font-bold text-blue-600">R$ {internacao.valor_diaria}</div>
                </div>
                <div>
                  <span className="font-medium">Valor Total:</span>
                  <div className="text-lg font-bold text-green-600">R$ {calcularValorTotal()}</div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                disabled={saving}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
                disabled={saving}
              >
                {saving ? 'Registrando Alta...' : 'Confirmar Alta'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}