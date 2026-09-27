'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/auth';
import { VetLayout } from '@/components/ui/VetLayout';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Activity,
  Search,
  Plus,
  Calendar,
  User,
  Stethoscope,
  DollarSign,
  Clock,
  Bed,
  Phone,
  Edit,
  CheckCircle
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import InternacaoService, { Internacao, InternacaoEstatisticas } from '@/services/internacao';
import { NovaInternacaoModal } from '@/components/ui/nova-internacao-modal';
import { EvolucaoInternacaoModal } from '@/components/ui/evolucao-internacao-modal';
import { EditarInternacaoModal } from '@/components/ui/editar-internacao-modal';
import { AltaInternacaoModal } from '@/components/ui/alta-internacao-modal';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const InternacaoPage: React.FC = () => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [internacoes, setInternacoes] = useState<Internacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('internado');
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
    console.log('Dashboard Internacao - useEffect executado:', { isAuthenticated, authLoading });
    if (!authLoading && !isAuthenticated) {
      setIsRedirecting(true);
      router.push('/login');
      return;
    }

    if (isAuthenticated) {
      carregarInternacoes();
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (isAuthenticated) {
      carregarInternacoes();
    }
  }, [searchTerm, statusFilter]);

  const carregarInternacoes = async () => {
    console.log('Dashboard - carregarInternacoes iniciada');
    try {
      setLoading(true);
      const params: any = {};

      if (searchTerm) {
        params.search = searchTerm;
      }

      if (statusFilter && statusFilter !== 'todos') {
        params.status = statusFilter;
      }

      const [internacoes, stats] = await Promise.all([
        InternacaoService.getInternacoes(params),
        InternacaoService.getEstatisticas()
      ]);

      setInternacoes(internacoes);
      setEstatisticas(stats);
    } catch (error) {
      console.error('Erro ao carregar internações:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar dados das internações',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveInternacao = async (novaInternacao: any) => {
    try {
      toast({
        title: 'Sucesso',
        description: 'Internação criada com sucesso!',
      });

      // Recarregar a lista de internações
      await carregarInternacoes();
    } catch (error) {
      console.error('Erro ao salvar internação:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao criar internação',
        variant: 'destructive',
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'internado':
        return (
          <Badge variant="default" className="bg-blue-600">
            Internado
          </Badge>
        );
      case 'alta':
        return (
          <Badge variant="default" className="bg-green-600">
            Alta
          </Badge>
        );
      case 'transferido':
        return (
          <Badge variant="default" className="bg-yellow-600">
            Transferido
          </Badge>
        );
      case 'obito':
        return (
          <Badge variant="destructive">
            Óbito
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatarData = (data: string) => {
    try {
      return format(new Date(data), 'dd/MM/yyyy HH:mm', { locale: ptBR });
    } catch {
      return data;
    }
  };

  const formatarDataSimples = (data: string) => {
    try {
      return format(new Date(data), 'dd/MM/yyyy', { locale: ptBR });
    } catch {
      return data;
    }
  };

  const filteredInternacoes = internacoes.filter(internacao => {
    const matchesSearch = !searchTerm ||
      internacao.paciente_nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      internacao.responsavel_nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      internacao.medico_nome.toLowerCase().includes(searchTerm.toLowerCase());

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
            <button
              className="flex items-center justify-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl hover:opacity-90 transition-all font-bold text-sm shadow-sm shadow-primary/20"
              onClick={() => setIsModalOpen(true)}
            >
              <Plus className="h-5 w-5" />
              Nova Internação
            </button>
          </div>
        </div>

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-none shadow-sm bg-white dark:bg-card">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-2.5 bg-orange-500/10 rounded-xl text-orange-500">
                <Bed className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">Internados</p>
                <p className="text-xl font-black text-foreground">{estatisticas?.ativas || 0}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-white dark:bg-card">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-2.5 bg-emerald-500/10 rounded-xl text-emerald-500">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">Altas Hoje</p>
                <p className="text-xl font-black text-foreground">{estatisticas?.alta_hoje || 0}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-white dark:bg-card">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-2.5 bg-blue-500/10 rounded-xl text-blue-500">
                <User className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">Total Histórico</p>
                <p className="text-xl font-black text-foreground">{estatisticas?.total || 0}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros e Tabela */}
        <Card className="border-none shadow-md bg-white dark:bg-card overflow-hidden">
          <div className="p-4 border-b border-border/50 bg-muted/20">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por paciente, responsável ou médico..."
                  className="pl-10 rounded-xl border-border/50"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-white dark:bg-background border border-border/50 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                >
                  <option value="todos">Todos os status</option>
                  <option value="internado">Internado</option>
                  <option value="alta">Alta</option>
                  <option value="transferido">Transferido</option>
                  <option value="obito">Óbito</option>
                </select>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto scrollbar-hide">
            <table className="min-w-full">
              <thead className="bg-muted/30">
                <tr>
                  <th className="px-6 py-4 text-left text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Paciente</th>
                  <th className="px-6 py-4 text-left text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Responsável</th>
                  <th className="px-6 py-4 text-left text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Entrada</th>
                  <th className="px-6 py-4 text-left text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4 text-right text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-20 text-center text-muted-foreground">
                      Carregando...
                    </td>
                  </tr>
                ) : filteredInternacoes.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-20 text-center text-muted-foreground">
                      Nenhuma internação encontrada.
                    </td>
                  </tr>
                ) : (
                  filteredInternacoes.map((internacao) => (
                    <tr key={internacao.id} className="hover:bg-muted/20 transition-colors group">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-bold text-foreground">{internacao.paciente_nome}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-muted-foreground">{internacao.responsavel_nome}</div>
                        <div className="text-[10px] text-muted-foreground/70 flex items-center">
                          <Phone className="h-3 w-3 mr-1" />
                          {internacao.responsavel_telefone}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-muted-foreground flex items-center">
                          <Calendar className="h-4 w-4 mr-1 text-muted-foreground/50" />
                          {formatarData(internacao.data_entrada)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(internacao.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setEvolucaoModal({ isOpen: true, internacao })}
                            className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                            title="Ver Evolução"
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
        </Card>

        {/* Modal de Nova Internação */}
        <NovaInternacaoModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveInternacao}
        />

        {/* Modais */}
        {evolucaoModal.isOpen && (
          <EvolucaoInternacaoModal
            internacao={evolucaoModal.internacao!}
            isOpen={evolucaoModal.isOpen}
            onClose={() => setEvolucaoModal({ isOpen: false, internacao: null })}
          />
        )}

        {editarModal.isOpen && (
          <EditarInternacaoModal
            internacao={editarModal.internacao!}
            isOpen={editarModal.isOpen}
            onClose={() => setEditarModal({ isOpen: false, internacao: null })}
            onUpdate={carregarInternacoes}
          />
        )}

        {altaModal.isOpen && (
          <AltaInternacaoModal
            internacao={altaModal.internacao!}
            isOpen={altaModal.isOpen}
            onClose={() => setAltaModal({ isOpen: false, internacao: null })}
            onUpdate={carregarInternacoes}
          />
        )}
      </div>
    </VetLayout>
  );
};

export default InternacaoPage;
