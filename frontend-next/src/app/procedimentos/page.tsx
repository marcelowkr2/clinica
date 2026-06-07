'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, Clock, User, ClipboardList, Plus, Search, Filter, Eye, Edit, Trash, Star, Phone, Check, X } from 'lucide-react';
import { VetLayout } from '@/components/ui/VetLayout';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/auth';
import procedimentosService, { Procedimento } from '@/services/procedimentos';
import AgendarProcedimentoModal from '@/components/modals/agendar-procedimento-modal';
import DetalhesProcedimentoModal from '@/components/modals/detalhes-procedimento-modal';
import EditarProcedimentoModal from '@/components/modals/editar-procedimento-modal';

export default function ProcedimentosPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [procedimentos, setProcedimentos] = useState<Procedimento[]>([]);
  
  // Estados dos modais
  const [showAgendarModal, setShowAgendarModal] = useState(false);
  const [showDetalhesModal, setShowDetalhesModal] = useState(false);
  const [showEditarModal, setShowEditarModal] = useState(false);
  const [selectedProcedimentoId, setSelectedProcedimentoId] = useState<number | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }

    if (isAuthenticated) {
      loadProcedimentos();
    }
  }, [isAuthenticated, authLoading, router]);

  const loadProcedimentos = async () => {
    setLoading(true);
    try {
      const response = await procedimentosService.getProcedimentos();
      
      const processedData = Array.isArray(response) ? response.map(item => ({
        ...item,
        servicos_nomes: Array.isArray(item.servicos_nomes) ? item.servicos_nomes : [],
        valor_total: item.valor_total || 0
      })) : [];
      
      setProcedimentos(processedData);
    } catch (error) {
      console.error('Erro ao carregar procedimentos:', error);
      setProcedimentos([]);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar lista de procedimentos',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerDetalhes = (id: number) => {
    setSelectedProcedimentoId(id);
    setShowDetalhesModal(true);
  };

  const handleEditar = (id: number) => {
    setSelectedProcedimentoId(id);
    setShowEditarModal(true);
  };

  const handleIniciarServico = async (id: number) => {
    try {
      const procedimentoAtual = procedimentos.find(p => p.id === id);
      if (!procedimentoAtual) {
        throw new Error('Procedimento não encontrado');
      }

      const updateData = {
        paciente: procedimentoAtual.paciente,
        servicos: procedimentoAtual.servicos,
        data_agendamento: procedimentoAtual.data_agendamento,
        profissional: procedimentoAtual.profissional_dados?.id || 
                     (typeof procedimentoAtual.profissional === 'object' 
                       ? procedimentoAtual.profissional.id 
                       : procedimentoAtual.profissional),
        observacoes: procedimentoAtual.observacoes || '',
        status: 'em_andamento' as const,
        data_realizacao: new Date().toISOString()
      };

      await procedimentosService.updateProcedimento(id, updateData);
      toast({
        title: 'Sucesso',
        description: 'Procedimento iniciado com sucesso',
      });
      loadProcedimentos();
    } catch (error) {
      console.error('Erro ao iniciar procedimento:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao iniciar procedimento',
        variant: 'destructive'
      });
    }
  };

  const handleFinalizarServico = async (id: number) => {
    try {
      const procedimentoAtual = procedimentos.find(p => p.id === id);
      if (!procedimentoAtual) {
        throw new Error('Procedimento não encontrado');
      }

      const updateData = {
        paciente: procedimentoAtual.paciente,
        servicos: procedimentoAtual.servicos,
        data_agendamento: procedimentoAtual.data_agendamento,
        profissional: procedimentoAtual.profissional_dados?.id || 
                     (typeof procedimentoAtual.profissional === 'object' 
                       ? procedimentoAtual.profissional.id 
                       : procedimentoAtual.profissional),
        observacoes: procedimentoAtual.observacoes || '',
        status: 'concluido' as const,
        data_realizacao: new Date().toISOString()
      };

      await procedimentosService.updateProcedimento(id, updateData);
      toast({
        title: 'Sucesso',
        description: 'Procedimento finalizado com sucesso',
      });
      loadProcedimentos();
    } catch (error) {
      console.error('Erro ao finalizar procedimento:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao finalizar procedimento',
        variant: 'destructive'
      });
    }
  };

  const handleExcluir = async (id: number) => {
    if (confirm('Tem certeza que deseja excluir este procedimento?')) {
      try {
        await procedimentosService.deleteProcedimento(id);
        toast({
          title: 'Sucesso',
          description: 'Procedimento excluído com sucesso',
        });
        loadProcedimentos();
      } catch (error) {
        console.error('Erro ao excluir procedimento:', error);
        toast({
          title: 'Erro',
          description: 'Erro ao excluir procedimento',
          variant: 'destructive'
        });
      }
    }
  };

  const filteredProcedimentos = procedimentos.filter(item => {
    const matchesSearch = item.paciente_nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.responsavel_nome.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'todos' || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (authLoading) return null;

  return (
    <VetLayout>
      <div className="p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Procedimentos</h1>
            <p className="text-muted-foreground">Gerencie agendamentos e realizações de procedimentos.</p>
          </div>
          <button 
            onClick={() => setShowAgendarModal(true)}
            className="flex items-center justify-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-transform"
          >
            <Plus className="h-5 w-5" />
            Novo Procedimento
          </button>
        </div>

        {/* Filtros */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-card p-4 rounded-2xl border border-border/50 shadow-sm">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Buscar por paciente ou responsável..."
              className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <select 
              className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all appearance-none"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="todos">Todos os Status</option>
              <option value="agendado">Agendado</option>
              <option value="em_andamento">Em Andamento</option>
              <option value="concluido">Concluído</option>
              <option value="cancelado">Cancelado</option>
            </select>
          </div>
        </div>

        {/* Lista de Procedimentos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full flex flex-col items-center justify-center py-20 gap-4">
              <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              <p className="text-muted-foreground font-medium">Carregando procedimentos...</p>
            </div>
          ) : filteredProcedimentos.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center py-20 bg-card rounded-3xl border border-dashed border-border/50">
              <ClipboardList className="h-16 w-16 text-muted-foreground/20 mb-4" />
              <p className="text-lg font-bold text-muted-foreground">Nenhum procedimento encontrado</p>
              <p className="text-sm text-muted-foreground/60">Tente ajustar seus filtros de busca</p>
            </div>
          ) : (
            filteredProcedimentos.map((procedimento) => (
              <div key={procedimento.id} className="group bg-card rounded-3xl border border-border/50 shadow-sm hover:shadow-xl hover:border-primary/20 transition-all duration-300 overflow-hidden">
                {/* Header do Card */}
                <div className="p-5 border-b border-border/30 bg-muted/20">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary border border-primary/20">
                        <User className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="font-bold text-foreground leading-tight">{procedimento.paciente_nome}</h3>
                        <p className="text-xs text-muted-foreground font-medium">{procedimento.responsavel_nome}</p>
                      </div>
                    </div>
                    <span className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm",
                      procedimento.status === 'agendado' ? "bg-blue-500/10 text-blue-600 border border-blue-500/20" :
                      procedimento.status === 'em_andamento' ? "bg-amber-500/10 text-amber-600 border border-amber-500/20" :
                      procedimento.status === 'concluido' ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20" :
                      "bg-rose-500/10 text-rose-600 border border-rose-500/20"
                    )}>
                      {procedimento.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                {/* Corpo do Card */}
                <div className="p-5 space-y-4">
                  <div className="flex flex-wrap gap-1.5">
                    {procedimento.servicos_nomes.map((servico, idx) => (
                      <span key={idx} className="px-2.5 py-1 bg-secondary text-secondary-foreground rounded-lg text-[10px] font-bold border border-border/50">
                        {servico}
                      </span>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-4 py-2 border-y border-border/30">
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1">
                        <Calendar className="h-3 w-3" /> Data
                      </p>
                      <p className="text-sm font-bold text-foreground">
                        {new Date(procedimento.data_agendamento).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1">
                        <Clock className="h-3 w-3" /> Horário
                      </p>
                      <p className="text-sm font-bold text-foreground">
                        {new Date(procedimento.data_agendamento).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Valor Total</p>
                      <p className="text-lg font-black text-primary">R$ {parseFloat(procedimento.valor_total.toString()).toFixed(2).replace('.', ',')}</p>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => handleVerDetalhes(procedimento.id)} className="p-2 text-muted-foreground hover:bg-secondary rounded-xl transition-colors" title="Ver Detalhes"><Eye className="h-4 w-4" /></button>
                      <button onClick={() => handleEditar(procedimento.id)} className="p-2 text-muted-foreground hover:bg-secondary rounded-xl transition-colors" title="Editar"><Edit className="h-4 w-4" /></button>
                      <button onClick={() => handleExcluir(procedimento.id)} className="p-2 text-muted-foreground hover:bg-rose-500/10 hover:text-rose-500 rounded-xl transition-colors" title="Excluir"><Trash className="h-4 w-4" /></button>
                    </div>
                  </div>
                </div>

                {/* Footer do Card - Ações de Status */}
                <div className="p-3 bg-muted/10 border-t border-border/30">
                  {procedimento.status === 'agendado' && (
                    <button 
                      onClick={() => handleIniciarServico(procedimento.id)}
                      className="w-full flex items-center justify-center gap-2 py-2 bg-blue-500 text-white rounded-xl text-xs font-bold hover:bg-blue-600 transition-colors shadow-sm"
                    >
                      <Check className="h-4 w-4" /> Iniciar Procedimento
                    </button>
                  )}
                  {procedimento.status === 'em_andamento' && (
                    <button 
                      onClick={() => handleFinalizarServico(procedimento.id)}
                      className="w-full flex items-center justify-center gap-2 py-2 bg-emerald-500 text-white rounded-xl text-xs font-bold hover:bg-emerald-600 transition-colors shadow-sm"
                    >
                      <Check className="h-4 w-4" /> Finalizar Procedimento
                    </button>
                  )}
                  {procedimento.status === 'concluido' && (
                    <div className="w-full flex items-center justify-center gap-2 py-2 text-emerald-600 bg-emerald-500/5 rounded-xl text-xs font-bold">
                      <Check className="h-4 w-4" /> Procedimento Concluído
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modais */}
      <AgendarProcedimentoModal 
        isOpen={showAgendarModal} 
        onClose={() => setShowAgendarModal(false)} 
        onSuccess={loadProcedimentos}
      />
      
      {selectedProcedimentoId && (
        <>
          <DetalhesProcedimentoModal 
            isOpen={showDetalhesModal} 
            onClose={() => setShowDetalhesModal(false)} 
            id={selectedProcedimentoId}
          />
          <EditarProcedimentoModal 
            isOpen={showEditarModal} 
            onClose={() => setShowEditarModal(false)} 
            id={selectedProcedimentoId}
            onSuccess={loadProcedimentos}
          />
        </>
      )}
    </VetLayout>
  );
}
