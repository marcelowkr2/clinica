'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/auth';
import { VetLayout } from '@/components/ui/VetLayout';
import { useRouter } from 'next/navigation';
import ModulosEstatisticas from '@/components/dashboard/ModulosEstatisticas';
import { Users, Calendar, Stethoscope, DollarSign, Clock, Activity, ArrowUpRight, TrendingUp, HeartPulse } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface DashboardStats {
  total_pacientes: number;
  agendamentos_hoje: number;
  servicos_hoje: number;
  receita_diaria: number;
  receita_agendamentos: number;
  receita_procedimentos: number;
  proximos_agendamentos: Array<{
    id: number;
    paciente_nome: string;
    responsavel_nome: string;
    responsavel_sobrenome: string;
    data_hora: string;
    status: string;
    servico_nome: string;
  }>;
  atividades_recentes: Array<{
    id: number;
    tipo: string;
    descricao: string;
    data_hora: string;
  }>;
}

export default function DashboardPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch('http://localhost:8001/api/dashboard/stats/');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      } else {
        console.error('Erro ao buscar estatísticas:', response.statusText);
      }
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && !isRedirecting) {
      if (!isAuthenticated) {
        setIsRedirecting(true);
        router.push('/login');
        return;
      } else {
        fetchDashboardStats();
      }
    }
  }, [isAuthenticated, authLoading, router, isRedirecting]);

  if (authLoading || isRedirecting || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <VetLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Bem-vindo de volta, {user?.first_name || 'Médico(a)'}. Aqui está o resumo de hoje.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="overflow-hidden border-none shadow-md bg-white dark:bg-card">
            <CardContent className="p-0">
              <div className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold uppercase tracking-wider text-muted-foreground/70">Pacientes</p>
                  <h3 className="text-3xl font-black mt-1">{stats?.total_pacientes || 0}</h3>
                  <div className="flex items-center mt-2 text-xs font-bold text-emerald-500">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    <span>+12% este mês</span>
                  </div>
                </div>
                <div className="h-14 w-14 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500 border border-blue-500/20">
                  <Users className="h-7 w-7" />
                </div>
              </div>
              <div className="h-1 w-full bg-blue-500/10">
                <div className="h-full bg-blue-500 w-[65%]"></div>
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden border-none shadow-md bg-white dark:bg-card">
            <CardContent className="p-0">
              <div className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold uppercase tracking-wider text-muted-foreground/70">Agendamentos</p>
                  <h3 className="text-3xl font-black mt-1">{stats?.agendamentos_hoje || 0}</h3>
                  <div className="flex items-center mt-2 text-xs font-bold text-amber-500">
                    <Clock className="h-3 w-3 mr-1" />
                    <span>Próximo em 15 min</span>
                  </div>
                </div>
                <div className="h-14 w-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500 border border-emerald-500/20">
                  <Calendar className="h-7 w-7" />
                </div>
              </div>
              <div className="h-1 w-full bg-emerald-500/10">
                <div className="h-full bg-emerald-500 w-[40%]"></div>
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden border-none shadow-md bg-white dark:bg-card">
            <CardContent className="p-0">
              <div className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold uppercase tracking-wider text-muted-foreground/70">Consultas</p>
                  <h3 className="text-3xl font-black mt-1">{stats?.servicos_hoje || 0}</h3>
                  <div className="flex items-center mt-2 text-xs font-bold text-rose-500">
                    <Activity className="h-3 w-3 mr-1" />
                    <span>8 concluídas hoje</span>
                  </div>
                </div>
                <div className="h-14 w-14 bg-rose-500/10 rounded-2xl flex items-center justify-center text-rose-500 border border-rose-500/20">
                  <Stethoscope className="h-7 w-7" />
                </div>
              </div>
              <div className="h-1 w-full bg-rose-500/10">
                <div className="h-full bg-rose-500 w-[80%]"></div>
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden border-none shadow-md bg-white dark:bg-card">
            <CardContent className="p-0">
              <div className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold uppercase tracking-wider text-muted-foreground/70">Faturamento</p>
                  <h3 className="text-2xl font-black mt-1">R$ {stats?.receita_diaria?.toFixed(2).replace('.', ',') || '0,00'}</h3>
                  <div className="flex items-center mt-2 text-xs font-bold text-emerald-500">
                    <ArrowUpRight className="h-3 w-3 mr-1" />
                    <span>Meta diária 75%</span>
                  </div>
                </div>
                <div className="h-14 w-14 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500 border border-amber-500/20">
                  <DollarSign className="h-7 w-7" />
                </div>
              </div>
              <div className="h-1 w-full bg-amber-500/10">
                <div className="h-full bg-amber-500 w-[75%]"></div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detalhamento do Faturamento */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-none shadow-sm bg-white dark:bg-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Faturamento Consultas</CardTitle>
              <Stethoscope className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-black text-blue-600 dark:text-blue-400">
                R$ {stats?.receita_agendamentos?.toFixed(2).replace('.', ',') || '0,00'}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Receita de consultas hoje</p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-white dark:bg-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Faturamento Procedimentos</CardTitle>
              <HeartPulse className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-black text-amber-600 dark:text-amber-400">
                R$ {stats?.receita_procedimentos?.toFixed(2).replace('.', ',') || '0,00'}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Receita de procedimentos hoje</p>
            </CardContent>
          </Card>
        </div>

        {/* Estatísticas dos Novos Módulos */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold tracking-tight text-foreground">Visão Geral da Clínica</h2>
            <Badge variant="secondary" className="font-bold">Tempo Real</Badge>
          </div>
          <ModulosEstatisticas />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="border-none shadow-md bg-white dark:bg-card">
            <CardHeader className="flex flex-row items-center justify-between border-b border-border/50 pb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-500">
                  <Calendar className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-lg font-bold">Próximos Agendamentos</CardTitle>
                  <p className="text-xs text-muted-foreground">Consultas programadas para hoje</p>
                </div>
              </div>
              <Badge variant="outline" className="text-blue-500 border-blue-500/20">Hoje</Badge>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-muted/30">
                    <tr>
                      <th className="px-6 py-3 text-left text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Paciente</th>
                      <th className="px-6 py-3 text-left text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Horário</th>
                      <th className="px-6 py-3 text-left text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {stats?.proximos_agendamentos && stats.proximos_agendamentos.length > 0 ? (
                      stats.proximos_agendamentos.map((agendamento) => (
                        <tr key={agendamento.id} className="hover:bg-muted/20 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex flex-col">
                              <span className="text-sm font-bold text-foreground">{agendamento.paciente_nome}</span>
                              <span className="text-xs text-muted-foreground">
                                {agendamento.responsavel_nome} {agendamento.responsavel_sobrenome}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                              <Clock className="h-3 w-3 text-muted-foreground" />
                              {new Date(agendamento.data_hora).toLocaleTimeString('pt-BR', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge className={
                              agendamento.status === 'confirmado'
                                ? 'bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-emerald-500/20'
                                : 'bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 border-amber-500/20'
                            }>
                              {agendamento.servico_nome}
                            </Badge>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td className="px-6 py-12 text-center" colSpan={3}>
                          <div className="flex flex-col items-center justify-center text-muted-foreground">
                            <div className="h-12 w-12 bg-muted rounded-full flex items-center justify-center mb-3">
                              <Users className="h-6 w-6 opacity-20" />
                            </div>
                            <p className="text-sm font-medium">Nenhum agendamento para hoje</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md bg-white dark:bg-card">
            <CardHeader className="flex flex-row items-center justify-between border-b border-border/50 pb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-rose-500/10 rounded-xl flex items-center justify-center text-rose-500">
                  <Activity className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-lg font-bold">Atividades Recentes</CardTitle>
                  <p className="text-xs text-muted-foreground">Log de ações no sistema</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                {stats?.atividades_recentes && stats.atividades_recentes.length > 0 ? (
                  stats.atividades_recentes.map((atividade, idx) => (
                    <div key={atividade.id} className="relative flex items-start gap-4">
                      {idx !== stats.atividades_recentes.length - 1 && (
                        <span className="absolute left-[19px] top-10 h-full w-px bg-border/50"></span>
                      )}
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 border-2 border-background shadow-sm ${
                        atividade.tipo === 'agendamento' ? 'bg-blue-500 text-white' : 'bg-emerald-500 text-white'
                      }`}>
                        {atividade.tipo === 'agendamento' ? <Calendar className="h-4 w-4" /> : <Users className="h-4 w-4" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-foreground">
                          {atividade.descricao}
                        </p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                          <Clock className="h-3 w-3" />
                          {new Date(atividade.data_hora).toLocaleString('pt-BR', {
                            day: '2-digit',
                            month: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center text-muted-foreground py-12">
                    <div className="h-12 w-12 bg-muted rounded-full flex items-center justify-center mb-3">
                      <Activity className="h-6 w-6 opacity-20" />
                    </div>
                    <p className="text-sm font-medium">Sem atividades recentes</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </VetLayout>
  );
}
