'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { VetLayout } from '@/components/ui/VetLayout';
import {
  Calendar,
  Search,
  Plus,
  Filter,
  CheckCircle,
  Clock,
  AlertTriangle,
  X
} from 'lucide-react';
import PetsService, { AgendamentoVacina } from '@/services/pets';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import NovoAgendamentoVacinaModal from '@/components/ui/novo-agendamento-vacina-modal';
import AplicarVacinaModal from '@/components/ui/aplicar-vacina-modal';
import DetalhesVacinaModal from '@/components/ui/detalhes-vacina-modal';

const VacinasPage: React.FC = () => {
  const [agendamentos, setAgendamentos] = useState<AgendamentoVacina[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [showNovoModal, setShowNovoModal] = useState(false);
  const [showAplicarModal, setShowAplicarModal] = useState(false);
  const [showEditarModal, setShowEditarModal] = useState(false);
  const [showDetalhesModal, setShowDetalhesModal] = useState(false);
  const [agendamentoSelecionado, setAgendamentoSelecionado] = useState<AgendamentoVacina | null>(null);

  useEffect(() => {
    carregarAgendamentos();
  }, [searchTerm, statusFilter]);

  const carregarAgendamentos = async () => {
    try {
      setLoading(true);

      const params: any = {};

      if (searchTerm) {
        params.search = searchTerm;
      }

      if (statusFilter) {
        params.status = statusFilter;
      }

      const data = await PetsService.getAgendamentosVacina(params);
      setAgendamentos(data);
    } catch (error) {
      console.error('Erro ao carregar agendamentos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNovoAgendamentoSuccess = () => {
    carregarAgendamentos();
  };

  const handleAplicarVacina = (agendamento: AgendamentoVacina) => {
    setAgendamentoSelecionado(agendamento);
    setShowAplicarModal(true);
  };

  const handleEditarAgendamento = (agendamento: AgendamentoVacina) => {
    setAgendamentoSelecionado(agendamento);
    setShowEditarModal(true);
  };

  const handleVerDetalhes = (agendamento: AgendamentoVacina) => {
    setAgendamentoSelecionado(agendamento);
    setShowDetalhesModal(true);
  };

  const handleAplicarVacinaSuccess = async () => {
    // Primeiro recarrega os agendamentos
    await carregarAgendamentos();

    // Fecha o modal
    setShowAplicarModal(false);

    // Pergunta se quer remover o card automaticamente
    const shouldRemove = window.confirm(
      'Vacina aplicada com sucesso! Deseja remover este agendamento da lista? (Recomendado para manter a lista organizada)'
    );

    if (shouldRemove && agendamentoSelecionado) {
      try {
        await PetsService.deleteAgendamentoVacina(agendamentoSelecionado.id);
        await carregarAgendamentos(); // Recarrega novamente após deletar
      } catch (error) {
        console.error('Erro ao remover agendamento:', error);
        alert('Erro ao remover agendamento. Você pode removê-lo manualmente.');
      }
    }

    setAgendamentoSelecionado(null);
  };

  const handleDeletarAgendamento = async (agendamento: AgendamentoVacina) => {
    const confirmMessage = agendamento.status === 'aplicado'
      ? `Tem certeza que deseja remover o registro da vacina ${agendamento.vacina_nome} aplicada em ${agendamento.paciente_nome}?`
      : `Tem certeza que deseja cancelar o agendamento da vacina ${agendamento.vacina_nome} para ${agendamento.paciente_nome}?`;

    if (window.confirm(confirmMessage)) {
      try {
        await PetsService.deleteAgendamentoVacina(agendamento.id);
        carregarAgendamentos();
      } catch (error) {
        console.error('Erro ao deletar agendamento:', error);
        alert('Erro ao deletar agendamento. Tente novamente.');
      }
    }
  };

  const getStatusBadge = (status: string, isAtrasado: boolean) => {
    if (isAtrasado && status === 'agendado') {
      return (
        <Badge variant="destructive" className="flex items-center space-x-1">
          <AlertTriangle className="h-3 w-3" />
          <span>Atrasado</span>
        </Badge>
      );
    }

    switch (status) {
      case 'agendado':
        return (
          <Badge variant="outline" className="flex items-center space-x-1 text-blue-600 border-blue-200">
            <Clock className="h-3 w-3" />
            <span>Agendado</span>
          </Badge>
        );
      case 'aplicado':
        return (
          <Badge variant="default" className="flex items-center space-x-1 bg-green-600">
            <CheckCircle className="h-3 w-3" />
            <span>Aplicado</span>
          </Badge>
        );
      case 'cancelado':
        return (
          <Badge variant="secondary" className="flex items-center space-x-1">
            <X className="h-3 w-3" />
            <span>Cancelado</span>
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatarData = (data: string) => {
    try {
      return format(new Date(data), 'dd/MM/yyyy', { locale: ptBR });
    } catch {
      return data;
    }
  };

  const filteredAgendamentos = agendamentos.filter(agendamento => {
    const matchesSearch = !searchTerm ||
      agendamento.paciente_nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agendamento.responsavel_nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agendamento.vacina_nome.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = !statusFilter || agendamento.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <VetLayout>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold tracking-tight">Agendamentos de Vacinas</h1>
          </div>
          <div className="grid gap-4">
            {[...Array(5)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="space-y-3">
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-4 bg-muted rounded w-1/2"></div>
                    <div className="h-4 bg-muted rounded w-2/3"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </VetLayout>
    );
  }

  return (
    <VetLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-500/10 rounded-xl text-blue-600">
              <Calendar className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">Imunização</h1>
              <p className="text-sm text-muted-foreground">Controle de imunização e reforços.</p>
            </div>
          </div>

          <Button
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg shadow-blue-600/20 hover:scale-105 transition-transform"
            onClick={() => setShowNovoModal(true)}
          >
            <Plus className="h-4 w-4" />
            <span>Novo Agendamento</span>
          </Button>
        </div>

      {/* Filtros */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar por paciente, responsável ou vacina..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos os status</option>
                <option value="agendado">Agendado</option>
                <option value="aplicado">Aplicado</option>
                <option value="cancelado">Cancelado</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Agendamentos */}
      <div className="grid gap-4">
        {filteredAgendamentos.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhum agendamento encontrado
              </h3>
              <p className="text-gray-500">
                {searchTerm || statusFilter
                  ? 'Tente ajustar os filtros de busca.'
                  : 'Comece criando um novo agendamento de vacina.'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredAgendamentos.map((agendamento) => (
            <Card key={agendamento.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {agendamento.pet_nome}
                    </h3>
                    <p className="text-gray-600 mb-2">
                      Tutor: {agendamento.tutor_nome}
                    </p>
                    <p className="text-sm text-gray-500">
                      Telefone: {agendamento.tutor_telefone}
                    </p>
                  </div>
                  <div className="text-right">
                    {getStatusBadge(agendamento.status, agendamento.is_atrasado)}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Vacina</p>
                    <p className="text-gray-900">{agendamento.vacina_nome}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Data Agendada</p>
                    <p className="text-gray-900">{formatarData(agendamento.data_agendamento)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Veterinário</p>
                    <p className="text-gray-900">
                      {agendamento.veterinario_nome || 'Não definido'}
                    </p>
                  </div>
                </div>

                {agendamento.observacoes && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-1">Observações</p>
                    <p className="text-gray-600 text-sm">{agendamento.observacoes}</p>
                  </div>
                )}

                {agendamento.data_aplicacao && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700">Data de Aplicação</p>
                    <p className="text-gray-900">{formatarData(agendamento.data_aplicacao)}</p>
                  </div>
                )}

                <div className="flex justify-end space-x-2">
                  {agendamento.status === 'agendado' && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditarAgendamento(agendamento)}
                      >
                        Editar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleDeletarAgendamento(agendamento)}
                      >
                        Cancelar
                      </Button>
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => handleAplicarVacina(agendamento)}
                      >
                        Aplicar Vacina
                      </Button>
                    </>
                  )}
                  {agendamento.status === 'aplicado' && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleVerDetalhes(agendamento)}
                      >
                        Ver Detalhes
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleDeletarAgendamento(agendamento)}
                      >
                        Remover
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Modal de Novo Agendamento */}
      <NovoAgendamentoVacinaModal
        isOpen={showNovoModal}
        onClose={() => setShowNovoModal(false)}
        onSuccess={handleNovoAgendamentoSuccess}
      />

      {/* Modal de Aplicar Vacina */}
      <AplicarVacinaModal
        isOpen={showAplicarModal && !!agendamentoSelecionado}
        onClose={() => {
          setShowAplicarModal(false);
          setAgendamentoSelecionado(null);
        }}
        onSuccess={handleAplicarVacinaSuccess}
        agendamento={agendamentoSelecionado}
      />

      {/* Modal de Editar Agendamento */}
      {showEditarModal && agendamentoSelecionado && (
        <NovoAgendamentoVacinaModal
          agendamento={agendamentoSelecionado}
          onClose={() => {
            setShowEditarModal(false);
            setAgendamentoSelecionado(null);
          }}
          onSuccess={() => {
            setShowEditarModal(false);
            setAgendamentoSelecionado(null);
            carregarAgendamentos();
          }}
        />
      )}

      {/* Modal de Detalhes da Vacina */}
      {showDetalhesModal && agendamentoSelecionado && (
        <DetalhesVacinaModal
          agendamento={agendamentoSelecionado}
          onClose={() => {
            setShowDetalhesModal(false);
            setAgendamentoSelecionado(null);
          }}
        />
      )}
      </div>
    </VetLayout>
  );
};

export default VacinasPage;
