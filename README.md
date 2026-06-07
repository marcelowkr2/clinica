# 🏥 MediHub - Sistema de Gestão de Clínicas

<div align="center">

![Medical SaaS](https://img.shields.io/badge/Medical-SaaS-blue?style=for-the-badge&logo=heart&logoColor=white)
![Django](https://img.shields.io/badge/Django-092E20?style=for-the-badge&logo=django&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)

**Sistema completo de gestão de clínicas humanas com tecnologias modernas**

[🚀 Demo](#demo) • [📖 Documentação](#documentação) • [🛠️ Instalação](#instalação) • [🤝 Contribuir](#contribuindo)

</div>

---

## ✨ Funcionalidades

### 🏥 Gestão Completa
- **👥 Pacientes**: Cadastro completo de pacientes com prontuário médico
- **📅 Agendamentos**: Sistema inteligente de consultas e procedimentos
- **🔬 Exames**: Controle de exames laboratoriais e resultados
- **💊 Receitas**: Prescrições médicas digitais
- **🏨 Internações**: Gestão de internamentos e acompanhamento
- **📋 Procedimentos**: Gestão de procedimentos ambulatoriais e cirúrgicos

### 🎯 Recursos Avançados
- **🔍 Busca Global**: Encontre qualquer informação instantaneamente
- **📊 Dashboard**: Estatísticas em tempo real
- **🔐 Autenticação**: Sistema seguro com JWT
- **📱 Responsivo**: Interface adaptável para todos os dispositivos
- **🌙 Tema Escuro**: Conforto visual para longas jornadas

## 🛠️ Tecnologias

### Backend
- **Django REST Framework** - API robusta e escalável
- **PostgreSQL** - Banco de dados confiável
- **JWT Authentication** - Segurança moderna
- **Django CORS** - Integração frontend/backend

### Frontend
- **Next.js 14** - Framework React de última geração
- **TypeScript** - Tipagem estática para maior confiabilidade
- **Tailwind CSS** - Design system moderno
- **Lucide Icons** - Ícones elegantes e consistentes

## 🚀 Instalação

### Usando Docker (Recomendado)

A maneira mais rápida de iniciar o projeto é usando Docker:

```bash
# Clone o repositório
git clone https://github.com/marcelowkr2/Projeto_Sass_Veterinaria.git
cd Projeto_Sass_Veterinaria

# Inicie os containers
docker-compose up -d --build
```

A aplicação estará disponível em:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **Admin Django**: http://localhost:8000/admin (Usuário: `admin`, Senha: `admin123`)

### Instalação Manual

#### Pré-requisitos
- Python 3.11+
- Node.js 18+
- PostgreSQL 17+
- Git

## 📖 Documentação

### 🔗 Links Úteis
- [📋 Guia de Contribuição](CONTRIBUTING.md)
- [❓ FAQ](FAQ.md)
- [🔐 Política de Segurança](SECURITY.md)
- [📝 Changelog](CHANGELOG.md)

### 🏗️ Arquitetura
```
├── backend/          # Django REST API
│   ├── core/         # Autenticação e usuários
│   ├── pets/         # Gestão de pacientes
│   ├── appointments/ # Sistema de agendamentos
│   ├── exames/       # Controle de exames
│   ├── receitas/     # Prescrições médicas
│   └── internacao/   # Gestão de internações
│
├── frontend-next/    # Interface Next.js
│   ├── src/app/      # Páginas da aplicação
│   ├── src/components/ # Componentes reutilizáveis
│   └── src/services/ # Integração com API
```

## 🎯 Roadmap

### 🚀 Versão 1.1 (Em Desenvolvimento)
- [x] Sistema de relatórios avançados
- [x] Integração com WhatsApp
- [x] Notificações push
- [x] Backup automático

### 🌟 Versão 1.2 (Planejado)
- [ ] App mobile (React Native)
- [ ] IA para diagnósticos
- [ ] Telemedicina
- [ ] Multi-tenancy

### 🔮 Futuro
- [ ] Integração com laboratórios
- [ ] Sistema de fidelidade
- [ ] Marketplace de produtos
- [ ] Analytics avançados

## 🤝 Contribuindo

Contribuições são sempre bem-vindas! Veja nosso [Guia de Contribuição](CONTRIBUTING.md) para começar.

### 🐛 Reportar Bugs
Encontrou um bug? [Abra uma issue](https://github.com/marcelowkr2/Projeto_Sass_Veterinaria/issues/new)

### 💡 Sugerir Funcionalidades
Tem uma ideia? [Inicie uma discussão](https://github.com/marcelowkr2/Projeto_Sass_Veterinaria/discussions)

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👨‍💻 Autor

**Marcelo Pires de Oliveira**
- GitHub: [@marcelowkr2](https://github.com/marcelowkr2)
- LinkedIn: [Marcelo Pires](https://linkedin.com/in/marcelowkr2)

---

<div align="center">

**⭐ Se este projeto te ajudou, considere dar uma estrela!**

Made with ❤️ for the veterinary community

</div>
