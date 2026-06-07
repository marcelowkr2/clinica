'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, User, Mail, Phone, Shield, Key, CheckSquare } from 'lucide-react';
import usuariosService, { CreateUsuarioData } from '@/services/usuarios';

export default function NovoUsuario() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [permissoesDisponiveis, setPermissoesDisponiveis] = useState<string[]>([]);
  
  // Estados do formulário
  const [formData, setFormData] = useState<CreateUsuarioData>({
    nome: '',
    email: '',
    telefone: '',
    cargo: '',
    perfil: 'auxiliar',
    senha: '',
    permissoes: []
  });

  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Carregar permissões disponíveis
  useEffect(() => {
    const loadPermissoes = async () => {
      try {
        const permissoes = await usuariosService.getPermissoesDisponiveis();
        setPermissoesDisponiveis(permissoes);
      } catch (error) {
        console.error('Erro ao carregar permissões:', error);
      }
    };

    loadPermissoes();
  }, []);

  // Atualizar permissões baseado no perfil
  useEffect(() => {
    let permissoesPadrao: string[] = [];
    
    switch (formData.perfil) {
      case 'admin':
        permissoesPadrao = ['todos'];
        break;
      case 'veterinario':
        permissoesPadrao = ['consultas', 'exames', 'receitas', 'cirurgias', 'clientes', 'pets'];
        break;
      case 'recepcionista':
        permissoesPadrao = ['agendamentos', 'clientes', 'pets', 'vendas'];
        break;
      case 'auxiliar':
        permissoesPadrao = ['banho-tosa', 'internacao', 'estoque'];
        break;
    }

    setFormData(prev => ({ ...prev, permissoes: permissoesPadrao }));
  }, [formData.perfil]);

  // Validar formulário
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome é obrigatório';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!formData.telefone.trim()) {
      newErrors.telefone = 'Telefone é obrigatório';
    }

    if (!formData.cargo.trim()) {
      newErrors.cargo = 'Cargo é obrigatório';
    }

    if (!formData.senha) {
      newErrors.senha = 'Senha é obrigatória';
    } else if (formData.senha.length < 6) {
      newErrors.senha = 'Senha deve ter pelo menos 6 caracteres';
    }

    if (formData.senha !== confirmarSenha) {
      newErrors.confirmarSenha = 'Senhas não coincidem';
    }

    if (formData.permissoes.length === 0) {
      newErrors.permissoes = 'Selecione pelo menos uma permissão';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submeter formulário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      await usuariosService.createUsuario(formData);
      router.push('/usuarios');
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      alert('Erro ao criar usuário. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // Atualizar campo do formulário
  const updateField = (field: keyof CreateUsuarioData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Toggle permissão
  const togglePermissao = (permissao: string) => {
    if (permissao === 'todos') {
      // Se selecionar "todos", desmarcar outras e marcar apenas "todos"
      setFormData(prev => ({
        ...prev,
        permissoes: prev.permissoes.includes('todos') ? [] : ['todos']
      }));
    } else {
      // Se selecionar outra permissão, remover "todos" se estiver selecionado
      setFormData(prev => {
        const novasPermissoes = prev.permissoes.includes(permissao)
          ? prev.permissoes.filter(p => p !== permissao)
          : [...prev.permissoes.filter(p => p !== 'todos'), permissao];
        
        return { ...prev, permissoes: novasPermissoes };
      });
    }
  };

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
            <h1 className="text-2xl font-bold text-gray-900">Novo Usuário</h1>
            <p className="text-gray-600">Cadastre um novo usuário no sistema</p>
          </div>
        </div>
      </div>

      {/* Formulário */}
      <form onSubmit={handleSubmit} className="max-w-4xl">
        <div className="bg-white rounded-lg shadow-sm border p-6 space-y-6">
          {/* Informações Básicas */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <User className="w-5 h-5" />
              Informações Básicas
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  value={formData.nome}
                  onChange={(e) => updateField('nome', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.nome ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Digite o nome completo"
                />
                {errors.nome && (
                  <p className="text-red-500 text-sm mt-1">{errors.nome}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cargo *
                </label>
                <input
                  type="text"
                  value={formData.cargo}
                  onChange={(e) => updateField('cargo', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.cargo ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Ex: Veterinário Clínico"
                />
                {errors.cargo && (
                  <p className="text-red-500 text-sm mt-1">{errors.cargo}</p>
                )}
              </div>
            </div>
          </div>

          {/* Contato */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Contato
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateField('email', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="usuario@vethub.com"
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Telefone *
                </label>
                <input
                  type="tel"
                  value={formData.telefone}
                  onChange={(e) => updateField('telefone', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.telefone ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="(11) 99999-9999"
                />
                {errors.telefone && (
                  <p className="text-red-500 text-sm mt-1">{errors.telefone}</p>
                )}
              </div>
            </div>
          </div>

          {/* Perfil e Acesso */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Perfil e Acesso
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Perfil *
                </label>
                <select
                  value={formData.perfil}
                  onChange={(e) => updateField('perfil', e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="auxiliar">Auxiliar</option>
                  <option value="recepcionista">Recepcionista</option>
                  <option value="veterinario">Veterinário</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Senha *
                </label>
                <input
                  type="password"
                  value={formData.senha}
                  onChange={(e) => updateField('senha', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.senha ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Mínimo 6 caracteres"
                />
                {errors.senha && (
                  <p className="text-red-500 text-sm mt-1">{errors.senha}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirmar Senha *
                </label>
                <input
                  type="password"
                  value={confirmarSenha}
                  onChange={(e) => setConfirmarSenha(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.confirmarSenha ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Confirme a senha"
                />
                {errors.confirmarSenha && (
                  <p className="text-red-500 text-sm mt-1">{errors.confirmarSenha}</p>
                )}
              </div>
            </div>
          </div>

          {/* Permissões */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <CheckSquare className="w-5 h-5" />
              Permissões
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {permissoesDisponiveis.map((permissao) => (
                <label
                  key={permissao}
                  className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={formData.permissoes.includes(permissao)}
                    onChange={() => togglePermissao(permissao)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700 capitalize">
                    {permissao.replace('-', ' ')}
                  </span>
                </label>
              ))}
            </div>
            
            {errors.permissoes && (
              <p className="text-red-500 text-sm mt-2">{errors.permissoes}</p>
            )}
          </div>

          {/* Botões */}
          <div className="flex justify-end gap-3 pt-6 border-t">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {loading ? 'Salvando...' : 'Salvar Usuário'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}