# Gerenciamento de Candidatos

## Resumo das Funcionalidades

### Interface de Candidatos (Admin)
- **Rota:** `/gerenciar-candidatos`
- **Função:** Lista apenas usuários do tipo "trabalhador" (candidatos)
- **Filtragem:** `GET /api/usuarios/?tipo_usuario=trabalhador`
- **Recursos:**
  - Tabela com paginação
  - Busca por nome e email
  - Ações: Visualizar, Editar, Excluir
  - Botão "Adicionar Candidato"

### Criação de Candidatos (Admin)
- **Rota:** `/candidatos/criar`
- **Função:** Criar apenas candidatos/trabalhadores
- **API:** `POST /api/usuarios/criar/`
- **Validações:**
  - Força `tipo_usuario = 'trabalhador'`
  - Cria perfil de trabalhador automaticamente
  - Usuário criado já ativo e aprovado

### Backend - Views Específicas

#### `ListaUsuariosView`
- Suporte a filtro `?tipo_usuario=trabalhador`
- Retorna apenas candidatos quando filtrado

#### `CriarCandidatoView`
- Especializada para criar apenas candidatos
- Ignora `tipo_usuario` enviado pelo frontend
- Sempre cria como 'trabalhador'
- Cria `PerfilTrabalhador` automaticamente

### Regras de Negócio
1. ✅ **Admin** pode gerenciar candidatos (trabalhadores)
2. ✅ **Admin** pode criar candidatos via interface específica
3. ✅ **Empresa/Admin** não aparecem na lista de candidatos
4. ✅ Interface focada apenas em candidatos
5. ✅ Não é possível criar admin/empresa pela interface de candidatos

### URLs Funcionais
- `GET /api/usuarios/?tipo_usuario=trabalhador` - Lista candidatos
- `POST /api/usuarios/criar/` - Cria candidato (força tipo trabalhador)
- Frontend: `/gerenciar-candidatos` e `/candidatos/criar`
