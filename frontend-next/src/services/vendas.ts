import { estoqueService } from './estoque';

export interface ItemVenda {
  id: number;
  produto_id: number;
  produto_nome: string;
  produto_codigo: string;
  produto_imagem?: string;
  quantidade: number;
  preco_unitario: number;
  subtotal: number;
}

export interface Venda {
  id: number;
  numero_venda: string;
  cliente_nome: string;
  cliente_telefone: string;
  cliente_email?: string;
  data_venda: string;
  total: number;
  desconto?: number;
  status: 'pendente' | 'pago' | 'cancelado';
  forma_pagamento: 'dinheiro' | 'cartao_credito' | 'cartao_debito' | 'pix' | 'transferencia';
  observacoes?: string;
  itens: ItemVenda[];
  created_at: string;
  updated_at: string;
}

export interface CreateVendaData {
  cliente_nome: string;
  cliente_telefone: string;
  cliente_email?: string;
  forma_pagamento: 'dinheiro' | 'cartao_credito' | 'cartao_debito' | 'pix' | 'transferencia';
  desconto?: number;
  observacoes?: string;
  itens: {
    produto_id: number;
    quantidade: number;
    preco_unitario: number;
  }[];
}

export interface EstatisticasVendas {
  totalVendas: number;
  vendasPagas: number;
  vendasPendentes: number;
  vendasCanceladas: number;
  faturamentoTotal: number;
  faturamentoMes: number;
  ticketMedio: number;
}

