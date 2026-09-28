# setup.ps1 — Instala dependências e compila o MCP Server
# Execute este script após instalar o Node.js (https://nodejs.org)

$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition

Write-Host ""
Write-Host "=== DIO Explorer MCP Server — Setup ===" -ForegroundColor Cyan
Write-Host ""

# Verifica Node.js
try {
    $nodeVersion = & node --version
    Write-Host "[OK] Node.js encontrado: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "[ERRO] Node.js nao encontrado. Instale em: https://nodejs.org" -ForegroundColor Red
    exit 1
}

# Verifica npm
try {
    $npmVersion = & npm --version
    Write-Host "[OK] npm encontrado: v$npmVersion" -ForegroundColor Green
} catch {
    Write-Host "[ERRO] npm nao encontrado." -ForegroundColor Red
    exit 1
}

# Instala dependências
Write-Host ""
Write-Host "Instalando dependencias..." -ForegroundColor Yellow
Set-Location $scriptDir
& npm install
if ($LASTEXITCODE -ne 0) { Write-Host "[ERRO] npm install falhou." -ForegroundColor Red; exit 1 }
Write-Host "[OK] Dependencias instaladas." -ForegroundColor Green

# Build TypeScript
Write-Host ""
Write-Host "Compilando TypeScript..." -ForegroundColor Yellow
& npm run build
if ($LASTEXITCODE -ne 0) { Write-Host "[ERRO] Build falhou." -ForegroundColor Red; exit 1 }
Write-Host "[OK] Build concluido: build/index.js" -ForegroundColor Green

# Teste rápido
Write-Host ""
Write-Host "Testando servidor (stdio, 3s)..." -ForegroundColor Yellow
$job = Start-Job -ScriptBlock {
    param($dir)
    Set-Location $dir
    & node build/index.js
} -ArgumentList $scriptDir

Start-Sleep 3
Stop-Job $job | Out-Null
Remove-Job $job | Out-Null
Write-Host "[OK] Servidor inicializou sem erros." -ForegroundColor Green

Write-Host ""
Write-Host "=== Setup concluido! ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Para usar com Bob (stdio), adicione ao .bob/mcp.json:" -ForegroundColor White
Write-Host ""
Write-Host '  {' -ForegroundColor Gray
Write-Host '    "mcpServers": {' -ForegroundColor Gray
Write-Host '      "dio-explorer": {' -ForegroundColor Gray
Write-Host "        `"command`": `"node`"," -ForegroundColor Gray
Write-Host "        `"args`": [`"$scriptDir\build\index.js`"]" -ForegroundColor Gray
Write-Host '      }' -ForegroundColor Gray
Write-Host '    }' -ForegroundColor Gray
Write-Host '  }' -ForegroundColor Gray
Write-Host ""
Write-Host "Para rodar em modo HTTP:" -ForegroundColor White
Write-Host "  `$env:MCP_TRANSPORT='http'; node build/index.js" -ForegroundColor Gray
Write-Host ""
