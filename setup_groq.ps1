# setup_groq.ps1 - PowerShell script to configure Groq API for SmartTask

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "SmartTask - Groq API Setup" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Check if GROQ_API_KEY is provided as parameter
param(
    [string]$ApiKey
)

if ($ApiKey) {
    $GROQ_API_KEY = $ApiKey
    Write-Host "Using provided Groq API key..." -ForegroundColor Green
} else {
    Write-Host "Please enter your Groq API key:" -ForegroundColor Yellow
    Write-Host "(You can get one free from https://console.groq.com/keys)" -ForegroundColor Gray
    $GROQ_API_KEY = Read-Host "Groq API Key"
}

if ([string]::IsNullOrWhiteSpace($GROQ_API_KEY)) {
    Write-Host "❌ Error: Groq API key is required!" -ForegroundColor Red
    Write-Host "Get your free API key from: https://console.groq.com/keys" -ForegroundColor Yellow
    exit 1
}

# Update .env file
Write-Host "📝 Updating .env file..." -ForegroundColor Blue
$envFile = ".env"
if (Test-Path $envFile) {
    $content = Get-Content $envFile
    $updated = $false
    
    for ($i = 0; $i -lt $content.Length; $i++) {
        if ($content[$i] -match "^GROQ_API_KEY=") {
            $content[$i] = "GROQ_API_KEY=$GROQ_API_KEY"
            $updated = $true
            break
        }
    }
    
    if (-not $updated) {
        $content += "GROQ_API_KEY=$GROQ_API_KEY"
    }
    
    $content | Set-Content $envFile
    Write-Host "✅ .env file updated successfully!" -ForegroundColor Green
} else {
    Write-Host "❌ Error: .env file not found!" -ForegroundColor Red
    exit 1
}

# Update application.properties for development
Write-Host "📝 Updating application.properties..." -ForegroundColor Blue
$propsFile = "backend\src\main\resources\application.properties"
if (Test-Path $propsFile) {
    $content = Get-Content $propsFile
    $updated = $false
    
    for ($i = 0; $i -lt $content.Length; $i++) {
        if ($content[$i] -match "^groq\.api\.key=") {
            $content[$i] = "groq.api.key=$GROQ_API_KEY"
            $updated = $true
            break
        }
    }
    
    if (-not $updated) {
        $content += "groq.api.key=$GROQ_API_KEY"
    }
    
    $content | Set-Content $propsFile
    Write-Host "✅ application.properties updated successfully!" -ForegroundColor Green
} else {
    Write-Host "❌ Warning: application.properties not found at $propsFile" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🎉 Groq API setup completed!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Restart your backend server" -ForegroundColor White
Write-Host "2. Test the chat functionality in your application" -ForegroundColor White
Write-Host ""
Write-Host "Available Groq models:" -ForegroundColor Cyan
Write-Host "- llama-3.1-8b-instant (default)" -ForegroundColor White
Write-Host "- llama-3.1-70b-versatile" -ForegroundColor White
Write-Host "- mixtral-8x7b-32768" -ForegroundColor White
Write-Host ""
Write-Host "For more models, visit: https://console.groq.com/docs/models" -ForegroundColor Gray
