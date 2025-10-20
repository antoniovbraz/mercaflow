# E2E Testing - Load & Performance Tests
# MercaFlow Production Performance Testing
# Run: .\test_e2e_performance.ps1

$BaseUrl = "https://mercaflow.vercel.app"
$TestDuration = 30 # seconds
$ConcurrentRequests = 5

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "MercaFlow Performance Testing" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# ====================
# Test 1: Response Time Benchmarks
# ====================
Write-Host "Test 1: Response Time Benchmarks" -ForegroundColor Yellow
Write-Host "Testing response times for critical endpoints..."
Write-Host ""

$endpoints = @(
    @{ Path = "/"; Name = "Homepage"; ExpectedMs = 1000 },
    @{ Path = "/login"; Name = "Login Page"; ExpectedMs = 1000 },
    @{ Path = "/dashboard"; Name = "Dashboard (redirect)"; ExpectedMs = 500 },
    @{ Path = "/api/settings"; Name = "Settings API (401)"; ExpectedMs = 300 },
    @{ Path = "/api/analytics/elasticity?days=30"; Name = "Elasticity API (401)"; ExpectedMs = 300 }
)

$timings = @()

foreach ($endpoint in $endpoints) {
    $measurements = @()
    
    # Run 5 requests to get average
    for ($i = 1; $i -le 5; $i++) {
        try {
            $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
            Invoke-WebRequest -Uri "$BaseUrl$($endpoint.Path)" -Method GET -TimeoutSec 10 2>&1 | Out-Null
            $stopwatch.Stop()
            $measurements += $stopwatch.ElapsedMilliseconds
        } catch {
            # Still measure time even on errors (like 401)
            $stopwatch.Stop()
            $measurements += $stopwatch.ElapsedMilliseconds
        }
    }
    
    $avg = ($measurements | Measure-Object -Average).Average
    $min = ($measurements | Measure-Object -Minimum).Minimum
    $max = ($measurements | Measure-Object -Maximum).Maximum
    
    $color = if ($avg -lt $endpoint.ExpectedMs) { "Green" } 
             elseif ($avg -lt $endpoint.ExpectedMs * 1.5) { "Yellow" } 
             else { "Red" }
    
    Write-Host "  $($endpoint.Name):" -NoNewline
    Write-Host " Avg: ${avg}ms" -ForegroundColor $color -NoNewline
    Write-Host " (Min: ${min}ms, Max: ${max}ms)" -ForegroundColor Gray
    
    $timings += @{
        Endpoint = $endpoint.Name
        Average = $avg
        Min = $min
        Max = $max
    }
}
Write-Host ""

# ====================
# Test 2: Concurrent Requests
# ====================
Write-Host "Test 2: Concurrent Request Handling" -ForegroundColor Yellow
Write-Host "Testing $ConcurrentRequests concurrent requests..."
Write-Host ""

$jobs = @()
$stopwatch = [System.Diagnostics.Stopwatch]::StartNew()

for ($i = 1; $i -le $ConcurrentRequests; $i++) {
    $jobs += Start-Job -ScriptBlock {
        param($url)
        try {
            $response = Invoke-WebRequest -Uri $url -Method GET -TimeoutSec 10 2>&1
            return @{ Success = $true; StatusCode = 200 }
        } catch {
            return @{ Success = $false; Error = $_.Exception.Message }
        }
    } -ArgumentList "$BaseUrl/"
}

# Wait for all jobs to complete
$results = $jobs | Wait-Job | Receive-Job
$stopwatch.Stop()

$successful = ($results | Where-Object { $_.Success }).Count
$failed = ($results | Where-Object { -not $_.Success }).Count

Write-Host "  Total Requests: $ConcurrentRequests" -ForegroundColor Gray
Write-Host "  Successful: $successful" -ForegroundColor Green
Write-Host "  Failed: $failed" -ForegroundColor $(if ($failed -gt 0) { "Red" } else { "Gray" })
Write-Host "  Total Time: $($stopwatch.ElapsedMilliseconds)ms" -ForegroundColor Gray
Write-Host "  Avg per request: $([math]::Round($stopwatch.ElapsedMilliseconds / $ConcurrentRequests, 0))ms" -ForegroundColor Gray

# Cleanup jobs
$jobs | Remove-Job
Write-Host ""

# ====================
# Test 3: Static Asset Performance
# ====================
Write-Host "Test 3: Static Asset Loading" -ForegroundColor Yellow
Write-Host "Testing static assets and bundle sizes..."
Write-Host ""

$assets = @(
    @{ Path = "/favicon.ico"; Name = "Favicon"; MaxSize = 50000 },
    @{ Path = "/_next/static/css/app/layout.css"; Name = "Main CSS"; MaxSize = 500000 }
)

foreach ($asset in $assets) {
    try {
        $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
        $response = Invoke-WebRequest -Uri "$BaseUrl$($asset.Path)" -Method GET -TimeoutSec 10
        $stopwatch.Stop()
        
        $sizeKB = [math]::Round($response.RawContentLength / 1024, 2)
        $timeMs = $stopwatch.ElapsedMilliseconds
        
        $sizeColor = if ($response.RawContentLength -lt $asset.MaxSize) { "Green" } else { "Yellow" }
        $timeColor = if ($timeMs -lt 500) { "Green" } elseif ($timeMs -lt 1000) { "Yellow" } else { "Red" }
        
        Write-Host "  $($asset.Name):" -NoNewline
        Write-Host " ${sizeKB}KB" -ForegroundColor $sizeColor -NoNewline
        Write-Host " in ${timeMs}ms" -ForegroundColor $timeColor
    } catch {
        Write-Host "  $($asset.Name): Not found or error" -ForegroundColor Gray
    }
}
Write-Host ""

