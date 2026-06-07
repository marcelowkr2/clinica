'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Edit, Trash2, Shield, Mail, Phone, Calendar, Clock, Key, CheckSquare, User } from 'lucide-react';
import usuariosService, { Usuario } from '@/services/usuarios';

export default function VisualizarUsuario() {
  const router = useRouter();
  const params = useParams();
  const id = Number(params.id);
  
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Carregar dados do usuário
  useEffect(() => {
    const loadUsuario = async () => {
      try {
        // Limpar cache para garantir dados atualizados
        usuariosService.clearUserCache(id);
        const data = await usuariosService.getUsuarioById(id);
        console.log('🔍 [VisualizarUsuario] Dados carregados:', data);
        setUsuario(data);
      } catch (error) {
        console.error('Erro ao carregar usuário:', error);
        alert('Erro ao carregar dados do usuário');
        router.push('/usuarios');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadUsuario();
    }
  }, [id, router]);

  // Recarregar dados quando a página ganha foco (volta da edição)
  useEffect(() => {
    const handleFocus = () => {
      if (id && !loading) {
        setLoading(true);
        usuariosService.clearUserCache(id);
        usuariosService.getUsuarioById(id).then(data => {
          setUsuario(data);
          setLoading(false);
        }).catch(error => {
          console.error('Erro ao recarregar dados:', error);
          setLoading(false);
        });
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [id, loading]);

  // Atualizar status do usuário
  const handleUpdateStatus = async (novoStatus: 'ativo' | 'inativo' | 'bloqueado') => {
    if (!usuario) return;
    
    const confirmMessage = {
      ativo: 'Tem certeza que deseja ativar este usuário?',
      inativo: 'Tem certeza que deseja inativar este usuário?',
      bloqueado: 'Tem certeza que deseja bloquear este usuário?'
    };

    if (!confirm(confirmMessage[novoStatus])) return;

    setActionLoading(true);
    try {
      const usuarioAtualizado = await usuariosService.updateStatus(id, novoStatus);
      setUsuario(usuarioAtualizado);
      alert(`Usuário ${novoStatus} com sucesso!`);
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      alert('Erro ao atualizar status do usuário');
    } finally {
      setActionLoading(false);
    }
  };

  // Resetar senha
  const handleResetSenha = async () => {
    if (!usuario) return;
    
    if (!confirm('Tem certeza que deseja resetar a senha deste usuário?')) return;

    setActionLoading(true);
    try {
      const novaSenha = await usuariosService.resetSenha(id);
      alert(`Senha resetada com sucesso! Nova senha temporária: ${novaSenha}`);
    } catch (error) {
      console.error('Erro ao resetar senha:', error);
      alert('Erro ao resetar senha do usuário');
    } finally {
      setActionLoading(false);
    }
  };

  // Deletar usuário
  const handleDelete = async () => {
    if (!usuario) return;
    
    if (!confirm('Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita.')) return;

    setActionLoading(true);
    try {
      await usuariosService.deleteUsuario(id);
      alert('Usuário excluído com sucesso!');
      router.push('/usuarios');
    } catch (error) {
      console.error('Erro ao excluir usuário:', error);
      alert('Erro ao excluir usuário');
    } finally {
      setActionLoading(false);
    }
  };

  // Função para formatar status
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ativo': return 'bg-green-100 text-green-800';
      case 'inativo': return 'bg-gray-100 text-gray-800';
      case 'bloqueado': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Função para formatar perfil
  const getPerfilColor = (perfil: string) => {
    switch (perfil) {
      case 'admin': return 'bg-purple-100 text-purple-800';
      case 'veterinario': return 'bg-blue-100 text-blue-800';
      case 'recepcionista': return 'bg-green-100 text-green-800';
      case 'auxiliar': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!usuario) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900">Usuário não encontrado</h2>
          <p className="text-gray-600 mt-2">O usuário solicitado não existe ou foi removido.</p>
          <button
            onClick={() => router.push('/usuarios')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Voltar para Usuários
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Detalhes do Usuário</h1>
            <p className="text-gray-600">Visualize e gerencie informações do usuário</p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => router.push(`/usuarios/editar/${id}`)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Edit className="w-4 h-4" />
            Editar
          </button>
          <button
            onClick={handleDelete}
            disabled={actionLoading}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Excluir
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Informações Principais */}
        <div className="lg:col-span-2 space-y-6">
          {/* Dados Pessoais */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <User className="w-5 h-5" />
              Dados Pessoais
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                <p className="text-gray-900">{usuario.nome}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cargo</label>
                <p className="text-gray-900">{usuario.cargo}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <p className="text-gray-900 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-500" />
                  {usuario.email}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                <p className="text-gray-900 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-500" />
                  {usuario.telefone}
                </p>
              </div>
            </div>
          </div>

          {/* Permissões */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <CheckSquare className="w-5 h-5" />
              Permissões
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {usuario.permissoes.map((permissao) => (
                <span
                  key={permissao}
                  className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium capitalize"
                >
                  {permissao.replace('-', ' ')}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Avatar e Status */}
          <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
            <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
              {usuario.avatar ? (
                <img src={usuario.avatar} alt={usuario.nome} className="w-full h-full object-cover" />
              ) : (
                <User className="w-12 h-12 text-gray-400" />
              )}
            </div>
            
            <h3 className="font-semibold text-gray-900 mb-2">{usuario.nome}</h3>
            
            <div className="space-y-2">
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(usuario.status)}`}>
                {usuario.status.charAt(0).toUpperCase() + usuario.status.slice(1)}
              </span>
              
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getPerfilColor(usuario.perfil)}`}>
                {usuario.perfil.charAt(0).toUpperCase() + usuario.perfil.slice(1)}
              </span>
            </div>
          </div>

          {/* Informações do Sistema */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Informações do Sistema
            </h3>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Data de Cadastro</label>
                <p className="text-gray-900 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  {new Date(usuario.dataCadastro).toLocaleDateString('pt-BR')}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Último Acesso</label>
                <p className="text-gray-900 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  {usuario.ultimoAcesso}
                </p>
              </div>
            </div>
          </div>

          {/* Ações */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Ações</h3>
            
            <div className="space-y-2">
              {usuario.status === 'ativo' && (
                <button
                  onClick={() => handleUpdateStatus('inativo')}
                  disabled={actionLoading}
                  className="w-full px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors disabled:opacity-50"
                >
                  Inativar Usuário
                </button>
              )}
              
              {usuario.status === 'inativo' && (
                <button
                  onClick={() => handleUpdateStatus('ativo')}
                  disabled={actionLoading}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  Ativar Usuário
                </button>
              )}
              
              {usuario.status !== 'bloqueado' && (
                <button
                  onClick={() => handleUpdateStatus('bloqueado')}
                  disabled={actionLoading}
                  className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  Bloquear Usuário
                </button>
              )}
              
              {usuario.status === 'bloqueado' && (
                <button
                  onClick={() => handleUpdateStatus('ativo')}
                  disabled={actionLoading}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  Desbloquear Usuário
                </button>
              )}
              
              <button
                onClick={handleResetSenha}
                disabled={actionLoading}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Key className="w-4 h-4" />
                Resetar Senha
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}