'use client';

import { useState } from 'react';
import { X } from 'lucide-react';

interface NovoAtendimentoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (atendimento: any) => void;
}

export function NovoAtendimentoModal({ isOpen, onClose, onSave }: NovoAtendimentoModalProps) {
  const [paciente, setPaciente] = useState('');
  const [tipo, setTipo] = useState('');
  const [queixa, setQueixa] = useState('');
  const [anamnese, setAnamnese] = useState('');
  const [exame, setExame] = useState('');
  const [diagnostico, setDiagnostico] = useState('');
  const [tratamento, setTratamento] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [veterinario, setVeterinario] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const novoAtendimento = {
      paciente,
      tipo,
      queixa,
      anamnese,
      exame,
      diagnostico,
      tratamento,
      observacoes,
      veterinario,
      data: new Date().toISOString(),
      status: 'em_andamento'
    };
    
    onSave(novoAtendimento);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold">Novo Atendimento</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="space-y-4">
                <div>
                  <label htmlFor="paciente" className="block text-sm font-medium text-gray-700 mb-1">Paciente*</label>
                  <select
                    id="paciente"
                    value={paciente}
                    onChange={(e) => setPaciente(e.target.value)}
                    required
                    className="w-full border rounded-md px-3 py-2"
                  >
                    <option value="">Selecione um paciente</option>
                    {/* Aqui seriam listados os pacientes do sistema */}
                    <option value="paciente1">Rex (Tutor: João Silva)</option>
                    <option value="paciente2">Luna (Tutor: Maria Oliveira)</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="tipo" className="block text-sm font-medium text-gray-700 mb-1">Tipo de Atendimento*</label>
                  <select
                    id="tipo"
                    value={tipo}
                    onChange={(e) => setTipo(e.target.value)}
                    required
                    className="w-full border rounded-md px-3 py-2"
                  >
                    <option value="">Selecione</option>
                    <option value="consulta">Consulta</option>
                    <option value="vacina">Vacinação</option>
                    <option value="exame">Exame</option>
                    <option value="cirurgia">Cirurgia</option>
                    <option value="retorno">Retorno</option>
                    <option value="emergencia">Emergência</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="veterinario" className="block text-sm font-medium text-gray-700 mb-1">Veterinário*</label>
                  <select
                    id="veterinario"
                    value={veterinario}
                    onChange={(e) => setVeterinario(e.target.value)}
                    required
                    className="w-full border rounded-md px-3 py-2"
                  >
                    <option value="">Selecione</option>
                    {/* Aqui seriam listados os veterinários do sistema */}
                    <option value="vet1">Dr. Carlos Mendes</option>
                    <option value="vet2">Dra. Ana Paula Santos</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="queixa" className="block text-sm font-medium text-gray-700 mb-1">Queixa Principal*</label>
                  <textarea
                    id="queixa"
                    value={queixa}
                    onChange={(e) => setQueixa(e.target.value)}
                    required
                    rows={3}
                    className="w-full border rounded-md px-3 py-2"
                  />
                </div>
              </div>
            </div>
            
            <div>
              <div className="space-y-4">
                <div>
                  <label htmlFor="anamnese" className="block text-sm font-medium text-gray-700 mb-1">Anamnese</label>
                  <textarea
                    id="anamnese"
                    value={anamnese}
                    onChange={(e) => setAnamnese(e.target.value)}
                    rows={3}
                    className="w-full border rounded-md px-3 py-2"
                  />
                </div>
                
                <div>
                  <label htmlFor="exame" className="block text-sm font-medium text-gray-700 mb-1">Exame Físico</label>
                  <textarea
                    id="exame"
                    value={exame}
                    onChange={(e) => setExame(e.target.value)}
                    rows={3}
                    className="w-full border rounded-md px-3 py-2"
                  />
                </div>
                
                <div>
                  <label htmlFor="diagnostico" className="block text-sm font-medium text-gray-700 mb-1">Diagnóstico</label>
                  <textarea
                    id="diagnostico"
                    value={diagnostico}
                    onChange={(e) => setDiagnostico(e.target.value)}
                    rows={2}
                    className="w-full border rounded-md px-3 py-2"
                  />
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6 space-y-4">
            <div>
              <label htmlFor="tratamento" className="block text-sm font-medium text-gray-700 mb-1">Tratamento</label>
              <textarea
                id="tratamento"
                value={tratamento}
                onChange={(e) => setTratamento(e.target.value)}
                rows={3}
                className="w-full border rounded-md px-3 py-2"
              />
            </div>
            
            <div>
              <label htmlFor="observacoes" className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
              <textarea
                id="observacoes"
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                rows={2}
                className="w-full border rounded-md px-3 py-2"
              />
            </div>
          </div>
          
          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}