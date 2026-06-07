'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { 
  ArrowLeft, 
  Edit, 
  Trash, 
  User, 
  Phone, 
  Mail, 
  Calendar, 
  CreditCard, 
  Package, 
  DollarSign,
  CheckCircle,
  Clock,
  XCircle,
  Banknote
} from 'lucide-react';
import { VetLayout } from '@/components/ui/VetLayout';
import { vendasService, Venda } from '@/services/vendas';

export default function VisualizarVendaPage() {
  const router = useRouter();
  const params = useParams();
  const [venda, setVenda] = useState<Venda | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      loadVenda(parseInt(params.id as string));
    }
  }, [params.id]);

  const loadVenda = async (id: number) => {
    try {
      const vendaData = await vendasService.getVendaById(id);
      setVenda(vendaData);
    } catch (error) {
      console.error('Erro ao carregar venda:', error);
      alert('Erro ao carregar venda');
      router.push('/vendas');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!venda) return;
    
    if (confirm('Tem certeza que deseja excluir esta venda? Esta ação não pode ser desfeita.')) {
      try {
        await vendasService.deleteVenda(venda.id);
        alert('Venda excluída com sucesso!');
        router.push('/vendas');
      } catch (error) {
        console.error('Erro ao excluir venda:', error);
        alert('Erro ao excluir venda');
      }
    }
  };

  const handleUpdateStatus = async (novoStatus: 'pendente' | 'pago' | 'cancelado') => {
    if (!venda) return;
    
    try {
      const vendaAtualizada = await vendasService.updateStatusVenda(venda.id, novoStatus);
      setVenda(vendaAtualizada);
      alert('Status da venda atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      alert('Erro ao atualizar status da venda');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pago': return 'bg-green-100 text-green-800';
      case 'pendente': return 'bg-yellow-100 text-yellow-800';
      case 'cancelado': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pago': return <CheckCircle className="w-4 h-4" />;
      case 'pendente': return <Clock className="w-4 h-4" />;
      case 'cancelado': return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pago': return 'Pago';
      case 'pendente': return 'Pendente';
      case 'cancelado': return 'Cancelado';
      default: return status;
    }
  };

  const getPaymentIcon = (forma: string) => {
    switch (forma) {
      case 'dinheiro': return <Banknote className="w-4 h-4" />;
      case 'cartao_credito': 
      case 'cartao_debito': return <CreditCard className="w-4 h-4" />;
      case 'pix': return <DollarSign className="w-4 h-4" />;
      default: return <DollarSign className="w-4 h-4" />;
    }
  };

  const getPaymentText = (forma: string) => {
    switch (forma) {
      case 'dinheiro': return 'Dinheiro';
      case 'cartao_credito': return 'Cartão Crédito';
      case 'cartao_debito': return 'Cartão Débito';
      case 'pix': return 'PIX';
      case 'transferencia': return 'Transferência';
      default: return forma;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const formatCurrency = (value: number) => {
    return `R$ ${value.toFixed(2).replace('.', ',')}`;
  };

  if (loading) {
    return (
      <VetLayout>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Carregando venda...</span>
        </div>
      </VetLayout>
    );
  }

  if (!venda) {
    return (
      <VetLayout>
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-900">Venda não encontrada</h2>
          <button
            onClick={() => router.push('/vendas')}
            className="mt-4 text-blue-600 hover:text-blue-800"
          >
            Voltar para vendas
          </button>
        </div>
      </VetLayout>
    );
  }

  return (
    <VetLayout>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/vendas')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{venda.numero_venda}</h1>
              <p className="text-gray-600">Detalhes da venda</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push(`/vendas/editar/${venda.id}`)}
              className="flex items-center gap-2 px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
            >
              <Edit className="w-4 h-4" />
              Editar
            </button>
            <button
              onClick={handleDelete}
              className="flex items-center gap-2 px-4 py-2 text-red-600 border border-red-600 rounded-lg hover:bg-red-50 transition-colors"
            >
              <Trash className="w-4 h-4" />
              Excluir
            </button>
          </div>
        </div>

        {/* Header da Venda */}
        <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <Package className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">{venda.numero_venda}</h2>
                <p className="text-gray-600">{venda.cliente_nome}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-green-600">{formatCurrency(venda.total)}</div>
              <div className="text-sm text-gray-600">Total da Venda</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Informações do Cliente */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <User className="w-5 h-5" />
              Informações do Cliente
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <User className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600">Nome</p>
                  <p className="font-medium text-gray-900">{venda.cliente_nome}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600">Telefone</p>
                  <p className="font-medium text-gray-900">{venda.cliente_telefone}</p>
                </div>
              </div>
              
              {venda.cliente_email && (
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium text-gray-900">{venda.cliente_email}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Informações da Venda */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Informações da Venda
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600">Data da Venda</p>
                  <p className="font-medium text-gray-900">{formatDate(venda.data_venda)}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                {getPaymentIcon(venda.forma_pagamento)}
                <div>
                  <p className="text-sm text-gray-600">Forma de Pagamento</p>
                  <p className="font-medium text-gray-900">{getPaymentText(venda.forma_pagamento)}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                {getStatusIcon(venda.status)}
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(venda.status)}`}>
                    {getStatusText(venda.status)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Itens da Venda */}
        <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Package className="w-5 h-5" />
            Itens da Venda
          </h3>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Produto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Código
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantidade
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Preço Unit.
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Subtotal
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {venda.itens.map((item) => (
                  <tr key={item.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{item.produto_nome}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{item.produto_codigo}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{item.quantidade}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatCurrency(item.preco_unitario)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{formatCurrency(item.subtotal)}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Resumo Financeiro */}
        <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Resumo Financeiro
          </h3>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal:</span>
              <span className="font-medium">
                {formatCurrency(venda.total + (venda.desconto || 0))}
              </span>
            </div>
            
            {venda.desconto && venda.desconto > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Desconto:</span>
                <span className="font-medium text-red-600">
                  - {formatCurrency(venda.desconto)}
                </span>
              </div>
            )}
            
            <div className="border-t pt-2">
              <div className="flex justify-between">
                <span className="text-lg font-bold text-gray-900">Total:</span>
                <span className="text-lg font-bold text-green-600">
                  {formatCurrency(venda.total)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Ações de Status */}
        {venda.status !== 'cancelado' && (
          <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Ações</h3>
            
            <div className="flex gap-4">
              {venda.status === 'pendente' && (
                <button
                  onClick={() => handleUpdateStatus('pago')}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <CheckCircle className="w-4 h-4" />
                  Marcar como Pago
                </button>
              )}
              
              {venda.status === 'pago' && (
                <button
                  onClick={() => handleUpdateStatus('pendente')}
                  className="flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                >
                  <Clock className="w-4 h-4" />
                  Marcar como Pendente
                </button>
              )}
              
              {venda.status !== 'cancelado' && (
                <button
                  onClick={() => handleUpdateStatus('cancelado')}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <XCircle className="w-4 h-4" />
                  Cancelar Venda
                </button>
              )}
            </div>
          </div>
        )}

        {/* Observações */}
        {venda.observacoes && (
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Observações</h3>
            <p className="text-gray-700">{venda.observacoes}</p>
          </div>
        )}
      </div>
    </VetLayout>
  );
}