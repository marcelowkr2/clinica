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
  Phone
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
      internacao.pet_nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      internacao.tutor_nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      internacao.veterinario_nome.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'todos' || internacao.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  if (authLoading || isRedirecting) {
    return (
      <VetLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-800"></div>
        </div>
      </VetLayout>
    );
  }

  return (
    <VetLayout>
      <div className="p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <div className="flex items-center gap-3">
            <Bed className="h-8 w-8 text-orange-600" />
            <h1 className="text-2xl font-bold">Internação - Dashboard</h1>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mt-4 sm:mt-0 w-full sm:w-auto">
            <button
              className="flex items-center justify-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
              onClick={() => setIsModalOpen(true)}
            >
              <Plus className="h-5 w-5" />
              Nova Internação
            </button>
          </div>
        </div>

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pacientes Internados</p>
                <p className="text-2xl font-bold text-orange-600">
                  {estatisticas?.ativas || 0}
                </p>
              </div>
              <Bed className="h-8 w-8 text-orange-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Altas Hoje</p>
                <p className="text-2xl font-bold text-green-600">
                  {estatisticas?.alta_hoje || 0}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total de Internações</p>
                <p className="text-2xl font-bold text-blue-600">{estatisticas?.total || 0}</p>
              </div>
              <User className="h-8 w-8 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Buscar por paciente, responsável ou médico..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="todos">Todos os Status</option>
            <option value="internado">Internado</option>
            <option value="alta">Alta</option>
            <option value="transferido">Transferido</option>
            <option value="obito">Óbito</option>
          </select>
        </div>

        {/* Lista de Internações */}
        <div className="grid gap-4">
          {loading ? (
            <div className="bg-white p-8 rounded-lg shadow-sm border text-center">
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-800"></div>
                <span className="ml-2">Carregando internações...</span>
              </div>
            </div>
          ) : filteredInternacoes.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhuma internação encontrada
                </h3>
                <p className="text-gray-500">
                  {searchTerm || statusFilter
                    ? 'Tente ajustar os filtros de busca.'
                    : 'Comece registrando uma nova internação.'
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredInternacoes.map((internacao) => (
            <Card key={internacao.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {internacao.paciente_nome}
                    </h3>
                    <p className="text-gray-600 mb-2 flex items-center space-x-1">
                      <User className="h-4 w-4" />
                      <span>Responsável: {internacao.responsavel_nome}</span>
                    </p>
                    <p className="text-sm text-gray-500 flex items-center space-x-1">
                      <Phone className="h-3 w-3" />
                      <span>{internacao.responsavel_telefone}</span>
                    </p>
                  </div>
                  <div className="text-right">
                    {getStatusBadge(internacao.status)}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700 flex items-center space-x-1">
                      <Stethoscope className="h-4 w-4" />
                      <span>Médico</span>
                    </p>
                    <p className="text-gray-900">{internacao.medico_nome}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700 flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>Data Entrada</span>
                    </p>
                    <p className="text-gray-900">{formatarDataSimples(internacao.data_entrada)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700 flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>Dias Internado</span>
                    </p>
                    <p className="text-gray-900">{internacao.dias_internado} dias</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700 flex items-center space-x-1">
                      <DollarSign className="h-4 w-4" />
                      <span>Diária</span>
                    </p>
                    <p className="text-gray-900">
                      R$ {parseFloat(internacao.valor_diaria).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>

                {internacao.data_alta && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700">Data de Alta</p>
                    <p className="text-gray-900">{formatarDataSimples(internacao.data_alta)}</p>
                  </div>
                )}

                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-1">Motivo</p>
                  <p className="text-gray-600 text-sm">{internacao.motivo}</p>
                </div>

                {internacao.diagnostico && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-1">Diagnóstico</p>
                    <p className="text-gray-600 text-sm">{internacao.diagnostico}</p>
                  </div>
                )}

                {internacao.observacoes_entrada && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-1">Observações de Entrada</p>
                    <p className="text-gray-600 text-sm">{internacao.observacoes_entrada}</p>
                  </div>
                )}

                {internacao.observacoes_alta && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-1">Observações de Alta</p>
                    <p className="text-gray-600 text-sm">{internacao.observacoes_alta}</p>
                  </div>
                )}

                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      console.log('Clicou em Ver Evoluções para:', internacao.pet_nome);
                      setEvolucaoModal({ isOpen: true, internacao });
                    }}
                  >
                    Ver Evoluções
                  </Button>
                  {internacao.status === 'internado' && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          console.log('Clicou em Editar para:', internacao.pet_nome);
                          setEditarModal({ isOpen: true, internacao });
                        }}
                      >
                        Editar
                      </Button>
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => {
                          console.log('Clicou em Dar Alta para:', internacao.pet_nome);
                          setAltaModal({ isOpen: true, internacao });
                        }}
                      >
                        Dar Alta
                      </Button>
                    </>
                  )}
                  {internacao.status !== 'internado' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        console.log('Clicou em Ver Detalhes para:', internacao.pet_nome);
                        setEvolucaoModal({ isOpen: true, internacao });
                      }}
                    >
                      Ver Detalhes
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
            ))
          )}
        </div>

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
