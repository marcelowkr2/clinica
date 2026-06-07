'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Activity,
  Calendar,
  FileText,
  Scissors,
  TestTube,
  Pill,
  Syringe,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';
import InternacaoService from '@/services/internacao';
import ExamesService from '@/services/exames';
import ReceitasService from '@/services/receitas';
import ProcedimentosService from '@/services/procedimentos';
import PetsService from '@/services/pets';

interface EstatisticasModulos {
  internacao: {
    total: number;
    ativas: number;
    alta_hoje: number;
    receita_ativa: number;
  };
  exames: {
    total: number;
    pendentes: number;
    coletados: number;
    finalizados: number;
  };
  receitas: {
    total: number;
    ativas: number;
    finalizadas: number;
    valor_total: number;
  };
  procedimentos: {
    total: number;
    agendados: number;
    finalizados: number;
    receita: number;
  };
  vacinas: {
    total: number;
    aplicadas: number;
    agendadas: number;
    receita: number;
  };
}

const ModulosEstatisticas: React.FC = () => {
  const [estatisticas, setEstatisticas] = useState<EstatisticasModulos | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    carregarEstatisticas();
  }, []);

  const carregarEstatisticas = async () => {
    try {
      setLoading(true);
      setError(null);

      const [internacao, exames, receitas, procedimentos, vacinas] = await Promise.all([
        InternacaoService.getEstatisticas(),
        ExamesService.getEstatisticas(),
        ReceitasService.getEstatisticas(),
        ProcedimentosService.getEstatisticas(),
        PetsService.getEstatisticasVacinas(),
      ]);

      setEstatisticas({
        internacao: internacao || { total: 0, ativas: 0, alta_hoje: 0, receita_ativa: 0 },
        exames: exames || { total: 0, pendentes: 0, coletados: 0, finalizados: 0 },
        receitas: receitas || { total: 0, ativas: 0, finalizadas: 0, valor_total: 0 },
        procedimentos: procedimentos || { total: 0, agendados: 0, concluidos: 0, hoje: 0, receita: 0, receita_hoje: 0 },
        vacinas: vacinas || { total: 0, aplicadas: 0, agendadas: 0, receita: 0 },
      });
    } catch (err) {
      console.error('Erro ao carregar estatísticas:', err);
      setError('Erro ao carregar estatísticas dos módulos');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="animate-pulse border-none shadow-sm">
            <CardHeader className="pb-2">
              <div className="h-4 bg-muted rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="h-8 bg-muted rounded w-1/2"></div>
                <div className="space-y-2">
                  <div className="h-3 bg-muted rounded w-full"></div>
                  <div className="h-3 bg-muted rounded w-2/3"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-rose-200 bg-rose-50 dark:bg-rose-950/20">
        <CardContent className="pt-6">
          <div className="flex items-center space-x-2 text-rose-600">
            <AlertTriangle className="h-5 w-5" />
            <span className="font-medium">{error}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!estatisticas) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Internação */}
      <Card className="border-none shadow-sm hover:shadow-md transition-shadow group">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-500/10 rounded-xl text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-all">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground/70">Internação</p>
                <p className="text-2xl font-black text-foreground">{estatisticas.internacao.ativas || 0}</p>
              </div>
            </div>
            <Badge variant="outline" className="text-[10px] font-bold border-blue-500/20 text-blue-500">Ativas</Badge>
          </div>
          <div className="space-y-2 pt-2 border-t border-border/50">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground font-medium">Total acumulado</span>
              <span className="font-bold text-foreground">{estatisticas.internacao.total || 0}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground font-medium">Altas para hoje</span>
              <span className="font-bold text-emerald-500">{estatisticas.internacao.alta_hoje || 0}</span>
            </div>
            <div className="flex justify-between text-sm pt-1">
              <span className="text-muted-foreground font-medium">Receita prevista</span>
              <span className="font-black text-blue-600 dark:text-blue-400">
                R$ {estatisticas.internacao.receita_ativa?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Exames */}
      <Card className="border-none shadow-sm hover:shadow-md transition-shadow group">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-500/10 rounded-xl text-purple-500 group-hover:bg-purple-500 group-hover:text-white transition-all">
                <TestTube className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground/70">Exames</p>
                <p className="text-2xl font-black text-foreground">{estatisticas.exames.realizados || 0}</p>
              </div>
            </div>
            <Badge variant="outline" className="text-[10px] font-bold border-purple-500/20 text-purple-500">Finalizados</Badge>
          </div>
          <div className="space-y-2 pt-2 border-t border-border/50">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground font-medium">Aguardando laudo</span>
              <span className="font-bold text-amber-500">{estatisticas.exames.pendentes || 0}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground font-medium">Solicitados hoje</span>
              <span className="font-bold text-foreground">{estatisticas.exames.hoje || 0}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Receitas */}
      <Card className="border-none shadow-sm hover:shadow-md transition-shadow group">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground/70">Receitas</p>
                <p className="text-2xl font-black text-foreground">{estatisticas.receitas.ativas || 0}</p>
              </div>
            </div>
            <Badge variant="outline" className="text-[10px] font-bold border-emerald-500/20 text-emerald-500">Em Aberto</Badge>
          </div>
          <div className="space-y-2 pt-2 border-t border-border/50">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground font-medium">Histórico total</span>
              <span className="font-bold text-foreground">{estatisticas.receitas.total || 0}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground font-medium">Prescritas hoje</span>
              <span className="font-bold text-foreground">{estatisticas.receitas.hoje || 0}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Procedimentos */}
      <Card className="border-none shadow-sm hover:shadow-md transition-shadow group">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-amber-500/10 rounded-xl text-amber-500 group-hover:bg-amber-500 group-hover:text-white transition-all">
                <HeartPulse className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground/70">Procedimentos</p>
                <p className="text-2xl font-black text-foreground">{estatisticas.procedimentos.agendados || 0}</p>
              </div>
            </div>
            <Badge variant="outline" className="text-[10px] font-bold border-amber-500/20 text-amber-500">Agendados</Badge>
          </div>
          <div className="space-y-2 pt-2 border-t border-border/50">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground font-medium">Concluídos hoje</span>
              <span className="font-bold text-foreground">{estatisticas.procedimentos.concluidos || 0}</span>
            </div>
            <div className="flex justify-between text-sm pt-1">
              <span className="text-muted-foreground font-medium">Receita do dia</span>
              <span className="font-black text-amber-600 dark:text-amber-400">
                R$ {estatisticas.procedimentos.receita?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Imunização */}
      <Card className="border-none shadow-sm hover:shadow-md transition-shadow group">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-rose-500/10 rounded-xl text-rose-500 group-hover:bg-rose-500 group-hover:text-white transition-all">
                <Pill className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground/70">Imunização</p>
                <p className="text-2xl font-black text-foreground">{estatisticas.vacinas.aplicadas || 0}</p>
              </div>
            </div>
            <Badge variant="outline" className="text-[10px] font-bold border-rose-500/20 text-rose-500">Aplicadas</Badge>
          </div>
          <div className="space-y-2 pt-2 border-t border-border/50">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground font-medium">Agendamentos</span>
              <span className="font-bold text-foreground">{estatisticas.vacinas.agendadas || 0}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground font-medium">Aplicações hoje</span>
              <span className="font-bold text-rose-500">{estatisticas.vacinas.hoje || 0}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ModulosEstatisticas;
