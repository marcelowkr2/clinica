'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  DollarSign, 
  Search, 
  Plus, 
  Eye, 
  Edit, 
  Trash, 
  TrendingUp, 
  TrendingDown,
  Calendar,
  CreditCard,
  Banknote,
  ArrowUpCircle,
  ArrowDownCircle,
  PieChart,
  BarChart3,
  Filter,
  Download,
  Clock,
  FileText
} from 'lucide-react';
import { VetLayout } from '@/components/ui/VetLayout';
import { 
  financeiroService, 
  Transacao, 
  EstatisticasFinanceiras, 
  CreateTransacaoData 
} from '@/services/financeiro';
import { DetalhesTransacaoModal } from '@/components/ui/detalhes-transacao-modal';
import { EditarTransacaoModal } from '@/components/ui/editar-transacao-modal';

export default function FinanceiroPage() {
  const router = useRouter();
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);
  const [estatisticas, setEstatisticas] = useState<EstatisticasFinanceiras | null>(null);
  const [loading, setLoading] = useState(true);
  const [filtroTipo, setFiltroTipo] = useState<string>('todos');
  const [filtroStatus, setFiltroStatus] = useState<string>('todos');
  const [filtroMes, setFiltroMes] = useState<string>('todos');
  const [busca, setBusca] = useState('');
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [transacaoSelecionada, setTransacaoSelecionada] = useState<Transacao | null>(null);
  const [modalDetalhesAberto, setModalDetalhesAberto] = useState(false);
  const [modalEditarAberto, setModalEditarAberto] = useState(false);
  const [loadingOperacao, setLoadingOperacao] = useState(false);
  const itensPorPagina = 10;

  // Função utilitária para formatar valores monetários
  const formatarValor = (valor: any): string => {
    const numero = parseFloat(valor || 0);
    return numero.toFixed(2).replace('.', ',');
  };

  const fetchTransacoes = async () => {
    try {
      const data = await financeiroService.getTransacoes();
      setTransacoes(data);
    } catch (error) {
      console.error('Erro ao buscar transações:', error);
    }
  };

  const fetchEstatisticas = async () => {
    try {
      const data = await financeiroService.getEstatisticas();
      setEstatisticas(data);
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
    }
  };

  // Função para visualizar detalhes da transação
  const handleVisualizarTransacao = (transacao: Transacao) => {
    setTransacaoSelecionada(transacao);
    setModalDetalhesAberto(true);
  };

  // Função para editar transação
  const handleEditarTransacao = (transacao: Transacao) => {
    setTransacaoSelecionada(transacao);
    setModalEditarAberto(true);
  };

  // Função para salvar edição da transação
  const handleSalvarEdicao = async (data: Partial<CreateTransacaoData>) => {
    if (!transacaoSelecionada) return;
    
    try {
      setLoadingOperacao(true);
      await financeiroService.updateTransacao(transacaoSelecionada.id, data);
      await fetchTransacoes();
      await fetchEstatisticas();
      setModalEditarAberto(false);
      setTransacaoSelecionada(null);
    } catch (error) {
      console.error('Erro ao atualizar transação:', error);
      throw error;
    } finally {
      setLoadingOperacao(false);
    }
  };

  // Função para deletar transação
  const handleDeletarTransacao = async (transacao: Transacao) => {
    if (!confirm(`Tem certeza que deseja excluir a transação "${transacao.descricao}"?`)) {
      return;
    }

    try {
      setLoadingOperacao(true);
      await financeiroService.deleteTransacao(transacao.id);
      await fetchTransacoes();
      await fetchEstatisticas();
    } catch (error) {
      console.error('Erro ao deletar transação:', error);
      alert('Erro ao deletar transação. Tente novamente.');
    } finally {
      setLoadingOperacao(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchTransacoes(), fetchEstatisticas()]);
      setLoading(false);
    };
    
    loadData();
  }, []);

  // Recarregar dados quando a página ganha foco (útil quando volta de nova transação)
  useEffect(() => {
    const handleFocus = () => {
      fetchTransacoes();
      fetchEstatisticas();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  // Verificar se uma nova transação foi criada e recarregar dados
  useEffect(() => {
    const checkForNewTransaction = () => {
      const newTransactionFlag = sessionStorage.getItem('newTransactionCreated');
      if (newTransactionFlag === 'true') {
        sessionStorage.removeItem('newTransactionCreated');
        fetchTransacoes();
        fetchEstatisticas();
      }
    };

    // Verificar imediatamente
    checkForNewTransaction();

    // Verificar periodicamente
    const interval = setInterval(checkForNewTransaction, 1000);
    return () => clearInterval(interval);
  }, []);

  const gerarRelatorio = () => {
    // Criar dados do relatório
    const dataAtual = new Date().toLocaleDateString('pt-BR');
    const relatorioData = {
      data_geracao: dataAtual,
      periodo: filtroMes === 'atual' ? 'Mês Atual' : 'Todos os Períodos',
      estatisticas: {
        total_receitas: totalReceitas,
        total_despesas: totalDespesas,
        saldo_liquido: saldoLiquido,
        transacoes_pendentes: transacoesPendentes
      },
      transacoes: transacoesFiltradas
    };

    // Gerar CSV
    const csvContent = [
      ['Relatório Financeiro - ' + dataAtual],
      [''],
      ['Resumo Financeiro'],
      ['Total de Receitas', 'R$ ' + formatarValor(totalReceitas)],
      ['Total de Despesas', 'R$ ' + formatarValor(totalDespesas)],
      ['Saldo Líquido', 'R$ ' + formatarValor(saldoLiquido)],
      ['Transações Pendentes', transacoesPendentes.toString()],
      [''],
      ['Detalhamento das Transações'],
      ['Tipo', 'Categoria', 'Descrição', 'Valor', 'Data', 'Status', 'Forma de Pagamento', 'Cliente/Fornecedor'],
      ...transacoesFiltradas.map(t => [
        t.tipo === 'receita' ? 'Receita' : 'Despesa',
        t.categoria,
        t.descricao,
        'R$ ' + formatarValor(t.valor),
        new Date(t.data).toLocaleDateString('pt-BR'),
        t.status,
        getPaymentText(t.forma_pagamento),
        t.cliente_fornecedor || ''
      ])
    ].map(row => row.join(';')).join('\n');

    // Download do arquivo
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `relatorio-financeiro-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const criarNovaTransacao = () => {
    router.push('/financeiro/nova-transacao');
  };

  const transacoesFiltradas = transacoes.filter(transacao => {
    const matchesSearch = transacao.descricao.toLowerCase().includes(busca.toLowerCase()) ||
                         transacao.categoria.toLowerCase().includes(busca.toLowerCase()) ||
                         (transacao.cliente_fornecedor && transacao.cliente_fornecedor.toLowerCase().includes(busca.toLowerCase()));
    const matchesStatus = filtroStatus === 'todos' || transacao.status === filtroStatus;
    const matchesTipo = filtroTipo === 'todos' || transacao.tipo === filtroTipo;
    
    // Filtro por mês
    let matchesMes = true;
    if (filtroMes && filtroMes !== 'todos') {
      if (filtroMes === 'atual') {
        const hoje = new Date();
        const transacaoData = new Date(transacao.data);
        matchesMes = transacaoData.getMonth() === hoje.getMonth() && 
                     transacaoData.getFullYear() === hoje.getFullYear();
      } else {
        const [ano, mes] = filtroMes.split('-');
        const transacaoData = new Date(transacao.data);
        matchesMes = transacaoData.getMonth() === parseInt(mes) - 1 && 
                     transacaoData.getFullYear() === parseInt(ano);
      }
    }
    
    return matchesSearch && matchesStatus && matchesTipo && matchesMes;
  });

  const totalPaginas = Math.ceil(transacoesFiltradas.length / itensPorPagina);
  const startIndex = (paginaAtual - 1) * itensPorPagina;
  const endIndex = startIndex + itensPorPagina;
  const transacoesPaginadas = transacoesFiltradas.slice(startIndex, endIndex);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pago': return 'bg-green-100 text-green-800';
      case 'pendente': return 'bg-yellow-100 text-yellow-800';
      case 'vencido': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pago': return 'Pago';
      case 'pendente': return 'Pendente';
      case 'vencido': return 'Vencido';
      default: return status;
    }
  };

  const getPaymentText = (forma: string) => {
    switch (forma) {
      case 'dinheiro': return 'Dinheiro';
      case 'cartao_credito': return 'Cartão Crédito';
      case 'cartao_debito': return 'Cartão Débito';
      case 'pix': return 'PIX';
      case 'transferencia': return 'Transferência';
      case 'boleto': return 'Boleto';
      default: return forma;
    }
  };

  // Cálculos financeiros usando estatísticas da API ou fallback
  const totalReceitas = estatisticas?.totalReceitas || 0;
  const totalDespesas = estatisticas?.totalDespesas || 0;
  const saldoLiquido = estatisticas?.saldoLiquido || 0;
  const transacoesPendentes = estatisticas?.pendentes || 0;

  return (
    <VetLayout>
      <div className="h-full flex flex-col overflow-hidden">
        <div className="flex-shrink-0 p-6 border-b bg-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Financeiro</h1>
              <p className="text-gray-600">Controle financeiro e relatórios</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                className="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                onClick={gerarRelatorio}
              >
                <Download className="h-4 w-4" />
                Relatório
              </button>
              <button
                className="flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                onClick={criarNovaTransacao}
              >
                <Plus className="h-4 w-4" />
                Nova Transação
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Receitas</p>
                <p className="text-2xl font-bold text-green-600">
                  R$ {formatarValor(estatisticas?.totalReceitas || totalReceitas)}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Despesas</p>
                <p className="text-2xl font-bold text-red-600">
                  R$ {formatarValor(estatisticas?.totalDespesas || totalDespesas)}
                </p>
              </div>
              <div className="p-3 bg-red-100 rounded-full">
                <TrendingDown className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Saldo Líquido</p>
                <p className={`text-2xl font-bold ${saldoLiquido >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  R$ {formatarValor(estatisticas?.saldoLiquido || saldoLiquido)}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pendentes</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {estatisticas?.pendentes || transacoesPendentes}
                </p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar por descrição, categoria ou cliente..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
              />
            </div>
            
            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value)}
            >
              <option value="todos">Todos os Tipos</option>
              <option value="receita">Receitas</option>
              <option value="despesa">Despesas</option>
            </select>

            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value)}
            >
              <option value="todos">Todos os Status</option>
              <option value="pago">Pago</option>
              <option value="pendente">Pendente</option>
              <option value="vencido">Vencido</option>
            </select>

            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={filtroMes}
              onChange={(e) => setFiltroMes(e.target.value)}
            >
              <option value="atual">Mês Atual</option>
              <option value="todos">Todos os Meses</option>
            </select>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : transacoesFiltradas.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Nenhuma transação encontrada</p>
            </div>
          ) : (
            <div className="overflow-x-auto h-full">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tipo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Descrição
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Categoria
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Valor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Data
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Pagamento
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                   {transacoesPaginadas.map((transacao) => (
                    <tr key={transacao.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          transacao.tipo === 'receita' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {transacao.tipo === 'receita' ? 'Receita' : 'Despesa'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {transacao.descricao}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {transacao.categoria}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <span className={transacao.tipo === 'receita' ? 'text-green-600' : 'text-red-600'}>
                          R$ {formatarValor(transacao.valor)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(transacao.data).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {getPaymentText(transacao.forma_pagamento)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          transacao.status === 'pago' 
                            ? 'bg-green-100 text-green-800'
                            : transacao.status === 'pendente'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {getStatusText(transacao.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => handleVisualizarTransacao(transacao)}
                            className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                            title="Visualizar detalhes"
                            disabled={loadingOperacao}
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleEditarTransacao(transacao)}
                            className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50"
                            title="Editar transação"
                            disabled={loadingOperacao}
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleDeletarTransacao(transacao)}
                            className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                            title="Excluir transação"
                            disabled={loadingOperacao}
                          >
                            <Trash className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

          {/* Paginação */}
          {totalPaginas > 1 && (
            <div className="flex-shrink-0 flex items-center justify-between border-t border-gray-200 bg-white px-6 py-3">
              <div className="flex flex-1 justify-between sm:hidden">
                <button
                  onClick={() => setPaginaAtual(Math.max(1, paginaAtual - 1))}
                  disabled={paginaAtual === 1}
                  className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Anterior
                </button>
                <button
                   onClick={() => setPaginaAtual(Math.min(totalPaginas, paginaAtual + 1))}
                   disabled={paginaAtual === totalPaginas}
                  className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Próxima
                </button>
              </div>
              <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Mostrando <span className="font-medium">{(paginaAtual - 1) * itensPorPagina + 1}</span> até{' '}
                      <span className="font-medium">
                        {Math.min(paginaAtual * itensPorPagina, transacoesFiltradas.length)}
                      </span>{' '}
                      de <span className="font-medium">{transacoesFiltradas.length}</span> resultados
                    </p>
                  </div>
                  <div>
                    <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm">
                      <button
                        onClick={() => setPaginaAtual(Math.max(1, paginaAtual - 1))}
                        disabled={paginaAtual === 1}
                        className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-50"
                      >
                        ←
                      </button>
                      {Array.from({ length: Math.min(5, totalPaginas) }, (_, i) => {
                        let pageNumber;
                        if (totalPaginas <= 5) {
                          pageNumber = i + 1;
                        } else if (paginaAtual <= 3) {
                          pageNumber = i + 1;
                        } else if (paginaAtual >= totalPaginas - 2) {
                          pageNumber = totalPaginas - 4 + i;
                        } else {
                          pageNumber = paginaAtual - 2 + i;
                        }
                        return (
                          <button
                            key={pageNumber}
                            onClick={() => setPaginaAtual(pageNumber)}
                            className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                              pageNumber === paginaAtual
                                ? 'z-10 bg-blue-600 text-white'
                                : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            {pageNumber}
                          </button>
                        );
                      })}
                      <button
                        onClick={() => setPaginaAtual(Math.min(totalPaginas, paginaAtual + 1))}
                        disabled={paginaAtual === totalPaginas}
                        className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-50"
                      >
                        →
                      </button>
                    </nav>
                  </div>
                </div>
            </div>
          )}
        </div>

        {/* Modais */}
        <DetalhesTransacaoModal
          isOpen={modalDetalhesAberto}
          onClose={() => {
            setModalDetalhesAberto(false);
            setTransacaoSelecionada(null);
          }}
          transacao={transacaoSelecionada}
        />

        <EditarTransacaoModal
          isOpen={modalEditarAberto}
          onClose={() => {
            setModalEditarAberto(false);
            setTransacaoSelecionada(null);
          }}
          onSave={handleSalvarEdicao}
          transacao={transacaoSelecionada}
          loading={loadingOperacao}
        />
      </div>
    </VetLayout>
  );
}