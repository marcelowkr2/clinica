'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  Calendar, 
  User, 
  Syringe, 
  FileText,
  Phone,
  MapPin,
  Clock
} from 'lucide-react';
import PetsService, { AgendamentoVacina, VacinaAplicada } from '@/services/pets';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface DetalhesVacinaModalProps {
  agendamento: AgendamentoVacina | null;
  onClose: () => void;
}

const DetalhesVacinaModal: React.FC<DetalhesVacinaModalProps> = ({
  agendamento,
  onClose
}) => {
  const [vacinaAplicada, setVacinaAplicada] = useState<VacinaAplicada | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (agendamento && agendamento.status === 'aplicado') {
      carregarDetalhesVacina();
    }
  }, [agendamento]);

  const carregarDetalhesVacina = async () => {
    if (!agendamento) return;
    
    setLoading(true);
    try {
      // Buscar todas as vacinas aplicadas do pet
      const vacinasAplicadas = await PetsService.getVacinasAplicadas(agendamento.pet);
      
      // Encontrar a vacina aplicada correspondente ao agendamento
      const vacinaEncontrada = vacinasAplicadas.find(v => 
        v.vacina === agendamento.vacina && 
        v.data_aplicacao === agendamento.data_aplicacao?.split('T')[0]
      );
      
      setVacinaAplicada(vacinaEncontrada || null);
    } catch (error) {
      console.error('Erro ao carregar detalhes da vacina:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatarData = (data: string) => {
    try {
      return format(new Date(data), 'dd/MM/yyyy', { locale: ptBR });
    } catch {
      return data;
    }
  };

  const formatarDataHora = (data: string) => {
    try {
      return format(new Date(data), 'dd/MM/yyyy \'às\' HH:mm', { locale: ptBR });
    } catch {
      return data;
    }
  };

  if (!agendamento) {
    return null;
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span>Detalhes da Vacina Aplicada</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status */}
          <div className="flex justify-center">
            <Badge className="bg-green-600 text-white px-4 py-2 text-sm">
              <CheckCircle className="h-4 w-4 mr-2" />
              Vacina Aplicada
            </Badge>
          </div>

          {/* Informações do Pet */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-3 flex items-center">
              <User className="h-5 w-5 mr-2" />
              Informações do Pet
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium text-gray-700">Nome do Pet:</p>
                <p className="text-gray-900">{agendamento.pet_nome}</p>
              </div>
              <div>
                <p className="font-medium text-gray-700">Tutor:</p>
                <p className="text-gray-900">{agendamento.tutor_nome}</p>
              </div>
              <div>
                <p className="font-medium text-gray-700 flex items-center">
                  <Phone className="h-4 w-4 mr-1" />
                  Telefone:
                </p>
                <p className="text-gray-900">{agendamento.tutor_telefone}</p>
              </div>
            </div>
          </div>

          {/* Informações da Vacina */}
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-semibold text-green-900 mb-3 flex items-center">
              <Syringe className="h-5 w-5 mr-2" />
              Informações da Vacina
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium text-gray-700">Vacina:</p>
                <p className="text-gray-900">{agendamento.vacina_nome}</p>
              </div>
              <div>
                <p className="font-medium text-gray-700">Veterinário:</p>
                <p className="text-gray-900">{agendamento.veterinario_nome || 'Não informado'}</p>
              </div>
            </div>
          </div>

          {/* Datas */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Cronologia
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between p-2 bg-white rounded border-l-4 border-blue-500">
                <div>
                  <p className="font-medium text-gray-700">Data do Agendamento:</p>
                  <p className="text-gray-900">{formatarData(agendamento.data_agendamento)}</p>
                </div>
                <Clock className="h-4 w-4 text-blue-500" />
              </div>
              
              {agendamento.data_aplicacao && (
                <div className="flex items-center justify-between p-2 bg-white rounded border-l-4 border-green-500">
                  <div>
                    <p className="font-medium text-gray-700">Data de Aplicação:</p>
                    <p className="text-gray-900">{formatarDataHora(agendamento.data_aplicacao)}</p>
                  </div>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </div>
              )}

              {vacinaAplicada?.data_proximo_reforco && (
                <div className="flex items-center justify-between p-2 bg-white rounded border-l-4 border-orange-500">
                  <div>
                    <p className="font-medium text-gray-700">Próximo Reforço:</p>
                    <p className="text-gray-900">{formatarData(vacinaAplicada.data_proximo_reforco)}</p>
                  </div>
                  <Calendar className="h-4 w-4 text-orange-500" />
                </div>
              )}
            </div>
          </div>

          {/* Observações */}
          {(agendamento.observacoes || vacinaAplicada?.observacoes) && (
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h3 className="font-semibold text-yellow-900 mb-3 flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Observações
              </h3>
              <div className="space-y-2 text-sm">
                {agendamento.observacoes && (
                  <div>
                    <p className="font-medium text-gray-700">Observações do Agendamento:</p>
                    <p className="text-gray-900 bg-white p-2 rounded border">{agendamento.observacoes}</p>
                  </div>
                )}
                {vacinaAplicada?.observacoes && vacinaAplicada.observacoes !== agendamento.observacoes && (
                  <div>
                    <p className="font-medium text-gray-700">Observações da Aplicação:</p>
                    <p className="text-gray-900 bg-white p-2 rounded border">{vacinaAplicada.observacoes}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {loading && (
            <div className="text-center py-4">
              <div className="inline-flex items-center space-x-2">
                <Clock className="h-4 w-4 animate-spin" />
                <span>Carregando detalhes...</span>
              </div>
            </div>
          )}
        </div>

        {/* Botão de Fechar */}
        <div className="flex justify-end pt-4 border-t">
          <Button onClick={onClose} variant="outline">
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DetalhesVacinaModal;