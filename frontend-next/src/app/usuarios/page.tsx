'use client';

import { useEffect, useState } from 'react';
import { Search, Plus, Edit, Trash2, Users, UserCheck, UserX, Clock } from 'lucide-react';
import { usuariosService, Usuario, EstatisticasUsuarios } from '@/services/usuarios';
import { NovoUsuarioModal } from '@/components/ui/novo-usuario-modal';
import { EditarUsuarioModal } from '@/components/ui/editar-usuario-modal';
import { ConfirmarExclusaoModal } from '@/components/ui/confirmar-exclusao-modal';
import { VetLayout } from '@/components/ui/VetLayout';

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [estatisticas, setEstatisticas] = useState<EstatisticasUsuarios>({
    total: 0,
    ativos: 0,
    inativos: 0,
    bloqueados: 0
  });
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState<string>('');
  const [pagina, setPagina] = useState(1);
  const [itensPorPagina] = useState(5);
  
  // Estados dos modais
  const [modalNovoUsuario, setModalNovoUsuario] = useState(false);
  const [modalEditarUsuario, setModalEditarUsuario] = useState(false);
  const [modalConfirmarExclusao, setModalConfirmarExclusao] = useState(false);
  const [usuarioSelecionado, setUsuarioSelecionado] = useState<Usuario | null>(null);
  const [loadingOperacao, setLoadingOperacao] = useState(false);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const data = await usuariosService.getUsuarios();
      setUsuarios(data);
      const stats = await usuariosService.getEstatisticas();
      setEstatisticas(stats);
      setLoading(false);
    }
    fetchData();
  }, []);

  const handleNovoUsuario = async (dadosUsuario: any) => {
    setLoadingOperacao(true);
    try {
      await usuariosService.createUsuario(dadosUsuario);
      const data = await usuariosService.getUsuarios();
      setUsuarios(data);
      const stats = await usuariosService.getEstatisticas();
      setEstatisticas(stats);
      setModalNovoUsuario(false);
      alert('Usuário criado com sucesso!');
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      alert('Erro ao criar usuário');
    } finally {
      setLoadingOperacao(false);
    }
  };

  const handleEditarUsuario = (usuario: Usuario) => {
    setUsuarioSelecionado(usuario);
    setModalEditarUsuario(true);
  };

  const handleSalvarEdicao = async (dadosAtualizados: Partial<Usuario>) => {
    if (!usuarioSelecionado) return;
    
    setLoadingOperacao(true);
    try {
      await usuariosService.updateUsuario(usuarioSelecionado.id, dadosAtualizados);
      const data = await usuariosService.getUsuarios();
      setUsuarios(data);
      const stats = await usuariosService.getEstatisticas();
      setEstatisticas(stats);
      setModalEditarUsuario(false);
      setUsuarioSelecionado(null);
      alert('Usuário atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      alert('Erro ao atualizar usuário');
    } finally {
      setLoadingOperacao(false);
    }
  };

  const handleExcluirUsuario = (usuario: Usuario) => {
    setUsuarioSelecionado(usuario);
    setModalConfirmarExclusao(true);
  };

  const confirmarExclusao = async () => {
    if (!usuarioSelecionado) return;
    
    setLoadingOperacao(true);
    try {
      await usuariosService.deleteUsuario(usuarioSelecionado.id);
      const data = await usuariosService.getUsuarios();
      setUsuarios(data);
      const stats = await usuariosService.getEstatisticas();
      setEstatisticas(stats);
      setModalConfirmarExclusao(false);
      setUsuarioSelecionado(null);
      alert('Usuário excluído com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir usuário:', error);
      alert('Erro ao excluir usuário');
    } finally {
      setLoadingOperacao(false);
    }
  };

  const usuariosFiltrados = usuarios.filter(u =>
    u.nome.toLowerCase().includes(filtro.toLowerCase()) ||
    u.email.toLowerCase().includes(filtro.toLowerCase()) ||
    u.cargo.toLowerCase().includes(filtro.toLowerCase())
  );

  const totalPaginas = Math.ceil(usuariosFiltrados.length / itensPorPagina);
  const usuariosPagina = usuariosFiltrados.slice(
    (pagina - 1) * itensPorPagina,
    pagina * itensPorPagina
  );

  return (
    <VetLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Usuários</h1>
        <button 
          onClick={() => setModalNovoUsuario(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Novo Usuário</span>
        </button>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-100 p-4 rounded shadow text-center">
          <div className="text-xl font-semibold">{estatisticas.total}</div>
          <div>Total</div>
        </div>
        <div className="bg-green-100 p-4 rounded shadow text-center">
          <div className="text-xl font-semibold">{estatisticas.ativos}</div>
          <div>Ativos</div>
        </div>
        <div className="bg-yellow-100 p-4 rounded shadow text-center">
          <div className="text-xl font-semibold">{estatisticas.inativos}</div>
          <div>Inativos</div>
        </div>
        <div className="bg-red-100 p-4 rounded shadow text-center">
          <div className="text-xl font-semibold">{estatisticas.bloqueados}</div>
          <div>Bloqueados</div>
        </div>
      </div>

      {/* Filtro */}
      <input
        type="text"
        placeholder="Filtrar por nome, email ou cargo"
        className="border p-2 rounded mb-4 w-full sm:w-1/3"
        value={filtro}
        onChange={e => setFiltro(e.target.value)}
      />

      {/* Tabela */}
      {loading ? (
        <div>Carregando usuários...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border rounded">
            <thead className="bg-gray-200">
              <tr>
                <th className="p-2 border">Nome</th>
                <th className="p-2 border">Email</th>
                <th className="p-2 border">Cargo</th>
                <th className="p-2 border">Perfil</th>
                <th className="p-2 border">Status</th>
                <th className="p-2 border">Último Acesso</th>
                <th className="p-2 border">Ações</th>
              </tr>
            </thead>
            <tbody>
              {usuariosPagina.map(u => (
                <tr key={u.id} className="hover:bg-gray-100">
                  <td className="p-2 border">{u.nome}</td>
                  <td className="p-2 border">{u.email}</td>
                  <td className="p-2 border">{u.cargo}</td>
                  <td className="p-2 border capitalize">{u.perfil}</td>
                  <td className="p-2 border capitalize">{u.status}</td>
                  <td className="p-2 border">{u.ultimoAcesso}</td>
                  <td className="p-2 border space-x-2">
                    <button 
                      onClick={() => handleEditarUsuario(u)}
                      className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                      title="Editar usuário"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => handleExcluirUsuario(u)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                      title="Excluir usuário"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Paginação */}
          {totalPaginas > 1 && (
            <div className="flex justify-center mt-4 space-x-2">
              <button
                className="px-3 py-1 border rounded disabled:opacity-50"
                onClick={() => setPagina(p => Math.max(1, p - 1))}
                disabled={pagina === 1}
              >
                Anterior
              </button>
              <span className="px-3 py-1">
                Página {pagina} de {totalPaginas}
              </span>
              <button
                className="px-3 py-1 border rounded disabled:opacity-50"
                onClick={() => setPagina(p => Math.min(totalPaginas, p + 1))}
                disabled={pagina === totalPaginas}
              >
                Próximo
              </button>
            </div>
          )}
        </div>
      )}
      
      {/* Modais */}
      <NovoUsuarioModal
        isOpen={modalNovoUsuario}
        onClose={() => setModalNovoUsuario(false)}
        onSave={handleNovoUsuario}
      />
      
      <EditarUsuarioModal
         isOpen={modalEditarUsuario}
         onClose={() => {
           setModalEditarUsuario(false);
           setUsuarioSelecionado(null);
         }}
         onSave={handleSalvarEdicao}
         usuario={usuarioSelecionado}
       />
      
      <ConfirmarExclusaoModal
        isOpen={modalConfirmarExclusao}
        onClose={() => {
          setModalConfirmarExclusao(false);
          setUsuarioSelecionado(null);
        }}
        onConfirm={confirmarExclusao}
        usuario={usuarioSelecionado}
        loading={loadingOperacao}
      />
    </VetLayout>
  );
}
