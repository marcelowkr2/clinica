'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FileText, Plus, Trash2, ArrowLeft, Save } from 'lucide-react';
import { VetLayout } from '@/components/ui/VetLayout';
import PetsService from '@/services/pets';
import receitasService from '@/services/receitas';

interface Medicamento {
  id: string;
  nome: string;
  dosagem: string;
  frequencia: string;
  duracao: string;
  observacoes?: string;
}

interface NovaReceita {
  paciente_id: string;
  paciente_nome: string;
  especie: string;
  tutor_nome: string;
  tutor_telefone: string;
  veterinario: string;
  data_prescricao: string;
  medicamentos: Medicamento[];
  observacoes: string;
}

interface Paciente {
  id: number;
  nome: string;
  especie: string;
  raca?: string;
  tutor_nome: string;
  tutor_telefone: string;
}

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

export default function NovaReceitaPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [loadingPacientes, setLoadingPacientes] = useState(true);
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [pacienteSelecionado, setPacienteSelecionado] = useState<Paciente | null>(null);
  
  const [receita, setReceita] = useState<NovaReceita>({
    paciente_id: '',
    paciente_nome: '',
    especie: '',
    tutor_nome: '',
    tutor_telefone: '',
    veterinario: 'Dr. João Veterinário',
    data_prescricao: new Date().toISOString().split('T')[0],
    medicamentos: [],
    observacoes: ''
  });

  // Carregar pacientes ao montar o componente
  useEffect(() => {
    const carregarPacientes = async () => {
      try {
        setLoadingPacientes(true);
        const pacientesData = await PetsService.getPetsParaReceitas();
        setPacientes(pacientesData);
      } catch (error) {
        console.error('Erro ao carregar pacientes:', error);
        alert('Erro ao carregar lista de pacientes. Tente recarregar a página.');
      } finally {
        setLoadingPacientes(false);
      }
    };

    carregarPacientes();
  }, []);

  const adicionarMedicamento = () => {
    const novoMedicamento: Medicamento = {
      id: Date.now().toString(),
      nome: '',
      dosagem: '',
      frequencia: '',
      duracao: '',
      observacoes: ''
    };
    
    setReceita(prev => ({
      ...prev,
      medicamentos: [...prev.medicamentos, novoMedicamento]
    }));
  };

  const removerMedicamento = (id: string) => {
    setReceita(prev => ({
      ...prev,
      medicamentos: prev.medicamentos.filter(med => med.id !== id)
    }));
  };

  const atualizarMedicamento = (id: string, campo: keyof Medicamento, valor: string) => {
    setReceita(prev => ({
      ...prev,
      medicamentos: prev.medicamentos.map(med => 
        med.id === id ? { ...med, [campo]: valor } : med
      )
    }));
  };

  const selecionarPaciente = (paciente: Paciente) => {
    setPacienteSelecionado(paciente);
    setReceita(prev => ({
      ...prev,
      paciente_id: paciente.id.toString(),
      paciente_nome: paciente.nome,
      especie: paciente.especie,
      tutor_nome: paciente.tutor_nome,
      tutor_telefone: paciente.tutor_telefone
    }));
  };

  const salvarReceita = async () => {
    if (!receita.paciente_id || receita.medicamentos.length === 0) {
      alert('Por favor, selecione um paciente e adicione pelo menos um medicamento.');
      return;
    }

    setLoading(true);
    
    try {
      // Criar a receita
      const novaReceita = await receitasService.createReceita({
        pet: parseInt(receita.paciente_id),
        veterinario: 1, // TODO: Pegar do usuário logado
        data_validade: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 dias
        diagnostico: receita.observacoes || 'Prescrição médica',
        observacoes: receita.observacoes,
        status: 'ativa'
      });

      // Criar os itens da receita
      for (const medicamento of receita.medicamentos) {
        if (medicamento.nome.trim()) {
          // Primeiro, buscar medicamento existente
          const medicamentos = await receitasService.getMedicamentos();
          let medicamentoId = 1; // Default para Amoxicilina
          
          // Buscar por nome similar
          const medicamentoEncontrado = medicamentos.find(med => 
            med.nome.toLowerCase().includes(medicamento.nome.toLowerCase()) ||
            medicamento.nome.toLowerCase().includes(med.nome.toLowerCase())
          );
          
          if (medicamentoEncontrado) {
            medicamentoId = medicamentoEncontrado.id;
          }

          await receitasService.createItemReceita({
            receita: novaReceita.id,
            medicamento_id: medicamentoId,
            dosagem: medicamento.dosagem,
            frequencia: medicamento.frequencia,
            duracao: medicamento.duracao,
            quantidade: 1,
            observacoes: medicamento.observacoes
          });
        }
      }
      
      alert('Receita criada com sucesso!');
      router.push('/receitas');
    } catch (error) {
      console.error('Erro ao salvar receita:', error);
      alert('Erro ao salvar receita. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <VetLayout>
      <div className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => router.back()}
            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          
          <div className="flex items-center gap-3">
            <FileText className="h-8 w-8 text-indigo-600" />
            <h1 className="text-2xl font-bold">Nova Receita Médica</h1>
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            {/* Seleção de Paciente */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold mb-4">Selecionar Paciente</h2>
              
              {loadingPacientes ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                  <span className="ml-2 text-gray-600">Carregando pacientes...</span>
                </div>
              ) : !pacienteSelecionado ? (
                pacientes.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>Nenhum paciente encontrado.</p>
                    <p className="text-sm mt-2">Cadastre um paciente primeiro para criar receitas.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {pacientes.map(paciente => (
                      <div
                        key={paciente.id}
                        onClick={() => selecionarPaciente(paciente)}
                        className="p-4 border border-gray-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 cursor-pointer transition-colors"
                      >
                        <h3 className="font-medium text-gray-900">{paciente.nome}</h3>
                        <p className="text-sm text-gray-600">{paciente.especie}{paciente.raca && ` - ${paciente.raca}`}</p>
                        <p className="text-sm text-gray-600">Tutor: {paciente.tutor_nome}</p>
                        <p className="text-sm text-gray-600">{paciente.tutor_telefone}</p>
                      </div>
                    ))}
                  </div>
                )
              ) : (
                <div className="flex items-center justify-between p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">{pacienteSelecionado.nome}</h3>
                    <p className="text-sm text-gray-600">{pacienteSelecionado.especie}{pacienteSelecionado.raca && ` - ${pacienteSelecionado.raca}`} - Tutor: {pacienteSelecionado.tutor_nome}</p>
                  </div>
                  <button
                    onClick={() => {
                      setPacienteSelecionado(null);
                      setReceita(prev => ({
                        ...prev,
                        paciente_id: '',
                        paciente_nome: '',
                        especie: '',
                        tutor_nome: '',
                        tutor_telefone: ''
                      }));
                    }}
                    className="text-indigo-600 hover:text-indigo-800"
                  >
                    Alterar
                  </button>
                </div>
              )}
            </div>

            {/* Informações da Receita */}
            {pacienteSelecionado && (
              <>
                <div className="mb-8">
                  <h2 className="text-lg font-semibold mb-4">Informações da Receita</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Veterinário
                      </label>
                      <input
                        type="text"
                        value={receita.veterinario}
                        onChange={(e) => setReceita(prev => ({ ...prev, veterinario: e.target.value }))}
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
                        onChange={(e) => setReceita(prev => ({ ...prev, data_prescricao: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
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
                    onChange={(e) => setReceita(prev => ({ ...prev, observacoes: e.target.value }))}
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
                    disabled={loading}
                  >
                    Cancelar
                  </button>
                  
                  <button
                    onClick={salvarReceita}
                    disabled={loading || !receita.paciente_id || receita.medicamentos.length === 0}
                    className="flex items-center justify-center gap-2 bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Salvando...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        Salvar Receita
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </VetLayout>
  );
}