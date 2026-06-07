'use client';

import { X, DollarSign, Calendar, CreditCard, User, FileText, Tag } from 'lucide-react';
import { Transacao } from '@/services/financeiro';

interface DetalhesTransacaoModalProps {
  isOpen: boolean;
  onClose: () => void;
  transacao: Transacao | null;
}

export function DetalhesTransacaoModal({ isOpen, onClose, transacao }: DetalhesTransacaoModalProps) {
  if (!isOpen || !transacao) return null;

  const formatarValor = (valor: number): string => {
    return (parseFloat(valor.toString()) || 0).toFixed(2).replace('.', ',');
  };

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

  const getTipoColor = (tipo: string) => {
    return tipo === 'receita' ? 'text-green-600' : 'text-red-600';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <DollarSign className="h-6 w-6 text-blue-600" />
            Detalhes da Transação #{transacao.id}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Informações Básicas */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Tag className="inline h-4 w-4 mr-1" />
                  Tipo
                </label>
                <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getTipoColor(transacao.tipo)}`}>
                  {transacao.tipo === 'receita' ? 'Receita' : 'Despesa'}
                </span>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <DollarSign className="inline h-4 w-4 mr-1" />
                  Valor
                </label>
                <p className={`text-2xl font-bold ${getTipoColor(transacao.tipo)}`}>
                  {transacao.tipo === 'receita' ? '+' : '-'} R$ {formatarValor(transacao.valor)}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Calendar className="inline h-4 w-4 mr-1" />
                  Data
                </label>
                <p className="text-gray-900">
                  {new Date(transacao.data).toLocaleDateString('pt-BR')}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(transacao.status)}`}>
                  {getStatusText(transacao.status)}
                </span>
              </div>
            </div>

            {/* Detalhes Adicionais */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Categoria
                </label>
                <p className="text-gray-900">{transacao.categoria}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <CreditCard className="inline h-4 w-4 mr-1" />
                  Forma de Pagamento
                </label>
                <p className="text-gray-900">{getPaymentText(transacao.forma_pagamento)}</p>
              </div>

              {transacao.cliente_fornecedor && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <User className="inline h-4 w-4 mr-1" />
                    {transacao.tipo === 'receita' ? 'Cliente' : 'Fornecedor'}
                  </label>
                  <p className="text-gray-900">{transacao.cliente_fornecedor}</p>
                </div>
              )}
            </div>
          </div>

          {/* Descrição */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <FileText className="inline h-4 w-4 mr-1" />
              Descrição
            </label>
            <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{transacao.descricao}</p>
          </div>

          {/* Observações */}
          {transacao.observacoes && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Observações
              </label>
              <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{transacao.observacoes}</p>
            </div>
          )}
        </div>
        
        <div className="flex justify-end gap-3 p-6 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}