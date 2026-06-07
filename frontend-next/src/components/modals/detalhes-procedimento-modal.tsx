'use client';

import { useState, useEffect } from 'react';
import { X, Calendar, Clock, User, ClipboardList, Star, Phone, MapPin } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import procedimentosService, { Procedimento } from '@/services/procedimentos';

interface DetalhesProcedimentoModalProps {
  isOpen: boolean;
  onClose: () => void;
  id: number | null;
}

export default function DetalhesProcedimentoModal({ isOpen, onClose, id }: DetalhesProcedimentoModalProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [procedimento, setProcedimento] = useState<Procedimento | null>(null);

  useEffect(() => {
    if (isOpen && id) {
      loadProcedimento();
    }
  }, [isOpen, id]);

  const loadProcedimento = async () => {
    if (!id) return;
    
    setLoading(true);
    try {
      const response = await procedimentosService.getProcedimento(id);
      setProcedimento(response);
    } catch (error) {
      console.error('Erro ao carregar detalhes:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar detalhes do procedimento',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-card w-full max-w-2xl rounded-3xl shadow-2xl border border-border/50 overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between p-6 border-b border-border/30 bg-muted/20">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl">
              <ClipboardList className="h-5 w-5 text-primary" />
            </div>
            <h2 className="text-xl font-bold text-foreground">Detalhes do Procedimento</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-secondary rounded-xl transition-colors">
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        {loading ? (
          <div className="p-20 flex flex-col items-center justify-center gap-4">
            <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-muted-foreground font-medium">Carregando detalhes...</p>
          </div>
        ) : procedimento ? (
          <div className="p-6 space-y-8">
            {/* Informações do Paciente */}
            <div className="flex items-start gap-4 p-4 bg-muted/30 rounded-2xl border border-border/50">
              <div className="h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary border border-primary/20">
                <User className="h-8 w-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-foreground">{procedimento.paciente_nome}</h3>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="font-bold text-foreground/70">Responsável:</span> {procedimento.responsavel_nome}
                  </div>
                  {procedimento.responsavel_telefone && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="h-3 w-3" /> {procedimento.responsavel_telefone}
                    </div>
                  )}
                </div>
              </div>
              <div className="ml-auto">
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                  procedimento.status === 'concluido' ? 'bg-emerald-500/10 text-emerald-600' :
                  procedimento.status === 'em_andamento' ? 'bg-amber-500/10 text-amber-600' :
                  'bg-blue-500/10 text-blue-600'
                }`}>
                  {procedimento.status}
                </span>
              </div>
            </div>

            {/* Detalhes do Agendamento */}
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1">
                  <Calendar className="h-3 w-3" /> Data e Hora
                </p>
                <p className="text-sm font-bold text-foreground">{formatDate(procedimento.data_agendamento)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1">
                  <User className="h-3 w-3" /> Profissional
                </p>
                <p className="text-sm font-bold text-foreground">{procedimento.profissional_nome || 'Não atribuído'}</p>
              </div>
            </div>

            {/* Serviços */}
            <div className="space-y-3">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Serviços Realizados</p>
              <div className="flex flex-wrap gap-2">
                {procedimento.servicos_nomes.map((s, idx) => (
                  <span key={idx} className="px-3 py-1.5 bg-secondary text-secondary-foreground rounded-xl text-xs font-bold border border-border/50">
                    {s}
                  </span>
                ))}
              </div>
            </div>

            {/* Observações */}
            {procedimento.observacoes && (
              <div className="space-y-2 p-4 bg-amber-500/5 rounded-2xl border border-amber-500/10">
                <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest flex items-center gap-1">
                  Observações
                </p>
                <p className="text-sm text-foreground/80 leading-relaxed italic">
                  "{procedimento.observacoes}"
                </p>
              </div>
            )}

            <div className="flex justify-between items-center pt-4 border-t border-border/30">
              <div className="space-y-0.5">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Valor Total</p>
                <p className="text-2xl font-black text-primary">{formatCurrency(procedimento.valor_total)}</p>
              </div>
              <button
                onClick={onClose}
                className="py-3 px-8 rounded-2xl font-bold bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        ) : (
          <div className="p-20 text-center text-muted-foreground">Procedimento não encontrado</div>
        )}
      </div>
    </div>
  );
}
