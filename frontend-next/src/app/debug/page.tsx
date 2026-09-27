'use client';

import { useState } from 'react';
import PetsService from '@/services/pets';

export default function DebugPage() {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testRequest = async () => {
    setLoading(true);
    setResult('Testando requisição...');

    try {
      console.log('Iniciando teste de requisição...');
      const pets = await PetsService.getAllPacientes();
      console.log('Resposta recebida:', pets);
      setResult(`Sucesso! Recebidos ${pets.length} pacientes: ${JSON.stringify(pets, null, 2)}`);
    } catch (error: any) {
      console.error('Erro na requisição:', error);
      setResult(`Erro: ${error.message}\nStack: ${error.stack}\nResponse: ${JSON.stringify(error.response?.data, null, 2)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Debug - Teste de Requisições</h1>

      <div className="space-y-4">
        <button
          onClick={testRequest}
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Testando...' : 'Testar getAllPacientes'}
        </button>
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-2">Resultado:</h2>
        <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-96 text-sm">
          {result || 'Clique em um botão para testar'}
        </pre>
      </div>
    </div>
  );
}
