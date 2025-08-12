# Script para setup inicial do projeto
Write-Host "===== Setup do Sistema de Emprego Rápido =====" -ForegroundColor Green

# Verificar se Docker está instalado
if (!(Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Host "ERRO: Docker não está instalado!" -ForegroundColor Red
    Write-Host "Por favor, instale o Docker Desktop primeiro." -ForegroundColor Yellow
    exit 1
}

# Verificar se Docker Compose está disponível
if (!(Get-Command docker-compose -ErrorAction SilentlyContinue)) {
    Write-Host "ERRO: Docker Compose não está disponível!" -ForegroundColor Red
    exit 1
}

Write-Host "✓ Docker encontrado" -ForegroundColor Green

# Navegar para o diretório do projeto
$projectPath = "c:\Users\user\Documents\SistemaEmpregoRapido"
Set-Location $projectPath

Write-Host "Iniciando build dos containers..." -ForegroundColor Yellow
docker-compose build

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Build concluído com sucesso" -ForegroundColor Green
    
    Write-Host "Iniciando os serviços..." -ForegroundColor Yellow
    docker-compose up -d
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Serviços iniciados com sucesso!" -ForegroundColor Green
        Write-Host ""
        Write-Host "===== ACESSE O SISTEMA =====" -ForegroundColor Cyan
        Write-Host "Frontend: http://localhost:3000" -ForegroundColor White
        Write-Host "Backend API: http://localhost:8000" -ForegroundColor White
        Write-Host "Admin Django: http://localhost:8000/admin" -ForegroundColor White
        Write-Host ""
        Write-Host "Para parar os serviços: docker-compose down" -ForegroundColor Yellow
        Write-Host "Para ver logs: docker-compose logs -f" -ForegroundColor Yellow
    } else {
        Write-Host "✗ Erro ao iniciar os serviços" -ForegroundColor Red
    }
} else {
    Write-Host "✗ Erro no build dos containers" -ForegroundColor Red
}
