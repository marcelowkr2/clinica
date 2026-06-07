'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/auth';
import { VetLayout } from '@/components/ui/VetLayout';
import { useRouter } from 'next/navigation';
import { Plus, Search, Eye, Edit, Trash, TestTube, Calendar, Clock, User, FileText, X, Filter, Activity } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { NovoExameModal } from '@/components/ui/novo-exame-modal';
import { DetalhesExameModal } from '@/components/ui/detalhes-exame-modal';
import { EditarExameModal } from '@/components/ui/editar-exame-modal';
import { ResultadoExameModal } from '@/components/ui/resultado-exame-modal';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

import ExamesService from '@/services/exames';

interface Exame {
  id: number;
  paciente_nome: string;
  responsavel_nome: string;
  tipo_exame_nome: string;
  data_solicitacao: string;
  data_coleta?: string;
  data_resultado?: string;
  status: 'solicitado' | 'coletado' | 'processando' | 'concluido' | 'cancelado';
  medico_nome: string;
  observacoes_resultado?: string;
  resultado?: string;
  prioridade?: string;
}

export default function ExamesPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [exames, setExames] = useState<Exame[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNovoExameModal, setShowNovoExameModal] = useState(false);
  const [showDetalhesModal, setShowDetalhesModal] = useState(false);
  const [showEditarModal, setShowEditarModal] = useState(false);
  const [showResultadoModal, setShowResultadoModal] = useState(false);
  const [selectedExame, setSelectedExame] = useState<Exame | null>(null);

  const fetchExames = async () => {
    try {
      setLoading(true);
      const data = await ExamesService.getExames();
      setExames(data);
    } catch (error) {
      console.error('Erro ao carregar exames:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os exames.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      setIsRedirecting(true);
      router.push('/login');
      return;
    }

    if (isAuthenticated) {
      fetchExames();
    }
  }, [isAuthenticated, authLoading, router]);

  const fetchExames = async () => {
    try {
      setLoading(true);
      const data = await ExamesService.getExames();
      setExames(data);
    } catch (error) {
      console.error('Erro ao carregar exames:', error);
      // Fallback para dados simulados em caso de erro
      setExames(dadosSimulados);
      toast({
        title: 'Aviso',
        description: 'Usando dados simulados - API não disponível',
        variant: 'default',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleNovoExame = async (dadosExame: any) => {
    try {
      const novoExame = await ExamesService.createExame(dadosExame);
      setExames(prev => [novoExame, ...prev]);
      setShowNovoExameModal(false);
      toast({
        title: 'Sucesso',
        description: 'Exame solicitado com sucesso',
      });
    } catch (error) {
      console.error('Erro ao criar exame:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao solicitar exame',
        variant: 'destructive',
      });
    }
  };

  const handleEditarExame = async (dadosExame: any) => {
    try {
      const exameAtualizado = await ExamesService.updateExame(selectedExame!.id, dadosExame);
      setExames(prev => prev.map(e => e.id === selectedExame!.id ? exameAtualizado : e));
      setShowEditarModal(false);
      setSelectedExame(null);
      toast({
        title: 'Sucesso',
        description: 'Exame atualizado com sucesso',
      });
    } catch (error) {
      console.error('Erro ao atualizar exame:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao atualizar exame',
        variant: 'destructive',
      });
    }
  };

  const handleCancelarExame = async (exameId: number) => {
    try {
      await ExamesService.updateExame(exameId, { status: 'cancelado' });
      setExames(prev => prev.map(e => e.id === exameId ? { ...e, status: 'cancelado' as const } : e));
      toast({
        title: 'Sucesso',
        description: 'Exame cancelado com sucesso',
      });
    } catch (error) {
      console.error('Erro ao cancelar exame:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao cancelar exame',
        variant: 'destructive',
      });
    }
  };

  const openDetalhesModal = (exame: Exame) => {
    setSelectedExame(exame);
    setShowDetalhesModal(true);
  };

  const openEditarModal = (exame: Exame) => {
    setSelectedExame(exame);
    setShowEditarModal(true);
  };

  const openResultadoModal = (exame: Exame) => {
    setSelectedExame(exame);
    setShowResultadoModal(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'solicitado':
        return 'bg-yellow-100 text-yellow-800';
      case 'coletado':
        return 'bg-blue-100 text-blue-800';
      case 'processando':
        return 'bg-purple-100 text-purple-800';
      case 'concluido':
        return 'bg-green-100 text-green-800';
      case 'cancelado':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'solicitado':
        return 'Solicitado';
      case 'coletado':
        return 'Coletado';
      case 'processando':
        return 'Processando';
      case 'concluido':
        return 'Concluído';
      case 'cancelado':
        return 'Cancelado';
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredExames = exames.filter(exame => {
    const matchesSearch = searchTerm === '' ||
      exame.paciente_nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exame.responsavel_nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exame.tipo_exame_nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exame.medico_nome.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'todos' || exame.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  if (authLoading || isRedirecting) {
    return (
      <VetLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-800"></div>
        </div>
      </VetLayout>
    );
  }

  return (
    <VetLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-cyan-500/10 rounded-xl text-cyan-500">
              <TestTube className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">Exames</h1>
              <p className="text-sm text-muted-foreground">Solicitações e resultados laboratoriais.</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-none">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar exames..."
                className="pl-10 pr-4 py-2 bg-white dark:bg-card border border-border/50 rounded-xl w-full sm:w-64 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <button
              className="flex items-center justify-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl hover:opacity-90 transition-all font-bold text-sm shadow-sm shadow-primary/20"
              onClick={() => setShowNovoExameModal(true)}
            >
              <Plus className="h-5 w-5" />
              Solicitar Exame
            </button>
          </div>
        </div>

        {/* Filtros */}
        <div className="flex flex-wrap items-center gap-4 p-4 bg-secondary/30 rounded-2xl border border-border/30">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Status:</span>
            <select
              className="bg-transparent border-none text-sm font-bold text-foreground focus:ring-0 outline-none cursor-pointer"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="todos">Todos os Status</option>
              <option value="solicitado">Solicitado</option>
              <option value="coletado">Coletado</option>
              <option value="processando">Processando</option>
              <option value="concluido">Concluído</option>
              <option value="cancelado">Cancelado</option>
            </select>
          </div>
        </div>

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="border-none shadow-sm bg-white dark:bg-card">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-2.5 bg-yellow-500/10 rounded-xl text-yellow-500">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">Solicitados</p>
                <p className="text-xl font-black text-foreground">
                  {exames.filter(e => e.status === 'solicitado').length}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-white dark:bg-card">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-2.5 bg-purple-500/10 rounded-xl text-purple-500">
                <TestTube className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">Processando</p>
                <p className="text-xl font-black text-foreground">
                  {exames.filter(e => e.status === 'processando' || e.status === 'coletado').length}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-white dark:bg-card">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-2.5 bg-emerald-500/10 rounded-xl text-emerald-500">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">Concluídos</p>
                <p className="text-xl font-black text-foreground">
                  {exames.filter(e => e.status === 'concluido').length}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-white dark:bg-card">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-2.5 bg-cyan-500/10 rounded-xl text-cyan-500">
                <Activity className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">Total</p>
                <p className="text-xl font-black text-foreground">{exames.length}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabela de Exames */}
        <Card className="border-none shadow-md bg-white dark:bg-card overflow-hidden">
          <div className="overflow-x-auto scrollbar-hide">
            <table className="min-w-full">
              <thead className="bg-muted/30">
                <tr>
                  <th className="px-6 py-4 text-left text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Paciente</th>
                  <th className="px-6 py-4 text-left text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Exame</th>
                  <th className="px-6 py-4 text-left text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Solicitação</th>
                  <th className="px-6 py-4 text-left text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Médico</th>
                  <th className="px-6 py-4 text-left text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4 text-right text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        <span className="text-sm font-medium text-muted-foreground">Buscando exames...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredExames.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <div className="p-4 bg-muted rounded-full">
                          <TestTube className="h-8 w-8 opacity-20" />
                        </div>
                        <p className="text-sm font-medium">Nenhum exame encontrado.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredExames.map((exame) => (
                    <tr key={exame.id} className="hover:bg-muted/20 transition-colors group">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-foreground">{exame.paciente_nome}</span>
                          <span className="text-[10px] font-medium text-muted-foreground">{exame.responsavel_nome}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-bold text-foreground">{exame.tipo_exame_nome}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-sm text-foreground font-medium">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          {formatDate(exame.data_solicitacao).split(',')[0]}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-muted-foreground font-medium">{exame.medico_nome}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge className={cn("text-[10px] font-bold shadow-none", getStatusColor(exame.status))}>
                          {getStatusText(exame.status)}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            className="p-2 text-muted-foreground hover:text-blue-500 hover:bg-blue-500/10 rounded-lg transition-all"
                            title="Ver detalhes"
                            onClick={() => openDetalhesModal(exame)}
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            className="p-2 text-muted-foreground hover:text-emerald-500 hover:bg-emerald-500/10 rounded-lg transition-all"
                            title="Editar"
                            onClick={() => openEditarModal(exame)}
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          {exame.status === 'concluido' && (
                            <button
                              className="p-2 text-muted-foreground hover:text-purple-500 hover:bg-purple-500/10 rounded-lg transition-all"
                              title="Ver resultado"
                              onClick={() => openResultadoModal(exame)}
                            >
                              <FileText className="h-4 w-4" />
                            </button>
                          )}
                          {exame.status !== 'cancelado' && exame.status !== 'concluido' && (
                            <button
                              className="p-2 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all"
                              title="Cancelar"
                              onClick={() => {
                                if (window.confirm('Tem certeza que deseja cancelar este exame?')) {
                                  handleCancelarExame(exame.id);
                                }
                              }}
                            >
                              <Trash className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

        {/* Modais */}
        {showNovoExameModal && (
          <NovoExameModal
            isOpen={showNovoExameModal}
            onClose={() => setShowNovoExameModal(false)}
            onSubmit={handleNovoExame}
          />
        )}

        {showDetalhesModal && selectedExame && (
          <DetalhesExameModal
            isOpen={showDetalhesModal}
            onClose={() => {
              setShowDetalhesModal(false);
              setSelectedExame(null);
            }}
            exame={selectedExame}
          />
        )}

        {showEditarModal && selectedExame && (
           <EditarExameModal
             isOpen={showEditarModal}
             onClose={() => {
               setShowEditarModal(false);
               setSelectedExame(null);
             }}
             exame={selectedExame}
             onSubmit={handleEditarExame}
           />
         )}

        {showResultadoModal && selectedExame && (
          <ResultadoExameModal
            isOpen={showResultadoModal}
            onClose={() => {
              setShowResultadoModal(false);
              setSelectedExame(null);
            }}
            exame={selectedExame}
          />
        )}
    </VetLayout>
  );
}
