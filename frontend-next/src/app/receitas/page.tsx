'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FileText, Search, Plus, Pill, Calendar, User, Eye, Edit, Printer, Download, Trash } from 'lucide-react';
import { VetLayout } from '@/components/ui/VetLayout';
import { NovaReceitaModal } from '@/components/ui/nova-receita-modal';
import { useToast } from '@/components/ui/use-toast';
import receitasService, { Receita } from '@/services/receitas';

export default function ReceitasPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [receitas, setReceitas] = useState<Receita[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [currentPage, setCurrentPage] = useState(1);
  const [showNovaReceitaModal, setShowNovaReceitaModal] = useState(false);
  const itemsPerPage = 6;

  useEffect(() => {
    fetchReceitas();
  }, []);

  useEffect(() => {
    fetchReceitas();
  }, [searchTerm, statusFilter]);

  const fetchReceitas = async () => {
    try {
      setLoading(true);
      const params: any = {};
      
      if (statusFilter !== 'todos') {
        params.status = statusFilter;
      }
      
      if (searchTerm.trim()) {
        params.search = searchTerm.trim();
      }
      
      const data = await receitasService.getReceitas(params);
      setReceitas(data);
    } catch (error) {
      console.error('Erro ao carregar receitas:', error);
      setReceitas([]);
    } finally {
      setLoading(false);
    }
  };

  // Paginação
  const totalPages = Math.ceil(receitas.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentReceitas = receitas.slice(startIndex, endIndex);

  // Reset página quando filtros mudam
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  const handleViewReceita = (id: number) => {
    router.push(`/receitas/${id}`);
  };

  const handleEditReceita = (id: number) => {
    router.push(`/receitas/${id}/editar`);
  };

  const handlePrintReceita = (receita: Receita) => {
    // Simular impressão
    const printContent = `
      RECEITA MÉDICA
      
      Paciente: ${receita.paciente_nome}
      Responsável: ${receita.responsavel_nome}
      Data: ${new Date(receita.data_prescricao).toLocaleDateString('pt-BR')}
      Médico: ${receita.medico_nome}
      Diagnóstico: ${receita.diagnostico}
      
      MEDICAMENTOS:
      ${receita.itens?.map(item => 
        `- ${item.medicamento_nome}: ${item.dosagem} - ${item.frequencia} por ${item.duracao}`
      ).join('\n') || 'Nenhum medicamento prescrito'}
      
      Observações: ${receita.observacoes || 'Nenhuma observação adicional'}
    `;
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Receita - ${receita.paciente_nome}</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; }
              h1 { color: #333; }
              .info { margin: 10px 0; }
              .medications { margin-top: 20px; }
            </style>
          </head>
          <body>
            <pre>${printContent}</pre>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handleDownloadReceita = (receita: Receita) => {
    const content = `RECEITA MÉDICA

Paciente: ${receita.paciente_nome}
Responsável: ${receita.responsavel_nome}
Data: ${new Date(receita.data_prescricao).toLocaleDateString('pt-BR')}
Médico: ${receita.medico_nome}
Diagnóstico: ${receita.diagnostico}

MEDICAMENTOS:
${receita.itens?.map(item => 
  `- ${item.medicamento_nome}: ${item.dosagem} - ${item.frequencia} por ${item.duracao}`
).join('\n') || 'Nenhum medicamento prescrito'}

Observações: ${receita.observacoes || 'Nenhuma observação adicional'}`;

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

  const handleNovaReceita = async (receitaData: any) => {
    try {
      await receitasService.createReceita(receitaData);
      toast({
        title: 'Sucesso',
        description: 'Receita criada com sucesso!',
      });
      fetchReceitas(); // Recarregar a lista de receitas
    } catch (error: any) {
      console.error('Erro ao criar receita:', error);
      toast({
        title: 'Erro',
        description: error.response?.data?.message || 'Erro ao criar receita',
        variant: 'destructive',
      });
    }
  };

  return (
    <VetLayout>
      <div className="p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex items-center gap-3">
            <FileText className="h-8 w-8 text-indigo-600" />
            <h1 className="text-2xl font-bold">Receitas Médicas</h1>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Buscar receitas..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="todos">Todos os Status</option>
              <option value="ativa">Ativas</option>
              <option value="finalizada">Finalizadas</option>
              <option value="cancelada">Canceladas</option>
            </select>

            <button
              className="flex items-center justify-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
              onClick={() => setShowNovaReceitaModal(true)}
            >
              <Plus className="h-4 w-4" />
              Nova Receita
            </button>
          </div>
         </div>

         {/* Cards de Estatísticas */}
         <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
           <div className="bg-white p-6 rounded-lg shadow-sm border">
             <div className="flex items-center">
               <div className="p-2 bg-blue-100 rounded-lg">
                 <FileText className="w-6 h-6 text-blue-600" />
               </div>
               <div className="ml-4">
                 <p className="text-sm font-medium text-gray-600">Total de Receitas</p>
                 <p className="text-2xl font-bold text-gray-900">{receitas.length}</p>
               </div>
             </div>
           </div>

           <div className="bg-white p-6 rounded-lg shadow-sm border">
             <div className="flex items-center">
               <div className="p-2 bg-green-100 rounded-lg">
                 <Pill className="w-6 h-6 text-green-600" />
               </div>
               <div className="ml-4">
                 <p className="text-sm font-medium text-gray-600">Receitas Ativas</p>
                 <p className="text-2xl font-bold text-gray-900">
                   {receitas.filter(r => r.status === 'ativa').length}
                 </p>
               </div>
             </div>
           </div>

           <div className="bg-white p-6 rounded-lg shadow-sm border">
             <div className="flex items-center">
               <div className="p-2 bg-yellow-100 rounded-lg">
                 <Calendar className="w-6 h-6 text-yellow-600" />
               </div>
               <div className="ml-4">
                 <p className="text-sm font-medium text-gray-600">Este Mês</p>
                 <p className="text-2xl font-bold text-gray-900">
                   {receitas.filter(r => {
                     const receitaDate = new Date(r.data_prescricao);
                     const currentDate = new Date();
                     return receitaDate.getMonth() === currentDate.getMonth() && 
                            receitaDate.getFullYear() === currentDate.getFullYear();
                   }).length}
                 </p>
               </div>
             </div>
           </div>

           <div className="bg-white p-6 rounded-lg shadow-sm border">
             <div className="flex items-center">
               <div className="p-2 bg-purple-100 rounded-lg">
                 <User className="w-6 h-6 text-purple-600" />
               </div>
               <div className="ml-4">
                 <p className="text-sm font-medium text-gray-600">Pacientes Únicos</p>
                 <p className="text-2xl font-bold text-gray-900">
                   {new Set(receitas.map(r => r.pet_nome)).size}
                 </p>
               </div>
             </div>
           </div>
         </div>
         
         {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Carregando receitas...</span>
          </div>
        ) : (
           <div className="space-y-4">
             <p className="text-gray-600">
               Mostrando {receitas.length} receitas
             </p>
             {receitas.length === 0 ? (
               <div className="text-center py-8">
                 <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                 <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma receita encontrada</h3>
                 <p className="text-gray-600">
                   {searchTerm || statusFilter !== 'todos' 
                     ? 'Tente ajustar os filtros de busca.' 
                     : 'Comece criando sua primeira receita médica.'}
                 </p>
               </div>
             ) : (
                <>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {currentReceitas.map((receita) => (
                    <div key={receita.id} className="bg-white border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-indigo-100 rounded-lg">
                            <FileText className="w-5 h-5 text-indigo-600" />
                          </div>
                          <div>
                            <h3 className="font-bold text-lg text-gray-900">{receita.pet_nome}</h3>
                            <p className="text-sm text-gray-500">Pet</p>
                          </div>
                        </div>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          receita.status === 'ativa' ? 'bg-green-100 text-green-800' :
                          receita.status === 'finalizada' ? 'bg-blue-100 text-blue-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {receita.status === 'ativa' ? 'Ativa' :
                           receita.status === 'finalizada' ? 'Finalizada' : 'Cancelada'}
                        </span>
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center text-sm text-gray-600">
                          <User className="w-4 h-4 mr-2" />
                          <span>Tutor: {receita.tutor_nome}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="w-4 h-4 mr-2" />
                          <span>Data: {new Date(receita.data_prescricao).toLocaleDateString('pt-BR')}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <User className="w-4 h-4 mr-2" />
                          <span>Veterinário: {receita.veterinario_nome}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Pill className="w-4 h-4 mr-2" />
                          <span>{receita.itens?.length || 0} medicamento{(receita.itens?.length || 0) > 1 ? 's' : ''}</span>
                        </div>
                      </div>

                      <div className="border-t pt-4">
                        <div className="flex items-center justify-between">
                          <div className="text-xs text-gray-500">
                            Medicamentos: {receita.itens?.slice(0, 2).map(item => item.medicamento_nome).join(', ') || 'Nenhum'}
                            {(receita.itens?.length || 0) > 2 && '...'}
                          </div>
                          <div className="flex items-center space-x-2">
                             <button
                               className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 transition-colors"
                               title="Visualizar"
                               onClick={() => handleViewReceita(receita.id)}
                             >
                               <Eye className="w-4 h-4" />
                             </button>
                             <button
                               className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50 transition-colors"
                               title="Editar"
                               onClick={() => handleEditReceita(receita.id)}
                             >
                               <Edit className="w-4 h-4" />
                             </button>
                             <button
                               className="text-purple-600 hover:text-purple-900 p-1 rounded hover:bg-purple-50 transition-colors"
                               title="Imprimir"
                               onClick={() => handlePrintReceita(receita)}
                             >
                               <Printer className="w-4 h-4" />
                             </button>
                             <button
                               className="text-orange-600 hover:text-orange-900 p-1 rounded hover:bg-orange-50 transition-colors"
                               title="Download"
                               onClick={() => handleDownloadReceita(receita)}
                             >
                               <Download className="w-4 h-4" />
                             </button>
                           </div>
                        </div>
                      </div>
                    </div>
                   ))}
                   </div>

                   {/* Controles de Paginação */}
                   {totalPages > 1 && (
                     <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 mt-6">
                       <div className="flex flex-1 justify-between sm:hidden">
                         <button
                           onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                           disabled={currentPage === 1}
                           className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                         >
                           Anterior
                         </button>
                         <button
                           onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                           disabled={currentPage === totalPages}
                           className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                         >
                           Próxima
                         </button>
                       </div>
                       <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                         <div>
                           <p className="text-sm text-gray-700">
                             Mostrando <span className="font-medium">{startIndex + 1}</span> a{' '}
                             <span className="font-medium">{Math.min(endIndex, receitas.length)}</span> de{' '}
                             <span className="font-medium">{receitas.length}</span> resultados
                           </p>
                         </div>
                         <div>
                           <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                             <button
                               onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                               disabled={currentPage === 1}
                               className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                             >
                               <span className="sr-only">Anterior</span>
                               ←
                             </button>
                             {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                               <button
                                 key={page}
                                 onClick={() => setCurrentPage(page)}
                                 className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                                   page === currentPage
                                     ? 'z-10 bg-indigo-600 text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600'
                                     : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                                 }`}
                               >
                                 {page}
                               </button>
                             ))}
                             <button
                               onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                               disabled={currentPage === totalPages}
                               className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                             >
                               <span className="sr-only">Próxima</span>
                               →
                             </button>
                           </nav>
                         </div>
                       </div>
                     </div>
                   )}
                 </>
               )}
            </div>
         )}
      </div>
      
      <NovaReceitaModal
        isOpen={showNovaReceitaModal}
        onClose={() => setShowNovaReceitaModal(false)}
        onSubmit={handleNovaReceita}
      />
    </VetLayout>
  );
}