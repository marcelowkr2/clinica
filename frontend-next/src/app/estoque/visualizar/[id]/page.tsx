'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Edit, Trash2, Package, Calendar, MapPin, DollarSign, AlertTriangle } from 'lucide-react';
import { estoqueService, Produto } from '@/services/estoque';

export default function VisualizarProdutoPage() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [produto, setProduto] = useState<Produto | null>(null);

  useEffect(() => {
    const loadProduto = async () => {
      try {
        const id = parseInt(params.id as string);
        const produtoData = await estoqueService.getProdutoById(id);
        
        if (produtoData) {
          setProduto(produtoData);
        } else {
          alert('Produto não encontrado');
          router.push('/estoque');
        }
      } catch (error) {
        console.error('Erro ao carregar produto:', error);
        alert('Erro ao carregar produto');
        router.push('/estoque');
      } finally {
        setLoading(false);
      }
    };

    loadProduto();
  }, [params.id, router]);

  const handleEdit = () => {
    router.push(`/estoque/editar/${produto?.id}`);
  };

  const handleDelete = async () => {
    if (!produto) return;
    
    if (confirm(`Tem certeza que deseja excluir o produto "${produto.nome}"?`)) {
      try {
        await estoqueService.deleteProduto(produto.id);
        router.push('/estoque');
      } catch (error) {
        console.error('Erro ao excluir produto:', error);
        alert('Erro ao excluir produto. Tente novamente.');
      }
    }
  };

  const handleBack = () => {
    router.push('/estoque');
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Não informado';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ativo':
        return 'bg-green-100 text-green-800';
      case 'inativo':
        return 'bg-yellow-100 text-yellow-800';
      case 'descontinuado':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ativo':
        return 'Ativo';
      case 'inativo':
        return 'Inativo';
      case 'descontinuado':
        return 'Descontinuado';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-600">Carregando produto...</div>
          </div>
        </div>
      </div>
    );
  }

  if (!produto) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-600">Produto não encontrado</div>
          </div>
        </div>
      </div>
    );
  }

  const isEstoqueBaixo = produto.quantidade_atual <= produto.quantidade_minima;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
            >
              <ArrowLeft className="w-5 h-5" />
              Voltar
            </button>
            <h1 className="text-2xl font-bold text-gray-800">Detalhes do Produto</h1>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={handleEdit}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <Edit className="w-4 h-4" />
              Editar
            </button>
            <button
              onClick={handleDelete}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Excluir
            </button>
          </div>
        </div>

        {/* Alerta de Estoque Baixo */}
        {isEstoqueBaixo && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
              <span className="text-yellow-800 font-medium">
                Atenção: Estoque baixo! Quantidade atual ({produto.quantidade_atual}) está igual ou abaixo do mínimo ({produto.quantidade_minima}).
              </span>
            </div>
          </div>
        )}

        {/* Informações do Produto */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">{produto.nome}</h2>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600">Código: {produto.codigo}</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(produto.status)}`}>
                  {getStatusText(produto.status)}
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-green-600">{formatCurrency(produto.preco_venda)}</div>
              <div className="text-sm text-gray-600">Preço de Venda</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Informações Básicas */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-800 border-b border-gray-200 pb-2">Informações Básicas</h3>
              
              <div>
                <label className="text-sm font-medium text-gray-600">Categoria</label>
                <p className="text-gray-800">{produto.categoria}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-600">Marca</label>
                <p className="text-gray-800">{produto.marca}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-600">Fornecedor</label>
                <p className="text-gray-800">{produto.fornecedor}</p>
              </div>
              
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-500" />
                <div>
                  <label className="text-sm font-medium text-gray-600">Localização</label>
                  <p className="text-gray-800">{produto.localizacao}</p>
                </div>
              </div>
            </div>

            {/* Estoque */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-800 border-b border-gray-200 pb-2">Estoque</h3>
              
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-gray-500" />
                <div>
                  <label className="text-sm font-medium text-gray-600">Quantidade Atual</label>
                  <p className={`text-lg font-semibold ${isEstoqueBaixo ? 'text-red-600' : 'text-gray-800'}`}>
                    {produto.quantidade_atual} {produto.unidade_medida}
                  </p>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-600">Quantidade Mínima</label>
                <p className="text-gray-800">{produto.quantidade_minima} {produto.unidade_medida}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-600">Unidade de Medida</label>
                <p className="text-gray-800">{produto.unidade_medida}</p>
              </div>
              
              {produto.data_validade && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <div>
                    <label className="text-sm font-medium text-gray-600">Data de Validade</label>
                    <p className="text-gray-800">{formatDate(produto.data_validade)}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Preços */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-800 border-b border-gray-200 pb-2">Preços</h3>
              
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-gray-500" />
                <div>
                  <label className="text-sm font-medium text-gray-600">Preço de Compra</label>
                  <p className="text-gray-800">{formatCurrency(produto.preco_compra)}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-green-500" />
                <div>
                  <label className="text-sm font-medium text-gray-600">Preço de Venda</label>
                  <p className="text-green-600 font-semibold">{formatCurrency(produto.preco_venda)}</p>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-600">Margem de Lucro</label>
                <p className="text-gray-800">
                  {((produto.preco_venda - produto.preco_compra) / produto.preco_compra * 100).toFixed(1)}%
                </p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-600">Valor Total em Estoque</label>
                <p className="text-gray-800 font-semibold">
                  {formatCurrency(produto.quantidade_atual * produto.preco_compra)}
                </p>
              </div>
            </div>
          </div>

          {/* Observações */}
          {produto.observacoes && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="font-semibold text-gray-800 mb-2">Observações</h3>
              <p className="text-gray-700">{produto.observacoes}</p>
            </div>
          )}

          {/* Datas */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Data de Cadastro</label>
                <p className="text-gray-800">{formatDate(produto.data_cadastro)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Última Atualização</label>
                <p className="text-gray-800">{formatDate(produto.data_atualizacao)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}