'use client';

import { useState, useEffect } from 'react';
import { X, Calendar, Clock, User, ClipboardList, Check } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import procedimentosService, { Procedimento, ServicoProcedimento } from '@/services/procedimentos';
import PacientesService from '@/services/pets';
import UsersService, { User as UserType } from '@/services/users';
import { cn } from '@/lib/utils';

interface EditarProcedimentoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  id: number | null;
}

export default function EditarProcedimentoModal({ isOpen, onClose, onSuccess, id }: EditarProcedimentoModalProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [pacientes, setPacientes] = useState<any[]>([]);
  const [servicos, setServicos] = useState<ServicoProcedimento[]>([]);
  const [profissionais, setProfissionais] = useState<UserType[]>([]);
  const [formData, setFormData] = useState({
    paciente: '',
    profissional: '',
    servicos: [] as number[],
    data_agendamento: '',
    observacoes: '',
    status: 'agendado'
  });

  useEffect(() => {
    if (isOpen && id) {
      loadData();
    }
  }, [isOpen, id]);

  const loadData = async () => {
    setLoadingData(true);
    try {
      const [pacientesData, servicosData, profissionaisData, procedimentoData] = await Promise.all([
        PacientesService.getPetsParaReceitas(),
        procedimentosService.getServicos(),
        UsersService.getAllUsers(),
        procedimentosService.getProcedimento(id!)
      ]);

      setPacientes(pacientesData);
      setServicos(servicosData);
      setProfissionais(profissionaisData.filter(u => u.user_type === 2 || u.user_type === 3));
      
      setFormData({
        paciente: procedimentoData.paciente.toString(),
        profissional: (typeof procedimentoData.profissional === 'object' ? procedimentoData.profissional.id : procedimentoData.profissional)?.toString() || '',
        servicos: procedimentoData.servicos,
        data_agendamento: new Date(procedimentoData.data_agendamento).toISOString().slice(0, 16),
        observacoes: procedimentoData.observacoes || '',
        status: procedimentoData.status
      });
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os dados do procedimento',
        variant: 'destructive'
      });
    } finally {
      setLoadingData(false);
    }
  };

  const handleServicoChange = (servicoId: number, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      servicos: checked 
        ? [...prev.servicos, servicoId]
        : prev.servicos.filter(sid => sid !== servicoId)
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

    setLoading(true);
    try {
      await procedimentosService.updateProcedimento(id!, {
        paciente: parseInt(formData.paciente),
        profissional: parseInt(formData.profissional),
        servicos: formData.servicos,
        data_agendamento: new Date(formData.data_agendamento).toISOString(),
        observacoes: formData.observacoes,
        status: formData.status as any
      });

      toast({
        title: 'Sucesso',
        description: 'Procedimento atualizado com sucesso',
      });
      
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Erro ao atualizar procedimento:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao atualizar procedimento',
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
            <h2 className="text-xl font-bold text-foreground">Editar Procedimento</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-secondary rounded-xl transition-colors">
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        {loadingData ? (
          <div className="p-20 flex flex-col items-center justify-center gap-4">
            <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-muted-foreground font-medium">Carregando dados...</p>
          </div>
        ) : (
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
                {pacientes.map(p => (
                  <option key={p.id} value={p.id}>{p.nome}</option>
                ))}
              </select>
            </div>

            {/* Profissional */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-muted-foreground uppercase tracking-widest ml-1 flex items-center gap-2">
                <User className="h-4 w-4" /> Profissional *
              </label>
              <select
                className="w-full p-3 bg-background border border-border rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none transition-all font-medium"
                value={formData.profissional}
                onChange={(e) => setFormData({...formData, profissional: e.target.value})}
                required
              >
                <option value="">Selecione o profissional</option>
                {profissionais.map(p => (
                  <option key={p.id} value={p.id}>{p.first_name} {p.last_name}</option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-muted-foreground uppercase tracking-widest ml-1 flex items-center gap-2">
                Status
              </label>
              <select
                className="w-full p-3 bg-background border border-border rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none transition-all font-medium"
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
              >
                <option value="agendado">Agendado</option>
                <option value="em_andamento">Em Andamento</option>
                <option value="concluido">Concluído</option>
                <option value="cancelado">Cancelado</option>
              </select>
            </div>

            {/* Serviços */}
            <div className="space-y-3">
              <label className="text-sm font-bold text-muted-foreground uppercase tracking-widest ml-1">Serviços *</label>
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
                      <span className="text-sm font-bold text-foreground">{servico.nome}</span>
                    </div>
                    <span className="text-sm font-black text-primary">R$ {parseFloat(servico.preco.toString()).toFixed(2)}</span>
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
              <label className="text-sm font-bold text-muted-foreground uppercase tracking-widest ml-1">Observações</label>
              <textarea
                className="w-full p-3 bg-background border border-border rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none transition-all font-medium min-h-[100px]"
                value={formData.observacoes}
                onChange={(e) => setFormData({...formData, observacoes: e.target.value})}
              />
            </div>
          </form>
        )}

        <div className="p-6 border-t border-border/30 bg-muted/20 flex gap-3">
          <button type="button" onClick={onClose} className="flex-1 py-3 px-4 rounded-2xl font-bold text-muted-foreground hover:bg-secondary transition-colors">
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || loadingData}
            className="flex-1 py-3 px-4 rounded-2xl font-bold bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:scale-105 transition-all disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Check className="h-4 w-4" />
            )}
            Salvar Alterações
          </button>
        </div>
      </div>
    </div>
  );
}