// Dados mockados para demonstração
const mockVendas: Venda[] = [
  {
    id: 1,
    numero_venda: 'VND-001',
    cliente_nome: 'Maria Silva',
    cliente_telefone: '(11) 99999-9999',
    cliente_email: 'maria@email.com',
    data_venda: '2024-12-30T10:30:00',
    total: 150.00,
    desconto: 0,
    status: 'pago',
    forma_pagamento: 'cartao_credito',
    observacoes: 'Cliente preferencial',
    itens: [
      { 
        id: 1, 
        produto_id: 1,
        produto_nome: 'Ração Premium Cães Adultos 15kg', 
        produto_codigo: 'RAC001',
        produto_imagem: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxyZWN0IHg9IjQwIiB5PSI0MCIgd2lkdGg9IjEyMCIgaGVpZ2h0PSIxMjAiIHJ4PSIxMCIgZmlsbD0iIzM5OEVGNyIvPgo8dGV4dCB4PSIxMDAiIHk9IjEwNSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+UmHDp8OjbzwvdGV4dD4KPC9zdmc+',
        quantidade: 1, 
        preco_unitario: 120.00, 
        subtotal: 120.00 
      },
      { 
        id: 2, 
        produto_id: 2,
        produto_nome: 'Shampoo Antipulgas 500ml', 
        produto_codigo: 'SHP001',
        produto_imagem: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxyZWN0IHg9IjQwIiB5PSI0MCIgd2lkdGg9IjEyMCIgaGVpZ2h0PSIxMjAiIHJ4PSIxMCIgZmlsbD0iIzEwQjk4MSIvPgo8dGV4dCB4PSIxMDAiIHk9IjEwNSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+U2hhbXBvbzwvdGV4dD4KPC9zdmc+',
        quantidade: 1, 
        preco_unitario: 30.00, 
        subtotal: 30.00 
      }
    ],
    created_at: '2024-12-30T10:30:00',
    updated_at: '2024-12-30T10:30:00'
  },
  {
    id: 2,
    numero_venda: 'VND-002',
    cliente_nome: 'João Santos',
    cliente_telefone: '(11) 88888-8888',
    data_venda: '2024-12-30T14:15:00',
    total: 85.50,
    status: 'pendente',
    forma_pagamento: 'dinheiro',
    itens: [
      { 
        id: 3, 
        produto_id: 3,
        produto_nome: 'Coleira Antipulgas', 
        produto_codigo: 'COLAR001',
        produto_imagem: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiByeD0iOCIgZmlsbD0iIzM0Njg0ZiIvPgo8ZWxsaXBzZSBjeD0iMjAiIGN5PSIyMCIgcng9IjEyIiByeT0iNiIgZmlsbD0iI2ZmZmZmZiIvPgo8ZWxsaXBzZSBjeD0iMjAiIGN5PSIyMCIgcng9IjgiIHJ5PSIzIiBmaWxsPSIjMzQ2ODRmIi8+Cjwvc3ZnPg==',
        quantidade: 2, 
        preco_unitario: 25.00, 
        subtotal: 50.00 
      },
      { 
        id: 4, 
        produto_id: 4,
        produto_nome: 'Brinquedo Mordedor', 
        produto_codigo: 'BRINQ001',
        produto_imagem: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiByeD0iOCIgZmlsbD0iIzM0Njg0ZiIvPgo8cG9seWdvbiBwb2ludHM9IjIwLDEwIDI4LDIwIDIwLDMwIDEyLDIwIiBmaWxsPSIjZmZmZmZmIi8+CjxjaXJjbGUgY3g9IjIwIiBjeT0iMjAiIHI9IjMiIGZpbGw9IiMzNDY4NGYiLz4KPC9zdmc+',
        quantidade: 1, 
        preco_unitario: 35.50, 
        subtotal: 35.50 
      }
    ],
    created_at: '2024-12-30T14:15:00',
    updated_at: '2024-12-30T14:15:00'
  },
  {
    id: 3,
    numero_venda: 'VND-003',
    cliente_nome: 'Ana Costa',
    cliente_telefone: '(11) 77777-7777',
    cliente_email: 'ana@email.com',
    data_venda: '2024-12-29T16:45:00',
    total: 200.00,
    status: 'pago',
    forma_pagamento: 'pix',
    itens: [
      { 
        id: 5, 
        produto_id: 5,
        produto_nome: 'Medicamento Vermífugo', 
        produto_codigo: 'VERM001',
        produto_imagem: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiByeD0iOCIgZmlsbD0iIzM0Njg0ZiIvPgo8cmVjdCB4PSIxNCIgeT0iMTAiIHdpZHRoPSIxMiIgaGVpZ2h0PSIyMCIgcng9IjIiIGZpbGw9IiNmZmZmZmYiLz4KPGNpcmNsZSBjeD0iMjAiIGN5PSIxNiIgcj0iMiIgZmlsbD0iIzM0Njg0ZiIvPgo8L3N2Zz4=',
        quantidade: 2, 
        preco_unitario: 45.00, 
        subtotal: 90.00 
      },
      { 
        id: 6, 
        produto_id: 6,
        produto_nome: 'Vitaminas para Cães', 
        produto_codigo: 'VIT001',
        produto_imagem: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiByeD0iOCIgZmlsbD0iIzM0Njg0ZiIvPgo8Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIxMCIgZmlsbD0iI2ZmZmZmZiIvPgo8dGV4dCB4PSIyMCIgeT0iMjQiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMiIgZmlsbD0iIzM0Njg0ZiIgdGV4dC1hbmNob3I9Im1pZGRsZSI+VjwvdGV4dD4KPC9zdmc+',
        quantidade: 1, 
        preco_unitario: 110.00, 
        subtotal: 110.00 
      }
    ],
    created_at: '2024-12-29T16:45:00',
    updated_at: '2024-12-29T16:45:00'
  },
  {
    id: 4,
    numero_venda: 'VND-004',
    cliente_nome: 'Carlos Oliveira',
    cliente_telefone: '(11) 66666-6666',
    data_venda: '2024-12-28T09:20:00',
    total: 75.00,
    status: 'cancelado',
    forma_pagamento: 'cartao_debito',
    observacoes: 'Cancelado a pedido do cliente',
    itens: [
      { 
        id: 7, 
        produto_id: 7,
        produto_nome: 'Produto 7', 
        produto_codigo: 'PROD007',
        quantidade: 3, 
        preco_unitario: 25.00, 
        subtotal: 75.00 
      }
    ],
    created_at: '2024-12-28T09:20:00',
    updated_at: '2024-12-28T11:30:00'
  }
];

