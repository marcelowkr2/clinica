'use client';

import { useState, useEffect } from 'react';
import { X, Calendar, Clock, User, ClipboardList } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/auth';
import procedimentosService, { Procedimento, ServicoProcedimento } from '@/services/procedimentos';
import PacientesService from '@/services/pets';

interface AgendarProcedimentoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AgendarProcedimentoModal({ isOpen, onClose, onSuccess }: AgendarProcedimentoModalProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [pacientes, setPacientes] = useState<any[]>([]);
  const [servicos, setServicos] = useState<ServicoProcedimento[]>([]);
  const [formData, setFormData] = useState({
    paciente: '',
    servicos: [] as number[],
    data_agendamento: '',
    observacoes: ''
  });

  useEffect(() => {
    if (isOpen) {
      loadPacientes();
      loadServicos();
    }
  }, [isOpen]);

  const loadPacientes = async () => {
    try {
      const response = await PacientesService.getPetsParaReceitas();
      setPacientes(response);
    } catch (error) {
      console.error('Erro ao carregar pacientes:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar lista de pacientes',
        variant: 'destructive'
      });
    }
  };

  const loadServicos = async () => {
    try {
      const response = await procedimentosService.getServicos();
      setServicos(response);
    } catch (error) {
      console.error('Erro ao carregar serviços:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar lista de serviços',
        variant: 'destructive'
      });
    }
  };

  const handleServicoChange = (servicoId: number, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      servicos: checked 
        ? [...prev.servicos, servicoId]
        : prev.servicos.filter(id => id !== servicoId)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.paciente || formData.servicos.length === 0 || !formData.data_agendamento) {
      toast({
        title: 'Erro',
        description: 'Preencha todos os campos obrigatórios',
        variant: 'destructive'
      });
      return;
    }

    if (!user?.id) {
      toast({
        title: 'Erro',
        description: 'Usuário não autenticado',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      await procedimentosService.createProcedimento({
        paciente: parseInt(formData.paciente),
        servicos: formData.servicos,
        data_agendamento: new Date(formData.data_agendamento).toISOString(),
        observacoes: formData.observacoes,
        profissional: user.id,
        status: 'agendado'
      });

      toast({
        title: 'Sucesso',
        description: 'Procedimento agendado com sucesso',
      });
      
      onSuccess();
      onClose();
      setFormData({
        paciente: '',
        servicos: [] as number[],
        data_agendamento: '',
        observacoes: ''
      });
    } catch (error) {
      console.error('Erro ao agendar procedimento:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao agendar procedimento',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-card w-full max-w-lg rounded-3xl shadow-2xl border border-border/50 overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between p-6 border-b border-border/30 bg-muted/20">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl">
              <ClipboardList className="h-5 w-5 text-primary" />
            </div>
            <h2 className="text-xl font-bold text-foreground">Novo Procedimento</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-secondary rounded-xl transition-colors">
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
          {/* Paciente */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-muted-foreground uppercase tracking-widest ml-1 flex items-center gap-2">
              <User className="h-4 w-4" /> Paciente *
            </label>
            <select
              className="w-full p-3 bg-background border border-border rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none transition-all font-medium"
              value={formData.paciente}
              onChange={(e) => setFormData({...formData, paciente: e.target.value})}
              required
            >
              <option value="">Selecione o paciente</option>
              {pacientes.map(p => (
                <option key={p.id} value={p.id}>
                  {p.nome} ({p.responsavel.user.first_name} {p.responsavel.user.last_name})
                </option>
              ))}
            </select>
          </div>

          {/* Serviços */}
          <div className="space-y-3">
            <label className="text-sm font-bold text-muted-foreground uppercase tracking-widest ml-1">
              Serviços *
            </label>
            <div className="grid grid-cols-1 gap-2">
              {servicos.map(servico => (
                <label 
                  key={servico.id} 
                  className={cn(
                    "flex items-center justify-between p-3 border rounded-2xl cursor-pointer transition-all hover:border-primary/50",
                    formData.servicos.includes(servico.id) ? "bg-primary/5 border-primary shadow-sm" : "bg-background border-border"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-border text-primary focus:ring-primary/20"
                      checked={formData.servicos.includes(servico.id)}
                      onChange={(e) => handleServicoChange(servico.id, e.target.checked)}
                    />
                    <div>
                      <p className="text-sm font-bold text-foreground">{servico.nome}</p>
                      <p className="text-xs text-muted-foreground">{servico.tempo_estimado} min</p>
                    </div>
                  </div>
                  <span className="text-sm font-black text-primary">
                    R$ {parseFloat(servico.preco.toString()).toFixed(2).replace('.', ',')}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Data e Hora */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-muted-foreground uppercase tracking-widest ml-1 flex items-center gap-2">
              <Calendar className="h-4 w-4" /> Data e Horário *
            </label>
            <input
              type="datetime-local"
              className="w-full p-3 bg-background border border-border rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none transition-all font-medium"
              value={formData.data_agendamento}
              onChange={(e) => setFormData({...formData, data_agendamento: e.target.value})}
              required
            />
          </div>

          {/* Observações */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-muted-foreground uppercase tracking-widest ml-1">
              Observações
            </label>
            <textarea
              className="w-full p-3 bg-background border border-border rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none transition-all font-medium min-h-[100px]"
              placeholder="Alguma observação importante?"
              value={formData.observacoes}
              onChange={(e) => setFormData({...formData, observacoes: e.target.value})}
            />
          </div>
        </form>

        <div className="p-6 border-t border-border/30 bg-muted/20 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 px-4 rounded-2xl font-bold text-muted-foreground hover:bg-secondary transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 py-3 px-4 rounded-2xl font-bold bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:scale-105 transition-all disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Check className="h-4 w-4" />
            )}
            Agendar Procedimento
          </button>
        </div>
      </div>
    </div>
  );
}

import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';
