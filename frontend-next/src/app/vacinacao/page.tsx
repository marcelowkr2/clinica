'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/auth';
import { VetLayout } from '@/components/ui/VetLayout';
import { useRouter } from 'next/navigation';
import { Plus, Search, Eye, Edit, Trash, Pill, Calendar, Clock, User, Shield, AlertTriangle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface Vacinacao {
  id: number;
  paciente_nome: string;
  tutor_nome: string;
  tutor_telefone: string;
  vacina: string;
  data_aplicacao: string;
  data_proxima_dose?: string;
  lote: string;
  fabricante: string;
  veterinario: string;
  observacoes: string;
  status: 'aplicada' | 'agendada' | 'atrasada' | 'cancelada';
  dose_numero: number;
  total_doses: number;
}

export default function VacinacaoPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [vacinacoes, setVacinacoes] = useState<Vacinacao[]>([]);
  const [loading, setLoading] = useState(true);

  // Dados simulados para demonstração
  const dadosSimulados: Vacinacao[] = [
    {
      id: 1,
      paciente_nome: "Rex",
      tutor_nome: "João Silva",
      tutor_telefone: "(11) 99999-9999",
      vacina: "V10 (Múltipla)",
      data_aplicacao: "2024-01-15T10:00:00",
      data_proxima_dose: "2024-02-15T10:00:00",
      lote: "VAC2024001",
      fabricante: "Zoetis",
      veterinario: "Dr. Maria Santos",
      observacoes: "Primeira dose da série anual",
      status: "aplicada",
      dose_numero: 1,
      total_doses: 3
    },
    {
      id: 2,
      paciente_nome: "Mimi",
      tutor_nome: "Ana Costa",
      tutor_telefone: "(11) 88888-8888",
      vacina: "Antirrábica",
      data_aplicacao: "2024-01-20T14:00:00",
      lote: "RAB2024005",
      fabricante: "Merial",
      veterinario: "Dr. Carlos Lima",
      observacoes: "Reforço anual",
      status: "agendada",
      dose_numero: 1,
      total_doses: 1
    },
    {
      id: 3,
      paciente_nome: "Thor",
      tutor_nome: "Pedro Oliveira",
      tutor_telefone: "(11) 77777-7777",
      vacina: "V10 (Múltipla)",
      data_aplicacao: "2023-12-15T09:00:00",
      data_proxima_dose: "2024-01-10T09:00:00",
      lote: "VAC2023089",
      fabricante: "Zoetis",
      veterinario: "Dr. Ana Rodrigues",
      observacoes: "Segunda dose - ATRASADA",
      status: "atrasada",
      dose_numero: 2,
      total_doses: 3
    },
    {
      id: 4,
      paciente_nome: "Luna",
      tutor_nome: "Maria Fernanda",
      tutor_telefone: "(11) 66666-6666",
      vacina: "Gripe Canina",
      data_aplicacao: "2024-01-12T11:30:00",
      lote: "GRI2024012",
      fabricante: "Virbac",
      veterinario: "Dr. Roberto Silva",
      observacoes: "Dose única anual",
      status: "aplicada",
      dose_numero: 1,
      total_doses: 1
    },
    {
      id: 5,
      paciente_nome: "Bella",
      tutor_nome: "Carlos Mendes",
      tutor_telefone: "(11) 55555-5555",
      vacina: "V8 (Múltipla)",
      data_aplicacao: "2024-01-25T15:00:00",
      lote: "VAC2024015",
      fabricante: "Zoetis",
      veterinario: "Dr. Maria Santos",
      observacoes: "Primeira vacinação - filhote",
      status: "agendada",
      dose_numero: 1,
      total_doses: 3
    }
  ];

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      setIsRedirecting(true);
      router.push('/login');
      return;
    }

    if (isAuthenticated) {
      fetchVacinacoes();
    }
  }, [isAuthenticated, authLoading, router]);

  const fetchVacinacoes = async () => {
    try {
      setLoading(true);
      // Simulando carregamento da API
      setTimeout(() => {
        setVacinacoes(dadosSimulados);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Erro ao carregar vacinações:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar dados das vacinações',
        variant: 'destructive',
      });
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'aplicada':
        return 'bg-green-100 text-green-800';
      case 'agendada':
        return 'bg-blue-100 text-blue-800';
      case 'atrasada':
        return 'bg-red-100 text-red-800';
      case 'cancelada':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'aplicada':
        return 'Aplicada';
      case 'agendada':
        return 'Agendada';
      case 'atrasada':
        return 'Atrasada';
      case 'cancelada':
        return 'Cancelada';
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

  const isVencida = (dataProximaDose?: string) => {
    if (!dataProximaDose) return false;
    return new Date(dataProximaDose) < new Date();
  };

  const filteredVacinacoes = vacinacoes.filter(vacinacao => {
    const matchesSearch = searchTerm === '' || 
      vacinacao.paciente_nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vacinacao.tutor_nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vacinacao.vacina.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vacinacao.veterinario.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'todos' || vacinacao.status === statusFilter;
    
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
            <Pill className="h-8 w-8 text-pink-600" />
            <h1 className="text-2xl font-bold">Vacinação</h1>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 mt-4 sm:mt-0 w-full sm:w-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Buscar por paciente, tutor, vacina ou veterinário..."
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
              <option value="aplicada">Aplicada</option>
              <option value="agendada">Agendada</option>
              <option value="atrasada">Atrasada</option>
              <option value="cancelada">Cancelada</option>
            </select>

            <button
              className="flex items-center justify-center gap-2 bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700 transition-colors"
              onClick={() => toast({ title: 'Em desenvolvimento', description: 'Funcionalidade em desenvolvimento' })}
            >
              <Plus className="h-5 w-5" />
              Agendar Vacina
            </button>
          </div>
        </div>

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Aplicadas</p>
                <p className="text-2xl font-bold text-green-600">
                  {vacinacoes.filter(v => v.status === 'aplicada').length}
                </p>
              </div>
              <Shield className="h-8 w-8 text-green-600" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Agendadas</p>
                <p className="text-2xl font-bold text-blue-600">
                  {vacinacoes.filter(v => v.status === 'agendada').length}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Atrasadas</p>
                <p className="text-2xl font-bold text-red-600">
                  {vacinacoes.filter(v => v.status === 'atrasada').length}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold text-pink-600">{vacinacoes.length}</p>
              </div>
              <User className="h-8 w-8 text-pink-600" />
            </div>
          </div>
        </div>

        {/* Tabela de Vacinações */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paciente</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vacina</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data Aplicação</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Próxima Dose</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dose</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Veterinário</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-800"></div>
                        <span className="ml-2">Carregando vacinações...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredVacinacoes.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                      Nenhuma vacinação encontrada
                    </td>
                  </tr>
                ) : (
                  filteredVacinacoes.map((vacinacao) => (
                    <tr key={vacinacao.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{vacinacao.paciente_nome}</div>
                        <div className="text-sm text-gray-500">{vacinacao.tutor_nome}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{vacinacao.vacina}</div>
                        <div className="text-xs text-gray-500">Lote: {vacinacao.lote}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 flex items-center">
                          <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                          {formatDate(vacinacao.data_aplicacao)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {vacinacao.data_proxima_dose ? (
                          <div className={`text-sm flex items-center ${isVencida(vacinacao.data_proxima_dose) ? 'text-red-600' : 'text-gray-900'}`}>
                            <Clock className="h-4 w-4 mr-1" />
                            {formatDate(vacinacao.data_proxima_dose)}
                            {isVencida(vacinacao.data_proxima_dose) && (
                              <AlertTriangle className="h-4 w-4 ml-1 text-red-500" />
                            )}
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {vacinacao.dose_numero}/{vacinacao.total_doses}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{vacinacao.veterinario}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(vacinacao.status)}`}>
                          {getStatusText(vacinacao.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            className="text-blue-600 hover:text-blue-900 p-1 rounded"
                            title="Ver detalhes"
                            onClick={() => toast({ title: 'Em desenvolvimento', description: 'Visualização de detalhes em desenvolvimento' })}
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            className="text-green-600 hover:text-green-900 p-1 rounded"
                            title="Editar"
                            onClick={() => toast({ title: 'Em desenvolvimento', description: 'Edição em desenvolvimento' })}
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          {vacinacao.status === 'agendada' && (
                            <button
                              className="text-purple-600 hover:text-purple-900 p-1 rounded"
                              title="Aplicar vacina"
                              onClick={() => toast({ title: 'Em desenvolvimento', description: 'Aplicação de vacina em desenvolvimento' })}
                            >
                              <Pill className="h-4 w-4" />
                            </button>
                          )}
                          <button
                            className="text-red-600 hover:text-red-900 p-1 rounded"
                            title="Cancelar"
                            onClick={() => toast({ title: 'Em desenvolvimento', description: 'Cancelamento em desenvolvimento' })}
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
        </div>
      </div>
    </VetLayout>
  );
}