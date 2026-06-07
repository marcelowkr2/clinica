'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, Syringe, User, Clock } from 'lucide-react';
import PetsService, { Pet, Vacina, AgendamentoVacina } from '@/services/pets';
import UsersService, { User as UserType } from '@/services/users';

interface NovoAgendamentoVacinaModalProps {
  isOpen?: boolean;
  onClose: () => void;
  onSuccess: () => void;
  agendamento?: AgendamentoVacina | null;
}

const NovoAgendamentoVacinaModal: React.FC<NovoAgendamentoVacinaModalProps> = ({
  isOpen = true,
  onClose,
  onSuccess,
  agendamento = null
}) => {
  const isEditing = !!agendamento;
  const [formData, setFormData] = useState({
    pet: '',
    vacina: '',
    data_agendamento: '',
    veterinario: '',
    observacoes: ''
  });

  const [pets, setPets] = useState<Pet[]>([]);
  const [vacinas, setVacinas] = useState<Vacina[]>([]);
  const [veterinarios, setVeterinarios] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<any>({});

  useEffect(() => {
    if (isOpen) {
      carregarDados();
    }
  }, [isOpen]);

  useEffect(() => {
    if (agendamento && isEditing) {
      // Formatar data para datetime-local
      const dataFormatada = agendamento.data_agendamento 
        ? new Date(agendamento.data_agendamento).toISOString().slice(0, 16)
        : '';
      
      setFormData({
        pet: agendamento.pet?.id?.toString() || '',
        vacina: agendamento.vacina?.id?.toString() || '',
        data_agendamento: dataFormatada,
        veterinario: agendamento.veterinario?.id?.toString() || '',
        observacoes: agendamento.observacoes || ''
      });
    }
  }, [agendamento, isEditing]);

  const carregarDados = async () => {
    try {
      const [petsData, vacinasData, medicosData] = await Promise.all([
        PetsService.getAllPets(),
        PetsService.getAllVacinas(),
        UsersService.getMedicos()
      ]);

      setPets(petsData);
      setVacinas(vacinasData);
      setMedicos(medicosData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      const agendamentoData = {
        pet: parseInt(formData.pet),
        vacina: parseInt(formData.vacina),
        data_agendamento: formData.data_agendamento,
        veterinario: parseInt(formData.veterinario),
        observacoes: formData.observacoes,
        status: isEditing ? agendamento?.status : 'agendado'
      };

      if (isEditing && agendamento?.id) {
        await PetsService.updateAgendamentoVacina(agendamento.id, agendamentoData);
      } else {
        await PetsService.createAgendamentoVacina(agendamentoData);
      }
      
      onSuccess();
      resetForm();
      onClose();
    } catch (error: any) {
      console.error(`Erro ao ${isEditing ? 'atualizar' : 'criar'} agendamento:`, error);
      if (error.response?.data) {
        setErrors(error.response.data);
      }
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      pet: '',
      vacina: '',
      data_agendamento: '',
      veterinario: '',
      observacoes: ''
    });
    setErrors({});
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  // Função para formatar data/hora para input datetime-local
  const getMinDateTime = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Syringe className="h-5 w-5 text-blue-600" />
            <span>{isEditing ? 'Editar Agendamento de Vacina' : 'Novo Agendamento de Vacina'}</span>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Pet */}
          <div>
            <Label htmlFor="pet" className="flex items-center space-x-1">
              <User className="h-4 w-4" />
              <span>Pet *</span>
            </Label>
            <select
              id="pet"
              value={formData.pet}
              onChange={(e) => setFormData({ ...formData, pet: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Selecione um pet</option>
              {pets.map((pet) => (
                <option key={pet.id} value={pet.id}>
                  {pet.nome}
                </option>
              ))}
            </select>
            {errors.pet && (
              <p className="text-red-500 text-sm mt-1">{errors.pet[0]}</p>
            )}
          </div>

          {/* Vacina */}
          <div>
            <Label htmlFor="vacina" className="flex items-center space-x-1">
              <Syringe className="h-4 w-4" />
              <span>Vacina *</span>
            </Label>
            <select
              id="vacina"
              value={formData.vacina}
              onChange={(e) => setFormData({ ...formData, vacina: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Selecione uma vacina</option>
              {vacinas.map((vacina) => (
                <option key={vacina.id} value={vacina.id}>
                  {vacina.nome}
                </option>
              ))}
            </select>
            {errors.vacina && (
              <p className="text-red-500 text-sm mt-1">{errors.vacina[0]}</p>
            )}
          </div>

          {/* Data e Hora */}
          <div>
            <Label htmlFor="data_agendamento" className="flex items-center space-x-1">
              <Calendar className="h-4 w-4" />
              <span>Data e Hora *</span>
            </Label>
            <Input
              id="data_agendamento"
              type="datetime-local"
              value={formData.data_agendamento}
              onChange={(e) => setFormData({ ...formData, data_agendamento: e.target.value })}
              min={getMinDateTime()}
              required
            />
            {errors.data_agendamento && (
              <p className="text-red-500 text-sm mt-1">{errors.data_agendamento[0]}</p>
            )}
          </div>

          {/* Veterinário */}
          <div>
            <Label htmlFor="veterinario" className="flex items-center space-x-1">
              <User className="h-4 w-4" />
              <span>Veterinário *</span>
            </Label>
            <select
              id="veterinario"
              value={formData.veterinario}
              onChange={(e) => setFormData({ ...formData, veterinario: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Selecione um veterinário</option>
              {veterinarios.map((vet) => (
                <option key={vet.id} value={vet.id}>
                  {vet.first_name} {vet.last_name}
                </option>
              ))}
            </select>
            {errors.veterinario && (
              <p className="text-red-500 text-sm mt-1">{errors.veterinario[0]}</p>
            )}
          </div>

          {/* Observações */}
          <div>
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              value={formData.observacoes}
              onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
              placeholder="Observações sobre o agendamento..."
              rows={3}
            />
            {errors.observacoes && (
              <p className="text-red-500 text-sm mt-1">{errors.observacoes[0]}</p>
            )}
          </div>

          {/* Botões */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <Clock className="h-4 w-4 animate-spin" />
                  <span>{isEditing ? 'Atualizando...' : 'Agendando...'}</span>
                </>
              ) : (
                <>
                  <Syringe className="h-4 w-4" />
                  <span>{isEditing ? 'Atualizar Agendamento' : 'Agendar Vacina'}</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NovoAgendamentoVacinaModal;