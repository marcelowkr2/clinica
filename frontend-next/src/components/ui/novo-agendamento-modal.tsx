'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { AppointmentsService, PacienteParaAgendamento, Servico } from '@/services/appointments';
import UsersService, { User } from '@/services/users';

interface NovoAgendamentoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (agendamento: any) => void;
}

export function NovoAgendamentoModal({ isOpen, onClose, onSave }: NovoAgendamentoModalProps) {
  const [paciente, setPaciente] = useState('');
  const [data, setData] = useState('');
  const [hora, setHora] = useState('');
  const [servico, setServico] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [veterinario, setVeterinario] = useState('');
  
  // Estados para dados carregados do backend
  const [pacientes, setPacientes] = useState<PacienteParaAgendamento[]>([]);
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [veterinarios, setVeterinarios] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  // Carregar dados quando o modal abrir
  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [pacientesData, servicosData, veterinariosData] = await Promise.all([
        AppointmentsService.getPacientesParaAgendamento(),
        AppointmentsService.getAllServicos(),
        UsersService.getAllUsers()
      ]);
      
      setPacientes(pacientesData);
      setServicos(servicosData);
      // Filtrar apenas veterinários (user_type = 2)
      setVeterinarios(veterinariosData.filter(user => user.user_type === 2));
    } catch (error: any) {
      console.error('Erro ao carregar dados:', error);
      if (error.response?.status === 401) {
        alert('Sessão expirada. Por favor, faça login novamente.');
        // Redirecionar para login se necessário
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
    
    if (!paciente || !data || !hora || !servico || !veterinario) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    try {
      const dataHora = `${data}T${hora}:00`;
      const servicoSelecionado = servicos.find(s => s.id === parseInt(servico));
      
      const novoAgendamento = {
        pet: parseInt(paciente),
        veterinario: parseInt(veterinario),
        servico: parseInt(servico),
        data_hora: dataHora,
        status: 'agendado',
        observacoes: observacoes || '',
        valor: servicoSelecionado?.valor || 0
      };
      
      const agendamentoCriado = await AppointmentsService.createAgendamento(novoAgendamento);
      
      // Buscar dados completos para o callback
      const pacienteSelecionado = pacientes.find(p => p.id === parseInt(paciente));
      const veterinarioSelecionado = veterinarios.find(v => v.id === parseInt(veterinario));
      
      onSave({
        ...agendamentoCriado,
        paciente_nome: pacienteSelecionado?.nome,
        veterinario_nome: `${veterinarioSelecionado?.first_name} ${veterinarioSelecionado?.last_name}`,
        servico_nome: servicoSelecionado?.nome,
        data: data,
        hora: hora
      });
      
      // Limpar formulário
      setPaciente('');
      setData('');
      setHora('');
      setServico('');
      setObservacoes('');
      setVeterinario('');
      
      onClose();
    } catch (error: any) {
      console.error('Erro ao criar agendamento:', error);
      if (error.response?.status === 401) {
        alert('Sessão expirada. Por favor, faça login novamente.');
        window.location.href = '/login';
      } else if (error.response?.status === 400) {
        alert('Dados inválidos. Verifique os campos e tente novamente.');
      } else {
        alert('Erro ao criar agendamento. Tente novamente.');
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold">Novo Agendamento</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="paciente" className="block text-sm font-medium text-gray-700 mb-1">Paciente*</label>
              <select
                id="paciente"
                value={paciente}
                onChange={(e) => setPaciente(e.target.value)}
                required
                disabled={loading}
                className="w-full border rounded-md px-3 py-2 disabled:bg-gray-100"
              >
                <option value="">
                  {loading ? 'Carregando pacientes...' : 'Selecione um paciente'}
                </option>
                {pacientes.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nome} ({p.especie}{p.raca ? ` - ${p.raca}` : ''}) - Tutor: {p.tutor.user.first_name} {p.tutor.user.last_name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="data" className="block text-sm font-medium text-gray-700 mb-1">Data*</label>
                <input
                  id="data"
                  type="date"
                  value={data}
                  onChange={(e) => setData(e.target.value)}
                  required
                  className="w-full border rounded-md px-3 py-2"
                />
              </div>
              
              <div>
                <label htmlFor="hora" className="block text-sm font-medium text-gray-700 mb-1">Hora*</label>
                <select
                  id="hora"
                  value={hora}
                  onChange={(e) => setHora(e.target.value)}
                  required
                  className="w-full border rounded-md px-3 py-2"
                >
                  <option value="">Selecione</option>
                  <option value="08:00">08:00</option>
                  <option value="09:00">09:00</option>
                  <option value="10:00">10:00</option>
                  <option value="11:00">11:00</option>
                  <option value="13:00">13:00</option>
                  <option value="14:00">14:00</option>
                  <option value="15:00">15:00</option>
                  <option value="16:00">16:00</option>
                  <option value="17:00">17:00</option>
                  <option value="18:00">18:00</option>
                  <option value="19:00">19:00</option>
                </select>
              </div>
            </div>
            
            <div>
              <label htmlFor="servico" className="block text-sm font-medium text-gray-700 mb-1">Serviço*</label>
              <select
                id="servico"
                value={servico}
                onChange={(e) => setServico(e.target.value)}
                required
                disabled={loading}
                className="w-full border rounded-md px-3 py-2 disabled:bg-gray-100"
              >
                <option value="">
                  {loading ? 'Carregando serviços...' : 'Selecione um serviço'}
                </option>
                {servicos.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.nome} - R$ {(parseFloat(s.valor) || 0).toFixed(2)} ({s.duracao} min)
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
                disabled={loading}
                className="w-full border rounded-md px-3 py-2 disabled:bg-gray-100"
              >
                <option value="">
                  {loading ? 'Carregando veterinários...' : 'Selecione um veterinário'}
                </option>
                {veterinarios.map((v) => (
                  <option key={v.id} value={v.id}>
                    Dr(a). {v.first_name} {v.last_name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="observacoes" className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
              <textarea
                id="observacoes"
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                rows={3}
                className="w-full border rounded-md px-3 py-2"
              />
            </div>
          </div>
          
          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Agendar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}