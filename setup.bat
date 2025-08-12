@echo off
echo ===== Setup do Sistema de Emprego Rapido =====

REM Verificar se Docker esta instalado
docker --version >nul 2>&1
if errorlevel 1 (
    echo ERRO: Docker nao esta instalado!
    echo Por favor, instale o Docker Desktop primeiro.
    pause
    exit /b 1
)

echo Docker encontrado

REM Navegar para o diretorio do projeto
cd /d "c:\Users\user\Documents\SistemaEmpregoRapido"

echo Iniciando build dos containers...
docker-compose build

if errorlevel 1 (
    echo Erro no build dos containers
    pause
    exit /b 1
)

echo Build concluido com sucesso!
echo Iniciando os servicos...
docker-compose up -d

if errorlevel 1 (
    echo Erro ao iniciar os servicos
    pause
    exit /b 1
)

echo.
echo ===== ACESSE O SISTEMA =====
echo Frontend: http://localhost:3000
echo Backend API: http://localhost:8000
echo Admin Django: http://localhost:8000/admin
echo.
echo Para parar os servicos: docker-compose down
echo Para ver logs: docker-compose logs -f
echo.
pause
