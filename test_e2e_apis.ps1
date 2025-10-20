# E2E Testing Script - MercaFlow Analytics & Settings APIs (PowerShell)
# Tests full flow with real data
# Run: .\test_e2e_apis.ps1

$BaseUrl = "http://localhost:3000"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "MercaFlow E2E API Testing" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Test 1: Settings API
Write-Host "Test 1: Settings API" -ForegroundColor Yellow
Write-Host "GET /api/settings - Fetch or create default settings"
try {
    $response = Invoke-WebRequest -Uri "$BaseUrl/api/settings" -Method GET -ContentType "application/json"
    $response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 5
    Write-Host "✓ GET /api/settings successful" -ForegroundColor Green
} catch {
    Write-Host "✗ GET /api/settings failed: $_" -ForegroundColor Red
}
Write-Host ""

Write-Host "PUT /api/settings - Update settings"
try {
    $body = @{
        ml_sync_frequency = "15min"
        notification_roi_threshold = 2000
        dashboard_compact_mode = $true
    } | ConvertTo-Json

    $response = Invoke-WebRequest -Uri "$BaseUrl/api/settings" -Method PUT -Body $body -ContentType "application/json"
    $response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 5
    Write-Host "✓ PUT /api/settings successful" -ForegroundColor Green
} catch {
    Write-Host "✗ PUT /api/settings failed: $_" -ForegroundColor Red
}
Write-Host ""

# Test 2: Elasticity API
Write-Host "Test 2: Elasticity API" -ForegroundColor Yellow
Write-Host "GET /api/analytics/elasticity?days=30"
try {
    $response = Invoke-WebRequest -Uri "$BaseUrl/api/analytics/elasticity?days=30" -Method GET -ContentType "application/json"
    $data = $response.Content | ConvertFrom-Json
    Write-Host "Elasticity: $($data.elasticity)"
    Write-Host "Optimal Price: $($data.optimalPrice)"
    Write-Host "Data Points: $($data.dataPoints.Length)"
    Write-Host "✓ Elasticity API test successful" -ForegroundColor Green
} catch {
    Write-Host "✗ Elasticity API test failed: $_" -ForegroundColor Red
}
Write-Host ""

# Test 3: Forecast API
Write-Host "Test 3: Forecast API" -ForegroundColor Yellow
Write-Host "GET /api/analytics/forecast?historical_days=30&forecast_days=7"
try {
    $response = Invoke-WebRequest -Uri "$BaseUrl/api/analytics/forecast?historical_days=30&forecast_days=7" -Method GET -ContentType "application/json"
    $data = $response.Content | ConvertFrom-Json
    Write-Host "Trend: $($data.trend)"
    Write-Host "Forecast Points: $($data.forecast.Length)"
    Write-Host "Historical Points: $($data.historical.Length)"
    Write-Host "✓ Forecast API test successful" -ForegroundColor Green
} catch {
    Write-Host "✗ Forecast API test failed: $_" -ForegroundColor Red
}
Write-Host ""

# Test 4: Competitors API
Write-Host "Test 4: Competitors API" -ForegroundColor Yellow
Write-Host "GET /api/analytics/competitors?limit=5"
try {
    $response = Invoke-WebRequest -Uri "$BaseUrl/api/analytics/competitors?limit=5" -Method GET -ContentType "application/json"
    $data = $response.Content | ConvertFrom-Json
    Write-Host "Competitors Found: $($data.competitors.Length)"
    if ($data.competitors.Length -gt 0) {
        Write-Host "First Product: $($data.competitors[0].productTitle)"
        Write-Host "Market Position: $($data.competitors[0].insights.marketPosition)"
    }
    Write-Host "✓ Competitors API test successful" -ForegroundColor Green
} catch {
    Write-Host "✗ Competitors API test failed: $_" -ForegroundColor Red
}
Write-Host ""

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "All E2E tests complete!" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Cyan
