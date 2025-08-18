# ANÁLISE DE COMPATIBILIDADE FRONTEND ⟷ BACKEND

## ✅ PONTOS POSITIVOS IDENTIFICADOS

### 1. **Configuração da API**
- ✅ Service API bem configurado (`frontend/src/services/api.js`)
- ✅ Base URL correta: `http://localhost:8000`
- ✅ Interceptors para autenticação automática
- ✅ Refresh token funcionando

### 2. **Autenticação**
- ✅ Login endpoint correto: `/api/auth/login/`
- ✅ Registro endpoints corretos: `/api/auth/registro/empresa/` e `/api/auth/registro/trabalhador/`
- ✅ Context de autenticação bem implementado

### 3. **Listagem de Dados**
- ✅ Empresas: `GET /api/usuarios/?tipo_usuario=empresa` ✓
- ✅ Vagas: `GET /api/vagas/` ✓
- ✅ Trabalhadores: `GET /api/usuarios/?tipo_usuario=trabalhador` ✓

## ❌ PROBLEMAS IDENTIFICADOS

### 1. **Inconsistências de Endpoints**

#### **Frontend usa endpoints diferentes da API real:**
- ❌ Frontend: `/api/usuarios/empresas/` 
- ✅ API Real: `/api/usuarios/?tipo_usuario=empresa`

- ❌ Frontend: `/api/usuarios/trabalhadores/`
- ✅ API Real: `/api/usuarios/?tipo_usuario=trabalhador`

#### **CriarVaga.js tem problemas:**
- ❌ Frontend não envia campos obrigatórios identificados nos testes:
  - `jornada_trabalho` (obrigatório)
  - `local_trabalho` (obrigatório) 
  - `area` (obrigatório)
  - `nivel_experiencia` (obrigatório)
  - `cidade` e `estado` (separados, não `localizacao`)

### 2. **Campos Incompatíveis**

#### **Vaga Model vs Frontend:**
- ❌ Frontend: `localizacao` → API: `cidade`, `estado`
- ❌ Frontend: `responsabilidades` → API: não existe
- ❌ Frontend: `escolaridade_minima` → API: não existe
- ❌ Frontend: `experiencia_minima` → API: não existe
- ❌ Frontend: `data_limite` → API: `data_encerramento`

#### **Choices Incompatíveis:**
- ❌ Frontend: `tipo_contrato: ['CLT', 'PJ', ...]`
- ✅ API: `tipo_contrato: ['clt', 'pj', ...]` (lowercase)

- ❌ Frontend: `jornada_trabalho` não implementado
- ✅ API: `['integral', 'meio_periodo', 'flexivel', 'escala']`

### 3. **Problemas de Estrutura de Dados**

#### **GerenciarEmpresas.js:**
- ❌ Usa endpoints que não existem:
  - `PATCH /api/usuarios/${id}/aprovar/` 
- ✅ Deveria usar: endpoints administrativos apropriados

#### **Login/Register:**
- ❌ Campos do frontend não batem 100% com serializers do backend
- Exemplo: frontend envia `endereco`, backend espera separação de campos

## 🔧 CORREÇÕES NECESSÁRIAS

### 1. **Corrigir CriarVaga.js**
```javascript
// ADICIONAR campos obrigatórios:
const vagaData = {
  titulo: data.titulo,
  descricao: data.descricao,
  requisitos: data.requisitos_texto,
  empresa: empresaId,
  cidade: data.cidade,        // separar de localizacao
  estado: data.estado,        // separar de localizacao  
  tipo_contrato: data.tipo_contrato.toLowerCase(),
  jornada_trabalho: data.jornada_trabalho,    // NOVO
  local_trabalho: data.local_trabalho,        // NOVO
  area: data.area,                            // NOVO
  nivel_experiencia: data.nivel_experiencia,  // NOVO
  // ... outros campos
};
```

### 2. **Padronizar Endpoints**
```javascript
// TROCAR endpoints inconsistentes:
// DE: '/api/usuarios/empresas/'
// PARA: '/api/usuarios/?tipo_usuario=empresa'

// DE: '/api/usuarios/trabalhadores/' 
// PARA: '/api/usuarios/?tipo_usuario=trabalhador'
```

### 3. **Ajustar Choices**
```javascript
const tiposContrato = [
  { value: 'clt', label: 'CLT' },
  { value: 'pj', label: 'Pessoa Jurídica' },
  { value: 'temporario', label: 'Temporário' },
  { value: 'estagio', label: 'Estágio' },
  { value: 'freelancer', label: 'Freelancer' },
  { value: 'terceirizado', label: 'Terceirizado' }
];

const jornadaTrabalho = [
  { value: 'integral', label: 'Tempo Integral' },
  { value: 'meio_periodo', label: 'Meio Período' },
  { value: 'flexivel', label: 'Flexível' },
  { value: 'escala', label: 'Escala' }
];
```

## 📋 RESUMO DA SITUAÇÃO

### ✅ **Funcionando:**
- Autenticação e login
- Listagem básica de dados
- Estrutura geral do frontend

### ❌ **Precisa Corrigir:**
- Criação de vagas (campos faltando)
- Endpoints inconsistentes 
- Choices de formulários
- Estrutura de dados de alguns formulários

### 🚨 **Prioridade Alta:**
1. Corrigir CriarVaga.js para incluir campos obrigatórios
2. Padronizar endpoints de listagem
3. Ajustar choices para lowercase
4. Verificar todos os formulários de criação/edição
