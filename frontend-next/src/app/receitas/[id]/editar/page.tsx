'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { FileText, Plus, Trash2, ArrowLeft, Save } from 'lucide-react';
import { VetLayout } from '@/components/ui/VetLayout';

interface Medicamento {
  id: string;
  nome: string;
  dosagem: string;
  frequencia: string;
  duracao: string;
  observacoes?: string;
}

interface Receita {
  id: string;
  paciente_id: string;
  paciente_nome: string;
  especie: string;
  tutor_nome: string;
  tutor_telefone: string;
  veterinario: string;
  data_prescricao: string;
  status: 'ativa' | 'finalizada' | 'cancelada';
  medicamentos: Medicamento[];
  observacoes: string;
}

// Dados simulados - em produção viria da API
const receitaSimulada: Receita = {
  id: '1',
  paciente_id: '1',
  paciente_nome: 'Rex',
  especie: 'Cão',
  tutor_nome: 'João Silva',
  tutor_telefone: '(11) 99999-9999',
  veterinario: 'Dr. João Veterinário',
  data_prescricao: '2024-01-15',
  status: 'ativa',
  medicamentos: [
    {
      id: '1',
      nome: 'Amoxicilina',
      dosagem: '250mg',
      frequencia: '2x ao dia',
      duracao: '7 dias',
      observacoes: 'Administrar com alimento'
    },
    {
      id: '2',
      nome: 'Meloxicam',
      dosagem: '0.5ml',
      frequencia: '1x ao dia',
      duracao: '5 dias',
      observacoes: 'Anti-inflamatório'
    }
  ],
  observacoes: 'Retornar em 7 dias para reavaliação. Manter o animal em repouso.'
};

const medicamentosComuns = [
  'Amoxicilina',
  'Dipirona',
  'Meloxicam',
  'Prednisolona',
  'Doxiciclina',
  'Tramadol',
  'Omeprazol',
  'Furosemida',
  'Enalapril',
  'Metronidazol'
];

