# ============================================
# GVC-DOCKER ERROR AUDITOR v1.0
# Vasculha erros 400, 404, 500 nos logs e código
# ============================================

param(
    [switch]$DeepScan,  # Modo profundo (analisa código fonte)
    [int]$LogLines = 100 # Linhas de log a analisar
)

$projectRoot = "D:\PROJETOS\gvc-docker"
$reportFile = "$projectRoot\error_report_$(Get-Date -Format 'yyyyMMdd_HHmmss').txt"

Write-Host "`n🔍 GVC-DOCKER ERROR AUDITOR" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor DarkGray

# ============================================
# FUNÇÕES AUXILIARES
# ============================================
function Write-Report($header, $content, $color = "White") {
    Add-Content $reportFile "`n=== $header ==="
    Add-Content $reportFile $content
    Write-Host "`n📋 $header" -ForegroundColor Yellow
    Write-Host $content -ForegroundColor $color
}

# ============================================
# 1. ANALISAR LOGS DO DOCKER
# ============================================
Write-Host "📊 Coletando logs do Docker..." -ForegroundColor Cyan

$apiLogs = docker compose -f "$projectRoot\docker-compose.yml" logs api --tail $LogLines 2>&1 | Out-String
$frontendLogs = docker compose -f "$projectRoot\docker-compose.yml" logs frontend --tail $LogLines 2>&1 | Out-String

# Filtrar erros
$errors400 = [regex]::Matches($apiLogs, '"url":"([^"]+)".*?"statusCode":400')
$errors404 = [regex]::Matches($apiLogs, '"url":"([^"]+)".*?"statusCode":404')
$errors500 = [regex]::Matches($apiLogs, '"url":"([^"]+)".*?"statusCode":500')
$prismaErrors = [regex]::Matches($apiLogs, '"message":"([^"]+)"')

# ============================================
# 2. RELATÓRIO DE ERROS NOS LOGS
# ============================================
$report = @"
========================================
GVC-DOCKER ERROR AUDITOR - $(Get-Date)
========================================

📊 ERROS 400 (Bad Request) - Últimas $LogLines linhas:
"@

if ($errors400.Count -gt 0) {
    $unique400 = $errors400 | Group-Object { $_.Groups[1].Value } | Sort-Object Count -Descending
    foreach ($err in $unique400) {
        $report += "`n  [$($err.Count)x] $($err.Name)"
    }
} else {
    $report += "`n  ✅ Nenhum erro 400 encontrado"
}

$report += "`n`n📊 ERROS 404 (Not Found) - Últimas $LogLines linhas:"
if ($errors404.Count -gt 0) {
    $unique404 = $errors404 | Group-Object { $_.Groups[1].Value } | Sort-Object Count -Descending
    foreach ($err in $unique404) {
        $report += "`n  [$($err.Count)x] $($err.Name)"
    }
} else {
    $report += "`n  ✅ Nenhum erro 404 encontrado"
}

$report += "`n`n📊 ERROS 500 (Internal Server) - Últimas $LogLines linhas:"
if ($errors500.Count -gt 0) {
    $unique500 = $errors500 | Group-Object { $_.Groups[1].Value } | Sort-Object Count -Descending
    foreach ($err in $unique500) {
        $report += "`n  [$($err.Count)x] $($err.Name)"
    }
} else {
    $report += "`n  ✅ Nenhum erro 500 encontrado"
}

# ============================================
# 3. ERROS DO PRISMA
# ============================================
$report += "`n`n📊 ERROS DO PRISMA:"
$prismaFiltered = $prismaErrors | Where-Object { $_.Groups[1].Value -match "Unknown argument|does not exist|Invalid" }
if ($prismaFiltered.Count -gt 0) {
    foreach ($err in $prismaFiltered) {
        $report += "`n  ⚠️ $($err.Groups[1].Value.Substring(0, [Math]::Min(150, $err.Groups[1].Value.Length)))"
    }
} else {
    $report += "`n  ✅ Nenhum erro do Prisma"
}

