'use client';

import { useState, useEffect } from 'react';
import { X, Edit, Trash, Calendar, Clock, User, FileText, Check, AlertTriangle } from 'lucide-react';
import { AppointmentsService } from '@/services/appointments';
import PetsService from '@/services/pets';

interface DetalhesAgendamentoProps {
  isOpen: boolean;
  onClose: () => void;
  agendamentoId: string;
  onEdit?: (agendamento: any) => void;
  onDelete?: (agendamentoId: string) => void;
}

export function DetalhesAgendamento({ isOpen, onClose, agendamentoId, onEdit, onDelete }: DetalhesAgendamentoProps) {
  const [agendamento, setAgendamento] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && agendamentoId) {
      fetchAgendamentoData();
    }
  }, [isOpen, agendamentoId]);

  const fetchAgendamentoData = async () => {
    try {
      setLoading(true);
      console.log('Buscando dados do agendamento:', agendamentoId);
      
      // Buscar dados do agendamento
      const agendamentoData = await AppointmentsService.getAgendamento(parseInt(agendamentoId));
      console.log('Dados do agendamento recebidos:', agendamentoData);
      setAgendamento(agendamentoData);
    } catch (error) {
      console.error('Erro ao buscar dados do agendamento:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    if (onEdit && agendamento) {
      onEdit(agendamento);
    }
  };

  const handleDelete = async () => {
    if (onDelete && agendamento) {
      if (window.confirm('Tem certeza que deseja cancelar este agendamento?')) {
        try {
          await AppointmentsService.deleteAgendamento(agendamento.id);
          onDelete(agendamento.id);
          onClose();
        } catch (error) {
          console.error('Erro ao cancelar agendamento:', error);
          alert('Erro ao cancelar agendamento. Tente novamente.');
        }
      }
    }
  };

  if (!isOpen) return null;

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
          <div className="flex justify-center items-center p-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p>Carregando dados do agendamento...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!agendamento) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center p-6 border-b">
            <h2 className="text-xl font-semibold">Detalhes do Agendamento</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X className="h-6 w-6" />
            </button>
          </div>
          <div className="flex justify-center items-center p-8">
            <p className="text-red-600">Erro ao carregar dados do agendamento.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold">Detalhes do Agendamento</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${agendamento.status === 'confirmado' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                  {agendamento.status === 'confirmado' ? <Check className="h-3 w-3 mr-1" /> : <AlertTriangle className="h-3 w-3 mr-1" />}
                  {agendamento.status === 'confirmado' ? 'Confirmado' : agendamento.status === 'pendente' ? 'Pendente' : agendamento.status || 'Agendado'}
                </span>
                <span className="text-sm text-gray-500">{agendamento.servico_nome || 'Consulta'}</span>
              </div>
              <h3 className="text-2xl font-bold">{agendamento.pet_nome || 'Paciente não informado'}</h3>
              <p className="text-gray-600">Paciente</p>
            </div>
            <div className="flex gap-2">
              <button onClick={handleEdit} className="p-2 text-blue-600 hover:bg-blue-50 rounded-full">
                <Edit className="h-5 w-5" />
              </button>
              <button onClick={handleDelete} className="p-2 text-red-600 hover:bg-red-50 rounded-full">
                <Trash className="h-5 w-5" />
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
              <Calendar className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-xs text-gray-500">Data</p>
                <p className="font-medium">{agendamento.data_hora ? new Date(agendamento.data_hora).toLocaleDateString('pt-BR') : 'Data não informada'}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
              <Clock className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-xs text-gray-500">Hora</p>
                <p className="font-medium">{agendamento.data_hora ? new Date(agendamento.data_hora).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : 'Hora não informada'}</p>
              </div>
            </div>
          </div>
          
          <div className="space-y-4 mb-6">
            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
              <User className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-xs text-gray-500">Tutor</p>
                <p className="font-medium">{agendamento.tutor_nome ? `${agendamento.tutor_nome} ${agendamento.tutor_sobrenome || ''}`.trim() : 'Tutor não informado'}</p>
                <p className="text-sm text-gray-500">Telefone não disponível</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
              <FileText className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-xs text-gray-500">Veterinário</p>
                <p className="font-medium">{agendamento.veterinario_nome || 'Veterinário não informado'}</p>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-2">Observações</h4>
            <p className="bg-yellow-50 p-3 rounded-md border border-yellow-200">{agendamento.observacoes || 'Nenhuma observação registrada.'}</p>
          </div>
        </div>
        
        <div className="flex justify-between p-6 border-t">
          <div>
            <button
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 mr-3"
            >
              Cancelar Agendamento
            </button>
          </div>
          <div>
            <button
              onClick={onClose}
              className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50 mr-3"
            >
              Fechar
            </button>
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Iniciar Atendimento
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}