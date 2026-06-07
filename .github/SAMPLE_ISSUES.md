# 📋 Issues de Exemplo para GitHub Projects

## 🚀 Como Usar Este Arquivo

Copie e cole estas issues no seu GitHub para popular rapidamente o seu projeto Kanban:

---

## 🐛 **Bug Reports**

### Issue 1: Correção na Busca Global
```
**Título**: 🐛 Busca global não retorna resultados para nomes com acentos

**Labels**: bug, search, priority-medium

**Descrição**:
A funcionalidade de busca global não está retornando resultados quando o nome do pet contém acentos ou caracteres especiais.

**Passos para reproduzir**:
1. Cadastrar um pet com nome "José"
2. Buscar por "Jose" (sem acento)
3. Resultado não é encontrado

**Resultado esperado**: Busca deveria ser case-insensitive e ignorar acentos

**Prioridade**: Média
```

### Issue 2: Problema no Agendamento
```
**Título**: 🐛 Erro ao agendar consulta em horários já ocupados

**Labels**: bug, appointments, priority-high

**Descrição**:
Sistema permite agendar consultas em horários que já estão ocupados, causando conflitos.

**Erro**: ValidationError não está sendo tratada corretamente no frontend

**Prioridade**: Alta
```

---

## ✨ **Feature Requests**

### Issue 3: Sistema de Notificações
```
**Título**: ✨ Implementar sistema de notificações push

**Labels**: enhancement, notifications, v1.1

**Descrição**:
Implementar sistema de notificações para:
- Lembretes de consultas (24h antes)
- Resultados de exames disponíveis
- Medicações em falta
- Aniversário dos pets

**Critérios de Aceitação**:
- [ ] Notificações web (browser)
- [ ] Notificações por email
- [ ] Configurações de preferência do usuário
- [ ] Dashboard de notificações

**Estimativa**: 8 pontos
```

### Issue 4: Relatórios Avançados
```
**Título**: ✨ Sistema de relatórios avançados

**Labels**: enhancement, reports, v1.1

**Descrição**:
Criar sistema de relatórios com:
- Relatório financeiro mensal
- Estatísticas de atendimentos
- Relatório de medicamentos mais usados
- Gráficos de crescimento da clínica

**Tecnologias**: Chart.js, PDF generation

**Estimativa**: 13 pontos
```

### Issue 5: App Mobile
```
**Título**: 📱 Desenvolvimento do app mobile

**Labels**: enhancement, mobile, v2.0

**Descrição**:
Desenvolver aplicativo mobile usando React Native para:
- Visualização de agendamentos
- Histórico dos pets
- Notificações push nativas
- Agendamento rápido

**Plataformas**: iOS e Android

**Estimativa**: 21 pontos
```

---

## 🔧 **Maintenance & Refactoring**

### Issue 6: Otimização de Performance
```
**Título**: ⚡ Otimizar performance das consultas do banco

**Labels**: maintenance, performance, database

**Descrição**:
Otimizar queries que estão causando lentidão:
- Adicionar índices nas tabelas principais
- Implementar cache Redis
- Otimizar consultas N+1
- Implementar paginação

**Impacto**: Reduzir tempo de resposta em 50%
```

### Issue 7: Refatoração do Frontend
```
**Título**: 🎨 Refatorar componentes para usar Context API

**Labels**: refactor, frontend, code-quality

**Descrição**:
Refatorar componentes que estão passando props em excesso:
- Implementar Context para autenticação
- Context para dados globais
- Reduzir prop drilling
- Melhorar performance com useMemo

**Benefícios**: Código mais limpo e performático
```

---

## 📚 **Documentation**

### Issue 8: Documentação da API
```
**Título**: 📚 Criar documentação completa da API

**Labels**: documentation, api

**Descrição**:
Criar documentação interativa da API usando Swagger/OpenAPI:
- Documentar todos os endpoints
- Exemplos de request/response
- Códigos de erro
- Guia de autenticação

**Ferramentas**: drf-spectacular, Swagger UI
```

### Issue 9: Guia de Deploy
```
**Título**: 📚 Criar guia de deploy em produção

**Labels**: documentation, deployment

**Descrição**:
Documentar processo completo de deploy:
- Configuração do servidor
- Variáveis de ambiente
- Backup e restore
- Monitoramento
- SSL/HTTPS

**Incluir**: Docker, Nginx, PostgreSQL
```

---

## 🧪 **Testing**

### Issue 10: Testes Automatizados
```
**Título**: 🧪 Implementar testes automatizados

**Labels**: testing, quality

**Descrição**:
Implementar suite completa de testes:
- Testes unitários (Backend: 90% coverage)
- Testes de integração (API endpoints)
- Testes E2E (Frontend: fluxos principais)
- Testes de performance

**Ferramentas**: 
- Backend: pytest, factory_boy
- Frontend: Jest, React Testing Library, Cypress

**Meta**: 85% de cobertura geral
```

---

## 🔒 **Security**

### Issue 11: Auditoria de Segurança
```
**Título**: 🔒 Implementar auditoria de segurança

**Labels**: security, audit

**Descrição**:
Implementar sistema de auditoria:
- Log de todas as ações sensíveis
- Controle de acesso baseado em roles
- Criptografia de dados sensíveis
- Scan de vulnerabilidades

**Compliance**: LGPD, boas práticas de segurança
```

---

## 🎨 **UI/UX**

### Issue 12: Redesign da Interface
```
**Título**: 🎨 Modernizar interface do usuário

**Labels**: ui/ux, design

**Descrição**:
Atualizar design seguindo tendências modernas:
- Design system consistente
- Modo escuro/claro
- Animações suaves
- Responsividade aprimorada
- Acessibilidade (WCAG 2.1)

**Ferramentas**: Figma, Tailwind CSS, Framer Motion
```

---

## 🚀 **Como Criar Essas Issues**

### Via Interface Web:
1. Acesse seu repositório no GitHub
2. Clique em "Issues" → "New issue"
3. Copie e cole o conteúdo
4. Adicione as labels correspondentes
5. Atribua a você mesmo ou colaboradores

### Via GitHub CLI:
```bash
# Instalar GitHub CLI
gh auth login

# Criar issue
gh issue create --title "🐛 Busca global não funciona com acentos" --body "Descrição..." --label "bug,search"
```

### 📊 **Resultado Esperado**

Após criar essas issues, seu GitHub Project terá:
- ✅ **12 issues** bem estruturadas
- 🏷️ **Labels** organizadas por categoria
- 📈 **Roadmap** claro com versões
- 🎯 **Prioridades** definidas
- 📊 **Estimativas** para planejamento

---

**💡 Dica**: Crie 2-3 issues por vez para não sobrecarregar o projeto inicial!