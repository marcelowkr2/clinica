import api from './api';
import { Produto, CreateProdutoData, UpdateProdutoData, EstatisticasEstoque } from '../types/estoque';

// Dados mockados para fallback (caso a API não esteja disponível)
const mockProdutos: Produto[] = [
  {
    id: 1,
    codigo: 'RAC001',
    nome: 'Ração Premium Cães Adultos 15kg',
    categoria: 'Alimentação',
    marca: 'Royal Canin',
    preco_compra: 95.00,
    preco_venda: 120.00,
    quantidade_atual: 25,
    quantidade_minima: 10,
    unidade_medida: 'un',
    data_validade: '2025-06-15',
    fornecedor: 'Pet Distribuidora',
    localizacao: 'A1-B2',
    status: 'ativo',
    observacoes: 'Produto premium para cães adultos',
    data_cadastro: '2024-01-15',
    data_atualizacao: '2024-12-15',
    imagem: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxyZWN0IHg9IjQwIiB5PSI0MCIgd2lkdGg9IjEyMCIgaGVpZ2h0PSIxMjAiIHJ4PSIxMCIgZmlsbD0iIzM5OEVGNyIvPgo8dGV4dCB4PSIxMDAiIHk9IjEwNSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+UmHDp8OjbzwvdGV4dD4KPC9zdmc+'
  },
  {
    id: 2,
    codigo: 'SHP001',
    nome: 'Shampoo Antipulgas 500ml',
    categoria: 'Higiene',
    marca: 'Vetnil',
    preco_compra: 18.50,
    preco_venda: 30.00,
    quantidade_atual: 5,
    quantidade_minima: 15,
    unidade_medida: 'un',
    data_validade: '2025-12-20',
    fornecedor: 'Vetnil Distribuidora',
    localizacao: 'B2-C1',
    status: 'ativo',
    observacoes: 'Shampoo com ação antipulgas',
    data_cadastro: '2024-02-10',
    data_atualizacao: '2024-12-10',
    imagem: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxyZWN0IHg9IjQwIiB5PSI0MCIgd2lkdGg9IjEyMCIgaGVpZ2h0PSIxMjAiIHJ4PSIxMCIgZmlsbD0iIzEwQjk4MSIvPgo8dGV4dCB4PSIxMDAiIHk9IjEwNSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+U2hhbXBvbzwvdGV4dD4KPC9zdmc+'
  },
  {
    id: 3,
    codigo: 'MED001',
    nome: 'Vermífugo Canino 10ml',
    categoria: 'Medicamentos',
    marca: 'Bayer',
    preco_compra: 35.00,
    preco_venda: 45.00,
    quantidade_atual: 12,
    quantidade_minima: 8,
    unidade_medida: 'un',
    data_validade: '2025-03-10',
    fornecedor: 'Bayer Animal Health',
    localizacao: 'C1-D2',
    status: 'ativo',
    observacoes: 'Vermífugo de amplo espectro',
    data_cadastro: '2024-03-05',
    data_atualizacao: '2024-12-05',
    imagem: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxyZWN0IHg9IjQwIiB5PSI0MCIgd2lkdGg9IjEyMCIgaGVpZ2h0PSIxMjAiIHJ4PSIxMCIgZmlsbD0iI0VGNDQ0NCIvPgo8dGV4dCB4PSIxMDAiIHk9IjEwNSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+TWVkaWNhbWVudG88L3RleHQ+Cjwvc3ZnPg=='
  },
  {
    id: 4,
    codigo: 'COL001',
    nome: 'Coleira Antipulgas Média',
    categoria: 'Acessórios',
    marca: 'Seresto',
    preco_compra: 18.00,
    preco_venda: 25.00,
    quantidade_atual: 3,
    quantidade_minima: 10,
    unidade_medida: 'un',
    fornecedor: 'Pet Acessórios',
    localizacao: 'D1-E2',
    status: 'ativo',
    observacoes: 'Coleira com proteção de 8 meses',
    data_cadastro: '2024-04-12',
    data_atualizacao: '2024-12-12',
    imagem: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxyZWN0IHg9IjQwIiB5PSI0MCIgd2lkdGg9IjEyMCIgaGVpZ2h0PSIxMjAiIHJ4PSIxMCIgZmlsbD0iIzc5N0E3QiIvPgo8dGV4dCB4PSIxMDAiIHk9IjEwNSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+Q29sZWlyYTwvdGV4dD4KPC9zdmc+'
  },
  {
    id: 5,
    codigo: 'BRI001',
    nome: 'Brinquedo Mordedor Corda',
    categoria: 'Brinquedos',
    marca: 'Pet Games',
    preco_compra: 12.00,
    preco_venda: 20.00,
    quantidade_atual: 18,
    quantidade_minima: 5,
    unidade_medida: 'un',
    fornecedor: 'Brinquedos Pet',
    localizacao: 'E1-F2',
    status: 'ativo',
    observacoes: 'Brinquedo resistente para cães',
    data_cadastro: '2024-05-20',
    data_atualizacao: '2024-12-20',
    imagem: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxyZWN0IHg9IjQwIiB5PSI0MCIgd2lkdGg9IjEyMCIgaGVpZ2h0PSIxMjAiIHJ4PSIxMCIgZmlsbD0iI0Y1OUUwQiIvPgo8dGV4dCB4PSIxMDAiIHk9IjEwNSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+QnJpbnF1ZWRvPC90ZXh0Pgo8L3N2Zz4='
  },
  {
    id: 6,
    codigo: 'VIT001',
    nome: 'Vitaminas para Cães 60 caps',
    categoria: 'Suplementos',
    marca: 'Organnact',
    preco_compra: 85.00,
    preco_venda: 110.00,
    quantidade_atual: 8,
    quantidade_minima: 5,
    unidade_medida: 'un',
    data_validade: '2025-08-30',
    fornecedor: 'Organnact',
    localizacao: 'F1-G2',
    status: 'ativo',
    observacoes: 'Complexo vitamínico completo',
    data_cadastro: '2024-06-18',
    data_atualizacao: '2024-12-18'
  }
];

