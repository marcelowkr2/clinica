'use client';

import { useState, useEffect } from 'react';
import { X, Plus, Calendar, User, Thermometer, Weight } from 'lucide-react';
import InternacaoService, { EvolucoesInternacao } from '@/services/internacao';
import { useAuth } from '@/hooks/auth';
import { useToast } from '@/components/ui/use-toast';

interface Internacao {
  id: number;
  pet_nome: string;
  tutor_nome: string;
  tutor_telefone: string;
  data_entrada: string;
  data_alta?: string;
  motivo: string;
  status: 'internado' | 'alta' | 'transferido' | 'obito';
  veterinario_nome: string;
  diagnostico?: string;
  observacoes_entrada?: string;
  observacoes_alta?: string;
  valor_diaria: string;
  dias_internado: number;
}

interface EvolucaoInternacaoModalProps {
  isOpen: boolean;
  onClose: () => void;
  internacao: Internacao | null;
}

export function EvolucaoInternacaoModal({ isOpen, onClose, internacao }: EvolucaoInternacaoModalProps) {
  const [evolucoes, setEvolucoes] = useState<EvolucoesInternacao[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [novaEvolucao, setNovaEvolucao] = useState({
    evolucao: '',
    temperatura: '',
    peso: '',
    observacoes: ''
  });
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && internacao) {
      fetchEvolucoes();
    }
  }, [isOpen, internacao]);

  const fetchEvolucoes = async () => {
    if (!internacao) return;
    
    try {
      setLoading(true);
      const data = await InternacaoService.getEvolucoes(internacao.id);
      setEvolucoes(data);
    } catch (error) {
      console.error('Erro ao carregar evoluções:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar evoluções',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddEvolucao = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!novaEvolucao.evolucao.trim()) {
      toast({
        title: 'Erro',
        description: 'A evolução é obrigatória',
        variant: 'destructive',
      });
      return;
    }

    if (!internacao) return;

    try {
      const evolucaoData = {
        internacao: internacao.id,
        veterinario: user?.id,
        evolucao: novaEvolucao.evolucao,
        temperatura: novaEvolucao.temperatura ? parseFloat(novaEvolucao.temperatura) : undefined,
        peso: novaEvolucao.peso ? parseFloat(novaEvolucao.peso) : undefined,
        observacoes: novaEvolucao.observacoes || ''
      };

      await InternacaoService.createEvolucao(evolucaoData);
      
      toast({
        title: 'Sucesso',
        description: 'Evolução adicionada com sucesso',
      });

      setNovaEvolucao({
        evolucao: '',
        temperatura: '',
        peso: '',
        observacoes: ''
      });
      setShowAddForm(false);
      fetchEvolucoes();
    } catch (error) {
      console.error('Erro ao adicionar evolução:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao adicionar evolução',
        variant: 'destructive',
      });
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold">Evolução - {internacao?.pet_nome || 'Paciente'}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-medium">Histórico de Evoluções</h3>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Nova Evolução
            </button>
          </div>

          {showAddForm && (
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <h4 className="font-medium mb-4">Adicionar Nova Evolução</h4>
              <form onSubmit={handleAddEvolucao} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Evolução*
                  </label>
                  <textarea
                    value={novaEvolucao.evolucao}
                    onChange={(e) => setNovaEvolucao({ ...novaEvolucao, evolucao: e.target.value })}
                    rows={3}
                    className="w-full border rounded-md px-3 py-2"
                    placeholder="Descreva a evolução do paciente..."
                    required
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Temperatura (°C)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={novaEvolucao.temperatura}
                      onChange={(e) => setNovaEvolucao({ ...novaEvolucao, temperatura: e.target.value })}
                      className="w-full border rounded-md px-3 py-2"
                      placeholder="38.5"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Peso (kg)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={novaEvolucao.peso}
                      onChange={(e) => setNovaEvolucao({ ...novaEvolucao, peso: e.target.value })}
                      className="w-full border rounded-md px-3 py-2"
                      placeholder="5.2"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Observações
                  </label>
                  <textarea
                    value={novaEvolucao.observacoes}
                    onChange={(e) => setNovaEvolucao({ ...novaEvolucao, observacoes: e.target.value })}
                    rows={2}
                    className="w-full border rounded-md px-3 py-2"
                    placeholder="Observações adicionais..."
                  />
                </div>
                
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Salvar Evolução
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-800"></div>
              <span className="ml-2">Carregando evoluções...</span>
            </div>
          ) : evolucoes.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Nenhuma evolução registrada ainda
            </div>
          ) : (
            <div className="space-y-4">
              {evolucoes.map((evolucao) => (
                <div key={evolucao.id} className="bg-white border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="h-4 w-4" />
                      {formatDateTime(evolucao.data_hora)}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <User className="h-4 w-4" />
                      {evolucao.veterinario_nome}
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <h5 className="font-medium mb-2">Evolução:</h5>
                    <p className="text-gray-700">{evolucao.evolucao}</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                    {evolucao.temperatura && (
                      <div className="flex items-center gap-2 text-sm">
                        <Thermometer className="h-4 w-4 text-red-500" />
                        <span>Temperatura: {evolucao.temperatura}°C</span>
                      </div>
                    )}
                    {evolucao.peso && (
                      <div className="flex items-center gap-2 text-sm">
                        <Weight className="h-4 w-4 text-blue-500" />
                        <span>Peso: {evolucao.peso}kg</span>
                      </div>
                    )}
                  </div>
                  
                  {evolucao.observacoes && (
                    <div>
                      <h6 className="font-medium mb-1">Observações:</h6>
                      <p className="text-gray-600 text-sm">{evolucao.observacoes}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}