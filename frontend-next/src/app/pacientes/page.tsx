'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/auth';
import { useSearch } from '@/hooks/search';
import { VetLayout } from '@/components/ui/VetLayout';
import { useRouter } from 'next/navigation';
import { Plus, Edit, Trash, Eye, Users, Search, Filter } from 'lucide-react';
import { NovoPacienteModal } from '@/components/ui/novo-paciente-modal';
import { DetalhesPaciente } from '@/components/ui/detalhes-paciente';
import { EditarPacienteModal } from '@/components/ui/editar-paciente-modal';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import PacientesService, { Paciente } from '@/services/pets';
import UsersService from '@/services/users';

interface PacienteDisplay {
  id: number;
  nome: string;
  convenio: string;
  plano: string;
  responsavel: string;
  contato: string;
}

export default function PacientesPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { searchTerm, searchType, clearSearch } = useSearch();
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetalhesOpen, setIsDetalhesOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [pacienteSelecionado, setPacienteSelecionado] = useState('');
  const [pacienteParaEditar, setPacienteParaEditar] = useState<Paciente | null>(null);
  const [pacientes, setPacientes] = useState<PacienteDisplay[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading && !isRedirecting) {
      if (!isAuthenticated) {
        setIsRedirecting(true);
        router.push('/login');
        return;
      } else {
        fetchPacientes();
      }
    }
  }, [isAuthenticated, authLoading, router, isRedirecting]);

  const fetchPacientes = async () => {
    try {
      setLoading(true);
      const pacientesList = await PacientesService.getAllPacientes();
      const convenios = await PacientesService.getAllConvenios();

      const pacientesData = await Promise.all(
        pacientesList.map(async (paciente: Paciente) => {
          try {
            // Buscar responsável
            const responsavel = await PacientesService.getResponsavel(paciente.responsavel);
            const user = await UsersService.getUser(responsavel.user);

            // Buscar convênio
            const convenio = convenios.find(c => c.id === paciente.convenio);

            // Buscar plano se existir
            let planoNome = 'Particular';
            if (paciente.plano) {
              try {
                const planos = await PacientesService.getPlanosByConvenio(paciente.convenio);
                const plano = planos.find(p => p.id === paciente.plano);
                planoNome = plano?.nome || 'Particular';
              } catch (error) {
                console.error('Erro ao buscar plano:', error);
              }
            }

            return {
              id: paciente.id,
              nome: paciente.nome,
              convenio: convenio?.nome || 'Particular',
              plano: planoNome,
              responsavel: `${user.first_name} ${user.last_name}`.trim(),
              contato: user.phone || user.email || 'Não informado',
            };
          } catch (error) {
            console.error('Erro ao processar paciente:', error);
            return null;
          }
        })
      );

      const pacientesValidos = pacientesData.filter(p => p !== null) as PacienteDisplay[];
      setPacientes(pacientesValidos);
    } catch (error) {
      console.error('Erro ao carregar pacientes:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar a lista de pacientes.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditarPaciente = async (pacienteId: number) => {
    try {
      const paciente = await PacientesService.getPaciente(pacienteId);
      setPacienteParaEditar(paciente);
      setIsEditModalOpen(true);
    } catch (error) {
      console.error('Erro ao carregar dados do paciente:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os dados do paciente.',
        variant: 'destructive',
      });
    }
  };

  const handleDeletarPaciente = async (pacienteId: number, nomePaciente: string) => {
    if (confirm(`Tem certeza que deseja deletar o paciente ${nomePaciente}?`)) {
      try {
        await PacientesService.deletePaciente(pacienteId);
        toast({
          title: 'Paciente deletado',
          description: `O paciente ${nomePaciente} foi deletado com sucesso.`,
        });
        fetchPacientes();
      } catch (error) {
        console.error('Erro ao deletar paciente:', error);
        toast({
          title: 'Erro',
          description: 'Não foi possível deletar o paciente. Tente novamente.',
          variant: 'destructive',
        });
      }
    }
  };

  const handleSalvarEdicao = async (dadosAtualizados: Partial<Paciente>) => {
    try {
      if (!pacienteParaEditar) return;

      await PacientesService.updatePaciente(pacienteParaEditar.id, dadosAtualizados);
      toast({
        title: 'Paciente atualizado',
        description: `O paciente foi atualizado com sucesso.`,
      });
      setIsEditModalOpen(false);
      setPacienteParaEditar(null);
      fetchPacientes();
    } catch (error) {
      console.error('Erro ao atualizar paciente:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o paciente. Tente novamente.',
        variant: 'destructive',
      });
    }
  };

  if (authLoading || isRedirecting) {
    return (
      <VetLayout>
        <div className="flex items-center justify-center min-h-screen">
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
            <div className="p-2.5 bg-emerald-500/10 rounded-xl text-emerald-500">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">Pacientes</h1>
              <p className="text-sm text-muted-foreground">Listagem e gestão de todos os pacientes da clínica.</p>
            </div>
          </div>

          <button
            className="flex items-center justify-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl hover:opacity-90 transition-all font-bold text-sm shadow-sm shadow-primary/20"
            onClick={() => setIsModalOpen(true)}
          >
            <Plus className="h-5 w-5" />
            Novo Paciente
          </button>
        </div>

        {searchType === 'pacientes' && searchTerm && (
          <div className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 rounded-xl border border-blue-500/20 text-blue-600">
            <Search className="h-4 w-4" />
            <span className="text-sm font-medium">Resultados para: <strong>{searchTerm}</strong></span>
            <button
              onClick={clearSearch}
              className="ml-auto text-[10px] font-bold uppercase tracking-widest hover:underline"
            >
              Limpar busca
            </button>
          </div>
        )}

        <Card className="border-none shadow-md bg-white dark:bg-card overflow-hidden">
          <div className="overflow-x-auto scrollbar-hide">
            <table className="min-w-full">
              <thead className="bg-muted/30">
                <tr>
                  <th className="px-6 py-4 text-left text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Nome</th>
                  <th className="px-6 py-4 text-left text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Convênio</th>
                  <th className="px-6 py-4 text-left text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Plano</th>
                  <th className="px-6 py-4 text-left text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Responsável</th>
                  <th className="px-6 py-4 text-left text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Contato</th>
                  <th className="px-6 py-4 text-right text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        <span className="text-sm font-medium text-muted-foreground">Carregando pacientes...</span>
                      </div>
                    </td>
                  </tr>
                ) : pacientes.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <div className="p-4 bg-muted rounded-full">
                          <Users className="h-8 w-8 opacity-20" />
                        </div>
                        <p className="text-sm font-medium">Nenhum paciente encontrado.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  pacientes
                    .filter(paciente => {
                      if (!searchTerm || searchType !== 'pacientes') {
                        return true;
                      }
                      return paciente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             paciente.responsavel.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             paciente.convenio.toLowerCase().includes(searchTerm.toLowerCase());
                    })
                    .map((paciente) => (
                      <tr key={paciente.id} className="hover:bg-muted/20 transition-colors group">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-bold text-foreground">{paciente.nome}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge variant="secondary" className="text-[10px] font-bold bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-none">
                            {paciente.convenio}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-muted-foreground font-medium">{paciente.plano}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-bold text-foreground">{paciente.responsavel}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-muted-foreground font-medium">{paciente.contato}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              className="p-2 text-muted-foreground hover:text-blue-500 hover:bg-blue-500/10 rounded-lg transition-all"
                              onClick={() => {
                                setPacienteSelecionado(paciente.id.toString());
                                setIsDetalhesOpen(true);
                              }}
                              title="Ver detalhes"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              className="p-2 text-muted-foreground hover:text-emerald-500 hover:bg-emerald-500/10 rounded-lg transition-all"
                              onClick={() => handleEditarPaciente(paciente.id)}
                              title="Editar"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              className="p-2 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all"
                              onClick={() => handleDeletarPaciente(paciente.id, paciente.nome)}
                              title="Excluir"
                            >
                              <Trash className="h-4 w-4" />
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
      </div>

      <NovoPacienteModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={async (paciente) => {
          try {
            await PacientesService.createPaciente(paciente);
            toast({
              title: 'Paciente cadastrado',
              description: `O paciente ${paciente.nome} foi cadastrado com sucesso.`,
            });
            setIsModalOpen(false);
            fetchPacientes();
          } catch (error) {
            console.error('Erro ao cadastrar paciente:', error);
            toast({
              title: 'Erro',
              description: 'Não foi possível cadastrar o paciente. Tente novamente.',
              variant: 'destructive',
            });
          }
        }}
      />

      <DetalhesPaciente
        isOpen={isDetalhesOpen}
        onClose={() => setIsDetalhesOpen(false)}
        pacienteId={pacienteSelecionado}
      />

      <EditarPacienteModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setPacienteParaEditar(null);
        }}
        onSave={handleSalvarEdicao}
        paciente={pacienteParaEditar}
      />
    </VetLayout>
  );
}
