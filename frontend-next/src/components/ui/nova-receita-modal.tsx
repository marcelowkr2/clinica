'use client';

import { useState, useEffect } from 'react';
import { X, FileText, User, Calendar, Plus, Trash2, Pill } from 'lucide-react';
import PetsService from '@/services/pets';
import receitasService from '@/services/receitas';
import { useToast } from '@/components/ui/use-toast';

interface Pet {
  id: number;
  nome: string;
  especie: string;
  raca: string;
  tutor_nome: string;
  tutor_telefone: string;
}

interface Medicamento {
  id: string;
  nome: string;
  dosagem: string;
  frequencia: string;
  duracao: string;
  observacoes?: string;
}

interface NovaReceitaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
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

export function NovaReceitaModal({ isOpen, onClose, onSubmit }: NovaReceitaModalProps) {
  const [formData, setFormData] = useState({
    pet: '',
    data_prescricao: new Date().toISOString().split('T')[0],
    observacoes: ''
  });
  
  const [pets, setPets] = useState<Pet[]>([]);
  const [medicamentos, setMedicamentos] = useState<Medicamento[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      loadData();
      // Adicionar um medicamento inicial
      adicionarMedicamento();
    }
  }, [isOpen]);

  const loadData = async () => {
    try {
      setLoading(true);
      const petsData = await PetsService.getPetsParaReceitas();
      setPets(petsData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar dados necessários',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const adicionarMedicamento = () => {
    const novoMedicamento: Medicamento = {
      id: Date.now().toString(),
      nome: '',
      dosagem: '',
      frequencia: '',
      duracao: '',
      observacoes: ''
    };
    
    setMedicamentos(prev => [...prev, novoMedicamento]);
  };

  const removerMedicamento = (id: string) => {
    setMedicamentos(prev => prev.filter(med => med.id !== id));
  };

  const atualizarMedicamento = (id: string, campo: keyof Medicamento, valor: string) => {
    setMedicamentos(prev => prev.map(med => 
      med.id === id ? { ...med, [campo]: valor } : med
    ));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.pet || medicamentos.length === 0) {
      toast({
        title: 'Erro',
        description: 'Selecione um paciente e adicione pelo menos um medicamento',
        variant: 'destructive',
      });
      return;
    }

    // Validar medicamentos
    const medicamentosValidos = medicamentos.filter(med => 
      med.nome.trim() && med.dosagem.trim() && med.frequencia.trim() && med.duracao.trim()
    );

    if (medicamentosValidos.length === 0) {
      toast({
        title: 'Erro',
        description: 'Preencha pelo menos um medicamento completamente',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);
      
      const receitaData = {
        pet: parseInt(formData.pet),
        veterinario: 1, // TODO: Pegar do usuário logado
        data_validade: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 dias
        diagnostico: formData.observacoes || 'Prescrição médica',
        observacoes: formData.observacoes,
        status: 'ativa',
        medicamentos: medicamentosValidos
      };
      
      onSubmit(receitaData);
      resetForm();
      onClose();
    } catch (error: any) {
      console.error('Erro ao criar receita:', error);
      toast({
        title: 'Erro',
        description: error.response?.data?.message || 'Erro ao criar receita',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      pet: '',
      data_prescricao: new Date().toISOString().split('T')[0],
      observacoes: ''
    });
    setMedicamentos([]);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <FileText className="h-6 w-6 text-indigo-600" />
            Nova Receita Médica
          </h2>
          <button onClick={handleClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              <span className="ml-2">Carregando dados...</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Informações Básicas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="pet" className="block text-sm font-medium text-gray-700 mb-1">
                    <User className="inline h-4 w-4 mr-1" />
                    Paciente*
                  </label>
                  <select
                    id="pet"
                    value={formData.pet}
                    onChange={(e) => setFormData({ ...formData, pet: e.target.value })}
                    required
                    className="w-full border rounded-md px-3 py-2"
                  >
                    <option value="">Selecione um paciente</option>
                    {pets.map((pet) => (
                      <option key={pet.id} value={pet.id}>
                        {pet.nome} - {pet.tutor_nome}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label htmlFor="data_prescricao" className="block text-sm font-medium text-gray-700 mb-1">
                    <Calendar className="inline h-4 w-4 mr-1" />
                    Data da Prescrição*
                  </label>
                  <input
                    id="data_prescricao"
                    type="date"
                    value={formData.data_prescricao}
                    onChange={(e) => setFormData({ ...formData, data_prescricao: e.target.value })}
                    required
                    className="w-full border rounded-md px-3 py-2"
                  />
                </div>
              </div>

              {/* Medicamentos */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium flex items-center gap-2">
                    <Pill className="h-5 w-5 text-indigo-600" />
                    Medicamentos*
                  </h3>
                  <button
                    type="button"
                    onClick={adicionarMedicamento}
                    className="flex items-center gap-2 bg-indigo-600 text-white px-3 py-2 rounded-md hover:bg-indigo-700 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    Adicionar Medicamento
                  </button>
                </div>

                <div className="space-y-4">
                  {medicamentos.map((medicamento, index) => (
                    <div key={medicamento.id} className="border rounded-lg p-4 bg-gray-50">
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="font-medium">Medicamento {index + 1}</h4>
                        {medicamentos.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removerMedicamento(medicamento.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Nome do Medicamento*
                          </label>
                          <input
                            type="text"
                            value={medicamento.nome}
                            onChange={(e) => atualizarMedicamento(medicamento.id, 'nome', e.target.value)}
                            placeholder="Ex: Amoxicilina"
                            list={`medicamentos-${medicamento.id}`}
                            className="w-full border rounded-md px-3 py-2"
                          />
                          <datalist id={`medicamentos-${medicamento.id}`}>
                            {medicamentosComuns.map((med) => (
                              <option key={med} value={med} />
                            ))}
                          </datalist>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Dosagem*
                          </label>
                          <input
                            type="text"
                            value={medicamento.dosagem}
                            onChange={(e) => atualizarMedicamento(medicamento.id, 'dosagem', e.target.value)}
                            placeholder="Ex: 250mg, 1ml"
                            className="w-full border rounded-md px-3 py-2"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Frequência*
                          </label>
                          <input
                            type="text"
                            value={medicamento.frequencia}
                            onChange={(e) => atualizarMedicamento(medicamento.id, 'frequencia', e.target.value)}
                            placeholder="Ex: 2x ao dia, A cada 8 horas"
                            className="w-full border rounded-md px-3 py-2"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Duração*
                          </label>
                          <input
                            type="text"
                            value={medicamento.duracao}
                            onChange={(e) => atualizarMedicamento(medicamento.id, 'duracao', e.target.value)}
                            placeholder="Ex: 7 dias, 2 semanas"
                            className="w-full border rounded-md px-3 py-2"
                          />
                        </div>
                      </div>
                      
                      <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Observações
                        </label>
                        <input
                          type="text"
                          value={medicamento.observacoes}
                          onChange={(e) => atualizarMedicamento(medicamento.id, 'observacoes', e.target.value)}
                          placeholder="Ex: Administrar com alimento"
                          className="w-full border rounded-md px-3 py-2"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Observações Gerais */}
              <div>
                <label htmlFor="observacoes" className="block text-sm font-medium text-gray-700 mb-1">
                  Observações Gerais
                </label>
                <textarea
                  id="observacoes"
                  value={formData.observacoes}
                  onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                  rows={3}
                  className="w-full border rounded-md px-3 py-2"
                  placeholder="Observações adicionais sobre a receita..."
                />
              </div>
              
              <div className="flex justify-end gap-3 pt-4 border-t">
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
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                  disabled={loading}
                >
                  <FileText className="h-4 w-4" />
                  {loading ? 'Criando...' : 'Criar Receita'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}