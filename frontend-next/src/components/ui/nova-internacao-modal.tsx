'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import InternacaoService from '@/services/internacao';
import PetsService, { Paciente } from '@/services/pets';
import UsersService, { User } from '@/services/users';

interface NovaInternacaoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (internacao: any) => void;
}

export function NovaInternacaoModal({ isOpen, onClose, onSave }: NovaInternacaoModalProps) {
  const [pet, setPet] = useState('');
  const [veterinario, setVeterinario] = useState('');
  const [motivo, setMotivo] = useState('');
  const [diagnostico, setDiagnostico] = useState('');
  const [observacoesEntrada, setObservacoesEntrada] = useState('');
  const [valorDiaria, setValorDiaria] = useState('');

  const [pets, setPets] = useState<Paciente[]>([]);
  const [veterinarios, setVeterinarios] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [petsData, veterinariosData] = await Promise.all([
        PetsService.getAllPacientes(),
        UsersService.getAllUsers()
      ]);

      setPets(petsData);
      // Verificar se veterinariosData é um array ou objeto paginado
      const veterinariosArray = Array.isArray(veterinariosData)
        ? veterinariosData
        : veterinariosData.results || [];
      setVeterinarios(veterinariosArray.filter(user => user.user_type === 2));
    } catch (error: any) {
      console.error('Erro ao carregar dados:', error);
      if (error.response?.status === 401) {
        alert('Sessão expirada. Por favor, faça login novamente.');
        window.location.href = '/login';
      } else {
        alert('Erro ao carregar dados. Verifique sua conexão e tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!pet || !veterinario || !motivo || !diagnostico || !valorDiaria) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    try {
      // Limpar a máscara para enviar o valor numérico ao backend
      const numericValue = parseFloat(valorDiaria.replace(/[^\d,]/g, '').replace(',', '.'));

      const payload = {
        paciente: parseInt(pet),
        medico_responsavel: parseInt(veterinario),
        data_entrada: new Date().toISOString(),
        motivo: motivo,
        diagnostico: diagnostico,
        observacoes_entrada: observacoesEntrada || '',
        status: 'internado',
        valor_diaria: numericValue
      };

      console.log('🚀 Enviando payload de internação:', payload);
      const internacaoCriada = await InternacaoService.createInternacao(payload);

      const petSelecionado = pets.find(p => p.id === parseInt(pet));
      const veterinarioSelecionado = veterinarios.find(v => v.id === parseInt(veterinario));

      onSave({
        ...internacaoCriada,
        pet_nome: petSelecionado?.nome,
        veterinario_nome: `${veterinarioSelecionado?.first_name} ${veterinarioSelecionado?.last_name}`
      });

      setPet('');
      setVeterinario('');
      setMotivo('');
      setDiagnostico('');
      setObservacoesEntrada('');
      setValorDiaria('');

      onClose();
    } catch (error: any) {
      console.error('Erro ao criar internação:', error);
      if (error.response?.status === 401) {
        alert('Sessão expirada. Por favor, faça login novamente.');
        window.location.href = '/login';
      } else if (error.response?.status === 400) {
        alert('Dados inválidos. Verifique os campos e tente novamente.');
      } else {
        alert('Erro ao criar internação. Tente novamente.');
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold">Nova Internação</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="pet" className="block text-sm font-medium text-gray-700 mb-1">Paciente*</label>
              <select
                id="pet"
                value={pet}
                onChange={(e) => setPet(e.target.value)}
                required
                disabled={loading}
                className="w-full border rounded-md px-3 py-2 disabled:bg-gray-100"
              >
                <option value="">
                  {loading ? 'Carregando pacientes...' : 'Selecione um paciente'}
                </option>
                {pets.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nome}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="veterinario" className="block text-sm font-medium text-gray-700 mb-1">Médico Responsável*</label>
              <select
                id="veterinario"
                value={veterinario}
                onChange={(e) => setVeterinario(e.target.value)}
                required
                disabled={loading}
                className="w-full border rounded-md px-3 py-2 disabled:bg-gray-100"
              >
                <option value="">
                  {loading ? 'Carregando médicos...' : 'Selecione um médico'}
                </option>
                {veterinarios.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.first_name} {v.last_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="motivo" className="block text-sm font-medium text-gray-700 mb-1">Motivo*</label>
                <select
                  id="motivo"
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value)}
                  required
                  className="w-full border rounded-md px-3 py-2"
                >
                  <option value="">Selecione o motivo</option>
                  <option value="cirurgia">Cirurgia</option>
                  <option value="tratamento">Tratamento</option>
                  <option value="observacao">Observação</option>
                  <option value="pos_operatorio">Pós-operatório</option>
                  <option value="emergencia">Emergência</option>
                  <option value="outros">Outros</option>
                </select>
              </div>

              <div>
                <label htmlFor="valorDiaria" className="block text-sm font-medium text-gray-700 mb-1">Valor da Diária (R$)*</label>
                <input
                  id="valorDiaria"
                  type="text"
                  value={valorDiaria}
                  onChange={(e) => {
                    let value = e.target.value.replace(/\D/g, '');
                    if (value === '') {
                      setValorDiaria('');
                      return;
                    }
                    const amount = (parseInt(value) / 100).toFixed(2);
                    const formatted = new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    }).format(parseFloat(amount));
                    setValorDiaria(formatted);
                  }}
                  required
                  placeholder="R$ 0,00"
                  className="w-full border rounded-md px-3 py-2"
                />
              </div>
            </div>

            <div>
              <label htmlFor="diagnostico" className="block text-sm font-medium text-gray-700 mb-1">Diagnóstico*</label>
              <textarea
                id="diagnostico"
                value={diagnostico}
                onChange={(e) => setDiagnostico(e.target.value)}
                rows={3}
                required
                placeholder="Diagnóstico inicial ou suspeita clínica"
                className="w-full border rounded-md px-3 py-2"
              />
            </div>

            <div>
              <label htmlFor="observacoesEntrada" className="block text-sm font-medium text-gray-700 mb-1">Observações de Entrada</label>
              <textarea
                id="observacoesEntrada"
                value={observacoesEntrada}
                onChange={(e) => setObservacoesEntrada(e.target.value)}
                rows={3}
                placeholder="Observações sobre o estado do paciente na entrada"
                className="w-full border rounded-md px-3 py-2"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
            >
              {loading ? 'Salvando...' : 'Salvar Internação'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