class EstoqueService {
  private produtos: Produto[] = [];
  private nextId = 7;
  private readonly STORAGE_KEY = 'vet-hub-produtos';
  private readonly NEXT_ID_KEY = 'vet-hub-produtos-next-id';
  private useApi = true; // Flag para controlar se usa API ou localStorage

  constructor() {
    this.loadFromStorage();
  }

  private async loadFromStorage(): Promise<void> {
    if (this.useApi) {
      try {
        // Tentar carregar da API primeiro
        await this.loadFromApi();
        return;
      } catch (error) {
        console.warn('Falha ao carregar da API, usando localStorage como fallback:', error);
        this.useApi = false;
      }
    }

    // Fallback para localStorage
    try {
      const storedProdutos = localStorage.getItem(this.STORAGE_KEY);
      const storedNextId = localStorage.getItem(this.NEXT_ID_KEY);
      
      if (storedProdutos) {
        this.produtos = JSON.parse(storedProdutos);
      } else {
        this.produtos = [...mockProdutos];
        this.saveToStorage();
      }
      
      if (storedNextId) {
        this.nextId = parseInt(storedNextId, 10);
      }
    } catch (error) {
      console.error('Erro ao carregar produtos do localStorage:', error);
      this.produtos = [...mockProdutos];
    }
  }

  private async loadFromApi(): Promise<void> {
    try {
      const response = await api.get('/api/estoque/produtos/');
      this.produtos = response.data;
    } catch (error) {
      console.error('Erro ao carregar produtos da API:', error);
      throw error;
    }
  }

