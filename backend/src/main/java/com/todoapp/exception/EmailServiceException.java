package com.todoapp.exception;

/**
 * Custom exception for email service related errors
 */
public class EmailServiceException extends RuntimeException {
    
    public EmailServiceException(String message) {
        super(message);
    }
    
    public EmailServiceException(String message, Throwable cause) {
        super(message, cause);
    }
}
