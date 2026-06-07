'use client';

import { useState, useEffect } from 'react';
import { X, Edit, Trash, Calendar, Clock, FileText, Activity, UserRound, Phone, MapPin, ClipboardList } from 'lucide-react';
import PacientesService, { Paciente } from '@/services/pets';
import { AppointmentsService } from '@/services/appointments';
import { Card, CardContent } from './card';
import { Badge } from './badge';
import { cn } from '@/lib/utils';

interface DetalhesPacienteProps {
  isOpen: boolean;
  onClose: () => void;
  pacienteId: string;
}

export function DetalhesPaciente({ isOpen, onClose, pacienteId }: DetalhesPacienteProps) {
  const [activeTab, setActiveTab] = useState('info');
  const [paciente, setPaciente] = useState<any>(null);
  const [agendamentos, setAgendamentos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && pacienteId) {
      fetchPacienteData();
    }
  }, [isOpen, pacienteId]);

  const fetchPacienteData = async () => {
    try {
      setLoading(true);
      
      // Buscar dados do paciente com responsável
      const pacienteData = await PacientesService.getPacienteWithResponsavel(parseInt(pacienteId));
      setPaciente(pacienteData);

      // Buscar agendamentos do paciente
      try {
        const agendamentosData = await AppointmentsService.getAllAgendamentos();
        const agendamentosPaciente = agendamentosData.filter((agendamento: any) => 
          agendamento.paciente?.id === parseInt(pacienteId) || agendamento.paciente === parseInt(pacienteId)
        );
        setAgendamentos(agendamentosPaciente);
      } catch (error) {
        console.error('Erro ao buscar agendamentos:', error);
        setAgendamentos([]);
      }
    } catch (error) {
      console.error('Erro ao buscar dados do paciente:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    alert('Funcionalidade de edição será implementada em breve');
  };

  const handleDelete = async () => {
    if (window.confirm('Tem certeza que deseja deletar este paciente? Esta ação não pode ser desfeita.')) {
      try {
        await PacientesService.deletePaciente(parseInt(pacienteId));
        alert('Paciente deletado com sucesso!');
        onClose();
      } catch (error) {
        console.error('Erro ao deletar paciente:', error);
        alert('Erro ao deletar paciente. Tente novamente.');
      }
    }
  };

  if (!isOpen) return null;

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-card rounded-2xl shadow-xl w-full max-w-4xl border border-border/50">
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
            <span className="text-sm font-medium text-muted-foreground">Buscando prontuário...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!paciente) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-card rounded-2xl shadow-xl w-full max-w-4xl border border-border/50 p-12 text-center">
          <p className="text-rose-600 font-bold">Erro ao carregar prontuário do paciente.</p>
          <button onClick={onClose} className="mt-4 px-6 py-2 bg-secondary rounded-xl font-bold">Fechar</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-card rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-border/50">
        {/* Cabeçalho */}
        <div className="flex justify-between items-center p-6 border-b border-border/50 sticky top-0 bg-white/80 dark:bg-card/80 backdrop-blur-md z-10">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
              <UserRound className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-foreground">{paciente.nome}</h2>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-[10px] font-bold border-primary/20 text-primary">PACIENTE</Badge>
                <span className="text-xs text-muted-foreground font-medium">ID: #{paciente.id}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleEdit} className="p-2 text-muted-foreground hover:text-blue-500 hover:bg-blue-500/10 rounded-xl transition-all">
              <Edit className="h-5 w-5" />
            </button>
            <button onClick={handleDelete} className="p-2 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all">
              <Trash className="h-5 w-5" />
            </button>
            <div className="w-px h-6 bg-border/50 mx-2"></div>
            <button onClick={onClose} className="p-2 text-muted-foreground hover:bg-secondary rounded-xl transition-all">
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>
        
        <div className="p-6">
          {/* Abas */}
          <div className="flex gap-2 p-1 bg-secondary/30 rounded-xl mb-8 w-fit">
            {[
              { id: 'info', label: 'Prontuário', icon: ClipboardList },
              { id: 'historico', label: 'Histórico', icon: FileText },
              { id: 'agendamentos', label: 'Agendamentos', icon: Calendar }
            ].map((tab) => (
              <button
                key={tab.id}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all",
                  activeTab === tab.id 
                    ? "bg-white dark:bg-card text-primary shadow-sm" 
                    : "text-muted-foreground hover:text-foreground"
                )}
                onClick={() => setActiveTab(tab.id)}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </div>
          
          {activeTab === 'info' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in duration-300">
              <Card className="border-none shadow-sm bg-secondary/10">
                <CardContent className="p-6">
                  <h4 className="text-sm font-black uppercase tracking-widest text-primary/70 mb-6 flex items-center gap-2">
                    <Activity className="h-4 w-4" /> Dados Clínicos
                  </h4>
                  <div className="space-y-4">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold uppercase text-muted-foreground">Data de Nascimento</span>
                      <span className="font-bold text-foreground">
                        {paciente.data_nascimento ? new Date(paciente.data_nascimento).toLocaleDateString('pt-BR') : 'Não informado'}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold uppercase text-muted-foreground">Sexo</span>
                      <span className="font-bold text-foreground">
                        {paciente.sexo === 'M' ? 'Masculino' : paciente.sexo === 'F' ? 'Feminino' : 'Não informado'}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold uppercase text-muted-foreground">Peso Corporal</span>
                      <span className="font-bold text-foreground">
                        {paciente.peso ? `${paciente.peso} kg` : 'Não informado'}
                      </span>
                    </div>
                    <div className="flex flex-col pt-2 border-t border-border/50">
                      <span className="text-[10px] font-bold uppercase text-muted-foreground">Observações Médicas</span>
                      <p className="text-sm text-foreground mt-1 leading-relaxed">
                        {paciente.observacoes || 'Nenhuma observação relevante registrada.'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-none shadow-sm bg-emerald-500/5">
                <CardContent className="p-6">
                  <h4 className="text-sm font-black uppercase tracking-widest text-emerald-600/70 mb-6 flex items-center gap-2">
                    <Phone className="h-4 w-4" /> Responsável / Contato
                  </h4>
                  <div className="space-y-4">
                    {paciente.responsavelData ? (
                      <>
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold uppercase text-muted-foreground">Nome</span>
                          <span className="font-bold text-foreground">{paciente.responsavelData.nome}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold uppercase text-muted-foreground">Telefone Principal</span>
                          <span className="font-bold text-foreground">{paciente.responsavelData.telefone}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold uppercase text-muted-foreground flex items-center gap-1">
                            <MapPin className="h-3 w-3" /> Endereço Residencial
                          </span>
                          <span className="text-sm font-medium text-foreground">{paciente.responsavelData.endereco}</span>
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-12">
                        <p className="text-sm text-muted-foreground">Dados de contato não vinculados.</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          
          {activeTab === 'historico' && (
            <div className="animate-in fade-in duration-300">
              <div className="text-center py-20 border-2 border-dashed border-border/50 rounded-2xl">
                <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground/20" />
                <h5 className="font-bold text-foreground">Histórico Eletrônico</h5>
                <p className="text-sm text-muted-foreground max-w-xs mx-auto mt-1">
                  O histórico completo de evoluções médicas estará disponível em breve.
                </p>
              </div>
            </div>
          )}
          
          {activeTab === 'agendamentos' && (
            <div className="space-y-4 animate-in fade-in duration-300">
              {agendamentos.length > 0 ? (
                agendamentos.map((item) => (
                  <div key={item.id} className="group p-4 bg-white dark:bg-card border border-border/50 rounded-2xl hover:shadow-md transition-all">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-all">
                          <Calendar className="h-5 w-5" />
                        </div>
                        <div>
                          <h5 className="font-bold text-foreground">{item.servico_nome || 'Consulta Médica'}</h5>
                          <div className="flex items-center gap-3 mt-1">
                            <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                              <Calendar className="h-3 w-3" /> 
                              {item.data_hora ? new Date(item.data_hora).toLocaleDateString('pt-BR') : '--'}
                            </div>
                            <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                              <Clock className="h-3 w-3" /> 
                              {item.data_hora ? new Date(item.data_hora).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '--'}
                            </div>
                          </div>
                        </div>
                      </div>
                      <Badge className={cn(
                        "text-[10px] font-bold shadow-none",
                        item.status === 'confirmado' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-blue-500/10 text-blue-600'
                      )}>
                        {item.status?.toUpperCase() || 'AGENDADO'}
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-20 border-2 border-dashed border-border/50 rounded-2xl">
                  <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground/20" />
                  <h5 className="font-bold text-foreground">Sem Agendamentos</h5>
                  <p className="text-sm text-muted-foreground mt-1">Nenhuma consulta futura encontrada para este paciente.</p>
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className="p-6 border-t border-border/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-8 py-2.5 bg-secondary text-foreground rounded-xl text-sm font-bold hover:bg-secondary/70 transition-all"
          >
            Fechar Prontuário
          </button>
        </div>
      </div>
    </div>
  );
}