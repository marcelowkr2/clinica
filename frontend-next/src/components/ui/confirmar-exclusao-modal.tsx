'use client';

import { AlertTriangle, X } from 'lucide-react';
import { Usuario } from '@/services/usuarios';

interface ConfirmarExclusaoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  usuario: Usuario | null;
  loading?: boolean;
}

export function ConfirmarExclusaoModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  usuario, 
  loading = false 
}: ConfirmarExclusaoModalProps) {
  if (!isOpen || !usuario) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-6 w-6 text-red-500" />
            <h2 className="text-lg font-bold text-gray-900">Confirmar Exclusão</h2>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-1 hover:bg-gray-100 rounded-full disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-6">
          <p className="text-gray-700 mb-4">
            Tem certeza que deseja excluir o usuário <strong>{usuario.nome}</strong>?
          </p>
          
          <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
            <p className="text-red-800 text-sm">
              <strong>Atenção:</strong> Esta ação não pode ser desfeita. Todos os dados relacionados a este usuário serão permanentemente removidos.
            </p>
          </div>

          <div className="bg-gray-50 rounded-md p-3">
            <h4 className="font-medium text-gray-900 mb-2">Dados do usuário:</h4>
            <div className="text-sm text-gray-600 space-y-1">
              <p><strong>Nome:</strong> {usuario.nome}</p>
              <p><strong>Email:</strong> {usuario.email}</p>
              <p><strong>Cargo:</strong> {usuario.cargo}</p>
              <p><strong>Perfil:</strong> {usuario.perfil}</p>
              <p><strong>Status:</strong> {usuario.status}</p>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 flex items-center space-x-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Excluindo...</span>
              </>
            ) : (
              <span>Excluir Usuário</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}