export interface Produto {
  id: number;
  codigo: string;
  nome: string;
  categoria: string;
  marca: string;
  preco_compra: number;
  preco_venda: number;
  quantidade_atual: number;
  quantidade_minima: number;
  unidade_medida: string;
  data_validade?: string;
  fornecedor: string;
  localizacao: string;
  status: 'ativo' | 'inativo' | 'descontinuado';
  observacoes?: string;
  imagem?: string;
  data_cadastro?: string;
  data_atualizacao?: string;
  margem_lucro?: number;
  valor_total_estoque?: number;
  estoque_baixo?: boolean;
}

export interface CreateProdutoData {
  codigo: string;
  nome: string;
  categoria: string;
  marca: string;
  preco_compra: number | string;
  preco_venda: number | string;
  quantidade_atual: number | string;
  quantidade_minima: number | string;
  unidade_medida: string;
  data_validade?: string;
  fornecedor: string;
  localizacao: string;
  status: 'ativo' | 'inativo' | 'descontinuado';
  observacoes?: string;
  imagem?: File | string;
}

export interface UpdateProdutoData extends Partial<CreateProdutoData> {}

export interface EstatisticasEstoque {
  total_produtos: number;
  produtos_ativos: number;
  produtos_estoque_baixo: number;
  valor_total_estoque: number;
}