export default function EditarReceitaPage() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [receita, setReceita] = useState<Receita | null>(null);

  useEffect(() => {
    const carregarReceita = async () => {
      try {
        setLoading(true);
        // Simular carregamento da API
        await new Promise(resolve => setTimeout(resolve, 1000));
        setReceita(receitaSimulada);
      } catch (error) {
        console.error('Erro ao carregar receita:', error);
      } finally {
        setLoading(false);
      }
    };

    carregarReceita();
  }, [params.id]);

  const adicionarMedicamento = () => {
    if (!receita) return;

    const novoMedicamento: Medicamento = {
      id: Date.now().toString(),
      nome: '',
      dosagem: '',
      frequencia: '',
      duracao: '',
      observacoes: ''
    };
    
    setReceita(prev => prev ? ({
      ...prev,
      medicamentos: [...prev.medicamentos, novoMedicamento]
    }) : null);
  };

  const removerMedicamento = (id: string) => {
    if (!receita) return;

    setReceita(prev => prev ? ({
      ...prev,
      medicamentos: prev.medicamentos.filter(med => med.id !== id)
    }) : null);
  };

  const atualizarMedicamento = (id: string, campo: keyof Medicamento, valor: string) => {
    if (!receita) return;

    setReceita(prev => prev ? ({
      ...prev,
      medicamentos: prev.medicamentos.map(med => 
        med.id === id ? { ...med, [campo]: valor } : med
      )
    }) : null);
  };

  const atualizarReceita = (campo: keyof Receita, valor: string) => {
    if (!receita) return;

    setReceita(prev => prev ? ({
      ...prev,
      [campo]: valor
    }) : null);
  };

  const salvarReceita = async () => {
    if (!receita || receita.medicamentos.length === 0) {
      alert('Por favor, adicione pelo menos um medicamento.');
      return;
    }

    setSaving(true);
    
    try {
      // Simular salvamento na API
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      alert('Receita atualizada com sucesso!');
      router.push(`/receitas/${receita.id}`);
    } catch (error) {
      console.error('Erro ao salvar receita:', error);
      alert('Erro ao salvar receita. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ativa':
        return 'bg-green-100 text-green-800';
      case 'finalizada':
        return 'bg-blue-100 text-blue-800';
      case 'cancelada':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <VetLayout>
        <div className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        </div>
      </VetLayout>
    );
  }

  if (!receita) {
    return (
      <VetLayout>
        <div className="p-6">
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Receita não encontrada</h2>
            <p className="text-gray-600 mb-4">A receita solicitada não foi encontrada.</p>
            <button
              onClick={() => router.push('/receitas')}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Voltar para Receitas
            </button>
          </div>
        </div>
      </VetLayout>
    );
  }

  return (
    <VetLayout>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            
            <div className="flex items-center gap-3">
              <FileText className="h-8 w-8 text-indigo-600" />
              <div>
                <h1 className="text-2xl font-bold">Editar Receita Médica</h1>
                <p className="text-gray-600">#{receita.id} - {receita.paciente_nome}</p>
              </div>
            </div>
          </div>

          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(receita.status)}`}>
            {receita.status.charAt(0).toUpperCase() + receita.status.slice(1)}
          </span>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            {/* Informações do Paciente (somente leitura) */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold mb-4">Informações do Paciente</h2>
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Paciente</p>
                    <p className="font-medium">{receita.paciente_nome} ({receita.especie})</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Tutor</p>
                    <p className="font-medium">{receita.tutor_nome}</p>
                    <p className="text-sm text-gray-600">{receita.tutor_telefone}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Informações da Receita */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold mb-4">Informações da Receita</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Veterinário
                  </label>
                  <input
                    type="text"
                    value={receita.veterinario}
                    onChange={(e) => atualizarReceita('veterinario', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Data da Prescrição
                  </label>
                  <input
                    type="date"
                    value={receita.data_prescricao}
                    onChange={(e) => atualizarReceita('data_prescricao', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={receita.status}
                    onChange={(e) => atualizarReceita('status', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="ativa">Ativa</option>
                    <option value="finalizada">Finalizada</option>
                    <option value="cancelada">Cancelada</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Medicamentos */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Medicamentos</h2>
                <button
                  onClick={adicionarMedicamento}
                  className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  Adicionar Medicamento
                </button>
              </div>

              {receita.medicamentos.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  Nenhum medicamento adicionado. Clique em "Adicionar Medicamento" para começar.
                </div>
              ) : (
                <div className="space-y-4">
                  {receita.medicamentos.map((medicamento, index) => (
                    <div key={medicamento.id} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-medium">Medicamento {index + 1}</h3>
                        <button
                          onClick={() => removerMedicamento(medicamento.id)}
                          className="text-red-600 hover:text-red-800 p-1"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Nome do Medicamento
                          </label>
                          <input
                            type="text"
                            list={`medicamentos-${medicamento.id}`}
                            value={medicamento.nome}
                            onChange={(e) => atualizarMedicamento(medicamento.id, 'nome', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            placeholder="Digite o nome do medicamento"
                          />
                          <datalist id={`medicamentos-${medicamento.id}`}>
                            {medicamentosComuns.map(med => (
                              <option key={med} value={med} />
                            ))}
                          </datalist>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Dosagem
                          </label>
                          <input
                            type="text"
                            value={medicamento.dosagem}
                            onChange={(e) => atualizarMedicamento(medicamento.id, 'dosagem', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            placeholder="Ex: 250mg"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Frequência
                          </label>
                          <input
                            type="text"
                            value={medicamento.frequencia}
                            onChange={(e) => atualizarMedicamento(medicamento.id, 'frequencia', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            placeholder="Ex: 2x ao dia"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Duração
                          </label>
                          <input
                            type="text"
                            value={medicamento.duracao}
                            onChange={(e) => atualizarMedicamento(medicamento.id, 'duracao', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            placeholder="Ex: 7 dias"
                          />
                        </div>
                      </div>
                      
                      <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Observações do Medicamento
                        </label>
                        <textarea
                          value={medicamento.observacoes}
                          onChange={(e) => atualizarMedicamento(medicamento.id, 'observacoes', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          rows={2}
                          placeholder="Observações específicas para este medicamento..."
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Observações Gerais */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold mb-4">Observações Gerais</h2>
              <textarea
                value={receita.observacoes}
                onChange={(e) => atualizarReceita('observacoes', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                rows={4}
                placeholder="Observações gerais da receita, instruções especiais, etc..."
              />
            </div>

            {/* Botões de Ação */}
            <div className="flex flex-col sm:flex-row gap-4 justify-end">
              <button
                onClick={() => router.back()}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={saving}
              >
                Cancelar
              </button>
              
              <button
                onClick={salvarReceita}
                disabled={saving || receita.medicamentos.length === 0}
                className="flex items-center justify-center gap-2 bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Salvar Alterações
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </VetLayout>
  );
}