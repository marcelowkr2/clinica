'use client';

import { useState, useEffect } from 'react';
import { X, TestTube, User, Calendar } from 'lucide-react';
import ExamesService from '@/services/exames';
import PetsService from '@/services/pets';
import UsersService from '@/services/users';

interface Pet {
  id: number;
  nome: string;
  especie: string;
  raca: string;
  tutor_nome: string;
  tutor_telefone: string;
}

interface TipoExame {
  id: number;
  nome: string;
  descricao?: string;
  valor: number;
  tempo_resultado: number;
}

interface Veterinario {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  user_type: number;
  phone?: string;
  cpf?: string;
  crmv?: string;
  is_active: boolean;
  date_joined: string;
}
import { useToast } from '@/components/ui/use-toast';

interface NovoExameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

export function NovoExameModal({ isOpen, onClose, onSubmit }: NovoExameModalProps) {
  const [formData, setFormData] = useState({
    pet: '',
    tipo_exame: '',
    veterinario_solicitante: '',
    data_solicitacao: new Date().toISOString().slice(0, 16),
    prioridade: 'normal' as const
  });
  
  const [pets, setPets] = useState<Pet[]>([]);
  const [tiposExame, setTiposExame] = useState<TipoExame[]>([]);
  const [veterinarios, setVeterinarios] = useState<Veterinario[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      console.log('Modal aberto, carregando dados...');
      loadData();
    }
  }, [isOpen]);

  const loadData = async () => {
      try {
        setLoading(true);
        const [petsData, tiposData, medicosData] = await Promise.all([
          PetsService.getPetsParaReceitas(),
          ExamesService.getTiposExame(),
          UsersService.getMedicos()
        ]);
      
        console.log('Dados carregados com sucesso:');
        console.log('Pets:', petsData);
        console.log('Tipos de exame:', tiposData);
        console.log('Médicos:', medicosData);
        setPets(petsData);
        setTiposExame(tiposData);
        setVeterinarios(medicosData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      console.error('Detalhes do erro:', error.response?.data);
      console.error('Status do erro:', error.response?.status);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar dados necessários',
        variant: 'destructive',
      });
    } finally {
      console.log('Finalizando carregamento...');
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.pet || !formData.tipo_exame || !formData.veterinario_solicitante) {
      toast({
        title: 'Erro',
        description: 'Preencha todos os campos obrigatórios',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);
      
      const exameData = {
        pet: parseInt(formData.pet),
        tipo_exame: parseInt(formData.tipo_exame),
        veterinario_solicitante: parseInt(formData.veterinario_solicitante),
        data_solicitacao: new Date(formData.data_solicitacao).toISOString(),
        prioridade: formData.prioridade,
        status: 'solicitado'
      };
      
      onSubmit(exameData);
      resetForm();
      onClose();
    } catch (error: any) {
      console.error('Erro ao solicitar exame:', error);
      toast({
        title: 'Erro',
        description: error.response?.data?.message || 'Erro ao solicitar exame',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      pet: '',
      tipo_exame: '',
      veterinario_solicitante: '',
      data_solicitacao: new Date().toISOString().slice(0, 16),
      prioridade: 'normal'
    });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <TestTube className="h-6 w-6 text-cyan-600" />
            Solicitar Exame
          </h2>
          <button onClick={handleClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600"></div>
              <span className="ml-2">Carregando dados...</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
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
                  <label htmlFor="tipo_exame" className="block text-sm font-medium text-gray-700 mb-1">
                    <TestTube className="inline h-4 w-4 mr-1" />
                    Tipo de Exame*
                  </label>
                  <select
                    id="tipo_exame"
                    value={formData.tipo_exame}
                    onChange={(e) => setFormData({ ...formData, tipo_exame: e.target.value })}
                    required
                    className="w-full border rounded-md px-3 py-2"
                  >
                    <option value="">Selecione o tipo de exame</option>
                    {tiposExame.map((tipo) => (
                      <option key={tipo.id} value={tipo.id}>
                        {tipo.nome} - R$ {(parseFloat(tipo.valor) || 0).toFixed(2)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="veterinario_solicitante" className="block text-sm font-medium text-gray-700 mb-1">
                    Veterinário Solicitante*
                  </label>
                  <select
                    id="veterinario_solicitante"
                    value={formData.veterinario_solicitante}
                    onChange={(e) => setFormData({ ...formData, veterinario_solicitante: e.target.value })}
                    required
                    className="w-full border rounded-md px-3 py-2"
                  >
                    <option value="">Selecione o veterinário</option>
                    {veterinarios.map((vet) => (
                      <option key={vet.id} value={vet.id}>
                        {`${vet.first_name} ${vet.last_name}`.trim()}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label htmlFor="data_solicitacao" className="block text-sm font-medium text-gray-700 mb-1">
                    <Calendar className="inline h-4 w-4 mr-1" />
                    Data da Solicitação*
                  </label>
                  <input
                    id="data_solicitacao"
                    type="datetime-local"
                    value={formData.data_solicitacao}
                    onChange={(e) => setFormData({ ...formData, data_solicitacao: e.target.value })}
                    required
                    className="w-full border rounded-md px-3 py-2"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="prioridade" className="block text-sm font-medium text-gray-700 mb-1">
                  Prioridade
                </label>
                <select
                  id="prioridade"
                  value={formData.prioridade}
                  onChange={(e) => setFormData({ ...formData, prioridade: e.target.value as any })}
                  className="w-full border rounded-md px-3 py-2"
                >
                  <option value="baixa">Baixa</option>
                  <option value="normal">Normal</option>
                  <option value="alta">Alta</option>
                  <option value="urgente">Urgente</option>
                </select>
              </div>
              

              
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
                  className="px-4 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-700 transition-colors disabled:opacity-50"
                  disabled={loading}
                >
                  {loading ? 'Solicitando...' : 'Solicitar Exame'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}