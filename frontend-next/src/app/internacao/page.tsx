'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/auth';
import { VetLayout } from '@/components/ui/VetLayout';
import { useRouter } from 'next/navigation';
import { Plus, Search, Eye, Edit, Trash, Bed, Calendar, Clock, User, Phone, Activity, CheckCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import InternacaoService, { InternacaoEstatisticas } from '@/services/internacao';
import { NovaInternacaoModal } from '@/components/ui/nova-internacao-modal';
import { EvolucaoInternacaoModal } from '@/components/ui/evolucao-internacao-modal';
import { EditarInternacaoModal } from '@/components/ui/editar-internacao-modal';
import { AltaInternacaoModal } from '@/components/ui/alta-internacao-modal';

interface Internacao {
  id: number;
  pet_nome: string;
  tutor_nome: string;
  tutor_telefone: string;
  data_entrada: string;
  data_alta?: string;
  motivo: string;
  status: 'internado' | 'alta' | 'transferido' | 'obito';
  veterinario_nome: string;
  diagnostico?: string;
  observacoes_entrada?: string;
  observacoes_alta?: string;
  valor_diaria: string;
  dias_internado: number;
}

export default function InternacaoPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [internacoes, setInternacoes] = useState<Internacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [estatisticas, setEstatisticas] = useState<InternacaoEstatisticas | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [evolucaoModal, setEvolucaoModal] = useState<{ isOpen: boolean; internacao: Internacao | null }>({
    isOpen: false,
    internacao: null
  });
  const [editarModal, setEditarModal] = useState<{ isOpen: boolean; internacao: Internacao | null }>({
    isOpen: false,
    internacao: null
  });
  const [altaModal, setAltaModal] = useState<{ isOpen: boolean; internacao: Internacao | null }>({
    isOpen: false,
    internacao: null
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      setIsRedirecting(true);
      router.push('/login');
      return;
    }

    if (isAuthenticated) {
      console.log('useEffect executado - carregando dados');
      fetchInternacoes();
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchInternacoes();
    }
  }, [searchTerm, statusFilter]);

  const fetchInternacoes = async () => {
    console.log('fetchInternacoes iniciado');
    try {
      setLoading(true);
      const params: any = {};
      
      if (searchTerm) {
        params.search = searchTerm;
      }
      
      if (statusFilter !== 'todos') {
        params.status = statusFilter;
      }

      console.log('Fazendo requisição com params:', params);
      const [internacoes, stats] = await Promise.all([
        InternacaoService.getInternacoes(params),
        InternacaoService.getEstatisticas()
      ]);
      
      console.log('Dados recebidos da API - internacoes:', internacoes);
      console.log('Dados recebidos da API - stats:', stats);
      setInternacoes(internacoes);
      setEstatisticas(stats);
      console.log('Estado atualizado com', internacoes.length, 'internações');
    } catch (error) {
      console.error('Erro ao carregar internações:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar dados das internações',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
      console.log('Loading finalizado');
    }
  };

  const handleSaveInternacao = async (novaInternacao: any) => {
    try {
      toast({
        title: 'Sucesso',
        description: 'Internação criada com sucesso!',
      });
      
      // Recarregar a lista de internações
      await fetchInternacoes();
    } catch (error) {
      console.error('Erro ao salvar internação:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao criar internação',
        variant: 'destructive',
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'internado':
        return 'bg-yellow-100 text-yellow-800';
      case 'alta':
        return 'bg-green-100 text-green-800';
      case 'transferido':
        return 'bg-blue-100 text-blue-800';
      case 'obito':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'internado':
        return 'Internado';
      case 'alta':
        return 'Alta';
      case 'transferido':
        return 'Transferido';
      case 'obito':
        return 'Óbito';
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

  const filteredInternacoes = internacoes.filter(internacao => {
    const matchesSearch = searchTerm === '' || 
      internacao.pet_nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      internacao.tutor_nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      internacao.motivo.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'todos' || internacao.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (authLoading || isRedirecting) {
    return (
      <VetLayout>
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </VetLayout>
    );
  }

  return (
    <VetLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-orange-500/10 rounded-xl text-orange-500">
              <Bed className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">Internação</h1>
              <p className="text-sm text-muted-foreground">Monitoramento de pacientes internados.</p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-none">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar por paciente ou motivo..."
                className="pl-10 pr-4 py-2 bg-white dark:bg-card border border-border/50 rounded-xl w-full sm:w-64 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <button
              className="flex items-center justify-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl hover:opacity-90 transition-all font-bold text-sm shadow-sm shadow-primary/20"
              onClick={() => setIsModalOpen(true)}
            >
              <Plus className="h-5 w-5" />
              Nova Internação
            </button>
          </div>
        </div>

        {/* Filtros rápidos */}
        <div className="flex flex-wrap items-center gap-4 p-4 bg-secondary/30 rounded-2xl border border-border/30">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent border-none text-sm font-bold text-foreground focus:ring-0 outline-none cursor-pointer"
            >
              <option value="todos">Todos os Status</option>
              <option value="internado">Internado</option>
              <option value="alta">Alta</option>
              <option value="transferido">Transferido</option>
              <option value="obito">Óbito</option>
            </select>
          </div>
        </div>

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
           <div className="p-4 flex items-center gap-4 bg-white dark:bg-card rounded-2xl shadow-sm border border-border/50">
             <div className="p-2.5 bg-orange-500/10 rounded-xl text-orange-500">
               <Bed className="w-5 h-5" />
             </div>
             <div>
               <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">Internados</p>
               <p className="text-xl font-black text-foreground">{estatisticas?.ativas || 0}</p>
             </div>
           </div>

           <div className="p-4 flex items-center gap-4 bg-white dark:bg-card rounded-2xl shadow-sm border border-border/50">
             <div className="p-2.5 bg-emerald-500/10 rounded-xl text-emerald-500">
               <CheckCircle className="w-5 h-5" />
             </div>
             <div>
               <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">Altas Hoje</p>
               <p className="text-xl font-black text-foreground">{estatisticas?.alta_hoje || 0}</p>
             </div>
           </div>

           <div className="p-4 flex items-center gap-4 bg-white dark:bg-card rounded-2xl shadow-sm border border-border/50">
             <div className="p-2.5 bg-blue-500/10 rounded-xl text-blue-500">
               <Activity className="w-5 h-5" />
             </div>
             <div>
               <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">Total Histórico</p>
               <p className="text-xl font-black text-foreground">{estatisticas?.total || 0}</p>
             </div>
           </div>
        </div>

        {/* Tabela de Internações */}
        <div className="bg-white dark:bg-card rounded-2xl shadow-md border border-border/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-muted/30">
                <tr>
                  <th className="px-6 py-4 text-left text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Paciente</th>
                  <th className="px-6 py-4 text-left text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Tutor</th>
                  <th className="px-6 py-4 text-left text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Entrada</th>
                  <th className="px-6 py-4 text-left text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Dias</th>
                  <th className="px-6 py-4 text-left text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Motivo</th>
                  <th className="px-6 py-4 text-left text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4 text-right text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        <span className="text-sm font-medium text-muted-foreground">Carregando internações...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredInternacoes.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <div className="p-4 bg-muted rounded-full">
                          <Bed className="h-8 w-8 opacity-20" />
                        </div>
                        <p className="text-sm font-medium">Nenhuma internação encontrada.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredInternacoes.map((internacao) => (
                    <tr key={internacao.id} className="hover:bg-muted/20 transition-colors group">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-bold text-foreground">{internacao.pet_nome}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-muted-foreground">{internacao.tutor_nome}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-muted-foreground">{formatDate(internacao.data_entrada)}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-bold text-foreground">{internacao.dias_internado} dias</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-muted-foreground line-clamp-1">{internacao.motivo}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-[10px] font-bold rounded-full ${getStatusColor(internacao.status)}`}>
                          {getStatusText(internacao.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setEvolucaoModal({ isOpen: true, internacao })}
                            className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                            title="Evolução"
                          >
                            <Activity className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setEditarModal({ isOpen: true, internacao })}
                            className="p-2 text-muted-foreground hover:text-emerald-500 hover:bg-emerald-500/10 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setAltaModal({ isOpen: true, internacao })}
                            className="p-2 text-muted-foreground hover:text-orange-500 hover:bg-orange-500/10 rounded-lg transition-colors"
                            title="Dar Alta"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <NovaInternacaoModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveInternacao}
      />

      <EvolucaoInternacaoModal
        isOpen={evolucaoModal.isOpen}
        onClose={() => setEvolucaoModal({ isOpen: false, internacao: null })}
        internacao={evolucaoModal.internacao}
      />

      <EditarInternacaoModal
        isOpen={editarModal.isOpen}
        onClose={() => setEditarModal({ isOpen: false, internacao: null })}
        internacao={editarModal.internacao}
        onUpdate={carregarInternacoes}
      />

      <AltaInternacaoModal
        isOpen={altaModal.isOpen}
        onClose={() => setAltaModal({ isOpen: false, internacao: null })}
        internacao={altaModal.internacao}
        onUpdate={carregarInternacoes}
      />
    </VetLayout>
  );
}