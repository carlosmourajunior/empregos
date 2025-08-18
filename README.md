# Sistema de Emprego Rápido - Prefeitura

Sistema completo de cadastro de currículo e matching de vagas para prefeituras.

## 📋 Funcionalidades

### Controle de Usuários
- **Admin**: Controla, remove, desabilita empresas e trabalhadores
- **Empresas**: Cadastram vagas com requisitos específicos  
- **Trabalhadores**: Cadastram currículos e procuram vagas

### Sistema de Aprovação
- Empresas e trabalhadores precisam ser aprovados por admin antes de aparecer na plataforma

### Matching Inteligente
- Análise automática dos melhores candidatos para cada vaga
- Lista ordenada por compatibilidade

## 🚀 Tecnologias

- **Backend**: Django (Python) + Django REST Framework
- **Frontend**: React + Material-UI
- **Banco de Dados**: PostgreSQL
- **Containerização**: Docker + Docker Compose

## 📁 Estrutura do Projeto

```
SistemaEmpregoRapido/
├── backend/              # Django API
├── frontend/             # React App
├── docker-compose.yml    # Configuração Docker
└── README.md
```

## 🛠️ Como Executar

### Pré-requisitos
- Docker
- Docker Compose

### Instalação

1. Clone o repositório
2. Execute o comando:
```bash
docker-compose up --build
```

3. Acesse:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- Admin Django: http://localhost:8000/admin

## 📊 Modelos de Dados

### Usuários
- Admin, Empresas, Trabalhadores
- Sistema de aprovação

### Currículos
- Dados básicos
- Habilitação
- Experiências
- Habilidades
- Tipo de vaga procurada

### Vagas
- Requisitos
- Descrição
- Empresa

## 🔄 API Endpoints

- `/api/auth/` - Autenticação
- `/api/users/` - Gestão de usuários
- `/api/curriculos/` - Gestão de currículos
- `/api/vagas/` - Gestão de vagas
- `/api/matching/` - Sistema de matching

## 📱 Interface

- Design responsivo com Material-UI
- Dashboard para cada tipo de usuário
- Sistema de notificações
- Formulários intuitivos