  private saveToStorage(): void {
    if (!this.useApi) {
      try {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.produtos));
        localStorage.setItem(this.NEXT_ID_KEY, this.nextId.toString());
      } catch (error) {
        console.error('Erro ao salvar produtos no localStorage:', error);
      }
    }
  }

  async getProdutos(): Promise<Produto[]> {
    if (this.useApi) {
      try {
        const response = await api.get('/api/estoque/produtos/');
        return response.data;
      } catch (error) {
        console.error('Erro ao buscar produtos da API:', error);
        this.useApi = false;
        return this.produtos;
      }
    }
    
    await new Promise(resolve => setTimeout(resolve, 300));
    return this.produtos;
  }

  async getProdutoById(id: number): Promise<Produto | null> {
    if (this.useApi) {
      try {
        const response = await api.get(`/api/estoque/produtos/${id}/`);
        return response.data;
      } catch (error) {
        console.error('Erro ao buscar produto da API:', error);
        this.useApi = false;
      }
    }
    
    await new Promise(resolve => setTimeout(resolve, 300));
    return this.produtos.find(produto => produto.id === id) || null;
  }

  async createProduto(data: CreateProdutoData): Promise<Produto> {
    if (this.useApi) {
      try {
        const response = await api.post('/api/estoque/produtos/', data);
        return response.data;
      } catch (error) {
        console.error('Erro ao criar produto na API:', error);
        this.useApi = false;
      }
    }

    // Fallback para localStorage
    await new Promise(resolve => setTimeout(resolve, 500));

    const novoProduto: Produto = {
      id: this.nextId++,
      codigo: data.codigo,
      nome: data.nome,
      categoria: data.categoria,
      marca: data.marca,
      preco_compra: typeof data.preco_compra === 'string' ? parseFloat(data.preco_compra) : data.preco_compra,
      preco_venda: typeof data.preco_venda === 'string' ? parseFloat(data.preco_venda) : data.preco_venda,
      quantidade_atual: typeof data.quantidade_atual === 'string' ? parseInt(data.quantidade_atual) : data.quantidade_atual,
      quantidade_minima: typeof data.quantidade_minima === 'string' ? parseInt(data.quantidade_minima) : data.quantidade_minima,
      unidade_medida: data.unidade_medida,
      data_validade: data.data_validade,
      fornecedor: data.fornecedor,
      localizacao: data.localizacao,
      status: data.status,
      observacoes: data.observacoes,
      imagem: typeof data.imagem === 'string' ? data.imagem : undefined,
      data_cadastro: new Date().toISOString(),
      data_atualizacao: new Date().toISOString()
    };

    this.produtos.push(novoProduto);
    this.saveToStorage();
    return novoProduto;
  }

  async updateProduto(id: number, data: UpdateProdutoData): Promise<Produto> {
    if (this.useApi) {
      try {
        const response = await api.put(`/api/estoque/produtos/${id}/`, data);
        return response.data;
      } catch (error) {
        console.error('Erro ao atualizar produto na API:', error);
        this.useApi = false;
      }
    }

    // Fallback para localStorage
    await new Promise(resolve => setTimeout(resolve, 500));

    const produtoIndex = this.produtos.findIndex(p => p.id === id);
    if (produtoIndex === -1) {
      throw new Error('Produto não encontrado');
    }

    const produtoAtual = this.produtos[produtoIndex];
    const produtoAtualizado: Produto = {
      ...produtoAtual,
      ...data,
      preco_compra: data.preco_compra ? (typeof data.preco_compra === 'string' ? parseFloat(data.preco_compra) : data.preco_compra) : produtoAtual.preco_compra,
      preco_venda: data.preco_venda ? (typeof data.preco_venda === 'string' ? parseFloat(data.preco_venda) : data.preco_venda) : produtoAtual.preco_venda,
      quantidade_atual: data.quantidade_atual !== undefined ? (typeof data.quantidade_atual === 'string' ? parseInt(data.quantidade_atual) : data.quantidade_atual) : produtoAtual.quantidade_atual,
      quantidade_minima: data.quantidade_minima !== undefined ? (typeof data.quantidade_minima === 'string' ? parseInt(data.quantidade_minima) : data.quantidade_minima) : produtoAtual.quantidade_minima,
      imagem: data.imagem ? (typeof data.imagem === 'string' ? data.imagem : produtoAtual.imagem) : produtoAtual.imagem,
      data_atualizacao: new Date().toISOString()
    };

    this.produtos[produtoIndex] = produtoAtualizado;
    this.saveToStorage();
    return produtoAtualizado;
  }

  async deleteProduto(id: number): Promise<void> {
    if (this.useApi) {
      try {
        await api.delete(`/api/estoque/produtos/${id}/`);
        return;
      } catch (error) {
        console.error('Erro ao deletar produto na API:', error);
        this.useApi = false;
      }
    }

    // Fallback para localStorage
    await new Promise(resolve => setTimeout(resolve, 300));

    const produtoIndex = this.produtos.findIndex(p => p.id === id);
    if (produtoIndex === -1) {
      throw new Error('Produto não encontrado');
    }

    this.produtos.splice(produtoIndex, 1);
    this.saveToStorage();
  }

  async getEstatisticas(): Promise<EstatisticasEstoque> {
    if (this.useApi) {
      try {
        const response = await api.get('/api/estoque/produtos/estatisticas/');
        return response.data;
      } catch (error) {
        console.error('Erro ao buscar estatísticas da API:', error);
        this.useApi = false;
      }
    }

    // Fallback para localStorage
    await new Promise(resolve => setTimeout(resolve, 300));

    const totalProdutos = this.produtos.length;
    const produtosAtivos = this.produtos.filter(p => p.status === 'ativo').length;
    const produtosEstoqueBaixo = this.produtos.filter(p => p.quantidade_atual <= p.quantidade_minima).length;
    const valorTotalEstoque = this.produtos.reduce((acc, p) => acc + (p.quantidade_atual * p.preco_compra), 0);

    return {
      total_produtos: totalProdutos,
      produtos_ativos: produtosAtivos,
      produtos_estoque_baixo: produtosEstoqueBaixo,
      valor_total_estoque: valorTotalEstoque
    };
  }

  async getCategorias(): Promise<string[]> {
    if (this.useApi) {
      try {
        const response = await api.get('/api/estoque/produtos/categorias/');
        return response.data;
      } catch (error) {
        console.error('Erro ao buscar categorias da API:', error);
        this.useApi = false;
      }
    }

    // Fallback para localStorage
    await new Promise(resolve => setTimeout(resolve, 300));
    const categorias = [...new Set(this.produtos.map(p => p.categoria))];
    return categorias;
  }

  async getProdutosEstoqueBaixo(): Promise<Produto[]> {
    if (this.useApi) {
      try {
        const response = await api.get('/api/estoque/produtos/estoque_baixo/');
        return response.data;
      } catch (error) {
        console.error('Erro ao buscar produtos com estoque baixo da API:', error);
        this.useApi = false;
      }
    }

    // Fallback para localStorage
    await new Promise(resolve => setTimeout(resolve, 300));
    return this.produtos.filter(p => p.quantidade_atual <= p.quantidade_minima);
  }
}

export const estoqueService = new EstoqueService();