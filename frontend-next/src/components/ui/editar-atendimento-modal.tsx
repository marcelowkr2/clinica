'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { AppointmentsService, Agendamento, Servico } from '@/services/appointments';
import UsersService, { User } from '@/services/users';

interface AtendimentoDisplay {
  id: number;
  data_hora: string;
  paciente_nome: string;
  responsavel_nome: string;
  servico_nome: string;
  status: string;
  valor: number;
  observacoes?: string;
}

interface EditarAtendimentoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (atendimento: Agendamento) => void;
  atendimento: AtendimentoDisplay | null;
}

export function EditarAtendimentoModal({ isOpen, onClose, onSave, atendimento }: EditarAtendimentoModalProps) {
  const [data, setData] = useState('');
  const [hora, setHora] = useState('');
  const [servico, setServico] = useState('');
  const [status, setStatus] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [medico, setMedico] = useState('');
  const [valor, setValor] = useState('');

  // Estados para dados carregados do backend
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [medicos, setMedicos] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [agendamentoCompleto, setAgendamentoCompleto] = useState<Agendamento | null>(null);

  // Carregar dados quando o modal abrir
  useEffect(() => {
    if (isOpen && atendimento) {
      loadData();
      loadAgendamentoCompleto();
    }
  }, [isOpen, atendimento]);

  const loadAgendamentoCompleto = async () => {
    if (!atendimento) return;

    try {
      const agendamento = await AppointmentsService.getAgendamento(atendimento.id);
      setAgendamentoCompleto(agendamento);
      populateForm(agendamento);
    } catch (error) {
      console.error('Erro ao carregar agendamento completo:', error);
    }
  };

  const populateForm = (agendamento: Agendamento) => {
    const dataHora = new Date(agendamento.data_hora);
    const dataFormatada = dataHora.toISOString().split('T')[0];
    const horaFormatada = dataHora.toTimeString().slice(0, 5);

    setData(dataFormatada);
    setHora(horaFormatada);
    setServico(agendamento.servico?.toString() || '');
    setStatus(agendamento.status);
    setObservacoes(agendamento.observacoes || '');
    setMedico(agendamento.medico?.toString() || '');
    setValor(agendamento.valor?.toString() || '');
  };

  const loadData = async () => {
    try {
      setLoading(true);

      // Carregar serviços
      const servicosData = await AppointmentsService.getAllServicos();
      setServicos(servicosData);

      // Carregar médicos
      const medicosData = await UsersService.getMedicos();
      setMedicos(medicosData);

    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setData('');
    setHora('');
    setServico('');
    setStatus('');
    setObservacoes('');
    setVeterinario('');
    setValor('');
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!agendamentoCompleto) {
      alert('Erro: dados do atendimento não encontrados.');
      return;
    }

    // Verificar se é agendamento de vacinação
    const isVacinacao = typeof agendamentoCompleto.id === 'string' && agendamentoCompleto.id.startsWith('vacina_');

    if (isVacinacao) {
      // Para agendamentos de vacinação, apenas status e observações podem ser editados
      if (!status) {
        alert('Por favor, selecione um status.');
        return;
      }

      try {
        const vacinaId = agendamentoCompleto.id.toString().replace('vacina_', '');
        const atendimentoAtualizado = {
          status: status,
          observacoes: observacoes
        };

        const resultado = await AppointmentsService.updateAgendamentoVacina(parseInt(vacinaId), atendimentoAtualizado);
        onSave(resultado);
        resetForm();
        onClose();
      } catch (error: any) {
        console.error('Erro ao atualizar agendamento de vacinação:', error);
        if (error.response?.status === 401) {
          alert('Sessão expirada. Por favor, faça login novamente.');
        } else {
          alert('Erro ao atualizar agendamento de vacinação. Tente novamente.');
        }
      }
    } else {
      // Para agendamentos regulares
      if (!data || !hora || !servico || !veterinario || !status) {
        alert('Por favor, preencha todos os campos obrigatórios.');
        return;
      }

      try {
        const dataHora = `${data}T${hora}:00`;

        const atendimentoAtualizado = {
          pet: agendamentoCompleto.pet,
          veterinario: parseInt(veterinario),
          servico: parseInt(servico),
          data_hora: dataHora,
          status: status,
          valor: parseFloat(valor) || 0,
          observacoes: observacoes
        };

        const resultado = await AppointmentsService.updateAgendamento(agendamentoCompleto.id as number, atendimentoAtualizado);
        onSave(resultado);
        resetForm();
        onClose();
      } catch (error: any) {
        console.error('Erro ao atualizar atendimento:', error);
        if (error.response?.status === 401) {
          alert('Sessão expirada. Por favor, faça login novamente.');
        } else {
          alert('Erro ao atualizar atendimento. Tente novamente.');
        }
      }
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Editar Atendimento</h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        {loading ? (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Carregando...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {agendamentoCompleto && typeof agendamentoCompleto.id === 'string' && agendamentoCompleto.id.startsWith('vacina_') ? (
              // Interface para agendamentos de vacinação (apenas status e observações editáveis)
              <>
                <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-4">
                  <p className="text-sm text-blue-800">
                    <strong>Agendamento de Vacinação</strong><br />
                    Para agendamentos de vacinação, apenas o status e observações podem ser editados.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Paciente</label>
                  <input
                    type="text"
                    value={agendamentoCompleto.paciente || ''}
                    disabled
                    className="w-full border rounded-md px-3 py-2 bg-gray-100 text-gray-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Serviço</label>
                  <input
                    type="text"
                    value={agendamentoCompleto.servico || ''}
                    disabled
                    className="w-full border rounded-md px-3 py-2 bg-gray-100 text-gray-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Data/Hora</label>
                  <input
                    type="text"
                    value={agendamentoCompleto.data_hora ? new Date(agendamentoCompleto.data_hora).toLocaleString('pt-BR') : ''}
                    disabled
                    className="w-full border rounded-md px-3 py-2 bg-gray-100 text-gray-600"
                  />
                </div>

                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Status*</label>
                  <select
                    id="status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    required
                    className="w-full border rounded-md px-3 py-2"
                  >
                    <option value="">Selecione o status</option>
                    <option value="agendado">Agendado</option>
                    <option value="aplicado">Aplicado</option>
                    <option value="cancelado">Cancelado</option>
                  </select>
                </div>
              </>
            ) : (
              // Interface para agendamentos regulares
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="data" className="block text-sm font-medium text-gray-700 mb-1">Data*</label>
                    <input
                      type="date"
                      id="data"
                      value={data}
                      onChange={(e) => setData(e.target.value)}
                      required
                      className="w-full border rounded-md px-3 py-2"
                    />
                  </div>
                  <div>
                    <label htmlFor="hora" className="block text-sm font-medium text-gray-700 mb-1">Hora*</label>
                    <input
                      type="time"
                      id="hora"
                      value={hora}
                      onChange={(e) => setHora(e.target.value)}
                      required
                      className="w-full border rounded-md px-3 py-2"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="servico" className="block text-sm font-medium text-gray-700 mb-1">Serviço*</label>
                  <select
                    id="servico"
                    value={servico}
                    onChange={(e) => setServico(e.target.value)}
                    required
                    className="w-full border rounded-md px-3 py-2"
                  >
                    <option value="">Selecione um serviço</option>
                    {servicos.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.nome} - R$ {s.preco}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="veterinario" className="block text-sm font-medium text-gray-700 mb-1">Veterinário*</label>
                  <select
                    id="veterinario"
                    value={veterinario}
                    onChange={(e) => setVeterinario(e.target.value)}
                    required
                    className="w-full border rounded-md px-3 py-2"
                  >
                    <option value="">Selecione um veterinário</option>
                    {veterinarios.map((v) => (
                      <option key={v.id} value={v.id}>
                        Dr(a). {v.first_name} {v.last_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Status*</label>
                  <select
                    id="status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    required
                    className="w-full border rounded-md px-3 py-2"
                  >
                    <option value="">Selecione o status</option>
                    <option value="agendado">Agendado</option>
                    <option value="em_andamento">Em Andamento</option>
                    <option value="concluido">Concluído</option>
                    <option value="cancelado">Cancelado</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="valor" className="block text-sm font-medium text-gray-700 mb-1">Valor (R$)</label>
                  <input
                    type="number"
                    id="valor"
                    value={valor}
                    onChange={(e) => setValor(e.target.value)}
                    step="0.01"
                    min="0"
                    className="w-full border rounded-md px-3 py-2"
                    placeholder="0.00"
                  />
                </div>
              </>
            )}

            <div>
              <label htmlFor="observacoes" className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
              <textarea
                id="observacoes"
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                rows={3}
                className="w-full border rounded-md px-3 py-2"
                placeholder="Observações sobre o atendimento..."
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Salvar Alterações
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
