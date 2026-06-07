'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, X } from 'lucide-react';
import { estoqueService, CreateProdutoData } from '@/services/estoque';
import ImageUpload from '@/components/ImageUpload';

export default function NovoProdutoPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [formData, setFormData] = useState<CreateProdutoData>({
    codigo: '',
    nome: '',
    categoria: '',
    marca: '',
    preco_compra: '',
    preco_venda: '',
    quantidade_atual: '',
    quantidade_minima: '',
    unidade_medida: 'un',
    data_validade: '',
    fornecedor: '',
    localizacao: '',
    status: 'ativo',
    observacoes: ''
  });

  const categorias = [
    'Alimentação',
    'Medicamentos',
    'Higiene',
    'Acessórios',
    'Brinquedos',
    'Suplementos',
    'Equipamentos',
    'Outros'
  ];

  const unidadesMedida = [
    { value: 'un', label: 'Unidade' },
    { value: 'kg', label: 'Quilograma' },
    { value: 'g', label: 'Grama' },
    { value: 'l', label: 'Litro' },
    { value: 'ml', label: 'Mililitro' },
    { value: 'cx', label: 'Caixa' },
    { value: 'pct', label: 'Pacote' }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name.includes('preco') || name.includes('quantidade') ? 
        (value === '' ? '' : parseFloat(value)) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log('🚀 Iniciando criação de produto...');
      let imageUrl = '';
      
      // Converter a imagem para base64 se foi selecionada
      if (selectedImage) {
        console.log('📷 Processando imagem:', selectedImage.name, selectedImage.size);
        const reader = new FileReader();
        imageUrl = await new Promise<string>((resolve) => {
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.readAsDataURL(selectedImage);
        });
        console.log('✅ Imagem convertida para base64');
      }

      // Preparar dados para envio, garantindo tipos corretos
      const dataToSubmit = {
        ...formData,
        preco_compra: parseFloat(formData.preco_compra.toString()) || 0,
        preco_venda: parseFloat(formData.preco_venda.toString()) || 0,
        quantidade_atual: parseInt(formData.quantidade_atual.toString()) || 0,
        quantidade_minima: parseInt(formData.quantidade_minima.toString()) || 0,
        imagem: imageUrl,
        // Garantir que campos opcionais sejam strings ou undefined
        data_validade: formData.data_validade || undefined,
        observacoes: formData.observacoes || undefined
      };
      
      console.log('📦 Dados a serem enviados:', dataToSubmit);
      console.log('📦 Tipo dos dados numéricos:');
      console.log('  - preco_compra:', typeof dataToSubmit.preco_compra, dataToSubmit.preco_compra);
      console.log('  - preco_venda:', typeof dataToSubmit.preco_venda, dataToSubmit.preco_venda);
      console.log('  - quantidade_atual:', typeof dataToSubmit.quantidade_atual, dataToSubmit.quantidade_atual);
      console.log('  - quantidade_minima:', typeof dataToSubmit.quantidade_minima, dataToSubmit.quantidade_minima);
      
      const resultado = await estoqueService.createProduto(dataToSubmit);
      console.log('✅ Produto criado com sucesso:', resultado);
      
      router.push('/estoque');
    } catch (error: any) {
      console.error('❌ Erro detalhado ao criar produto:', error);
      console.error('❌ Status do erro:', error?.response?.status);
      console.error('❌ Dados do erro:', error?.response?.data);
      console.error('❌ URL do erro:', error?.config?.url);
      
      let mensagemErro = 'Erro ao criar produto. Tente novamente.';
      if (error?.response?.status === 404) {
        mensagemErro = 'Erro 404: Endpoint não encontrado. Verifique se o backend está rodando.';
      } else if (error?.response?.status === 400) {
        mensagemErro = 'Erro 400: Dados inválidos. Verifique os campos obrigatórios.';
      } else if (error?.response?.status === 500) {
        mensagemErro = 'Erro 500: Erro interno do servidor.';
      }
      
      alert(mensagemErro);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.push('/estoque');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={handleCancel}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
            >
              <ArrowLeft className="w-5 h-5" />
              Voltar
            </button>
            <h1 className="text-2xl font-bold text-gray-800">Novo Produto</h1>
          </div>
        </div>

        {/* Formulário */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Informações Básicas */}
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Informações Básicas</h2>
              
              {/* Upload de Imagem */}
              <div className="mb-6">
                <ImageUpload 
                  onImageSelect={setSelectedImage}
                  className="max-w-md"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Código do Produto *
                  </label>
                  <input
                    type="text"
                    name="codigo"
                    value={formData.codigo}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ex: RAC001"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome do Produto *
                  </label>
                  <input
                    type="text"
                    name="nome"
                    value={formData.nome}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ex: Ração Premium Cães Adultos"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Categoria *
                  </label>
                  <select
                    name="categoria"
                    value={formData.categoria}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Selecione uma categoria</option>
                    {categorias.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Marca *
                  </label>
                  <input
                    type="text"
                    name="marca"
                    value={formData.marca}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ex: Royal Canin"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fornecedor *
                  </label>
                  <input
                    type="text"
                    name="fornecedor"
                    value={formData.fornecedor}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ex: Pet Distribuidora"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Localização *
                  </label>
                  <input
                    type="text"
                    name="localizacao"
                    value={formData.localizacao}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ex: A1-B2"
                  />
                </div>
              </div>
            </div>

            {/* Preços e Estoque */}
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Preços e Estoque</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preço de Compra *
                  </label>
                  <input
                    type="number"
                    name="preco_compra"
                    value={formData.preco_compra}
                    onChange={handleInputChange}
                    required
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preço de Venda *
                  </label>
                  <input
                    type="number"
                    name="preco_venda"
                    value={formData.preco_venda}
                    onChange={handleInputChange}
                    required
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantidade Atual *
                  </label>
                  <input
                    type="number"
                    name="quantidade_atual"
                    value={formData.quantidade_atual}
                    onChange={handleInputChange}
                    required
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantidade Mínima *
                  </label>
                  <input
                    type="number"
                    name="quantidade_minima"
                    value={formData.quantidade_minima}
                    onChange={handleInputChange}
                    required
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                  />
                </div>
              </div>
            </div>

            {/* Informações Adicionais */}
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Informações Adicionais</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Unidade de Medida *
                  </label>
                  <select
                    name="unidade_medida"
                    value={formData.unidade_medida}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {unidadesMedida.map(unidade => (
                      <option key={unidade.value} value={unidade.value}>{unidade.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Data de Validade
                  </label>
                  <input
                    type="date"
                    name="data_validade"
                    value={formData.data_validade}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status *
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="ativo">Ativo</option>
                    <option value="inativo">Inativo</option>
                    <option value="descontinuado">Descontinuado</option>
                  </select>
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Observações
                </label>
                <textarea
                  name="observacoes"
                  value={formData.observacoes}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Observações adicionais sobre o produto..."
                />
              </div>
            </div>

            {/* Botões */}
            <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={handleCancel}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                <X className="w-4 h-4" />
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Save className="w-4 h-4" />
                {loading ? 'Salvando...' : 'Salvar Produto'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}