# ============================================
# 4. DEEP SCAN (OPCIONAL)
# ============================================
if ($DeepScan) {
    Write-Host "`n🔎 MODO PROFUNDO: Analisando código fonte..." -ForegroundColor Magenta
    
    $report += "`n`n========================================"
    $report += "`n🔎 ANÁLISE DE CÓDIGO FONTE"
    $report += "`n========================================"
    
    # Buscar rotas no backend
    $backendRoutes = Get-ChildItem "$projectRoot\backend\src\routes\" -Filter "*.ts" -Recurse
    $report += "`n`n📁 ROTAS DO BACKEND:"
    foreach ($route in $backendRoutes) {
        $content = Get-Content $route.FullName -Raw
        $endpoints = [regex]::Matches($content, "app\.(get|post|put|delete)\('([^']+)'")
        $report += "`n  📄 $($route.Name):"
        foreach ($ep in $endpoints) {
            $report += "`n    - $($ep.Groups[1].Value) $($ep.Groups[2].Value)"
        }
    }
    
    # Buscar chamadas API no frontend
    $frontendServices = Get-ChildItem "$projectRoot\frontend\src\services\" -Filter "*.ts" -Recurse
    $report += "`n`n📁 CHAMADAS API (FRONTEND):"
    foreach ($service in $frontendServices) {
        $content = Get-Content $service.FullName -Raw
        $apiCalls = [regex]::Matches($content, "api\.(get|post|put|delete)\(['`"]([^'`"]+)")
        if ($apiCalls.Count -gt 0) {
            $report += "`n  📄 $($service.Name):"
            foreach ($call in $apiCalls) {
                $report += "`n    - $($call.Groups[1].Value) $($call.Groups[2].Value)"
            }
        }
    }
    
    # Verificar endpoints sem rota correspondente
    $report += "`n`n⚠️ POSSÍVEIS ENDPOINTS ÓRFÃOS (frontend chama mas backend não tem):"
    $allBackendRoutes = @()
    foreach ($route in $backendRoutes) {
        $content = Get-Content $route.FullName -Raw
        $eps = [regex]::Matches($content, "app\.(?:get|post|put|delete)\('([^']+)'")
        foreach ($ep in $eps) {
            $allBackendRoutes += $ep.Groups[1].Value
        }
    }
    
    foreach ($service in $frontendServices) {
        $content = Get-Content $service.FullName -Raw
        $apiCalls = [regex]::Matches($content, "api\.(?:get|post|put|delete)\(['`"]([^'`"]+)")
        foreach ($call in $apiCalls) {
            $endpoint = $call.Groups[1].Value
            $found = $allBackendRoutes | Where-Object { $endpoint -match $_ -or $_ -match $endpoint }
            if (-not $found) {
                $report += "`n  ⚠️ $endpoint (em $($service.Name))"
            }
        }
    }
}

# ============================================
# 5. SALVAR RELATÓRIO
# ============================================
$report | Out-File $reportFile -Encoding UTF8

Write-Host "`n========================================" -ForegroundColor Green
Write-Host "✅ RELATÓRIO SALVO EM:" -ForegroundColor Green
Write-Host "   $reportFile" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Green

# Resumo rápido
Write-Host "`n📊 RESUMO:" -ForegroundColor Yellow
Write-Host "  Erros 400: $($errors400.Count)" -ForegroundColor $(if($errors400.Count -gt 0){'Red'}else{'Green'})
Write-Host "  Erros 404: $($errors404.Count)" -ForegroundColor $(if($errors404.Count -gt 0){'Red'}else{'Green'})
Write-Host "  Erros 500: $($errors500.Count)" -ForegroundColor $(if($errors500.Count -gt 0){'Red'}else{'Green'})

# Abrir relatório
Write-Host "`n📄 Abrindo relatório..." -ForegroundColor Cyan
notepad $reportFile