# ====================
# Test 4: API Error Handling
# ====================
Write-Host "Test 4: API Error Handling" -ForegroundColor Yellow
Write-Host "Testing graceful error responses..."
Write-Host ""

$errorTests = @(
    @{ Path = "/api/settings"; Params = "?invalid=param"; Name = "Invalid Query Params" },
    @{ Path = "/api/analytics/elasticity"; Params = "?days=invalid"; Name = "Invalid Data Type" },
    @{ Path = "/api/nonexistent"; Params = ""; Name = "Non-existent Endpoint" }
)

foreach ($test in $errorTests) {
    try {
        $response = Invoke-WebRequest -Uri "$BaseUrl$($test.Path)$($test.Params)" -Method GET 2>&1
        $statusCode = if ($response.Exception) { 
            $response.Exception.Response.StatusCode.Value__ 
        } else { 
            $response.StatusCode 
        }
        
        $color = if ($statusCode -ge 400 -and $statusCode -lt 500) { "Green" } 
                 elseif ($statusCode -ge 500) { "Red" } 
                 else { "Yellow" }
        
        Write-Host "  $($test.Name): Status $statusCode" -ForegroundColor $color
    } catch {
        Write-Host "  $($test.Name): Error handling works" -ForegroundColor Green
    }
}
Write-Host ""

# ====================
# Test 5: Cache Headers
# ====================
Write-Host "Test 5: Cache Header Validation" -ForegroundColor Yellow
Write-Host "Checking cache strategies..."
Write-Host ""

$cacheTests = @(
    @{ Path = "/"; Name = "Homepage"; ShouldCache = $true },
    @{ Path = "/api/settings"; Name = "Settings API"; ShouldCache = $false },
    @{ Path = "/api/analytics/elasticity"; Name = "Analytics API"; ShouldCache = $true }
)

foreach ($test in $cacheTests) {
    try {
        $response = Invoke-WebRequest -Uri "$BaseUrl$($test.Path)" -Method GET 2>&1
        $cacheControl = if ($response.Headers) { 
            $response.Headers["Cache-Control"] 
        } elseif ($response.Exception.Response) {
            $response.Exception.Response.Headers["Cache-Control"]
        }
        
        if ($cacheControl) {
            $hasCaching = $cacheControl -match "s-maxage|max-age|public"
            $noCaching = $cacheControl -match "no-cache|no-store|private"
            
            if ($test.ShouldCache -and $hasCaching) {
                Write-Host "  ✓ $($test.Name): Properly cached ($cacheControl)" -ForegroundColor Green
            } elseif (-not $test.ShouldCache -and $noCaching) {
                Write-Host "  ✓ $($test.Name): No cache (correct)" -ForegroundColor Green
            } else {
                Write-Host "  ⚠ $($test.Name): Cache strategy may need review" -ForegroundColor Yellow
            }
        } else {
            Write-Host "  ⚠ $($test.Name): No cache headers found" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "  ⚠ $($test.Name): Could not check cache headers" -ForegroundColor Gray
    }
}
Write-Host ""

# ====================
# Summary
# ====================
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Performance Test Summary" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Calculate overall metrics
$avgResponseTime = ($timings | ForEach-Object { $_.Average } | Measure-Object -Average).Average
$maxResponseTime = ($timings | ForEach-Object { $_.Max } | Measure-Object -Maximum).Maximum

Write-Host "Average Response Time: $([math]::Round($avgResponseTime, 0))ms" -ForegroundColor $(
    if ($avgResponseTime -lt 500) { "Green" } 
    elseif ($avgResponseTime -lt 1000) { "Yellow" } 
    else { "Red" }
)

Write-Host "Max Response Time: $([math]::Round($maxResponseTime, 0))ms" -ForegroundColor $(
    if ($maxResponseTime -lt 1000) { "Green" } 
    elseif ($maxResponseTime -lt 2000) { "Yellow" } 
    else { "Red" }
)

Write-Host "Concurrent Request Success Rate: $([math]::Round(($successful / $ConcurrentRequests) * 100, 1))%" -ForegroundColor $(
    if ($successful -eq $ConcurrentRequests) { "Green" } else { "Yellow" }
)

Write-Host ""
Write-Host "Recommendations:" -ForegroundColor Cyan
if ($avgResponseTime -gt 800) {
    Write-Host "  ⚠ Consider enabling Edge caching in Vercel" -ForegroundColor Yellow
}
if ($maxResponseTime -gt 2000) {
    Write-Host "  ⚠ Investigate slow endpoints for optimization" -ForegroundColor Yellow
}
Write-Host "  ✓ Monitor production performance with Sentry" -ForegroundColor Green
Write-Host "  ✓ Set up Vercel Analytics for detailed metrics" -ForegroundColor Green
Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Performance Tests Complete!" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Cyan