class VendasService {
  private vendas: Venda[] = [];
  private nextId = 5;
  private readonly STORAGE_KEY = 'vet-hub-vendas';
  private readonly NEXT_ID_KEY = 'vet-hub-vendas-next-id';

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    try {
      const storedVendas = localStorage.getItem(this.STORAGE_KEY);
      const storedNextId = localStorage.getItem(this.NEXT_ID_KEY);
      
      if (storedVendas) {
        this.vendas = JSON.parse(storedVendas);
      } else {
        // Se não há dados salvos, usar dados mock iniciais
        this.vendas = [...mockVendas];
        this.saveToStorage();
      }
      
      if (storedNextId) {
        this.nextId = parseInt(storedNextId, 10);
      }
    } catch (error) {
      console.error('Erro ao carregar vendas do localStorage:', error);
      this.vendas = [...mockVendas];
    }
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.vendas));
      localStorage.setItem(this.NEXT_ID_KEY, this.nextId.toString());
    } catch (error) {
      console.error('Erro ao salvar vendas no localStorage:', error);
    }
  }

  async getVendas(): Promise<Venda[]> {
    // Simular delay da API
    await new Promise(resolve => setTimeout(resolve, 500));
    return this.vendas.sort((a, b) => new Date(b.data_venda).getTime() - new Date(a.data_venda).getTime());
  }

  async getVendaById(id: number): Promise<Venda | null> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return this.vendas.find(venda => venda.id === id) || null;
  }

  async getEstatisticas(): Promise<EstatisticasVendas> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const totalVendas = this.vendas.length;
    const vendasPagas = this.vendas.filter(v => v.status === 'pago').length;
    const vendasPendentes = this.vendas.filter(v => v.status === 'pendente').length;
    const vendasCanceladas = this.vendas.filter(v => v.status === 'cancelado').length;
    
    const faturamentoTotal = this.vendas
      .filter(v => v.status === 'pago')
      .reduce((acc, v) => acc + v.total, 0);
    
    // Faturamento do mês atual
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const faturamentoMes = this.vendas
      .filter(v => {
        const vendaDate = new Date(v.data_venda);
        return v.status === 'pago' && 
               vendaDate.getMonth() === currentMonth && 
               vendaDate.getFullYear() === currentYear;
      })
      .reduce((acc, v) => acc + v.total, 0);
    
    const ticketMedio = vendasPagas > 0 ? faturamentoTotal / vendasPagas : 0;

    return {
      totalVendas,
      vendasPagas,
      vendasPendentes,
      vendasCanceladas,
      faturamentoTotal,
      faturamentoMes,
      ticketMedio
    };
  }

  async createVenda(data: CreateVendaData): Promise<Venda> {
    await new Promise(resolve => setTimeout(resolve, 500));

    // Calcular total dos itens
    const totalItens = data.itens.reduce((acc, item) => acc + (item.quantidade * item.preco_unitario), 0);
    const desconto = data.desconto || 0;
    const total = totalItens - desconto;

    // Gerar número da venda
    const numeroVenda = `VND-${String(this.nextId).padStart(3, '0')}`;

    // Buscar dados dos produtos do estoque
    const produtos = await estoqueService.getProdutos();
    
    const novaVenda: Venda = {
      id: this.nextId++,
      numero_venda: numeroVenda,
      cliente_nome: data.cliente_nome,
      cliente_telefone: data.cliente_telefone,
      cliente_email: data.cliente_email,
      data_venda: new Date().toISOString(),
      total,
      desconto,
      status: 'pendente',
      forma_pagamento: data.forma_pagamento,
      observacoes: data.observacoes,
      itens: data.itens.map((item, index) => {
        const produto = produtos.find(p => p.id === item.produto_id);
        return {
          id: this.nextId + index,
          produto_id: item.produto_id,
          produto_nome: produto?.nome || `Produto ${item.produto_id}`,
          produto_codigo: produto?.codigo || `PROD${item.produto_id}`,
          produto_imagem: produto?.imagem,
          quantidade: item.quantidade,
          preco_unitario: item.preco_unitario,
          subtotal: item.quantidade * item.preco_unitario
        };
      }),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    this.vendas.push(novaVenda);
    this.saveToStorage(); // Salvar no localStorage
    return novaVenda;
  }

  async updateVenda(id: number, data: Partial<CreateVendaData>): Promise<Venda> {
    await new Promise(resolve => setTimeout(resolve, 500));

    const vendaIndex = this.vendas.findIndex(v => v.id === id);
    if (vendaIndex === -1) {
      throw new Error('Venda não encontrada');
    }

    const vendaAtual = this.vendas[vendaIndex];
    
    // Recalcular total se os itens foram alterados
    let total = vendaAtual.total;
    let itens = vendaAtual.itens;
    
    if (data.itens) {
      const totalItens = data.itens.reduce((acc, item) => acc + (item.quantidade * item.preco_unitario), 0);
      const desconto = data.desconto || vendaAtual.desconto || 0;
      total = totalItens - desconto;
      
      // Buscar dados dos produtos do estoque
      const produtos = await estoqueService.getProdutos();
      
      itens = data.itens.map((item, index) => {
        const produto = produtos.find(p => p.id === item.produto_id);
        return {
          id: vendaAtual.itens[index]?.id || this.nextId + index,
          produto_id: item.produto_id,
          produto_nome: produto?.nome || `Produto ${item.produto_id}`,
          produto_codigo: produto?.codigo || `PROD${item.produto_id}`,
          produto_imagem: produto?.imagem,
          quantidade: item.quantidade,
          preco_unitario: item.preco_unitario,
          subtotal: item.quantidade * item.preco_unitario
        };
      });
    }

    const vendaAtualizada: Venda = {
      ...vendaAtual,
      cliente_nome: data.cliente_nome || vendaAtual.cliente_nome,
      cliente_telefone: data.cliente_telefone || vendaAtual.cliente_telefone,
      cliente_email: data.cliente_email || vendaAtual.cliente_email,
      forma_pagamento: data.forma_pagamento || vendaAtual.forma_pagamento,
      desconto: data.desconto !== undefined ? data.desconto : vendaAtual.desconto,
      observacoes: data.observacoes !== undefined ? data.observacoes : vendaAtual.observacoes,
      total,
      itens,
      updated_at: new Date().toISOString()
    };

    this.vendas[vendaIndex] = vendaAtualizada;
    this.saveToStorage(); // Salvar no localStorage
    return vendaAtualizada;
  }

  async updateStatusVenda(id: number, status: 'pendente' | 'pago' | 'cancelado'): Promise<Venda> {
    await new Promise(resolve => setTimeout(resolve, 300));

    const vendaIndex = this.vendas.findIndex(v => v.id === id);
    if (vendaIndex === -1) {
      throw new Error('Venda não encontrada');
    }

    this.vendas[vendaIndex] = {
      ...this.vendas[vendaIndex],
      status,
      updated_at: new Date().toISOString()
    };

    this.saveToStorage(); // Salvar no localStorage
    return this.vendas[vendaIndex];
  }

  async deleteVenda(id: number): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300));

    const vendaIndex = this.vendas.findIndex(v => v.id === id);
    if (vendaIndex === -1) {
      throw new Error('Venda não encontrada');
    }

    this.vendas.splice(vendaIndex, 1);
    this.saveToStorage(); // Salvar no localStorage
  }

  async exportarVendas(): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 500));

    const headers = [
      'Número da Venda',
      'Cliente',
      'Telefone',
      'Email',
      'Data da Venda',
      'Status',
      'Forma de Pagamento',
      'Subtotal',
      'Desconto',
      'Total',
      'Observações'
    ];

    const csvContent = [
      headers.join(','),
      ...this.vendas.map(venda => [
        venda.numero_venda,
        `"${venda.cliente_nome}"`,
        venda.cliente_telefone,
        venda.cliente_email || '',
        new Date(venda.data_venda).toLocaleDateString('pt-BR'),
        venda.status,
        venda.forma_pagamento,
        (venda.total + (venda.desconto || 0)).toFixed(2),
        (venda.desconto || 0).toFixed(2),
        venda.total.toFixed(2),
        `"${venda.observacoes || ''}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `vendas_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

export const vendasService = new VendasService();