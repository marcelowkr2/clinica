'use client';

import { X, TestTube, User, Calendar, Clock, FileText, AlertCircle, CheckCircle } from 'lucide-react';

interface Exame {
  id: number;
  pet_nome: string;
  tutor_nome: string;
  tipo_exame_nome: string;
  data_solicitacao: string;
  data_coleta?: string;
  data_resultado?: string;
  status: 'solicitado' | 'coletado' | 'processando' | 'concluido' | 'cancelado';
  veterinario_nome: string;
  observacoes_resultado?: string;
  resultado?: string;
  prioridade?: string;
  valor?: number;
}

interface DetalhesExameModalProps {
  isOpen: boolean;
  onClose: () => void;
  exame: Exame | null;
}

export function DetalhesExameModal({ isOpen, onClose, exame }: DetalhesExameModalProps) {
  if (!isOpen || !exame) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'solicitado':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'coletado':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'processando':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'concluido':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelado':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'solicitado':
        return 'Solicitado';
      case 'coletado':
        return 'Coletado';
      case 'processando':
        return 'Processando';
      case 'concluido':
        return 'Concluído';
      case 'cancelado':
        return 'Cancelado';
      default:
        return status;
    }
  };

  const getPrioridadeColor = (prioridade?: string) => {
    switch (prioridade) {
      case 'baixa':
        return 'bg-gray-100 text-gray-800';
      case 'normal':
        return 'bg-blue-100 text-blue-800';
      case 'alta':
        return 'bg-orange-100 text-orange-800';
      case 'urgente':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <TestTube className="h-6 w-6 text-cyan-600" />
            Detalhes do Exame #{exame.id}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <div className="p-6">
          {/* Status e Prioridade */}
          <div className="flex flex-wrap gap-3 mb-6">
            <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full border ${getStatusColor(exame.status)}`}>
              {getStatusText(exame.status)}
            </span>
            {exame.prioridade && (
              <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getPrioridadeColor(exame.prioridade)}`}>
                Prioridade: {exame.prioridade.charAt(0).toUpperCase() + exame.prioridade.slice(1)}
              </span>
            )}
          </div>

          {/* Informações do Paciente */}
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <h3 className="font-medium mb-3 flex items-center gap-2">
              <User className="h-5 w-5 text-gray-600" />
              Informações do Paciente
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Paciente:</span> {exame.pet_nome}
              </div>
              <div>
                <span className="font-medium">Tutor:</span> {exame.tutor_nome}
              </div>
            </div>
          </div>

          {/* Informações do Exame */}
          <div className="bg-blue-50 p-4 rounded-lg mb-6">
            <h3 className="font-medium mb-3 flex items-center gap-2">
              <TestTube className="h-5 w-5 text-blue-600" />
              Informações do Exame
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Tipo de Exame:</span> {exame.tipo_exame_nome}
              </div>
              <div>
                <span className="font-medium">Veterinário Solicitante:</span> {exame.veterinario_nome}
              </div>
              {exame.valor && (
                <div>
                  <span className="font-medium">Valor:</span> R$ {parseFloat(exame.valor || 0).toFixed(2)}
                </div>
              )}
            </div>
          </div>

          {/* Timeline do Exame */}
          <div className="bg-green-50 p-4 rounded-lg mb-6">
            <h3 className="font-medium mb-3 flex items-center gap-2">
              <Clock className="h-5 w-5 text-green-600" />
              Timeline do Exame
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div className="text-sm">
                  <span className="font-medium">Solicitado:</span> {formatDate(exame.data_solicitacao)}
                </div>
              </div>
              
              {exame.data_coleta && (
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <div className="text-sm">
                    <span className="font-medium">Coletado:</span> {formatDate(exame.data_coleta)}
                  </div>
                </div>
              )}
              
              {exame.data_resultado && (
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <div className="text-sm">
                    <span className="font-medium">Resultado:</span> {formatDate(exame.data_resultado)}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Observações */}
          {exame.observacoes_resultado && (
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <h3 className="font-medium mb-3 flex items-center gap-2">
                <FileText className="h-5 w-5 text-gray-600" />
                Observações
              </h3>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{exame.observacoes_resultado}</p>
            </div>
          )}

          {/* Resultado */}
          {exame.resultado && (
            <div className="bg-green-50 p-4 rounded-lg mb-6">
              <h3 className="font-medium mb-3 flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Resultado do Exame
              </h3>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{exame.resultado}</p>
            </div>
          )}

          {/* Status de Alerta */}
          {exame.status === 'cancelado' && (
            <div className="bg-red-50 border border-red-200 p-4 rounded-lg mb-6">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <span className="font-medium text-red-800">Exame Cancelado</span>
              </div>
              <p className="text-sm text-red-700 mt-1">
                Este exame foi cancelado e não será processado.
              </p>
            </div>
          )}
          
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}