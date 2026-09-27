'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/auth';
import { VetLayout } from '@/components/ui/VetLayout';
import { useRouter } from 'next/navigation';
import { Search, Filter, Eye, Edit, Trash, RefreshCw, Calendar, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { DetalhesAtendimento } from '@/components/ui/detalhes-atendimento';
import { EditarAtendimentoModal } from '@/components/ui/editar-atendimento-modal';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { AppointmentsService, Agendamento } from '@/services/appointments';
import ProcedimentosService, { Procedimento } from '@/services/procedimentos';
import ExamesService, { Exame } from '@/services/exames';
import PacientesService from '@/services/pets';
import UsersService from '@/services/users';

interface AtendimentoDisplay {
  id: number | string;
  data_hora: string;
  paciente_nome: string;
  responsavel_nome: string;
  servico_nome: string;
  status: string;
  valor: string;
  observacoes?: string;
  tipo: 'agendamento' | 'procedimento' | 'exame' | 'vacina';
}

export default function AtendimentosPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [dateFilter, setDateFilter] = useState('todos');
  const [tipoFilter, setTipoFilter] = useState('todos');
  const [isDetalhesOpen, setIsDetalhesOpen] = useState(false);
  const [atendimentoSelecionado, setAtendimentoSelecionado] = useState<number | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [atendimentoParaEditar, setAtendimentoParaEditar] = useState<AtendimentoDisplay | null>(null);
  const [atendimentos, setAtendimentos] = useState<AtendimentoDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    hoje: 0,
    concluidos: 0,
    pendentes: 0
  });
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading && !isRedirecting) {
      if (!isAuthenticated) {
        setIsRedirecting(true);
        router.push('/login');
        return;
      } else {
        fetchAtendimentos();
      }
    }
  }, [isAuthenticated, authLoading, router, isRedirecting]);

  const fetchAtendimentos = async () => {
    try {
      setLoading(true);

      // Buscar dados de todas as fontes
      const [agendamentos, procedimentosList, examesList] = await Promise.all([
        AppointmentsService.getAllAgendamentos(),
        ProcedimentosService.getProcedimentos(),
        ExamesService.getExames()
      ]);

      // Converter agendamentos regulares
      const agendamentosData = agendamentos.map((agendamento: Agendamento) => ({
        id: agendamento.id!,
        data_hora: agendamento.data_hora,
        paciente_nome: agendamento.paciente_nome || 'Paciente não encontrado',
        responsavel_nome: agendamento.responsavel_nome && agendamento.responsavel_sobrenome
          ? `${agendamento.responsavel_nome} ${agendamento.responsavel_sobrenome}`.trim()
          : agendamento.responsavel_nome || 'Responsável não encontrado',
        servico_nome: agendamento.servico_nome || 'Serviço não especificado',
        status: agendamento.status,
        valor: agendamento.valor?.toString() || '0',
        observacoes: agendamento.observacoes,
        tipo: agendamento.tipo === 'vacina' ? 'vacina' as const : 'agendamento' as const
      }));

      // Converter procedimentos
      const procedimentosData = procedimentosList.map((procedimento: Procedimento) => ({
        id: `proc_${procedimento.id}`,
        data_hora: procedimento.data_agendamento,
        paciente_nome: procedimento.paciente_nome || 'Paciente não encontrado',
        responsavel_nome: procedimento.responsavel_nome || 'Responsável não encontrado',
        servico_nome: procedimento.servicos_nomes?.join(', ') || 'Procedimento',
        status: procedimento.status,
        valor: procedimento.valor_total?.toString() || '0',
        observacoes: procedimento.observacoes,
        tipo: 'procedimento' as const
      }));

      // Converter exames
      const examesData = examesList.map((exame: Exame) => ({
        id: `exame_${exame.id}`,
        data_hora: exame.data_solicitacao,
        paciente_nome: exame.paciente_nome || 'Paciente não encontrado',
        responsavel_nome: exame.responsavel_nome || 'Responsável não encontrado',
        servico_nome: `Exame: ${exame.tipo_exame_nome}`,
        status: exame.status,
        valor: '0',
        observacoes: exame.observacoes_resultado,
        tipo: 'exame' as const
      }));

      // Combinar todos os dados
      const todosAtendimentos = [...agendamentosData, ...procedimentosData, ...examesData];
      setAtendimentos(todosAtendimentos.sort((a, b) => new Date(b.data_hora).getTime() - new Date(a.data_hora).getTime()));

      // Calcular estatísticas
      const hoje = new Date().toISOString().split('T')[0];
      const estatisticas = {
        total: todosAtendimentos.length,
        hoje: todosAtendimentos.filter(a => a.data_hora.split('T')[0] === hoje).length,
        concluidos: todosAtendimentos.filter(a => a.status === 'concluido').length,
        pendentes: todosAtendimentos.filter(a => ['agendado', 'em_andamento', 'solicitado', 'coletado'].includes(a.status)).length
      };
      setStats(estatisticas);
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os atendimentos.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAtendimento = async (id: number | string) => {
    if (!confirm('Tem certeza que deseja deletar este atendimento?')) {
      return;
    }

    try {
      if (typeof id === 'string') {
        if (id.startsWith('proc_')) {
          const procId = parseInt(id.replace('proc_', ''));
          await ProcedimentosService.deleteProcedimento(procId);
        } else if (id.startsWith('exame_')) {
          const exameId = parseInt(id.replace('exame_', ''));
          await ExamesService.deleteExame(exameId);
        } else if (id.startsWith('vacina_')) {
          await AppointmentsService.deleteAgendamento(id);
        }
      } else {
        await AppointmentsService.deleteAgendamento(id);
      }

      toast({
        title: 'Sucesso',
        description: 'Atendimento deletado com sucesso.',
      });
      fetchAtendimentos(); // Recarregar lista
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível deletar o atendimento.',
        variant: 'destructive',
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'agendado':
        return 'bg-blue-100 text-blue-800';
      case 'em_andamento':
        return 'bg-yellow-100 text-yellow-800';
      case 'concluido':
        return 'bg-green-100 text-green-800';
      case 'cancelado':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case 'agendado':
        return 'Agendado';
      case 'em_andamento':
        return 'Em andamento';
      case 'concluido':
        return 'Concluído';
      case 'cancelado':
        return 'Cancelado';
      default:
        return status;
    }
  };

  const getPeriodoInfo = (dataHora: string) => {
    const hora = new Date(dataHora).getHours();
    if (hora >= 6 && hora < 12) {
      return { periodo: 'Manhã', color: 'bg-yellow-100 text-yellow-800', icon: '🌅' };
    } else if (hora >= 12 && hora < 18) {
      return { periodo: 'Tarde', color: 'bg-orange-100 text-orange-800', icon: '☀️' };
    } else {
      return { periodo: 'Noite', color: 'bg-indigo-100 text-indigo-800', icon: '🌙' };
    }
  };

  const filteredAtendimentos = atendimentos.filter(atendimento => {
    const matchesSearch = searchTerm === '' ||
      atendimento.paciente_nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      atendimento.responsavel_nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      atendimento.servico_nome.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'todos' || atendimento.status === statusFilter;
    const matchesTipo = tipoFilter === 'todos' || atendimento.tipo === tipoFilter;

    // Filtro por data
    const hoje = new Date().toISOString().split('T')[0];
    const dataAtendimento = atendimento.data_hora.split('T')[0];
    let matchesDate = true;

    if (dateFilter === 'hoje') {
      matchesDate = dataAtendimento === hoje;
    } else if (dateFilter === 'semana') {
      const inicioSemana = new Date();
      inicioSemana.setDate(inicioSemana.getDate() - inicioSemana.getDay());
      const inicioSemanaStr = inicioSemana.toISOString().split('T')[0];
      matchesDate = dataAtendimento >= inicioSemanaStr;
    } else if (dateFilter === 'mes') {
      const inicioMes = new Date();
      inicioMes.setDate(1);
      const inicioMesStr = inicioMes.toISOString().split('T')[0];
      matchesDate = dataAtendimento >= inicioMesStr;
    }

    return matchesSearch && matchesStatus && matchesDate && matchesTipo;
  }).sort((a, b) => new Date(b.data_hora).getTime() - new Date(a.data_hora).getTime());

  if (authLoading || isRedirecting) {
    return (
      <VetLayout>
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground font-medium">Carregando...</p>
          </div>
        </div>
      </VetLayout>
    );
  }

  return (
    <VetLayout>
      <div className="space-y-6">
        {/* Cards de Estatísticas */}
         <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
           <Card className="border-none shadow-sm bg-white dark:bg-card">
             <CardContent className="p-4 flex items-center gap-4">
               <div className="p-2.5 bg-blue-500/10 rounded-xl text-blue-500">
                 <Calendar className="w-5 h-5" />
               </div>
               <div>
                 <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">Total</p>
                 <p className="text-xl font-black text-foreground">{stats.total}</p>
               </div>
             </CardContent>
           </Card>

           <Card className="border-none shadow-sm bg-white dark:bg-card">
             <CardContent className="p-4 flex items-center gap-4">
               <div className="p-2.5 bg-emerald-500/10 rounded-xl text-emerald-500">
                 <Clock className="w-5 h-5" />
               </div>
               <div>
                 <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">Hoje</p>
                 <p className="text-xl font-black text-foreground">{stats.hoje}</p>
               </div>
             </CardContent>
           </Card>

           <Card className="border-none shadow-sm bg-white dark:bg-card">
             <CardContent className="p-4 flex items-center gap-4">
               <div className="p-2.5 bg-green-500/10 rounded-xl text-green-500">
                 <CheckCircle className="w-5 h-5" />
               </div>
               <div>
                 <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">Concluídos</p>
                 <p className="text-xl font-black text-foreground">{stats.concluidos}</p>
               </div>
             </CardContent>
           </Card>

           <Card className="border-none shadow-sm bg-white dark:bg-card">
             <CardContent className="p-4 flex items-center gap-4">
               <div className="p-2.5 bg-amber-500/10 rounded-xl text-amber-500">
                 <AlertTriangle className="w-5 h-5" />
               </div>
               <div>
                 <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">Pendentes</p>
                 <p className="text-xl font-black text-foreground">{stats.pendentes}</p>
               </div>
             </CardContent>
           </Card>
         </div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Atendimentos</h1>
            <p className="text-sm text-muted-foreground">Gerencie todas as consultas e serviços da clínica.</p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:flex-none">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar atendimento..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-white dark:bg-card border border-border/50 rounded-xl w-full md:w-64 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              />
            </div>

            <Button
              variant="outline"
              size="sm"
              className="rounded-xl border-border/50 hover:bg-secondary"
              onClick={fetchAtendimentos}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Sincronizar
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 p-4 bg-secondary/30 rounded-2xl border border-border/30">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent border-none text-sm font-bold text-foreground focus:ring-0 outline-none cursor-pointer"
            >
              <option value="todos">Todos</option>
              <option value="agendado">Agendado</option>
              <option value="em_andamento">Em andamento</option>
              <option value="concluido">Concluído</option>
              <option value="cancelado">Cancelado</option>
              <option value="solicitado">Solicitado</option>
              <option value="coletado">Coletado</option>
            </select>
          </div>

          <div className="h-4 w-px bg-border/50"></div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Tipo:</span>
            <select
              value={tipoFilter}
              onChange={(e) => setTipoFilter(e.target.value)}
              className="bg-transparent border-none text-sm font-bold text-foreground focus:ring-0 outline-none cursor-pointer"
            >
              <option value="todos">Todos os tipos</option>
              <option value="agendamento">🏥 Consultas</option>
              <option value="vacina">💉 Vacinas</option>
              <option value="procedimento">� Procedimentos</option>
              <option value="exame">🔬 Exames</option>
            </select>
          </div>

          <div className="h-4 w-px bg-border/50"></div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Período:</span>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="bg-transparent border-none text-sm font-bold text-foreground focus:ring-0 outline-none cursor-pointer"
            >
              <option value="todos">Todo o período</option>
              <option value="hoje">Hoje</option>
              <option value="semana">Esta semana</option>
              <option value="mes">Este mês</option>
            </select>
          </div>
        </div>

        <Card className="border-none shadow-md bg-white dark:bg-card overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
              <span className="text-sm font-medium text-muted-foreground">Buscando atendimentos...</span>
            </div>
          ) : (
            <div className="overflow-x-auto scrollbar-hide">
              <table className="min-w-full">
                <thead className="bg-muted/30">
                  <tr>
                    <th className="px-6 py-4 text-left text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Data/Hora</th>
                    <th className="px-6 py-4 text-left text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Paciente</th>
                    <th className="px-6 py-4 text-left text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Responsável</th>
                    <th className="px-6 py-4 text-left text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Serviço</th>
                    <th className="px-6 py-4 text-left text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Valor</th>
                    <th className="px-6 py-4 text-left text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Status</th>
                    <th className="px-6 py-4 text-right text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {filteredAtendimentos.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-20 text-center">
                        <div className="flex flex-col items-center gap-2 text-muted-foreground">
                          <div className="p-4 bg-muted rounded-full">
                            <Calendar className="h-8 w-8 opacity-20" />
                          </div>
                          <p className="text-sm font-medium">
                            {atendimentos.length === 0 ? 'Nenhum atendimento registrado.' : 'Nenhum resultado para os filtros aplicados.'}
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredAtendimentos.map((atendimento) => {
                      return (
                        <tr key={atendimento.id} className="hover:bg-muted/20 transition-colors group">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex flex-col">
                              <span className="text-sm font-bold text-foreground">
                                {new Date(atendimento.data_hora).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                              </span>
                              <span className="text-[10px] font-medium text-muted-foreground">
                                {new Date(atendimento.data_hora).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm font-bold text-foreground">{atendimento.paciente_nome}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-muted-foreground font-medium">{atendimento.responsavel_nome}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <div className="text-sm font-bold text-foreground">
                                {atendimento.servico_nome}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm font-black text-foreground">
                              R$ {parseFloat(atendimento.valor || 0).toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge className={cn("text-[10px] font-bold shadow-none", getStatusColor(atendimento.status))}>
                              {getStatusText(atendimento.status)}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                className="p-2 text-muted-foreground hover:text-blue-500 hover:bg-blue-500/10 rounded-lg transition-all"
                                onClick={() => {
                                  setAtendimentoSelecionado(atendimento.id as number);
                                  setIsDetalhesOpen(true);
                                }}
                                title="Ver detalhes"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                              <button
                                className="p-2 text-muted-foreground hover:text-emerald-500 hover:bg-emerald-500/10 rounded-lg transition-all"
                                onClick={() => {
                                  setAtendimentoParaEditar(atendimento);
                                  setIsEditModalOpen(true);
                                }}
                                title="Editar atendimento"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                className="p-2 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all"
                                onClick={() => handleDeleteAtendimento(atendimento.id)}
                                title="Deletar atendimento"
                              >
                                <Trash className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <div className="flex justify-between items-center px-2">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            {filteredAtendimentos.length} atendimentos encontrados
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="h-8 rounded-lg text-[10px] font-bold uppercase tracking-widest" disabled>Anterior</Button>
            <Button variant="outline" size="sm" className="h-8 rounded-lg text-[10px] font-bold uppercase tracking-widest" disabled>Próximo</Button>
          </div>
        </div>
      </div>



      {/* Modal de Detalhes do Atendimento */}
      <DetalhesAtendimento
        isOpen={isDetalhesOpen}
        onClose={() => setIsDetalhesOpen(false)}
        atendimentoId={atendimentoSelecionado?.toString() || ''}
      />

      {/* Modal de Edição do Atendimento */}
      <EditarAtendimentoModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        atendimento={atendimentoParaEditar}
        onSave={(atendimentoAtualizado) => {
          toast({
            title: 'Atendimento atualizado',
            description: 'As informações do atendimento foram atualizadas com sucesso.',
          });
          setIsEditModalOpen(false);
          fetchAtendimentos();
        }}
      />
    </VetLayout>
  );
}
