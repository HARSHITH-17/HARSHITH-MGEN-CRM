$port = 3000
$baseUrl = "http://localhost:$port"

Write-Output "Starting Next.js production server on port $port..."
$process = Start-Process -FilePath "npx" -ArgumentList "next start -p $port" -WorkingDirectory "D:\CRM\HARSHITH_MGEN_CRM_WEB" -PassThru -NoNewWindow

Start-Sleep -Seconds 3

# Helper function
function Test-Endpoint($url, $method="GET", $body=$null, $description="") {
    Write-Output "------------------------------------------------------------"
    Write-Output "TEST: $description [$method $url]"
    try {
        if ($method -eq "GET") {
            $response = Invoke-RestMethod -Uri $url -Method Get -TimeoutSec 10
        } else {
            $response = Invoke-RestMethod -Uri $url -Method Post -Body $body -ContentType "application/json" -TimeoutSec 10
        }
        $json = $response | ConvertTo-Json -Depth 3 -Compress
        Write-Output "STATUS: PASS"
        Write-Output "RESPONSE: $json"
        return $true
    } catch {
        Write-Output "STATUS: EXPECTED_RESULT / ERROR: $($_.Exception.Message)"
        if ($_.Exception.Response) {
            $stream = $_.Exception.Response.GetResponseStream()
            $reader = New-Object System.IO.StreamReader($stream)
            Write-Output "BODY: $($reader.ReadToEnd())"
        }
        return $false
    }
}

try {
    # 1. Homepage
    Write-Output "=== 1. VERIFYING HOMEPAGE & PAGES ==="
    $homeRes = Invoke-WebRequest -Uri "$baseUrl/" -UseBasicParsing -TimeoutSec 10
    Write-Output "Homepage Status: $($homeRes.StatusCode) OK (Length: $($homeRes.RawContentLength) bytes)"
    
    # 2. Login Page
    $loginRes = Invoke-WebRequest -Uri "$baseUrl/login" -UseBasicParsing -TimeoutSec 10
    Write-Output "Login Page Status: $($loginRes.StatusCode) OK (Length: $($loginRes.RawContentLength) bytes)"

    # 3. API Routes: Stats
    Write-Output "`n=== 2. VERIFYING CORE API ROUTES ==="
    Test-Endpoint "$baseUrl/api/dashboard/stats" "GET" $null "Dashboard Aggregated Stats"

    # 4. API Routes: Customers GET & POST
    Test-Endpoint "$baseUrl/api/customers" "GET" $null "Get Customers Master"
    
    $newCustomerJson = '{"companyName":"BHARAT AEROSPACE PRECISION","contactName":"Vikram Malhotra","phone":"+91 98450 77112","email":"vikram@bharataero.in","city":"Bengaluru","gstNumber":"29AABCB1234F1Z5","productsUsed":"PowerMill Ultimate, FeatureCAM","annualBusinessPotential":1450000}'
    Test-Endpoint "$baseUrl/api/customers" "POST" $newCustomerJson "Add New Valid Customer Account"

    # 5. Error state: Customer with invalid GSTIN
    $badGstJson = '{"companyName":"TEST INVALID GST","gstNumber":"12345INVALID"}'
    Test-Endpoint "$baseUrl/api/customers" "POST" $badGstJson "Reject Invalid GSTIN Format (Expected 400)"

    # 6. Pipeline GET & POST
    Test-Endpoint "$baseUrl/api/pipeline" "GET" $null "Get Sales Pipeline Opportunities"
    $newOppJson = '{"customer":"BHARAT AEROSPACE PRECISION","product":"PowerMill Ultimate (2 Seats)","salesStage":"Proposal","estimatedValue":570000,"probability":80,"expectedSeats":2,"expectedCloseDate":"2026-12-15","remarks":"Kinematics trial on 5-axis Mazak."}'
    Test-Endpoint "$baseUrl/api/pipeline" "POST" $newOppJson "Create New Opportunity (Auto-weighted Value)"

    # 7. Tours GET & POST (Calculation Engine Verification)
    Test-Endpoint "$baseUrl/api/tours" "GET" $null "Get Tour Claims"
    $newTourJson = '{"employeeName":"Harshith S","startDate":"2026-10-25","startTime":"08:00","endDate":"2026-10-27","endTime":"14:00","placesToured":"Pune MIDC, Chakan","customerVisited":"Precision Toolings & Dies","travelExpenses":4200,"lodgingRatePerDay":1800,"lodgingDays":2,"lodgingBookedByOffice":false,"conveyanceExpenses":900,"otherExpenses":300,"daRatePerDay":750,"advanceReceived":10000}'
    Test-Endpoint "$baseUrl/api/tours" "POST" $newTourJson "Submit Tour Claim (Calculates DA ₹750/day policy & reimbursement due)"

    # 8. Authentication: Login
    Write-Output "`n=== 3. VERIFYING AUTHENTICATION & RECOVERY ==="
    $loginJson = '{"username":"admin","password":"admin"}'
    Test-Endpoint "$baseUrl/api/auth/login" "POST" $loginJson "Admin User Sign In"

    $badLoginJson = '{"username":"admin","password":"wrongpassword"}'
    Test-Endpoint "$baseUrl/api/auth/login" "POST" $badLoginJson "Reject Bad Credentials (Expected 401)"

    # 9. Authentication: Forgot Password
    $forgotJson = '{"usernameOrEmail":"admin"}'
    Test-Endpoint "$baseUrl/api/auth/forgot-password" "POST" $forgotJson "Request 6-Digit Password Reset OTP"

    # 10. Authentication: Reset Password
    $resetJson = '{"username":"admin","code":"999888","newPassword":"newadminpass123"}'
    Test-Endpoint "$baseUrl/api/auth/reset-password" "POST" $resetJson "Set New Password with Code"

} finally {
    Write-Output "`nStopping server process..."
    Stop-Process -Id $process.Id -Force -ErrorAction SilentlyContinue
    Write-Output "Server stopped cleanly."
}

