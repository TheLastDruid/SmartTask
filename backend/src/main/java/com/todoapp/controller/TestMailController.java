package com.todoapp.controller;

import com.todoapp.service.TestMailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/testmail")
public class TestMailController {
    
    @Autowired
    private TestMailService testMailService;
    
    /**
     * Check if testmail.app is configured
     */
    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getStatus() {
        Map<String, Object> status = new HashMap<>();
        status.put("configured", testMailService.isConfigured());
        status.put("message", testMailService.isConfigured() 
            ? "TestMail.app is configured and ready to use" 
            : "TestMail.app is not configured. Please set TESTMAIL_API_KEY and TESTMAIL_NAMESPACE environment variables.");
        
        return ResponseEntity.ok(status);
    }
    
    /**
     * Retrieve emails from testmail.app for a specific tag
     */
    @GetMapping("/emails/{tag}")
    public ResponseEntity<String> getEmails(@PathVariable String tag) {
        try {
            if (!testMailService.isConfigured()) {
                return ResponseEntity.badRequest()
                    .body("{\"error\": \"TestMail.app is not configured\"}");
            }
            
            String emails = testMailService.retrieveEmails(tag);
            return ResponseEntity.ok(emails);
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                .body("{\"error\": \"Failed to retrieve emails: " + e.getMessage() + "\"}");
        }
    }
    
    /**
     * Get configuration info (without sensitive data)
     */
    @GetMapping("/config")
    public ResponseEntity<Map<String, Object>> getConfig() {
        Map<String, Object> config = new HashMap<>();
        config.put("configured", testMailService.isConfigured());
        
        if (testMailService.isConfigured()) {
            config.put("info", "TestMail.app is configured. Use emails like: namespace.tag@inbox.testmail.app");
        } else {
            config.put("info", "TestMail.app is not configured. Run setup_testmail.ps1 to configure.");
        }
        
        return ResponseEntity.ok(config);
    }
}
