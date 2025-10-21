# E2E Authenticated API Tests
# MercaFlow - Testing with Real User Session
# Run: .\test_e2e_authenticated.ps1

param(
    [Parameter(Mandatory=$true)]
    [string]$Email,
    
    [Parameter(Mandatory=$true)]
    [string]$Password
)

$BaseUrl = "https://mercaflow.vercel.app"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "MercaFlow Authenticated E2E Tests" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# ====================
# Step 1: Login and Get Session
# ====================
Write-Host "Step 1: Authenticating..." -ForegroundColor Yellow
Write-Host "  Email: $Email" -ForegroundColor Gray
Write-Host ""

try {
    # Create a session to persist cookies
    $session = New-Object Microsoft.PowerShell.Commands.WebRequestSession
    
    # Login request
    $loginBody = @{
        email = $Email
        password = $Password
    } | ConvertTo-Json
    
    $loginResponse = Invoke-WebRequest `
        -Uri "$BaseUrl/auth/login" `
        -Method POST `
        -Body $loginBody `
        -ContentType "application/json" `
        -WebSession $session `
        -MaximumRedirection 0 `
        -ErrorAction SilentlyContinue
    
    # Check if login was successful (redirect or 200)
    if ($loginResponse.StatusCode -eq 302 -or $loginResponse.StatusCode -eq 200) {
        Write-Host "  ✓ Login successful!" -ForegroundColor Green
        
        # Display cookies for debugging
        Write-Host "  Session Cookies:" -ForegroundColor Gray
        foreach ($cookie in $session.Cookies.GetCookies($BaseUrl)) {
            if ($cookie.Name -like "*supabase*" -or $cookie.Name -like "*auth*") {
                Write-Host "    - $($cookie.Name): ${cookie.Value.Substring(0, [Math]::Min(20, $cookie.Value.Length))}..." -ForegroundColor DarkGray
            }
        }
        Write-Host ""
    } else {
        Write-Host "  ✗ Login failed (Status: $($loginResponse.StatusCode))" -ForegroundColor Red
        exit 1
    }
    
} catch {
    Write-Host "  ✗ Login error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "Possible reasons:" -ForegroundColor Yellow
    Write-Host "  1. Invalid credentials" -ForegroundColor Gray
    Write-Host "  2. User not confirmed (check email)" -ForegroundColor Gray
    Write-Host "  3. Login endpoint changed" -ForegroundColor Gray
    exit 1
}

# ====================
# Step 2: Test Protected APIs
# ====================
Write-Host "Step 2: Testing Protected APIs..." -ForegroundColor Yellow
Write-Host ""

$apis = @(
    @{ 
        Path = "/api/settings"
        Method = "GET"
        Name = "User Settings API"
        ExpectedStatus = 200
    },
    @{ 
        Path = "/api/analytics/elasticity?days=30"
        Method = "GET"
        Name = "Price Elasticity API"
        ExpectedStatus = 200
    },
    @{ 
        Path = "/api/analytics/forecast?historical_days=30&forecast_days=7"
        Method = "GET"
        Name = "Forecast API"
        ExpectedStatus = 200
    },
    @{ 
        Path = "/api/analytics/competitors?limit=5"
        Method = "GET"
        Name = "Competitors API"
        ExpectedStatus = 200
    },
    @{ 
        Path = "/api/dashboard/kpis"
        Method = "GET"
        Name = "Dashboard KPIs API"
        ExpectedStatus = 200
    }
)

$passed = 0
$failed = 0
$results = @()

foreach ($api in $apis) {
    try {
        $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
        
        $response = Invoke-WebRequest `
            -Uri "$BaseUrl$($api.Path)" `
            -Method $api.Method `
            -WebSession $session `
            -TimeoutSec 30
        
        $stopwatch.Stop()
        
        if ($response.StatusCode -eq $api.ExpectedStatus) {
            Write-Host "  ✓ $($api.Name): " -ForegroundColor Green -NoNewline
            Write-Host "$($stopwatch.ElapsedMilliseconds)ms" -ForegroundColor Gray
            
            # Try to parse JSON response
            try {
                $data = $response.Content | ConvertFrom-Json
                
                # Show data summary
                if ($data.data) {
                    Write-Host "    Data received: " -ForegroundColor DarkGray -NoNewline
                    if ($data.data -is [Array]) {
                        Write-Host "$($data.data.Count) items" -ForegroundColor DarkCyan
                    } else {
                        Write-Host "$(($data.data | Get-Member -MemberType NoteProperty).Count) fields" -ForegroundColor DarkCyan
                    }
                } elseif ($data.success) {
                    Write-Host "    Success: $($data.success)" -ForegroundColor DarkGray
                }
            } catch {
                Write-Host "    Raw response received" -ForegroundColor DarkGray
            }
            
            $passed++
            $results += @{
                API = $api.Name
                Status = "PASS"
                Time = $stopwatch.ElapsedMilliseconds
            }
        } else {
            Write-Host "  ⚠ $($api.Name): Unexpected status $($response.StatusCode)" -ForegroundColor Yellow
            $failed++
            $results += @{
                API = $api.Name
                Status = "UNEXPECTED_STATUS"
                Time = $stopwatch.ElapsedMilliseconds
            }
        }
        
    } catch {
        $statusCode = if ($_.Exception.Response) { 
            $_.Exception.Response.StatusCode.Value__ 
        } else { 
            "Error" 
        }
        
        Write-Host "  ✗ $($api.Name): Failed (Status: $statusCode)" -ForegroundColor Red
        
        # Try to get error message
        if ($_.Exception.Response) {
            try {
                $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
                $errorBody = $reader.ReadToEnd()
                $errorData = $errorBody | ConvertFrom-Json
                Write-Host "    Error: $($errorData.error)" -ForegroundColor DarkRed
            } catch {
                Write-Host "    Could not parse error response" -ForegroundColor DarkGray
            }
        }
        
        $failed++
        $results += @{
            API = $api.Name
            Status = "FAIL"
            Time = 0
        }
    }
}

Write-Host ""

# ====================
# Step 3: Test Settings Update (PUT)
# ====================
Write-Host "Step 3: Testing Settings Update..." -ForegroundColor Yellow
Write-Host ""

try {
    $updateBody = @{
        notifications_enabled = $true
        auto_reprice = $false
        min_margin = 15.5
        max_price_change = 10.0
    } | ConvertTo-Json
    
    $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
    
    $updateResponse = Invoke-WebRequest `
        -Uri "$BaseUrl/api/settings" `
        -Method PUT `
        -Body $updateBody `
        -ContentType "application/json" `
        -WebSession $session `
        -TimeoutSec 30
    
    $stopwatch.Stop()
    
    if ($updateResponse.StatusCode -eq 200) {
        Write-Host "  ✓ Settings Update: " -ForegroundColor Green -NoNewline
        Write-Host "$($stopwatch.ElapsedMilliseconds)ms" -ForegroundColor Gray
        
        $updateData = $updateResponse.Content | ConvertFrom-Json
        Write-Host "    Updated: $($updateData.success)" -ForegroundColor DarkGray
        
        $passed++
    } else {
        Write-Host "  ⚠ Settings Update: Unexpected status $($updateResponse.StatusCode)" -ForegroundColor Yellow
        $failed++
    }
} catch {
    Write-Host "  ✗ Settings Update: Failed" -ForegroundColor Red
    $failed++
}

Write-Host ""

# ====================
# Step 4: Test Dashboard Access
# ====================
Write-Host "Step 4: Testing Dashboard Pages..." -ForegroundColor Yellow
Write-Host ""

$dashboardPages = @(
    "/dashboard",
    "/dashboard/configuracoes",
    "/produtos"
)

foreach ($page in $dashboardPages) {
    try {
        $response = Invoke-WebRequest `
            -Uri "$BaseUrl$page" `
            -Method GET `
            -WebSession $session `
            -TimeoutSec 30
        
        if ($response.StatusCode -eq 200) {
            Write-Host "  ✓ ${page}: Accessible" -ForegroundColor Green
            $passed++
        }
    } catch {
        Write-Host "  ✗ ${page}: Not accessible" -ForegroundColor Red
        $failed++
    }
}

Write-Host ""

# ====================
# Summary
# ====================
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Test Summary" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

$total = $passed + $failed
$successRate = if ($total -gt 0) { [math]::Round(($passed / $total) * 100, 1) } else { 0 }

Write-Host "Total Tests: $total" -ForegroundColor Gray
Write-Host "Passed: $passed" -ForegroundColor Green
Write-Host "Failed: $failed" -ForegroundColor $(if ($failed -gt 0) { "Red" } else { "Gray" })
Write-Host "Success Rate: ${successRate}%" -ForegroundColor $(
    if ($successRate -eq 100) { "Green" }
    elseif ($successRate -ge 80) { "Yellow" }
    else { "Red" }
)

Write-Host ""
Write-Host "Performance Breakdown:" -ForegroundColor Cyan
foreach ($result in $results) {
    if ($result.Status -eq "PASS") {
        Write-Host "  $($result.API): " -NoNewline
        Write-Host "$($result.Time)ms" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
if ($failed -eq 0) {
    Write-Host "All Authenticated Tests Passed!" -ForegroundColor Green
} else {
    Write-Host "Some Tests Failed - Review Above" -ForegroundColor Yellow
}
Write-Host "==========================================" -ForegroundColor Cyan
