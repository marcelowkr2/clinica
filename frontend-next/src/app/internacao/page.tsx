'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/auth';
import { VetLayout } from '@/components/ui/VetLayout';
import { useRouter } from 'next/navigation';
import { Plus, Search, Eye, Edit, Trash, Bed, Calendar, Clock, User, Phone, Activity, CheckCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import InternacaoService, { InternacaoEstatisticas } from '@/services/internacao';
import { NovaInternacaoModal } from '@/components/ui/nova-internacao-modal';
import { EvolucaoInternacaoModal } from '@/components/ui/evolucao-internacao-modal';
import { EditarInternacaoModal } from '@/components/ui/editar-internacao-modal';
import { AltaInternacaoModal } from '@/components/ui/alta-internacao-modal';

interface Internacao {
  id: number;
  pet_nome: string;
  tutor_nome: string;
  tutor_telefone: string;
  data_entrada: string;
  data_alta?: string;
  motivo: string;
  status: 'internado' | 'alta' | 'transferido' | 'obito';
  veterinario_nome: string;
  diagnostico?: string;
  observacoes_entrada?: string;
  observacoes_alta?: string;
  valor_diaria: string;
  dias_internado: number;
}

export default function InternacaoPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [internacoes, setInternacoes] = useState<Internacao[]>([]);
  const [loading, setLoading] = useState(true);
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
    if (!authLoading && !isAuthenticated) {
      setIsRedirecting(true);
      router.push('/login');
      return;
    }

    if (isAuthenticated) {
      console.log('useEffect executado - carregando dados');
      fetchInternacoes();
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchInternacoes();
    }
  }, [searchTerm, statusFilter]);

  const fetchInternacoes = async () => {
    console.log('fetchInternacoes iniciado');
    try {
      setLoading(true);
      const params: any = {};
      
      if (searchTerm) {
        params.search = searchTerm;
      }
      
      if (statusFilter !== 'todos') {
        params.status = statusFilter;
      }

      console.log('Fazendo requisição com params:', params);
      const [internacoes, stats] = await Promise.all([
        InternacaoService.getInternacoes(params),
        InternacaoService.getEstatisticas()
      ]);
      
      console.log('Dados recebidos da API - internacoes:', internacoes);
      console.log('Dados recebidos da API - stats:', stats);
      setInternacoes(internacoes);
      setEstatisticas(stats);
      console.log('Estado atualizado com', internacoes.length, 'internações');
    } catch (error) {
      console.error('Erro ao carregar internações:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar dados das internações',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
      console.log('Loading finalizado');
    }
  };

  const handleSaveInternacao = async (novaInternacao: any) => {
    try {
      toast({
        title: 'Sucesso',
        description: 'Internação criada com sucesso!',
      });
      
      // Recarregar a lista de internações
      await fetchInternacoes();
    } catch (error) {
      console.error('Erro ao salvar internação:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao criar internação',
        variant: 'destructive',
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'internado':
        return 'bg-yellow-100 text-yellow-800';
      case 'alta':
        return 'bg-green-100 text-green-800';
      case 'transferido':
        return 'bg-blue-100 text-blue-800';
      case 'obito':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'internado':
        return 'Internado';
      case 'alta':
        return 'Alta';
      case 'transferido':
        return 'Transferido';
      case 'obito':
        return 'Óbito';
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredInternacoes = internacoes.filter(internacao => {
    const matchesSearch = searchTerm === '' || 
      internacao.pet_nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      internacao.tutor_nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      internacao.motivo.toLowerCase().includes(searchTerm.toLowerCase());
    
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
            <h1 className="text-2xl font-bold">Internação</h1>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 mt-4 sm:mt-0 w-full sm:w-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Buscar por paciente, tutor ou motivo..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-80"
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

        {/* Tabela de Internações */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paciente</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tutor</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Entrada</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dias Internado</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Motivo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-800"></div>
                        <span className="ml-2">Carregando internações...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredInternacoes.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                      Nenhuma internação encontrada
                    </td>
                  </tr>
                ) : (
                  filteredInternacoes.map((internacao) => (
                    <tr key={internacao.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{internacao.pet_nome}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{internacao.tutor_nome}</div>
                        <div className="text-sm text-gray-500 flex items-center">
                          <Phone className="h-3 w-3 mr-1" />
                          {internacao.tutor_telefone}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 flex items-center">
                          <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                          {formatDate(internacao.data_entrada)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 flex items-center">
                          <Clock className="h-4 w-4 mr-1 text-gray-400" />
                          {internacao.dias_internado} dias
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs truncate" title={internacao.motivo}>
                          {internacao.motivo}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(internacao.status)}`}>
                          {getStatusText(internacao.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              console.log('Clicou em Ver Evolução para:', internacao.pet_nome);
                              setEvolucaoModal({ isOpen: true, internacao });
                            }}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Ver Evolução"
                          >
                            <Activity className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => {
                              console.log('Clicou em Editar para:', internacao.pet_nome);
                              setEditarModal({ isOpen: true, internacao });
                            }}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => {
                              console.log('Clicou em Dar Alta para:', internacao.pet_nome);
                              setAltaModal({ isOpen: true, internacao });
                            }}
                            className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
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
        </div>
      </div>

      <NovaInternacaoModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveInternacao}
      />

      <EvolucaoInternacaoModal
        isOpen={evolucaoModal.isOpen}
        onClose={() => setEvolucaoModal({ isOpen: false, internacao: null })}
        internacao={evolucaoModal.internacao}
      />

      <EditarInternacaoModal
        isOpen={editarModal.isOpen}
        onClose={() => setEditarModal({ isOpen: false, internacao: null })}
        internacao={editarModal.internacao}
        onUpdate={carregarInternacoes}
      />

      <AltaInternacaoModal
        isOpen={altaModal.isOpen}
        onClose={() => setAltaModal({ isOpen: false, internacao: null })}
        internacao={altaModal.internacao}
        onUpdate={carregarInternacoes}
      />
    </VetLayout>
  );
}