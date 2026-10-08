# MeuEmprego

Sistema simples de cadastro de vagas de emprego e currículos para a prefeitura.
Pensado para pessoas com pouca familiaridade com tecnologia: poucos campos, letra grande, celular primeiro.

- **Backend:** Python 3.13, Django 5.2, Django REST Framework, PostgreSQL
- **Frontend:** React 19, Vite, TypeScript, Tailwind CSS 4, componentes no estilo shadcn/ui, React Query
- **Login:** CPF (candidato e prefeitura) ou CNPJ (empresa) + senha, com código de confirmação pelo WhatsApp via Evolution API
- **Produção:** Docker Compose no servidor próprio, publicado pelo Cloudflare Tunnel

## Estrutura

```
backend/            API Django (só API, sem Django Admin)
  apps/contas/      usuário, login, código pelo WhatsApp
  apps/curriculos/  currículo e experiências
  apps/vagas/       vagas e "tenho interesse"
frontend/           app React único: candidato e empresa (celular) e área da prefeitura (computador)
docker-compose.yml  Postgres + backend (gunicorn) + frontend (nginx, repassa /api ao backend)
```

## Rodar em desenvolvimento

Backend (usa SQLite se `DATABASE_URL` não estiver definido):

```bash
cd backend
python -m venv .venv && . .venv/bin/activate
pip install -r requirements-dev.txt
DJANGO_DEBUG=true python manage.py migrate
DJANGO_DEBUG=true python manage.py runserver
```

Frontend (o Vite repassa `/api` para `localhost:8000`):

```bash
cd frontend
npm install
npm run dev
```

Sem `EVOLUTION_URL`, o código do WhatsApp aparece no log do backend.

## Testes e lint

```bash
cd backend && pytest && ruff check . && ruff format --check .
cd frontend && npm run lint && npm run build
```

O GitHub Actions roda tudo isso a cada push e pull request.

## Produção (servidor próprio + Cloudflare Tunnel)

1. Copie `.env.example` para `.env` e preencha (senha do Postgres, `DJANGO_SECRET_KEY`, domínio, Evolution API).
2. Suba: `docker compose up -d --build`. O frontend fica em `127.0.0.1:8080` (mude com `PORTA`).
3. No Cloudflare Tunnel, aponte o subdomínio (ex.: `emprego.rlcsolucoes.com.br`) para `http://localhost:8080`.
4. Crie a conta do primeiro aprovador pelo próprio site (como candidato) e dê a permissão a ele:

```bash
docker compose exec backend python manage.py tornar_aprovador <CPF>
```

Depois disso, a própria equipe inclui outras pessoas em **Área da prefeitura → Equipe** (`/prefeitura/equipe`).

## API (até agora)

| Método | Rota | O que faz |
| --- | --- | --- |
| GET | `/api/auth/csrf/` | Entrega o cookie CSRF |
| POST | `/api/auth/cadastro/` | Cria conta e envia código pelo WhatsApp |
| POST | `/api/auth/enviar-codigo/` | Reenvia o código |
| POST | `/api/auth/verificar-codigo/` | Confirma o telefone e entra |
| POST | `/api/auth/login/` | Entra com CPF/CNPJ + senha |
| POST | `/api/auth/logout/` | Sai |
| GET / DELETE | `/api/auth/eu/` | Dados do usuário logado / apagar a conta (LGPD) |
| GET | `/api/saude/` | Verificação de saúde |

Área da prefeitura (só quem tem a permissão `vagas.aprovar_vaga`):

| Método | Rota | O que faz |
| --- | --- | --- |
| GET | `/api/painel/numeros/` | Números do início: vagas, currículos, interesses, por área |
| GET | `/api/painel/vagas/?status=&busca=&empresa=` | Todas as vagas (fila de aprovação: mais antiga primeiro) |
| POST | `/api/painel/vagas/avaliar/` | Aprova ou recusa uma ou várias vagas (`ids`, `decisao`, `motivo`) |
| GET | `/api/painel/empresas/` | Empresas e quantas vagas cada uma tem |
| POST | `/api/painel/empresas/<id>/bloquear/` | Bloqueia ou desbloqueia a empresa (`bloqueada`) |
| GET / POST | `/api/painel/equipe/` | Lista aprovadores / inclui pelo CPF |
| DELETE | `/api/painel/equipe/<id>/` | Tira a permissão |
| GET | `/api/painel/exportar/<vagas\|curriculos\|empresas>/` | Planilha .xlsx |
