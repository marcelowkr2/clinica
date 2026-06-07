'use client';

import { useState, useEffect } from 'react';
import { X, TestTube, Calendar, FileText, Save } from 'lucide-react';
import ExamesService from '@/services/exames';
import { useToast } from '@/components/ui/use-toast';

interface Exame {
  id: number;
  pet_nome: string;
  tutor_nome: string;
  tipo_exame_nome: string;
  data_solicitacao: string;
  data_coleta?: string;
  data_resultado?: string;
  status: 'solicitado' | 'coletado' | 'processando' | 'concluido' | 'cancelado';
  veterinario_nome: string;
  observacoes_resultado?: string;
  resultado?: string;
  prioridade?: string;
}

interface EditarExameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (dadosExame: any) => void;
  exame: Exame | null;
}

export function EditarExameModal({ isOpen, onClose, onSubmit, exame }: EditarExameModalProps) {
  const [formData, setFormData] = useState({
    status: '',
    data_coleta: '',
    data_resultado: '',
    observacoes_resultado: '',
    resultado: '',
    prioridade: ''
  });
  
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && exame) {
      setFormData({
        status: exame.status || 'solicitado',
        data_coleta: exame.data_coleta ? new Date(exame.data_coleta).toISOString().slice(0, 16) : '',
        data_resultado: exame.data_resultado ? new Date(exame.data_resultado).toISOString().slice(0, 16) : '',
        observacoes_resultado: exame.observacoes_resultado || '',
        resultado: exame.resultado || '',
        prioridade: exame.prioridade || 'normal'
      });
    }
  }, [isOpen, exame]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!exame) return;

    try {
      setLoading(true);
      
      const updateData: any = {
        status: formData.status,
        prioridade: formData.prioridade
      };

      // Adicionar datas apenas se preenchidas
      if (formData.data_coleta) {
        updateData.data_coleta = new Date(formData.data_coleta).toISOString();
      }
      
      if (formData.data_resultado) {
        updateData.data_resultado = new Date(formData.data_resultado).toISOString();
      }

      // Adicionar observações apenas se preenchidas
      if (formData.observacoes_resultado) {
        updateData.observacoes_resultado = formData.observacoes_resultado;
      }

      // Adicionar resultado apenas se status for concluído
      if (formData.status === 'concluido' && formData.resultado) {
        updateData.resultado = formData.resultado;
      }
      
      onSubmit(updateData);
      onClose();
    } catch (error: any) {
      console.error('Erro ao atualizar exame:', error);
      toast({
        title: 'Erro',
        description: error.response?.data?.message || 'Erro ao atualizar exame',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    onClose();
  };

  if (!isOpen || !exame) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <TestTube className="h-6 w-6 text-cyan-600" />
            Editar Exame - {exame.pet_nome}
          </h2>
          <button onClick={handleClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <div className="p-6">
          {/* Informações do Exame (somente leitura) */}
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <h3 className="font-medium mb-3">Informações do Exame</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Paciente:</span> {exame.pet_nome}
              </div>
              <div>
                <span className="font-medium">Tutor:</span> {exame.tutor_nome}
              </div>
              <div>
                <span className="font-medium">Tipo de Exame:</span> {exame.tipo_exame_nome}
              </div>
              <div>
                <span className="font-medium">Veterinário:</span> {exame.veterinario_nome}
              </div>
              <div>
                <span className="font-medium">Data Solicitação:</span>{' '}
                {new Date(exame.data_solicitacao).toLocaleString('pt-BR')}
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                  Status*
                </label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  required
                  className="w-full border rounded-md px-3 py-2"
                >
                  <option value="solicitado">Solicitado</option>
                  <option value="coletado">Coletado</option>
                  <option value="processando">Processando</option>
                  <option value="concluido">Concluído</option>
                  <option value="cancelado">Cancelado</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="prioridade" className="block text-sm font-medium text-gray-700 mb-1">
                  Prioridade
                </label>
                <select
                  id="prioridade"
                  value={formData.prioridade}
                  onChange={(e) => setFormData({ ...formData, prioridade: e.target.value })}
                  className="w-full border rounded-md px-3 py-2"
                >
                  <option value="baixa">Baixa</option>
                  <option value="normal">Normal</option>
                  <option value="alta">Alta</option>
                  <option value="urgente">Urgente</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="data_coleta" className="block text-sm font-medium text-gray-700 mb-1">
                  <Calendar className="inline h-4 w-4 mr-1" />
                  Data de Coleta
                </label>
                <input
                  id="data_coleta"
                  type="datetime-local"
                  value={formData.data_coleta}
                  onChange={(e) => setFormData({ ...formData, data_coleta: e.target.value })}
                  className="w-full border rounded-md px-3 py-2"
                />
              </div>
              
              <div>
                <label htmlFor="data_resultado" className="block text-sm font-medium text-gray-700 mb-1">
                  <Calendar className="inline h-4 w-4 mr-1" />
                  Data do Resultado
                </label>
                <input
                  id="data_resultado"
                  type="datetime-local"
                  value={formData.data_resultado}
                  onChange={(e) => setFormData({ ...formData, data_resultado: e.target.value })}
                  className="w-full border rounded-md px-3 py-2"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="observacoes_resultado" className="block text-sm font-medium text-gray-700 mb-1">
                <FileText className="inline h-4 w-4 mr-1" />
                Observações do Resultado
              </label>
              <textarea
                id="observacoes_resultado"
                value={formData.observacoes_resultado}
                onChange={(e) => setFormData({ ...formData, observacoes_resultado: e.target.value })}
                rows={3}
                className="w-full border rounded-md px-3 py-2"
                placeholder="Observações sobre o resultado do exame..."
              />
            </div>

            {formData.status === 'concluido' && (
              <div>
                <label htmlFor="resultado" className="block text-sm font-medium text-gray-700 mb-1">
                  <FileText className="inline h-4 w-4 mr-1" />
                  Resultado do Exame
                </label>
                <textarea
                  id="resultado"
                  value={formData.resultado}
                  onChange={(e) => setFormData({ ...formData, resultado: e.target.value })}
                  rows={4}
                  className="w-full border rounded-md px-3 py-2"
                  placeholder="Descreva o resultado do exame..."
                />
              </div>
            )}
            
            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                disabled={loading}
              >
                <Save className="h-4 w-4" />
                {loading ? 'Salvando...' : 'Salvar Alterações'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}