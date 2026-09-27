'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import InternacaoService, { Internacao } from '@/services/internacao';
import PetsService, { Paciente } from '@/services/pets';
import UsersService, { User } from '@/services/users';
import { useToast } from '@/components/ui/use-toast';

interface EditarInternacaoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
  internacao: Internacao | null;
}

export function EditarInternacaoModal({ isOpen, onClose, onUpdate, internacao }: EditarInternacaoModalProps) {
  const [formData, setFormData] = useState({
    pet: '',
    veterinario_responsavel: '',
    motivo: '',
    diagnostico: '',
    observacoes_entrada: '',
    valor_diaria: ''
  });

  const [pets, setPets] = useState<Paciente[]>([]);
  const [veterinarios, setVeterinarios] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      loadData();
      if (internacao) {
        // Formatar o valor da diária vindo do backend para a máscara de moeda
        const valorOriginal = internacao.valor_diaria || 0;
        const valorFormatado = new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        }).format(parseFloat(valorOriginal.toString()));

        setFormData({
          pet: internacao.paciente?.toString() || '',
          veterinario_responsavel: internacao.medico_responsavel?.toString() || '',
          motivo: internacao.motivo || '',
          diagnostico: internacao.diagnostico || '',
          observacoes_entrada: internacao.observacoes_entrada || '',
          valor_diaria: valorFormatado
        });
      }
    }
  }, [isOpen, internacao]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [petsData, veterinariosData] = await Promise.all([
        PetsService.getAllPacientes(),
        UsersService.getAllUsers()
      ]);

      setPets(petsData);

      // Garantir que veterinariosData seja um array antes de filtrar
      const vData = Array.isArray(veterinariosData)
        ? veterinariosData
        : (veterinariosData as any)?.results || [];

      setVeterinarios(vData.filter((user: any) => user.user_type === 2));
    } catch (error: any) {
      console.error('Erro ao carregar dados:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar dados',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!internacao) {
      toast({
        title: 'Erro',
        description: 'Internação não encontrada',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.pet || !formData.veterinario_responsavel || !formData.motivo || !formData.valor_diaria) {
      toast({
        title: 'Erro',
        description: 'Por favor, preencha todos os campos obrigatórios',
        variant: 'destructive',
      });
      return;
    }

    try {
      setSaving(true);

      // Limpar a máscara para enviar o valor numérico ao backend
      const numericValue = parseFloat(formData.valor_diaria.replace(/[^\d,]/g, '').replace(',', '.'));

      const dadosParaEnviar = {
        paciente: parseInt(formData.pet),
        medico_responsavel: parseInt(formData.veterinario_responsavel),
        motivo: formData.motivo,
        diagnostico: formData.diagnostico,
        observacoes_entrada: formData.observacoes_entrada,
        valor_diaria: numericValue
      };

      await InternacaoService.updateInternacao(internacao.id, dadosParaEnviar);

      toast({
        title: 'Sucesso',
        description: 'Internação atualizada com sucesso',
      });

      onUpdate();
      onClose();
    } catch (error: any) {
      console.error('Erro ao atualizar internação:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao atualizar internação',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold">Editar Internação</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="pet" className="block text-sm font-medium text-gray-700 mb-1">Paciente*</label>
              <select
                id="pet"
                value={formData.pet}
                onChange={(e) => setFormData({ ...formData, pet: e.target.value })}
                required
                disabled={loading}
                className="w-full border rounded-md px-3 py-2 disabled:bg-gray-100"
              >
                <option value="">
                  {loading ? 'Carregando pacientes...' : 'Selecione um paciente'}
                </option>
                {pets.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nome}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="veterinario" className="block text-sm font-medium text-gray-700 mb-1">Médico Responsável*</label>
              <select
                id="veterinario"
                value={formData.veterinario_responsavel}
                onChange={(e) => setFormData({ ...formData, veterinario_responsavel: e.target.value })}
                required
                disabled={loading}
                className="w-full border rounded-md px-3 py-2 disabled:bg-gray-100"
              >
                <option value="">
                  {loading ? 'Carregando médicos...' : 'Selecione um médico'}
                </option>
                {veterinarios.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.first_name} {v.last_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="motivo" className="block text-sm font-medium text-gray-700 mb-1">Motivo*</label>
                <select
                  id="motivo"
                  value={formData.motivo}
                  onChange={(e) => setFormData({ ...formData, motivo: e.target.value })}
                  required
                  className="w-full border rounded-md px-3 py-2"
                >
                  <option value="">Selecione o motivo</option>
                  <option value="cirurgia">Cirurgia</option>
                  <option value="tratamento">Tratamento</option>
                  <option value="observacao">Observação</option>
                  <option value="pos_operatorio">Pós-operatório</option>
                  <option value="emergencia">Emergência</option>
                  <option value="outros">Outros</option>
                </select>
              </div>

              <div>
                <label htmlFor="valor_diaria" className="block text-sm font-medium text-gray-700 mb-1">Valor da Diária (R$)*</label>
                <input
                  id="valor_diaria"
                  type="text"
                  value={formData.valor_diaria}
                  onChange={(e) => {
                    let value = e.target.value.replace(/\D/g, '');
                    if (value === '') {
                      setFormData({ ...formData, valor_diaria: '' });
                      return;
                    }
                    const amount = (parseInt(value) / 100).toFixed(2);
                    const formatted = new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    }).format(parseFloat(amount));
                    setFormData({ ...formData, valor_diaria: formatted });
                  }}
                  required
                  placeholder="R$ 0,00"
                  className="w-full border rounded-md px-3 py-2"
                />
              </div>
            </div>

            <div>
              <label htmlFor="diagnostico" className="block text-sm font-medium text-gray-700 mb-1">Diagnóstico*</label>
              <textarea
                id="diagnostico"
                value={formData.diagnostico}
                onChange={(e) => setFormData({ ...formData, diagnostico: e.target.value })}
                required
                rows={3}
                className="w-full border rounded-md px-3 py-2"
                placeholder="Descreva o diagnóstico..."
              />
            </div>

            <div>
              <label htmlFor="observacoesEntrada" className="block text-sm font-medium text-gray-700 mb-1">Observações de Entrada</label>
              <textarea
                id="observacoesEntrada"
                value={formData.observacoes_entrada}
                onChange={(e) => setFormData({ ...formData, observacoes_entrada: e.target.value })}
                rows={3}
                className="w-full border rounded-md px-3 py-2"
                placeholder="Observações sobre a entrada do paciente..."
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
              disabled={saving}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
              disabled={saving}
            >
              {saving ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
