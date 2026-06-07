'use client';

import { X, FileText, Download, Calendar, TestTube, User } from 'lucide-react';

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
}

interface ResultadoExameModalProps {
  isOpen: boolean;
  onClose: () => void;
  exame: Exame | null;
}

export function ResultadoExameModal({ isOpen, onClose, exame }: ResultadoExameModalProps) {
  if (!isOpen || !exame) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'solicitado':
        return 'text-yellow-600 bg-yellow-100';
      case 'coletado':
        return 'text-blue-600 bg-blue-100';
      case 'processando':
        return 'text-orange-600 bg-orange-100';
      case 'concluido':
        return 'text-green-600 bg-green-100';
      case 'cancelado':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getPrioridadeColor = (prioridade: string) => {
    switch (prioridade) {
      case 'urgente':
        return 'text-red-600 bg-red-100';
      case 'alta':
        return 'text-orange-600 bg-orange-100';
      case 'normal':
        return 'text-blue-600 bg-blue-100';
      case 'baixa':
        return 'text-gray-600 bg-gray-100';
      default:
        return 'text-blue-600 bg-blue-100';
    }
  };

  const handleDownload = () => {
    // Simular download do resultado
    const content = `
RESULTADO DE EXAME

Paciente: ${exame.pet_nome}
Tutor: ${exame.tutor_nome}
Tipo de Exame: ${exame.tipo_exame_nome}
Data de Solicitação: ${formatDate(exame.data_solicitacao)}
${exame.data_coleta ? `Data de Coleta: ${formatDate(exame.data_coleta)}` : ''}
${exame.data_resultado ? `Data do Resultado: ${formatDate(exame.data_resultado)}` : ''}
Veterinário Solicitante: ${exame.veterinario_nome}
Status: ${exame.status}
${exame.prioridade ? `Prioridade: ${exame.prioridade}` : ''}

${exame.observacoes_resultado ? `Observações:\n${exame.observacoes_resultado}` : ''}

${exame.resultado ? `Resultado:\n${exame.resultado}` : 'Resultado ainda não disponível.'}
    `;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `resultado_exame_${exame.pet_nome}_${exame.id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <FileText className="h-6 w-6 text-cyan-600" />
            Resultado do Exame - {exame.pet_nome}
          </h2>
          <div className="flex items-center gap-2">
            {exame.status === 'concluido' && exame.resultado && (
              <button
                onClick={handleDownload}
                className="px-3 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-700 transition-colors flex items-center gap-2 text-sm"
              >
                <Download className="h-4 w-4" />
                Download
              </button>
            )}
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>
        
        <div className="p-6">
          {/* Cabeçalho com informações principais */}
          <div className="bg-gradient-to-r from-cyan-50 to-blue-50 p-6 rounded-lg mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <User className="h-5 w-5 text-cyan-600" />
                  Informações do Paciente
                </h3>
                <div className="space-y-2">
                  <div>
                    <span className="font-medium text-gray-700">Paciente:</span>
                    <span className="ml-2 text-gray-900">{exame.pet_nome}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Tutor:</span>
                    <span className="ml-2 text-gray-900">{exame.tutor_nome}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <TestTube className="h-5 w-5 text-cyan-600" />
                  Informações do Exame
                </h3>
                <div className="space-y-2">
                  <div>
                    <span className="font-medium text-gray-700">Tipo:</span>
                    <span className="ml-2 text-gray-900">{exame.tipo_exame_nome}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Status:</span>
                    <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(exame.status)}`}>
                      {exame.status.charAt(0).toUpperCase() + exame.status.slice(1)}
                    </span>
                  </div>
                  {exame.prioridade && (
                    <div>
                      <span className="font-medium text-gray-700">Prioridade:</span>
                      <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getPrioridadeColor(exame.prioridade)}`}>
                        {exame.prioridade.charAt(0).toUpperCase() + exame.prioridade.slice(1)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Timeline de datas */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-cyan-600" />
              Timeline do Exame
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white border rounded-lg p-4">
                <div className="text-sm font-medium text-gray-700 mb-1">Data de Solicitação</div>
                <div className="text-gray-900">{formatDate(exame.data_solicitacao)}</div>
              </div>
              
              {exame.data_coleta && (
                <div className="bg-white border rounded-lg p-4">
                  <div className="text-sm font-medium text-gray-700 mb-1">Data de Coleta</div>
                  <div className="text-gray-900">{formatDate(exame.data_coleta)}</div>
                </div>
              )}
              
              {exame.data_resultado && (
                <div className="bg-white border rounded-lg p-4">
                  <div className="text-sm font-medium text-gray-700 mb-1">Data do Resultado</div>
                  <div className="text-gray-900">{formatDate(exame.data_resultado)}</div>
                </div>
              )}
            </div>
          </div>

          {/* Informações adicionais */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <User className="h-5 w-5 text-cyan-600" />
                Veterinário Responsável
              </h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-gray-900">{exame.veterinario_nome}</div>
              </div>
            </div>
            

          </div>

          {/* Observações */}
          {exame.observacoes_resultado && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <FileText className="h-5 w-5 text-cyan-600" />
                Observações
              </h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-gray-900 whitespace-pre-wrap">{exame.observacoes_resultado}</div>
              </div>
            </div>
          )}

          {/* Resultado */}
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <FileText className="h-5 w-5 text-cyan-600" />
              Resultado do Exame
            </h3>
            <div className="bg-gray-50 p-4 rounded-lg min-h-[200px]">
              {exame.resultado ? (
                <div className="text-gray-900 whitespace-pre-wrap">{exame.resultado}</div>
              ) : (
                <div className="text-gray-500 italic">
                  {exame.status === 'concluido' 
                    ? 'Resultado não informado.' 
                    : 'Resultado ainda não disponível. O exame está em andamento.'}
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex justify-end p-6 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}