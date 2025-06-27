package com.todoapp.service;

import com.todoapp.exception.EmailServiceException;
import okhttp3.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.concurrent.TimeUnit;

@Service
public class TestMailService {
    
    private static final Logger logger = LoggerFactory.getLogger(TestMailService.class);
    
    private final OkHttpClient httpClient;
    private final JavaMailSender mailSender;
    
    @Value("${testmail.api.key:}")
    private String apiKey;
    
    @Value("${testmail.namespace:}")
    private String namespace;
    
    @Value("${testmail.base.url:https://api.testmail.app/api/json}")
    private String testmailBaseUrl;
    
    @Value("${testmail.inbox.domain:inbox.testmail.app}")
    private String inboxDomain;
    
    @Value("${app.frontend.url:http://localhost:3000}")
    private String frontendUrl;
    
    @Value("${spring.mail.from:noreply@smarttask.com}")
    private String fromEmail;
    
    private static final String EMAIL_VERIFICATION_SUBJECT = "SmartTask - Verify Your Email Address";
    private static final String PASSWORD_RESET_SUBJECT = "SmartTask - Password Reset Request";
    
    public TestMailService(JavaMailSender mailSender) {
        this.httpClient = new OkHttpClient.Builder()
                .connectTimeout(30, TimeUnit.SECONDS)
                .readTimeout(30, TimeUnit.SECONDS)
                .build();
        this.mailSender = mailSender;
    }
      /**
     * Send verification email using testmail.app
     */
    public void sendVerificationEmail(String toEmail, String firstName, String verificationToken) {
        try {
            String testmailAddress = generateTestmailAddress(toEmail);
            String verificationUrl = buildVerificationUrl(verificationToken);
            String messageBody = createVerificationEmailBody(firstName, verificationUrl);
            
            sendEmailToTestmail(testmailAddress, EMAIL_VERIFICATION_SUBJECT, messageBody);
            
            logger.info("Verification email sent to testmail.app: {}", testmailAddress);
            logger.debug("Verification URL: {}", verificationUrl);
            
        } catch (Exception e) {
            logger.error("Failed to send verification email via testmail.app", e);
            throw new EmailServiceException("Failed to send verification email via testmail.app", e);
        }
    }

    /**
     * Send password reset email using testmail.app
     */
    public void sendPasswordResetEmail(String toEmail, String firstName, String resetToken) {
        try {
            String testmailAddress = generateTestmailAddress(toEmail);
            String resetUrl = buildPasswordResetUrl(resetToken);
            String messageBody = createPasswordResetEmailBody(firstName, resetUrl);
            
            sendEmailToTestmail(testmailAddress, PASSWORD_RESET_SUBJECT, messageBody);
            
            logger.info("Password reset email sent to testmail.app: {}", testmailAddress);
            logger.debug("Reset URL: {}", resetUrl);
            
        } catch (Exception e) {
            logger.error("Failed to send password reset email via testmail.app", e);
            throw new EmailServiceException("Failed to send password reset email via testmail.app", e);
        }
    }
      /**
     * Generate a testmail.app email address from a regular email
     */
    private String generateTestmailAddress(String originalEmail) {
        validateTestmailConfiguration();
        
        // Extract username from email (before @)
        String username = originalEmail.split("@")[0];
        // Clean username to be testmail compatible (remove dots, special chars)
        String cleanUsername = username.replaceAll("[^a-zA-Z0-9]", "");
        
        return String.format("%s.%s@%s", namespace, cleanUsername, inboxDomain);
    }

    /**
     * Actually send the email via SMTP to testmail.app address
     */
    private void sendEmailToTestmail(String toEmail, String subject, String body) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(toEmail);
            message.setSubject(subject);
            message.setText(body);
            message.setFrom(fromEmail);
            
            mailSender.send(message);
            
            logger.info("Email sent successfully to testmail.app - To: {}, Subject: {}", toEmail, subject);
            
        } catch (Exception e) {
            logger.error("Failed to send email to testmail.app: {}", e.getMessage(), e);
            throw new EmailServiceException("Failed to send email to testmail.app", e);
        }
    }
    
    /**
     * Build verification URL
     */
    private String buildVerificationUrl(String token) {
        return frontendUrl + "/verify-email?token=" + token;
    }
    
    /**
     * Build password reset URL
     */
    private String buildPasswordResetUrl(String token) {
        return frontendUrl + "/reset-password?token=" + token;
    }
    
    /**
     * Validate testmail configuration
     */
    private void validateTestmailConfiguration() {
        if (namespace == null || namespace.isEmpty()) {
            throw new EmailServiceException("Testmail namespace not configured. Please set TESTMAIL_NAMESPACE environment variable.");
        }
    }
      /**
     * Retrieve emails from testmail.app (for testing purposes)
     */
    public String retrieveEmails(String tag) throws IOException {
        validateApiConfiguration();
        
        String url = String.format("%s?apikey=%s&namespace=%s&tag=%s", 
                                 testmailBaseUrl, apiKey, namespace, tag);
        
        Request request = new Request.Builder()
                .url(url)
                .get()
                .build();
        
        try (Response response = httpClient.newCall(request).execute()) {
            if (!response.isSuccessful()) {
                throw new IOException("Failed to retrieve emails: " + response);
            }
            
            return response.body().string();
        } catch (Exception e) {
            logger.error("Failed to retrieve emails from testmail.app", e);
            throw new EmailServiceException("Failed to retrieve emails from testmail.app", e);
        }
    }

    /**
     * Check if testmail.app is configured
     */
    public boolean isConfigured() {
        return apiKey != null && !apiKey.isEmpty() && 
               namespace != null && !namespace.isEmpty();
    }
    
    /**
     * Validate API configuration
     */
    private void validateApiConfiguration() {
        if (apiKey == null || apiKey.isEmpty()) {
            throw new EmailServiceException("Testmail API key not configured. Please set TESTMAIL_API_KEY environment variable.");
        }
        
        if (namespace == null || namespace.isEmpty()) {
            throw new EmailServiceException("Testmail namespace not configured. Please set TESTMAIL_NAMESPACE environment variable.");
        }
    }
      private String createVerificationEmailBody(String firstName, String verificationUrl) {
        return String.format("""
            Hi %s,
            
            Thank you for registering with SmartTask!
            
            Please click the link below to verify your email address:
            %s
            
            This link will expire in 24 hours.
            
            If you didn't create an account with SmartTask, please ignore this email.
            
            Best regards,
            The SmartTask Team""", firstName, verificationUrl);
    }

    private String createPasswordResetEmailBody(String firstName, String resetUrl) {
        return String.format("""
            Hi %s,
            
            We received a request to reset your password for your SmartTask account.
            
            Please click the link below to reset your password:
            %s
            
            This link will expire in 1 hour.
            
            If you didn't request a password reset, please ignore this email.
            
            Best regards,
            The SmartTask Team""", firstName, resetUrl);
    }
}
