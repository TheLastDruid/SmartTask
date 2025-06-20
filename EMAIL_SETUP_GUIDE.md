# SmartTask Email Verification Setup Guide

This guide explains how to set up email verification for the SmartTask application.

## Features Added

✅ **User Registration with Email Verification**
- Users must verify their email before they can log in
- Verification emails are sent automatically upon registration
- Email verification tokens expire after 24 hours

✅ **Login Protection**
- Users with unverified emails cannot log in
- Clear error messages guide users to verify their email

✅ **Email Verification Pages**
- Dedicated page for email verification (`/verify-email`)
- Page for users who need to verify their email (`/email-verification-required`)
- Ability to resend verification emails

✅ **Backend Email Service**
- Spring Boot Mail integration
- Configurable SMTP settings
- Email templates for verification

## Quick Setup

### 1. Run the Email Setup Script

```powershell
.\setup_email.ps1
```

This script will:
- Guide you through Gmail setup
- Set the required environment variables
- Configure your email settings

### 2. Gmail Configuration

To use Gmail for sending emails:

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate an App Password**:
   - Go to [Google Account Settings](https://myaccount.google.com/)
   - Navigate to Security → 2-Step Verification → App passwords
   - Generate a new app password for "Mail"
   - Use this app password (not your regular Gmail password)

### 3. Manual Environment Setup

If you prefer to set up manually, add these environment variables:

```bash
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_FROM=noreply@smarttask.com
FRONTEND_URL=http://localhost:3000
```

### 4. Alternative Email Providers

For other email providers, update `application.properties`:

```properties
# For Outlook/Hotmail
spring.mail.host=smtp-mail.outlook.com
spring.mail.port=587

# For Yahoo
spring.mail.host=smtp.mail.yahoo.com
spring.mail.port=587

# For custom SMTP
spring.mail.host=your-smtp-server.com
spring.mail.port=587
```

## Application Configuration

The following properties are configurable in `application.properties`:

```properties
# Email Configuration
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=${MAIL_USERNAME}
spring.mail.password=${MAIL_PASSWORD}
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true
spring.mail.from=${MAIL_FROM:noreply@smarttask.com}

# Frontend URL for email links
app.frontend.url=${FRONTEND_URL:http://localhost:3000}
```

## User Flow

### Registration Flow
1. User fills out registration form
2. Account is created but not activated
3. Verification email is sent
4. User clicks verification link in email
5. Email is verified and user can log in

### Login Flow
1. User attempts to log in
2. System checks if email is verified
3. If not verified, login is blocked with helpful message
4. User is redirected to resend verification email

## API Endpoints

### Authentication Endpoints

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user (requires verified email)
- `GET /api/auth/verify` - Verify JWT token

### Email Verification Endpoints

- `GET /api/auth/verify-email?token=xxx` - Verify email with token
- `POST /api/auth/resend-verification` - Resend verification email

## Frontend Routes

- `/register` - User registration
- `/login` - User login
- `/verify-email?token=xxx` - Email verification page
- `/email-verification-required` - Prompt to verify email
- `/dashboard` - Protected dashboard (requires verified email)

## Database Changes

The `User` model now includes:

```java
private boolean emailVerified = false;
private String emailVerificationToken;
private LocalDateTime emailVerificationTokenExpiry;
```

## Testing

1. Start the backend server
2. Start the frontend server
3. Register a new account
4. Check your email for the verification link
5. Click the link to verify your account
6. Try logging in with the verified account

## Troubleshooting

### Email Not Sending
- Check your email credentials
- Verify 2FA and app password for Gmail
- Check spam folder
- Review server logs for email errors

### Verification Link Not Working
- Check if the token has expired (24 hours)
- Verify the frontend URL is correct
- Try resending the verification email

### Login Issues
- Ensure email is verified
- Check for error messages in the UI
- Verify JWT token configuration

## Security Notes

- Email verification tokens expire after 24 hours
- Tokens are securely generated using UUID
- Environment variables keep sensitive data secure
- HTTPS should be used in production

## Production Deployment

For production:
1. Use environment variables for all sensitive data
2. Set up proper SMTP server (SendGrid, Mailgun, etc.)
3. Configure proper "from" domain
4. Enable HTTPS for all email links
5. Set up proper email templates

```bash
# Production environment variables
MAIL_USERNAME=your-production-email@domain.com
MAIL_PASSWORD=your-secure-password
MAIL_FROM=noreply@yourdomain.com
FRONTEND_URL=https://yourdomain.com
```
