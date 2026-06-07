'use client';

import { useEffect, useState } from 'react';
import { AppointmentsService } from '@/services/appointments';

export default function TestAuth() {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testAuth = async () => {
    setLoading(true);
    try {
      console.log('Testando autenticação...');
      
      // Verificar token no localStorage
      const token = localStorage.getItem('access_token');
      console.log('Token encontrado:', token ? 'Sim' : 'Não');
      
      // Testar endpoint de pacientes
      const pacientes = await AppointmentsService.getPacientesParaAgendamento();
      console.log('Pacientes retornados:', pacientes);
      
      setResult(`Sucesso! ${pacientes.length} pacientes encontrados: ${JSON.stringify(pacientes, null, 2)}`);
    } catch (error: any) {
      console.error('Erro no teste:', error);
      setResult(`Erro: ${error.message || error.toString()}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    testAuth();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Teste de Autenticação</h1>
      
      <div className="mb-4">
        <button 
          onClick={testAuth}
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {loading ? 'Testando...' : 'Testar Novamente'}
        </button>
      </div>
      
      <div className="bg-gray-100 p-4 rounded">
        <h2 className="font-bold mb-2">Resultado:</h2>
        <pre className="whitespace-pre-wrap text-sm">{result}</pre>
      </div>
    </div>
  );
}