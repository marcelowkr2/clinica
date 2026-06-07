'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { FileText, ArrowLeft, Edit, Printer, Download, Calendar, User, Pill } from 'lucide-react';
import { VetLayout } from '@/components/ui/VetLayout';

interface Medicamento {
  nome: string;
  dosagem: string;
  frequencia: string;
  duracao: string;
  observacoes?: string;
}

interface Receita {
  id: string;
  paciente_nome: string;
  especie: string;
  tutor_nome: string;
  tutor_telefone: string;
  veterinario: string;
  data_prescricao: string;
  status: 'ativa' | 'finalizada' | 'cancelada';
  medicamentos: Medicamento[];
  observacoes: string;
}

// Dados simulados - em produção viria da API
const receitaSimulada: Receita = {
  id: '1',
  paciente_nome: 'Rex',
  especie: 'Cão',
  tutor_nome: 'João Silva',
  tutor_telefone: '(11) 99999-9999',
  veterinario: 'Dr. João Veterinário',
  data_prescricao: '2024-01-15',
  status: 'ativa',
  medicamentos: [
    {
      nome: 'Amoxicilina',
      dosagem: '250mg',
      frequencia: '2x ao dia',
      duracao: '7 dias',
      observacoes: 'Administrar com alimento'
    },
    {
      nome: 'Meloxicam',
      dosagem: '0.5ml',
      frequencia: '1x ao dia',
      duracao: '5 dias',
      observacoes: 'Anti-inflamatório'
    }
  ],
  observacoes: 'Retornar em 7 dias para reavaliação. Manter o animal em repouso.'
};

