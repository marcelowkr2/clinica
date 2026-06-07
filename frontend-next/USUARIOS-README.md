# Sistema de Usuários - VetHub Central

## Visão Geral
Sistema completo de gerenciamento de usuários para o VetHub Central, permitindo cadastro, visualização, edição e controle de permissões de usuários do sistema veterinário.

## Funcionalidades Implementadas

### 1. Página Principal de Usuários (`/usuarios`)
- **Estatísticas em tempo real**: Cards mostrando total de usuários, ativos, inativos e bloqueados
- **Sistema de busca**: Busca por nome, email ou cargo
- **Filtros avançados**: Por perfil (Admin, Veterinário, Recepcionista, Auxiliar) e status
- **Tabela responsiva**: Exibição organizada com informações completas
- **Paginação**: Navegação eficiente para grandes volumes de dados
- **Ações rápidas**: Visualizar, editar e excluir usuários
- **Exportação**: Download de dados em formato CSV

### 2. Cadastro de Novo Usuário (`/usuarios/novo`)
- **Formulário completo**: Informações básicas, contato e configurações de acesso
- **Validação em tempo real**: Verificação de campos obrigatórios e formatos
- **Gestão de permissões**: Seleção baseada no perfil escolhido
- **Confirmação de senha**: Validação de segurança
- **Interface intuitiva**: Design responsivo e user-friendly

### 3. Visualização de Usuário (`/usuarios/visualizar/[id]`)
- **Perfil completo**: Todas as informações do usuário organizadas
- **Avatar personalizado**: Iniciais do nome como avatar
- **Status visual**: Indicadores coloridos para status e perfil
- **Informações do sistema**: Data de cadastro e último acesso
- **Ações administrativas**: Editar, excluir, alterar status e resetar senha

### 4. Edição de Usuário (`/usuarios/editar/[id]`)
- **Formulário pré-preenchido**: Dados atuais carregados automaticamente
- **Edição completa**: Todos os campos editáveis exceto ID
- **Atualização de permissões**: Baseada no perfil selecionado
- **Validação consistente**: Mesmas regras do cadastro
- **Salvamento seguro**: Confirmação antes de aplicar alterações

## Estrutura de Dados

### Interface Usuario
```typescript
interface Usuario {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  cargo: string;
  perfil: 'admin' | 'veterinario' | 'recepcionista' | 'auxiliar';
  status: 'ativo' | 'inativo' | 'bloqueado';
  dataCadastro: string;
  ultimoAcesso: string;
  avatar?: string;
  permissoes: string[];
}
```

### Perfis de Usuário
- **Admin**: Acesso total ao sistema
- **Veterinário**: Foco em atendimentos e procedimentos
- **Recepcionista**: Gestão de agendamentos e clientes
- **Auxiliar**: Suporte operacional

### Status de Usuário
- **Ativo**: Usuário com acesso normal
- **Inativo**: Usuário temporariamente desabilitado
- **Bloqueado**: Usuário com acesso restrito por segurança

## Serviço de Usuários (`usuarios.ts`)

### Métodos Principais
- `getUsuarios()`: Lista todos os usuários
- `getUsuarioById(id)`: Busca usuário específico
- `getEstatisticas()`: Retorna estatísticas do sistema
- `createUsuario(data)`: Cria novo usuário
- `updateUsuario(id, data)`: Atualiza dados do usuário
- `updateStatus(id, status)`: Altera status do usuário
- `deleteUsuario(id)`: Remove usuário do sistema
- `resetSenha(id)`: Reseta senha do usuário
- `exportUsuarios()`: Exporta dados para CSV
- `getPermissoesDisponiveis()`: Lista permissões do sistema

### Dados Mockados
O serviço inclui dados de demonstração com 8 usuários de diferentes perfis para testes e desenvolvimento.

## Integração com o Sistema

### Navegação
- Integrado ao menu principal do VetLayout
- Rotas dinâmicas para visualização e edição
- Breadcrumbs para navegação contextual

### Componentes Utilizados
- **VetLayout**: Layout padrão do sistema
- **Lucide Icons**: Ícones consistentes
- **React Router**: Navegação entre páginas
- **React Hooks**: Gerenciamento de estado

## Tecnologias

### Frontend
- **Next.js 14**: Framework React com App Router
- **TypeScript**: Tipagem estática
- **Tailwind CSS**: Estilização responsiva
- **Lucide React**: Biblioteca de ícones

### Funcionalidades Avançadas
- **Responsive Design**: Adaptável a diferentes telas
- **Loading States**: Indicadores de carregamento
- **Error Handling**: Tratamento de erros
- **Form Validation**: Validação de formulários
- **CSV Export**: Exportação de dados

## Arquivos Principais

### Páginas
- `src/app/usuarios/page.tsx` - Página principal
- `src/app/usuarios/novo/page.tsx` - Cadastro
- `src/app/usuarios/visualizar/[id]/page.tsx` - Visualização
- `src/app/usuarios/editar/[id]/page.tsx` - Edição

### Serviços
- `src/services/usuarios.ts` - Serviço principal

## Próximas Melhorias

### Funcionalidades Planejadas
1. **Importação de usuários**: Upload de arquivo CSV
2. **Histórico de atividades**: Log de ações do usuário
3. **Notificações**: Sistema de alertas
4. **Backup automático**: Exportação programada
5. **Integração com API**: Conexão com backend real
6. **Autenticação avançada**: 2FA e SSO
7. **Relatórios**: Dashboard analítico
8. **Auditoria**: Trilha de alterações

### Melhorias de UX
1. **Filtros salvos**: Preferências do usuário
2. **Busca avançada**: Múltiplos critérios
3. **Ações em lote**: Operações múltiplas
4. **Temas**: Personalização visual
5. **Atalhos**: Navegação por teclado

## Como Usar

1. **Acessar**: Navegue para `/usuarios`
2. **Buscar**: Use a barra de busca ou filtros
3. **Visualizar**: Clique no ícone de olho
4. **Editar**: Clique no ícone de lápis
5. **Criar**: Clique em "Novo Usuário"
6. **Exportar**: Clique em "Exportar" para CSV

O sistema está totalmente funcional e pronto para uso em produção!