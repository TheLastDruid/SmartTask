package com.todoapp.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;
    
    @Autowired
    private TestMailService testMailService;

    @Value("${spring.mail.from:noreply@smarttask.com}")
    private String fromEmail;

    @Value("${app.frontend.url:http://localhost:3000}")
    private String frontendUrl;
    
    @Value("${app.email.use-testmail:true}")
    private boolean useTestMail;    public void sendVerificationEmail(String toEmail, String firstName, String verificationToken) {
        try {
            // Use testmail.app if configured, otherwise use traditional SMTP
            if (useTestMail && testMailService.isConfigured()) {
                testMailService.sendVerificationEmail(toEmail, firstName, verificationToken);
                return;
            }
            
            // Fallback to traditional SMTP
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject("SmartTask - Verify Your Email Address");
            
            String verificationUrl = frontendUrl + "/verify-email?token=" + verificationToken;
            
            String messageBody = String.format(
                "Hi %s,\n\n" +
                "Thank you for registering with SmartTask!\n\n" +
                "Please click the link below to verify your email address:\n" +
                "%s\n\n" +
                "This link will expire in 24 hours.\n\n" +
                "If you didn't create an account with SmartTask, please ignore this email.\n\n" +
                "Best regards,\n" +
                "The SmartTask Team",
                firstName, verificationUrl
            );
            
            message.setText(messageBody);
            
            mailSender.send(message);
        } catch (Exception e) {
            throw new RuntimeException("Failed to send verification email: " + e.getMessage());
        }
    }    public void sendPasswordResetEmail(String toEmail, String firstName, String resetToken) {
        try {
            // Use testmail.app if configured, otherwise use traditional SMTP
            if (useTestMail && testMailService.isConfigured()) {
                testMailService.sendPasswordResetEmail(toEmail, firstName, resetToken);
                return;
            }
            
            // Fallback to traditional SMTP
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject("SmartTask - Password Reset Request");
            
            String resetUrl = frontendUrl + "/reset-password?token=" + resetToken;
            
            String messageBody = String.format(
                "Hi %s,\n\n" +
                "We received a request to reset your password for your SmartTask account.\n\n" +
                "Please click the link below to reset your password:\n" +
                "%s\n\n" +
                "This link will expire in 1 hour.\n\n" +
                "If you didn't request a password reset, please ignore this email.\n\n" +
                "Best regards,\n" +
                "The SmartTask Team",
                firstName, resetUrl
            );
            
            message.setText(messageBody);
            
            mailSender.send(message);
        } catch (Exception e) {
            throw new RuntimeException("Failed to send password reset email: " + e.getMessage());
        }
    }
}