export default function VisualizarReceitaPage() {
  const router = useRouter();
  const params = useParams();
  const [receita, setReceita] = useState<Receita | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const carregarReceita = async () => {
      try {
        setLoading(true);
        // Simular carregamento da API
        await new Promise(resolve => setTimeout(resolve, 1000));
        setReceita(receitaSimulada);
      } catch (error) {
        console.error('Erro ao carregar receita:', error);
      } finally {
        setLoading(false);
      }
    };

    carregarReceita();
  }, [params.id]);

  const handlePrint = () => {
    if (!receita) return;

    const printContent = `
      RECEITA VETERINÁRIA
      
      Paciente: ${receita.paciente_nome}
      Espécie: ${receita.especie}
      Tutor: ${receita.tutor_nome}
      Telefone: ${receita.tutor_telefone}
      Data: ${new Date(receita.data_prescricao).toLocaleDateString('pt-BR')}
      Veterinário: ${receita.veterinario}
      Status: ${receita.status.toUpperCase()}
      
      MEDICAMENTOS:
      ${receita.medicamentos.map((med, index) => 
        `${index + 1}. ${med.nome}
           Dosagem: ${med.dosagem}
           Frequência: ${med.frequencia}
           Duração: ${med.duracao}
           ${med.observacoes ? `Observações: ${med.observacoes}` : ''}`
      ).join('\n\n')}
      
      OBSERVAÇÕES GERAIS:
      ${receita.observacoes || 'Nenhuma observação adicional'}
    `;
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Receita - ${receita.paciente_nome}</title>
            <style>
              body { 
                font-family: Arial, sans-serif; 
                padding: 20px; 
                line-height: 1.6;
              }
              h1 { 
                color: #333; 
                text-align: center;
                border-bottom: 2px solid #333;
                padding-bottom: 10px;
              }
              .info { 
                margin: 10px 0; 
                background: #f5f5f5;
                padding: 15px;
                border-radius: 5px;
              }
              .medications { 
                margin-top: 20px; 
              }
              .medication {
                margin: 15px 0;
                padding: 10px;
                border-left: 3px solid #007bff;
                background: #f8f9fa;
              }
              .observations {
                margin-top: 20px;
                padding: 15px;
                background: #fff3cd;
                border-radius: 5px;
              }
            </style>
          </head>
          <body>
            <pre style="white-space: pre-wrap;">${printContent}</pre>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handleDownload = () => {
    if (!receita) return;

    const content = `RECEITA VETERINÁRIA

Paciente: ${receita.paciente_nome}
Espécie: ${receita.especie}
Tutor: ${receita.tutor_nome}
Telefone: ${receita.tutor_telefone}
Data: ${new Date(receita.data_prescricao).toLocaleDateString('pt-BR')}
Veterinário: ${receita.veterinario}
Status: ${receita.status.toUpperCase()}

MEDICAMENTOS:
${receita.medicamentos.map((med, index) => 
  `${index + 1}. ${med.nome}
   Dosagem: ${med.dosagem}
   Frequência: ${med.frequencia}
   Duração: ${med.duracao}
   ${med.observacoes ? `Observações: ${med.observacoes}` : ''}`
).join('\n\n')}

OBSERVAÇÕES GERAIS:
${receita.observacoes || 'Nenhuma observação adicional'}`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `receita-${receita.paciente_nome}-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ativa':
        return 'bg-green-100 text-green-800';
      case 'finalizada':
        return 'bg-blue-100 text-blue-800';
      case 'cancelada':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <VetLayout>
        <div className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        </div>
      </VetLayout>
    );
  }

  if (!receita) {
    return (
      <VetLayout>
        <div className="p-6">
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Receita não encontrada</h2>
            <p className="text-gray-600 mb-4">A receita solicitada não foi encontrada.</p>
            <button
              onClick={() => router.push('/receitas')}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Voltar para Receitas
            </button>
          </div>
        </div>
      </VetLayout>
    );
  }

  return (
    <VetLayout>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            
            <div className="flex items-center gap-3">
              <FileText className="h-8 w-8 text-indigo-600" />
              <div>
                <h1 className="text-2xl font-bold">Receita Médica</h1>
                <p className="text-gray-600">#{receita.id}</p>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => router.push(`/receitas/${receita.id}/editar`)}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Edit className="h-4 w-4" />
              Editar
            </button>
            
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <Printer className="h-4 w-4" />
              Imprimir
            </button>
            
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              <Download className="h-4 w-4" />
              Download
            </button>
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            {/* Informações do Paciente */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Informações do Paciente</h2>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(receita.status)}`}>
                  {receita.status.charAt(0).toUpperCase() + receita.status.slice(1)}
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <User className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Paciente</p>
                      <p className="font-medium">{receita.paciente_nome}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Pill className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Espécie</p>
                      <p className="font-medium">{receita.especie}</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <User className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Tutor</p>
                      <p className="font-medium">{receita.tutor_nome}</p>
                      <p className="text-sm text-gray-600">{receita.tutor_telefone}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Data da Prescrição</p>
                      <p className="font-medium">{new Date(receita.data_prescricao).toLocaleDateString('pt-BR')}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm text-gray-600">Veterinário Responsável</p>
                <p className="font-medium">{receita.veterinario}</p>
              </div>
            </div>

            {/* Medicamentos */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold mb-4">Medicamentos Prescritos</h2>
              
              <div className="space-y-4">
                {receita.medicamentos.map((medicamento, index) => (
                  <div key={index} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-medium text-lg">{medicamento.nome}</h3>
                      <span className="text-sm text-gray-500">#{index + 1}</span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                      <div>
                        <p className="text-sm text-gray-600">Dosagem</p>
                        <p className="font-medium">{medicamento.dosagem}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-600">Frequência</p>
                        <p className="font-medium">{medicamento.frequencia}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-600">Duração</p>
                        <p className="font-medium">{medicamento.duracao}</p>
                      </div>
                    </div>
                    
                    {medicamento.observacoes && (
                      <div className="pt-3 border-t border-gray-200">
                        <p className="text-sm text-gray-600">Observações</p>
                        <p className="text-sm">{medicamento.observacoes}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Observações Gerais */}
            {receita.observacoes && (
              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-4">Observações Gerais</h2>
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-gray-700">{receita.observacoes}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </VetLayout>
  );
}