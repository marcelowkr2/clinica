'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/auth';
import { useSearch } from '@/hooks/search';
import { VetLayout } from '@/components/ui/VetLayout';
import { useRouter } from 'next/navigation';
import { Plus, Calendar, Clock, Check, AlertTriangle, Eye, Edit, Trash } from 'lucide-react';
import { NovoAgendamentoModal } from '@/components/ui/novo-agendamento-modal';
import { DetalhesAgendamento } from '@/components/ui/detalhes-agendamento';
import { useToast } from '@/components/ui/use-toast';
import { AppointmentsService, Agendamento } from '@/services/appointments';

export default function AgendamentosPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { searchTerm, searchType, clearSearch } = useSearch();
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetalhesOpen, setIsDetalhesOpen] = useState(false);
  const [agendamentoSelecionado, setAgendamentoSelecionado] = useState('');
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const loadAgendamentos = async () => {
    console.log('🔄 Iniciando carregamento de agendamentos...');
    setLoading(true);
    try {
      console.log('📡 Fazendo requisição para API...');
      const data = await AppointmentsService.getAllAgendamentos();
      console.log('✅ Dados recebidos:', data);
      setAgendamentos(data);
    } catch (error) {
      console.error('❌ Erro ao carregar agendamentos:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar agendamentos. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditAgendamento = (agendamentoId: number) => {
    // TODO: Implementar modal de edição
    alert('Funcionalidade de edição será implementada em breve');
  };

  const handleDeleteAgendamento = async (agendamentoId: number) => {
    if (window.confirm('Tem certeza que deseja deletar este agendamento?')) {
      try {
        await AppointmentsService.deleteAgendamento(agendamentoId);
        alert('Agendamento deletado com sucesso!');
        loadAgendamentos(); // Recarregar lista
      } catch (error) {
        console.error('Erro ao deletar agendamento:', error);
        alert('Erro ao deletar agendamento. Tente novamente.');
      }
    }
  };

  // Função para organizar agendamentos por período do dia
  const organizeAgendamentosByPeriod = () => {
    const selectedDateStr = selectedDate.toISOString().split('T')[0];

    // Primeiro filtrar por data
    let agendamentosDodia = agendamentos.filter(agendamento => {
      const agendamentoDate = new Date(agendamento.data_hora).toISOString().split('T')[0];
      return agendamentoDate === selectedDateStr;
    });

    // Depois filtrar por termo de busca se houver e for busca de agendamentos
    if (searchTerm.trim() && searchType === 'agendamentos') {
      agendamentosDodia = agendamentosDodia.filter(agendamento => {
        const searchLower = searchTerm.toLowerCase();
        return (
          (agendamento.paciente_nome && agendamento.paciente_nome.toLowerCase().includes(searchLower)) ||
          (agendamento.servico_nome && agendamento.servico_nome.toLowerCase().includes(searchLower)) ||
          (agendamento.responsavel_nome && agendamento.responsavel_nome.toLowerCase().includes(searchLower)) ||
          (agendamento.responsavel_sobrenome && agendamento.responsavel_sobrenome.toLowerCase().includes(searchLower)) ||
          (agendamento.medico_nome && agendamento.medico_nome.toLowerCase().includes(searchLower)) ||
          (agendamento.observacoes && agendamento.observacoes.toLowerCase().includes(searchLower))
        );
      });
    }

    const manha = agendamentosDodia.filter(agendamento => {
      const hora = new Date(agendamento.data_hora).getHours();
      return hora >= 8 && hora < 12;
    });

    const tarde = agendamentosDodia.filter(agendamento => {
      const hora = new Date(agendamento.data_hora).getHours();
      return hora >= 13 && hora < 17;
    });

    const noite = agendamentosDodia.filter(agendamento => {
      const hora = new Date(agendamento.data_hora).getHours();
      return hora >= 18 && hora <= 20;
    });

    return { manha, tarde, noite };
  };

  const { manha, tarde, noite } = organizeAgendamentosByPeriod();

  // Função para renderizar agendamentos de um período
  const renderAgendamentosPeriodo = (agendamentos: Agendamento[], horariosDisponiveis: string[]) => {
    const horariosOcupados = agendamentos.map(agendamento => {
      const dataHora = new Date(agendamento.data_hora);
      return dataHora.getHours().toString().padStart(2, '0') + ':00';
    });

    return horariosDisponiveis.map((horario) => {
      const agendamento = agendamentos.find(ag => {
        const dataHora = new Date(ag.data_hora);
        const horarioAg = dataHora.getHours().toString().padStart(2, '0') + ':00';
        return horarioAg === horario;
      });

      if (agendamento) {
        return (
          <div
            key={horario}
            className="border rounded-lg p-3 bg-blue-50 border-blue-200 cursor-pointer hover:bg-blue-100"
            onClick={() => {
              setAgendamentoSelecionado(agendamento.id?.toString() || '');
              setIsDetalhesOpen(true);
            }}
          >
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium">{horario}</span>
              <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 flex items-center">
                <Check className="h-3 w-3 mr-1" /> {agendamento.status}
              </span>
            </div>
            <div>
               <p className="font-medium">{agendamento.paciente_nome || `Paciente ID: ${agendamento.paciente}`}</p>
               <p className="text-sm text-gray-600">{agendamento.servico_nome || `Serviço ID: ${agendamento.servico}`}</p>
               <p className="text-sm text-gray-600">
                 Responsável: {agendamento.responsavel_nome && agendamento.responsavel_sobrenome
                   ? `${agendamento.responsavel_nome} ${agendamento.responsavel_sobrenome}`
                   : 'N/A'}
               </p>
               <p className="text-sm text-gray-600">
                 Dr(a). {agendamento.medico_nome || `Médico ID: ${agendamento.medico}`}
               </p>
               {agendamento.observacoes && (
                 <p className="text-sm text-gray-600">Obs: {agendamento.observacoes}</p>
               )}
             </div>
            <div className="flex justify-end mt-2">
              <button className="p-1 text-blue-600 hover:bg-blue-200 rounded">
                <Eye className="h-4 w-4" />
              </button>
              <button
                className="p-1 text-green-600 hover:bg-green-100 rounded ml-1"
                onClick={(e) => {
                  e.stopPropagation();
                  handleEditAgendamento(agendamento.id!);
                }}
              >
                <Edit className="h-4 w-4" />
              </button>
              <button
                className="p-1 text-red-600 hover:bg-red-100 rounded ml-1"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteAgendamento(agendamento.id!);
                }}
              >
                <Trash className="h-4 w-4" />
              </button>
            </div>
          </div>
        );
      } else {
        return (
          <div key={horario} className="border rounded-lg p-3 hover:bg-gray-50 cursor-pointer">
            <div className="flex justify-between items-center">
              <span className="font-medium">{horario}</span>
              <span className="text-sm text-green-600">Disponível</span>
            </div>
          </div>
        );
      }
    });
  };

  useEffect(() => {
    console.log('🔍 useEffect - Estado da autenticação:', {
      authLoading,
      isAuthenticated,
      isRedirecting
    });

    // Aguarda o loading do auth terminar antes de redirecionar
    if (!authLoading && !isRedirecting) {
      // Verificar autenticação
      if (!isAuthenticated) {
        console.log('❌ Usuário não autenticado, redirecionando para login...');
        setIsRedirecting(true);
        router.push('/login');
        return;
      } else {
        console.log('✅ Usuário autenticado, carregando agendamentos...');
        // Carregar agendamentos quando autenticado
        loadAgendamentos();
      }
    }
  }, [isAuthenticated, authLoading, router, isRedirecting]);

  if (authLoading || isRedirecting) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-800"></div>
      </div>
    );
  }

  // Formatar a data selecionada
  const formattedDate = selectedDate.toLocaleDateString('pt-BR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <VetLayout>
      <div className="p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Agendamentos</h1>
            {searchType === 'agendamentos' && searchTerm && (
              <p className="text-sm text-gray-600 mt-1">
                Resultados para: "{searchTerm}"
                <button
                  onClick={clearSearch}
                  className="ml-2 text-blue-600 hover:text-blue-800 underline"
                >
                  Limpar busca
                </button>
              </p>
            )}
          </div>

          <button
            className="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors mt-4 sm:mt-0"
            onClick={() => setIsModalOpen(true)}
          >
            <Plus className="h-5 w-5" />
            Novo Agendamento
          </button>
        </div>

        <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-gray-500" />
            <input
              type="date"
              className="border rounded-lg px-3 py-2"
              value={selectedDate.toISOString().split('T')[0]}
              onChange={(e) => setSelectedDate(new Date(e.target.value))}
            />
          </div>
          <p className="text-gray-600 capitalize">{formattedDate}</p>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <p>Carregando agendamentos...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
              {/* Horários da manhã */}
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-4">Manhã (08:00 - 12:00)</h3>
                <div className="space-y-2">
                  {renderAgendamentosPeriodo(manha, ['08:00', '09:00', '10:00', '11:00'])}
                </div>
              </div>

              {/* Horários da tarde */}
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-4">Tarde (13:00 - 17:00)</h3>
                <div className="space-y-2">
                  {renderAgendamentosPeriodo(tarde, ['13:00', '14:00', '15:00', '16:00'])}
                </div>
              </div>

              {/* Horários da noite */}
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-4">Noite (18:00 - 20:00)</h3>
                <div className="space-y-2">
                  {renderAgendamentosPeriodo(noite, ['18:00', '19:00'])}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Novo Agendamento */}
      <NovoAgendamentoModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={(agendamento) => {
          console.log('Novo agendamento:', agendamento);
          toast({
            title: 'Agendamento realizado',
            description: `Agendamento para ${agendamento.paciente_nome} em ${agendamento.data} às ${agendamento.hora} foi realizado com sucesso.`,
          });
          setIsModalOpen(false);
          // Recarregar lista de agendamentos
          loadAgendamentos();
        }}
      />

      {/* Modal de Detalhes do Agendamento */}
      <DetalhesAgendamento
        isOpen={isDetalhesOpen}
        onClose={() => setIsDetalhesOpen(false)}
        agendamentoId={agendamentoSelecionado}
      />
    </VetLayout>
  );
}
