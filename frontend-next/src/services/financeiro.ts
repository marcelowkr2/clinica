import api from './api';

export interface Transacao {
  id: number;
  tipo: 'receita' | 'despesa';
  descricao: string;
  categoria: string;
  valor: number;
  data: string;
  forma_pagamento: string;
  status: 'pago' | 'pendente' | 'vencido';
  cliente_fornecedor?: string;
  observacoes?: string;
}

export interface EstatisticasFinanceiras {
  totalReceitas: number;
  totalDespesas: number;
  saldoLiquido: number;
  pendentes: number;
}

export interface CreateTransacaoData {
  tipo: 'receita' | 'despesa';
  descricao: string;
  categoria: string;
  valor: number;
  data: string;
  forma_pagamento: string;
  status: 'pago' | 'pendente' | 'vencido';
  cliente_fornecedor?: string;
  observacoes?: string;
}

// Dados mock para demonstração
const mockTransacoes: Transacao[] = [
  {
    id: 1,
    tipo: 'receita',
    descricao: 'Consulta veterinária',
    categoria: 'Consultas',
    valor: 150.00,
    data: '2024-12-15',
    forma_pagamento: 'cartao_credito',
    status: 'pago',
    cliente_fornecedor: 'João Silva',
    observacoes: 'Consulta de rotina'
  },
  {
    id: 2,
    tipo: 'despesa',
    descricao: 'Medicamentos',
    categoria: 'Suprimentos',
    valor: 250.00,
    data: '2024-12-14',
    forma_pagamento: 'dinheiro',
    status: 'pago',
    cliente_fornecedor: 'Farmácia Veterinária ABC',
    observacoes: 'Antibióticos e anti-inflamatórios'
  },
  {
    id: 3,
    tipo: 'receita',
    descricao: 'Cirurgia',
    categoria: 'Cirurgias',
    valor: 800.00,
    data: '2024-12-13',
    forma_pagamento: 'pix',
    status: 'pendente',
    cliente_fornecedor: 'Maria Santos',
    observacoes: 'Castração'
  },
  {
    id: 4,
    tipo: 'despesa',
    descricao: 'Equipamento médico',
    categoria: 'Equipamentos',
    valor: 1200.00,
    data: '2024-12-12',
    forma_pagamento: 'cartao_debito',
    status: 'pago',
    cliente_fornecedor: 'MedVet Equipamentos',
    observacoes: 'Estetoscópio digital'
  },
  {
    id: 5,
    tipo: 'receita',
    descricao: 'Banho e tosa',
    categoria: 'Estética',
    valor: 80.00,
    data: '2024-12-11',
    forma_pagamento: 'dinheiro',
    status: 'pago',
    cliente_fornecedor: 'Carlos Oliveira',
    observacoes: 'Banho completo com tosa'
  },
  {
    id: 6,
    tipo: 'receita',
    descricao: 'Exame de sangue',
    categoria: 'Exames',
    valor: 120.00,
    data: '2024-12-10',
    forma_pagamento: 'boleto',
    status: 'vencido',
    cliente_fornecedor: 'Ana Costa',
    observacoes: 'Hemograma completo'
  }
];

class FinanceiroService {
  private transacoes: Transacao[] = [...mockTransacoes];
  private nextId = 7;

  async getTransacoes(): Promise<Transacao[]> {
    // Simula delay da API
    await new Promise(resolve => setTimeout(resolve, 500));
    return [...this.transacoes];
  }

  async getEstatisticas(): Promise<EstatisticasFinanceiras> {
    // Simula delay da API
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const receitas = this.transacoes
      .filter(t => t.tipo === 'receita' && t.status === 'pago')
      .reduce((sum, t) => sum + t.valor, 0);
    
    const despesas = this.transacoes
      .filter(t => t.tipo === 'despesa' && t.status === 'pago')
      .reduce((sum, t) => sum + t.valor, 0);
    
    const pendentes = this.transacoes
      .filter(t => t.status === 'pendente')
      .length;

    return {
      totalReceitas: receitas,
      totalDespesas: despesas,
      saldoLiquido: receitas - despesas,
      pendentes: pendentes
    };
  }

  async createTransacao(data: CreateTransacaoData): Promise<Transacao> {
    // Simula delay da API
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const novaTransacao: Transacao = {
      id: this.nextId++,
      ...data
    };
    
    this.transacoes.push(novaTransacao);
    return novaTransacao;
  }

  async updateTransacao(id: number, data: Partial<CreateTransacaoData>): Promise<Transacao> {
    // Simula delay da API
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const index = this.transacoes.findIndex(t => t.id === id);
    if (index === -1) {
      throw new Error('Transação não encontrada');
    }
    
    this.transacoes[index] = { ...this.transacoes[index], ...data };
    return this.transacoes[index];
  }

  async deleteTransacao(id: number): Promise<void> {
    // Simula delay da API
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const index = this.transacoes.findIndex(t => t.id === id);
    if (index === -1) {
      throw new Error('Transação não encontrada');
    }
    
    this.transacoes.splice(index, 1);
  }
}

export const financeiroService = new FinanceiroService();