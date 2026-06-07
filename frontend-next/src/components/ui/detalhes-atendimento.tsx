'use client';

import { useState, useEffect } from 'react';
import { X, Printer, Download, Edit, Check, Clock, Calendar, User, FileText, Activity, MessageSquare } from 'lucide-react';
import { AppointmentsService, Agendamento } from '@/services/appointments';

interface DetalhesAtendimentoProps {
  isOpen: boolean;
  onClose: () => void;
  atendimentoId: string;
}

export function DetalhesAtendimento({ isOpen, onClose, atendimentoId }: DetalhesAtendimentoProps) {
  const [atendimento, setAtendimento] = useState<Agendamento | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && atendimentoId) {
      fetchAtendimento();
    }
  }, [isOpen, atendimentoId]);

  const fetchAtendimento = async () => {
    try {
      setLoading(true);
      const data = await AppointmentsService.getAgendamento(parseInt(atendimentoId));
      setAtendimento(data);
    } catch (error) {
      console.error('Erro ao buscar detalhes do atendimento:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case 'agendado':
        return 'Agendado';
      case 'em_andamento':
        return 'Em andamento';
      case 'concluido':
        return 'Concluído';
      case 'cancelado':
        return 'Cancelado';
      default:
        return status;
    }
  };

  const handlePrint = () => {
    if (!atendimento) return;
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    const dataHora = new Date(atendimento.data_hora);
    const dataFormatada = dataHora.toLocaleDateString('pt-BR');
    const horaFormatada = dataHora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Detalhes do Atendimento #${atendimento.id}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
            .info-item { margin-bottom: 10px; }
            .label { font-weight: bold; }
            .status { padding: 4px 8px; border-radius: 4px; font-size: 12px; }
            .status-agendado { background-color: #dbeafe; color: #1e40af; }
            .status-concluido { background-color: #dcfce7; color: #166534; }
            .status-em_andamento { background-color: #fef3c7; color: #92400e; }
            .status-cancelado { background-color: #fee2e2; color: #991b1b; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Detalhes do Atendimento #${atendimento.id}</h1>
            <p>Data de impressão: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}</p>
          </div>
          
          <div class="info-grid">
            <div>
              <div class="info-item">
                <span class="label">Pet:</span> ${atendimento.pet_nome}
              </div>
              <div class="info-item">
                <span class="label">Tutor:</span> ${atendimento.tutor_nome && atendimento.tutor_sobrenome 
                  ? `${atendimento.tutor_nome} ${atendimento.tutor_sobrenome}`.trim()
                  : atendimento.tutor_nome || 'Não informado'}
              </div>
              <div class="info-item">
                <span class="label">Data/Hora:</span> ${dataFormatada} às ${horaFormatada}
              </div>
            </div>
            <div>
              <div class="info-item">
                <span class="label">Serviço:</span> ${atendimento.servico_nome}
              </div>
              <div class="info-item">
                <span class="label">Veterinário:</span> ${atendimento.veterinario_nome || 'Não informado'}
              </div>
              <div class="info-item">
                <span class="label">Status:</span> 
                <span class="status status-${atendimento.status}">${getStatusText(atendimento.status)}</span>
              </div>
            </div>
          </div>
          
          <div class="info-item">
            <span class="label">Valor:</span> R$ ${(parseFloat(atendimento.valor) || 0).toFixed(2)}
          </div>
          
          ${atendimento.observacoes ? `
            <div style="margin-top: 20px;">
              <div class="label">Observações:</div>
              <p style="background-color: #f9fafb; padding: 10px; border-radius: 4px; margin-top: 5px;">
                ${atendimento.observacoes}
              </p>
            </div>
          ` : ''}
        </body>
      </html>
    `;
    
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  const handleDownload = () => {
    if (!atendimento) return;
    
    const dataHora = new Date(atendimento.data_hora);
    const dataFormatada = dataHora.toLocaleDateString('pt-BR');
    const horaFormatada = dataHora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    
    const content = `DETALHES DO ATENDIMENTO #${atendimento.id}
=====================================

Pet: ${atendimento.pet_nome}
Tutor: ${atendimento.tutor_nome && atendimento.tutor_sobrenome 
  ? `${atendimento.tutor_nome} ${atendimento.tutor_sobrenome}`.trim()
  : atendimento.tutor_nome || 'Não informado'}
Data/Hora: ${dataFormatada} às ${horaFormatada}
Serviço: ${atendimento.servico_nome}
Veterinário: ${atendimento.veterinario_nome || 'Não informado'}
Status: ${getStatusText(atendimento.status)}
Valor: R$ ${(parseFloat(atendimento.valor) || 0).toFixed(2)}

${atendimento.observacoes ? `Observações:
${atendimento.observacoes}` : ''}

=====================================
Relatório gerado em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}
`;
    
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `atendimento_${atendimento.id}_${dataFormatada.replace(/\//g, '-')}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'agendado':
        return 'bg-blue-100 text-blue-800';
      case 'em_andamento':
        return 'bg-yellow-100 text-yellow-800';
      case 'concluido':
        return 'bg-green-100 text-green-800';
      case 'cancelado':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!isOpen) return null;

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Carregando detalhes...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!atendimento) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center">
            <p className="text-gray-600">Atendimento não encontrado.</p>
            <button
              onClick={onClose}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    );
  }

  const dataHora = new Date(atendimento.data_hora);
  const dataFormatada = dataHora.toLocaleDateString('pt-BR');
  const horaFormatada = dataHora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold">Detalhes do Atendimento #{atendimento.id}</h2>
          <div className="flex items-center gap-2">
            <button 
              onClick={handlePrint}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-full"
              title="Imprimir"
            >
              <Printer className="h-5 w-5" />
            </button>
            <button 
              onClick={handleDownload}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-full"
              title="Baixar PDF"
            >
              <Download className="h-5 w-5" />
            </button>
            <button onClick={onClose} className="p-2 text-gray-500 hover:bg-gray-100 rounded-full">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
        
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(atendimento.status)}`}>
                  {atendimento.status === 'concluido' ? <Check className="h-3 w-3 mr-1" /> : <Clock className="h-3 w-3 mr-1" />}
                  {getStatusText(atendimento.status)}
                </span>
                <span className="text-sm text-gray-500">{atendimento.servico_nome}</span>
              </div>
              <h3 className="text-2xl font-bold">{atendimento.pet_nome}</h3>
              <p className="text-gray-600">Valor: R$ {(parseFloat(atendimento.valor) || 0).toFixed(2)}</p>
            </div>
            <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-full">
              <Edit className="h-5 w-5" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
              <Calendar className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-xs text-gray-500">Data e Hora</p>
                <p className="font-medium">{dataFormatada} às {horaFormatada}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
              <User className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-xs text-gray-500">Tutor</p>
                <p className="font-medium">
                  {atendimento.tutor_nome && atendimento.tutor_sobrenome 
                    ? `${atendimento.tutor_nome} ${atendimento.tutor_sobrenome}`.trim()
                    : atendimento.tutor_nome || 'Não informado'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
              <FileText className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-xs text-gray-500">Veterinário</p>
                <p className="font-medium">{atendimento.veterinario_nome || 'Não informado'}</p>
              </div>
            </div>
          </div>
          
          <div className="space-y-6">
            {atendimento.observacoes && (
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Observações
                </h4>
                <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{atendimento.observacoes}</p>
              </div>
            )}
            
            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Informações do Agendamento
              </h4>
              <div className="bg-gray-50 p-3 rounded-lg space-y-2">
                <p><strong>ID:</strong> {atendimento.id}</p>
                <p><strong>Status:</strong> {getStatusText(atendimento.status)}</p>
                <p><strong>Serviço:</strong> {atendimento.servico_nome}</p>
                <p><strong>Valor:</strong> R$ {(parseFloat(atendimento.valor) || 0).toFixed(2)}</p>
                <p><strong>Data/Hora:</strong> {dataFormatada} às {horaFormatada}</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end gap-3 p-6 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}