'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Pet } from '@/services/pets';

interface EditarPacienteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (dadosAtualizados: Partial<Pet>) => void;
  paciente: Pet | null;
}

export function EditarPacienteModal({ isOpen, onClose, onSave, paciente }: EditarPacienteModalProps) {
  const [formData, setFormData] = useState({
    nome: '',
    sexo: 'M' as 'M' | 'F',
    peso: '',
    observacoes: '',
  });

  useEffect(() => {
    if (paciente) {
      setFormData({
        nome: paciente.nome || '',
        sexo: paciente.sexo || 'M',
        peso: paciente.peso?.toString() || '',
        observacoes: paciente.observacoes || '',
      });
    }
  }, [paciente]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const dadosAtualizados: Partial<Pet> = {
      nome: formData.nome,
      sexo: formData.sexo,
      peso: formData.peso ? parseFloat(formData.peso) : undefined,
      observacoes: formData.observacoes,
    };

    onSave(dadosAtualizados);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Editar Paciente</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Dados do Pet */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Dados do Pet</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome *
                </label>
                <input
                  type="text"
                  name="nome"
                  value={formData.nome}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sexo *
                </label>
                <select
                  name="sexo"
                  value={formData.sexo}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="M">Macho</option>
                  <option value="F">Fêmea</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Peso (kg)
                </label>
                <input
                  type="number"
                  name="peso"
                  value={formData.peso}
                  onChange={handleInputChange}
                  step="0.1"
                  min="0"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Observações
              </label>
              <textarea
                name="observacoes"
                value={formData.observacoes}
                onChange={handleInputChange}
                rows={3}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Botões */}
          <div className="flex justify-end space-x-4 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Salvar Alterações
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}