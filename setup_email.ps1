#!/usr/bin/env powershell

# Email Setup Script for SmartTask Development
# This script helps set up email configuration for local development

Write-Host "========================================" -ForegroundColor Blue
Write-Host "    SmartTask Email Setup Guide" -ForegroundColor Blue
Write-Host "========================================" -ForegroundColor Blue
Write-Host ""

Write-Host "This script will help you configure email settings for development." -ForegroundColor Green
Write-Host ""

Write-Host "For Gmail setup:" -ForegroundColor Yellow
Write-Host "1. Enable 2-Factor Authentication on your Gmail account"
Write-Host "2. Generate an App Password:"
Write-Host "   - Go to Google Account settings"
Write-Host "   - Security > 2-Step Verification > App passwords"
Write-Host "   - Generate a new app password for 'Mail'"
Write-Host "3. Use your Gmail address and the generated app password"
Write-Host ""

# Prompt for email configuration
$mailUsername = Read-Host "Enter your email address (e.g., your-email@gmail.com)"
$mailPassword = Read-Host "Enter your email password or app password" -AsSecureString
$plainPassword = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($mailPassword))
$mailFrom = Read-Host "Enter the 'from' email address (press Enter to use $mailUsername)"

if ([string]::IsNullOrWhiteSpace($mailFrom)) {
    $mailFrom = $mailUsername
}

$frontendUrl = Read-Host "Enter frontend URL (press Enter for http://localhost:3000)"
if ([string]::IsNullOrWhiteSpace($frontendUrl)) {
    $frontendUrl = "http://localhost:3000"
}

Write-Host ""
Write-Host "Setting environment variables..." -ForegroundColor Green

# Set environment variables
[Environment]::SetEnvironmentVariable("MAIL_USERNAME", $mailUsername, "User")
[Environment]::SetEnvironmentVariable("MAIL_PASSWORD", $plainPassword, "User")
[Environment]::SetEnvironmentVariable("MAIL_FROM", $mailFrom, "User")
[Environment]::SetEnvironmentVariable("FRONTEND_URL", $frontendUrl, "User")

Write-Host "Environment variables set successfully!" -ForegroundColor Green
Write-Host ""

Write-Host "Your email configuration:" -ForegroundColor Cyan
Write-Host "Username: $mailUsername"
Write-Host "From: $mailFrom"
Write-Host "Frontend URL: $frontendUrl"
Write-Host ""

Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Restart your IDE/terminal to load the new environment variables"
Write-Host "2. Start your backend server"
Write-Host "3. Test email verification by registering a new account"
Write-Host ""

Write-Host "Note: The email password is stored as an environment variable." -ForegroundColor Red
Write-Host "Make sure to keep it secure and don't commit it to version control." -ForegroundColor Red
Write-Host ""

Write-Host "Setup complete! Press any key to exit..." -ForegroundColor Green
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
