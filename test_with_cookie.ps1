# Test Authenticated APIs with Manual Cookie
# Quick test script for debugging with browser cookies
# 
# HOW TO USE:
# 1. Login at https://mercaflow.vercel.app/login in your browser
# 2. Open DevTools (F12) > Application > Cookies
# 3. Copy the value of 'sb-access-token' cookie
# 4. Paste it in the $accessToken variable below
# 5. Run this script: .\test_with_cookie.ps1

param(
    [Parameter(Mandatory=$false)]
    [string]$AccessToken = "",
    
    [Parameter(Mandatory=$false)]
    [string]$RefreshToken = ""
)

$BaseUrl = "https://mercaflow.vercel.app"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Quick Authenticated API Test" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Check if tokens provided
if (-not $AccessToken) {
    Write-Host "❌ No access token provided!" -ForegroundColor Red
    Write-Host ""
    Write-Host "How to get your access token:" -ForegroundColor Yellow
    Write-Host "  1. Login at: $BaseUrl/login" -ForegroundColor Gray
    Write-Host "  2. Press F12 to open DevTools" -ForegroundColor Gray
    Write-Host "  3. Go to: Application > Cookies > $BaseUrl" -ForegroundColor Gray
    Write-Host "  4. Copy the value of 'sb-access-token'" -ForegroundColor Gray
    Write-Host "  5. Run:" -ForegroundColor Gray
    Write-Host "     .\test_with_cookie.ps1 -AccessToken 'YOUR_TOKEN_HERE'" -ForegroundColor Cyan
    Write-Host ""
    exit 1
}

Write-Host "Using Access Token: $($AccessToken.Substring(0, 20))..." -ForegroundColor Gray
Write-Host ""

# Create session with cookies
$session = New-Object Microsoft.PowerShell.Commands.WebRequestSession
$domain = "mercaflow.vercel.app"

# Add access token cookie
$cookie1 = New-Object System.Net.Cookie
$cookie1.Name = "sb-access-token"
$cookie1.Value = $AccessToken
$cookie1.Domain = $domain
$session.Cookies.Add($cookie1)

# Add refresh token if provided
if ($RefreshToken) {
    $cookie2 = New-Object System.Net.Cookie
    $cookie2.Name = "sb-refresh-token"
    $cookie2.Value = $RefreshToken
    $cookie2.Domain = $domain
    $session.Cookies.Add($cookie2)
}

# Test APIs
$apis = @(
    "/api/settings",
    "/api/dashboard/kpis",
    "/api/analytics/elasticity?days=30"
)

$passed = 0
$failed = 0

Write-Host "Testing APIs..." -ForegroundColor Yellow
Write-Host ""

foreach ($api in $apis) {
    try {
        $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
        
        $response = Invoke-WebRequest `
            -Uri "$BaseUrl$api" `
            -Method GET `
            -WebSession $session `
            -TimeoutSec 30
        
        $stopwatch.Stop()
        
        if ($response.StatusCode -eq 200) {
            Write-Host "  ✓ $api" -ForegroundColor Green -NoNewline
            Write-Host " - $($stopwatch.ElapsedMilliseconds)ms" -ForegroundColor Gray
            
            # Try to show data summary
            try {
                $data = $response.Content | ConvertFrom-Json
                if ($data.data) {
                    if ($data.data -is [Array]) {
                        Write-Host "    → $($data.data.Count) items returned" -ForegroundColor DarkCyan
                    } else {
                        $fieldCount = ($data.data | Get-Member -MemberType NoteProperty).Count
                        Write-Host "    → $fieldCount fields returned" -ForegroundColor DarkCyan
                    }
                }
            } catch {
                # Ignore JSON parse errors
            }
            
            $passed++
        }
    } catch {
        $statusCode = if ($_.Exception.Response) { 
            $_.Exception.Response.StatusCode.Value__ 
        } else { 
            "Error" 
        }
        
        Write-Host "  ✗ $api" -ForegroundColor Red -NoNewline
        Write-Host " - Status: $statusCode" -ForegroundColor DarkRed
        
        if ($statusCode -eq 401) {
            Write-Host "    → Token expired or invalid" -ForegroundColor Yellow
            Write-Host "    → Get a new token from browser and try again" -ForegroundColor Yellow
        }
        
        $failed++
    }
}

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Results: $passed passed, $failed failed" -ForegroundColor $(
    if ($failed -eq 0) { "Green" } else { "Yellow" }
)
Write-Host "==========================================" -ForegroundColor Cyan

if ($failed -gt 0 -and $failed -eq $apis.Count) {
    Write-Host ""
    Write-Host "⚠️  All tests failed - Your token might be expired!" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Get a fresh token:" -ForegroundColor Cyan
    Write-Host "  1. Open: $BaseUrl/login" -ForegroundColor Gray
    Write-Host "  2. Login again" -ForegroundColor Gray
    Write-Host "  3. Copy new token from DevTools > Application > Cookies" -ForegroundColor Gray
    Write-Host "  4. Run this script again with the new token" -ForegroundColor Gray
    Write-Host ""
}
