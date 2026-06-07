'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ShoppingCart, 
  Plus, 
  Minus, 
  Trash, 
  Search,
  User,
  Phone,
  Mail,
  CreditCard,
  DollarSign,
  Package,
  Save,
  ArrowLeft
} from 'lucide-react';
import { VetLayout } from '@/components/ui/VetLayout';
import { vendasService, CreateVendaData } from '@/services/vendas';
import { estoqueService, Produto } from '@/services/estoque';

interface ItemCarrinho {
  produto_id: number;
  produto_nome: string;
  produto_codigo: string;
  produto_imagem?: string;
  preco_unitario: number;
  quantidade: number;
  subtotal: number;
  estoque_disponivel: number;
}

export default function NovaVendaPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [produtosFiltrados, setProdutosFiltrados] = useState<Produto[]>([]);
  const [searchProduto, setSearchProduto] = useState('');
  const [carrinho, setCarrinho] = useState<ItemCarrinho[]>([]);
  
  // Dados do cliente
  const [clienteNome, setClienteNome] = useState('');
  const [clienteTelefone, setClienteTelefone] = useState('');
  const [clienteEmail, setClienteEmail] = useState('');
  
  // Dados da venda
  const [formaPagamento, setFormaPagamento] = useState<'dinheiro' | 'cartao_credito' | 'cartao_debito' | 'pix' | 'transferencia'>('dinheiro');
  const [desconto, setDesconto] = useState(0);
  const [observacoes, setObservacoes] = useState('');

  useEffect(() => {
    loadProdutos();
  }, []);

  useEffect(() => {
    if (searchProduto.trim()) {
      const filtrados = produtos.filter(produto =>
        produto.nome.toLowerCase().includes(searchProduto.toLowerCase()) ||
        produto.codigo.toLowerCase().includes(searchProduto.toLowerCase()) ||
        produto.categoria.toLowerCase().includes(searchProduto.toLowerCase())
      );
      setProdutosFiltrados(filtrados);
    } else {
      setProdutosFiltrados([]);
    }
  }, [searchProduto, produtos]);

  const loadProdutos = async () => {
    try {
      const produtosData = await estoqueService.getProdutos();
      // Filtrar apenas produtos ativos com estoque
      const produtosDisponiveis = produtosData.filter(p => 
        p.status === 'ativo' && p.quantidade_atual > 0
      );
      setProdutos(produtosDisponiveis);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
    }
  };

  const adicionarProduto = (produto: Produto) => {
    const itemExistente = carrinho.find(item => item.produto_id === produto.id);
    
    if (itemExistente) {
      if (itemExistente.quantidade < produto.quantidade_atual) {
        setCarrinho(carrinho.map(item =>
          item.produto_id === produto.id
            ? {
                ...item,
                quantidade: item.quantidade + 1,
                subtotal: (item.quantidade + 1) * Number(item.preco_unitario)
              }
            : item
        ));
      } else {
        alert('Quantidade em estoque insuficiente');
      }
    } else {
      const novoItem: ItemCarrinho = {
        produto_id: produto.id,
        produto_nome: produto.nome,
        produto_codigo: produto.codigo,
        produto_imagem: produto.imagem,
        preco_unitario: Number(produto.preco_venda),
        quantidade: 1,
        subtotal: Number(produto.preco_venda),
        estoque_disponivel: produto.quantidade_atual
      };
      setCarrinho([...carrinho, novoItem]);
    }
    setSearchProduto('');
  };

  const atualizarQuantidade = (produtoId: number, novaQuantidade: number) => {
    if (novaQuantidade <= 0) {
      removerProduto(produtoId);
      return;
    }

    const item = carrinho.find(item => item.produto_id === produtoId);
    if (item && novaQuantidade > item.estoque_disponivel) {
      alert('Quantidade em estoque insuficiente');
      return;
    }

    setCarrinho(carrinho.map(item =>
      item.produto_id === produtoId
        ? {
            ...item,
            quantidade: novaQuantidade,
            subtotal: Number(novaQuantidade) * Number(item.preco_unitario)
          }
        : item
    ));
  };

  const removerProduto = (produtoId: number) => {
    setCarrinho(carrinho.filter(item => item.produto_id !== produtoId));
  };

  const calcularSubtotal = () => {
    return carrinho.reduce((acc, item) => acc + Number(item.subtotal), 0);
  };

  const calcularTotal = () => {
    return calcularSubtotal() - desconto;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!clienteNome.trim()) {
      alert('Nome do cliente é obrigatório');
      return;
    }
    
    if (!clienteTelefone.trim()) {
      alert('Telefone do cliente é obrigatório');
      return;
    }
    
    if (carrinho.length === 0) {
      alert('Adicione pelo menos um produto à venda');
      return;
    }

    setLoading(true);
    try {
      const vendaData: CreateVendaData = {
        cliente_nome: clienteNome,
        cliente_telefone: clienteTelefone,
        cliente_email: clienteEmail || undefined,
        forma_pagamento: formaPagamento,
        desconto: desconto > 0 ? desconto : undefined,
        observacoes: observacoes || undefined,
        itens: carrinho.map(item => ({
          produto_id: item.produto_id,
          quantidade: item.quantidade,
          preco_unitario: item.preco_unitario
        }))
      };

      await vendasService.createVenda(vendaData);
      alert('Venda criada com sucesso!');
      router.push('/vendas');
    } catch (error) {
      console.error('Erro ao criar venda:', error);
      alert('Erro ao criar venda. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

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
              <h1 className="text-2xl font-bold text-gray-900">Nova Venda</h1>
              <p className="text-gray-600">Registre uma nova venda</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Dados do Cliente */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <User className="w-5 h-5" />
                Dados do Cliente
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome do Cliente *
                  </label>
                  <input
                    type="text"
                    value={clienteNome}
                    onChange={(e) => setClienteNome(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nome completo do cliente"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Telefone *
                  </label>
                  <input
                    type="tel"
                    value={clienteTelefone}
                    onChange={(e) => setClienteTelefone(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="(11) 99999-9999"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={clienteEmail}
                    onChange={(e) => setClienteEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="email@exemplo.com"
                  />
                </div>
              </div>
            </div>

            {/* Dados da Venda */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Dados da Venda
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Forma de Pagamento *
                  </label>
                  <select
                    value={formaPagamento}
                    onChange={(e) => setFormaPagamento(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="dinheiro">Dinheiro</option>
                    <option value="cartao_credito">Cartão de Crédito</option>
                    <option value="cartao_debito">Cartão de Débito</option>
                    <option value="pix">PIX</option>
                    <option value="transferencia">Transferência</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Desconto (R$)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={desconto}
                    onChange={(e) => setDesconto(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0,00"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Observações
                  </label>
                  <textarea
                    value={observacoes}
                    onChange={(e) => setObservacoes(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Observações sobre a venda..."
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Adicionar Produtos */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Package className="w-5 h-5" />
              Produtos
            </h2>
            
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Buscar produtos por nome, código ou categoria..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
                  value={searchProduto}
                  onChange={(e) => setSearchProduto(e.target.value)}
                />
              </div>
              
              {/* Lista de produtos filtrados */}
              {produtosFiltrados.length > 0 && (
                <div className="mt-2 max-h-60 overflow-y-auto border border-gray-200 rounded-lg">
                  {produtosFiltrados.map((produto) => (
                    <div
                      key={produto.id}
                      className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                      onClick={() => adicionarProduto(produto)}
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          {produto.imagem && (
                            <img
                              src={produto.imagem}
                              alt={produto.nome}
                              className="w-12 h-12 object-cover rounded-md border border-gray-200"
                            />
                          )}
                          <div>
                            <p className="font-medium text-gray-900">{produto.nome}</p>
                            <p className="text-sm text-gray-600">
                              {produto.codigo} - {produto.categoria}
                            </p>
                            <p className="text-sm text-gray-500">
                              Estoque: {produto.quantidade_atual} {produto.unidade_medida}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-600">
                            R$ {Number(produto.preco_venda).toFixed(2).replace('.', ',')}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Carrinho */}
            {carrinho.length > 0 && (
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900">Itens da Venda</h3>
                {carrinho.map((item) => (
                  <div key={item.produto_id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      {item.produto_imagem && (
                        <img
                          src={item.produto_imagem}
                          alt={item.produto_nome}
                          className="w-12 h-12 object-cover rounded-md border border-gray-200"
                        />
                      )}
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{item.produto_nome}</p>
                        <p className="text-sm text-gray-600">{item.produto_codigo}</p>
                        <p className="text-sm text-gray-500">
                          R$ {Number(item.preco_unitario).toFixed(2).replace('.', ',')} cada
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => atualizarQuantidade(item.produto_id, item.quantidade - 1)}
                          className="p-1 text-gray-500 hover:text-gray-700"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-12 text-center font-medium">{item.quantidade}</span>
                        <button
                          type="button"
                          onClick={() => atualizarQuantidade(item.produto_id, item.quantidade + 1)}
                          className="p-1 text-gray-500 hover:text-gray-700"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <div className="text-right min-w-[80px]">
                        <p className="font-bold text-gray-900">
                          R$ {Number(item.subtotal).toFixed(2).replace('.', ',')}
                        </p>
                      </div>
                      
                      <button
                        type="button"
                        onClick={() => removerProduto(item.produto_id)}
                        className="p-1 text-red-500 hover:text-red-700"
                      >
                        <Trash className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Resumo da Venda */}
          {carrinho.length > 0 && (
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Resumo da Venda
              </h2>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium">
                    R$ {Number(calcularSubtotal()).toFixed(2).replace('.', ',')}
                  </span>
                </div>
                
                {desconto > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Desconto:</span>
                    <span className="font-medium text-red-600">
                      - R$ {Number(desconto).toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                )}
                
                <div className="border-t pt-2">
                  <div className="flex justify-between">
                    <span className="text-lg font-bold text-gray-900">Total:</span>
                    <span className="text-lg font-bold text-green-600">
                      R$ {Number(calcularTotal()).toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Botões */}
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => router.push('/vendas')}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || carrinho.length === 0}
              className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Save className="w-4 h-4" />
              )}
              {loading ? 'Salvando...' : 'Finalizar Venda'}
            </button>
          </div>
        </form>
      </div>
    </VetLayout>
  );
}