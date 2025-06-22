package com.todoapp.test;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class ApiKeyTester implements CommandLineRunner {
    
    @Value("${groq.api.key}")
    private String groqApiKey;
    
    @Override
    public void run(String... args) throws Exception {
        System.out.println("=== API KEY TEST ===");
        System.out.println("API Key loaded: " + (groqApiKey != null ? "YES" : "NO"));
        System.out.println("API Key length: " + (groqApiKey != null ? groqApiKey.length() : 0));
        System.out.println("API Key starts with 'gsk_': " + (groqApiKey != null && groqApiKey.startsWith("gsk_")));
        System.out.println("API Key first 10 chars: " + (groqApiKey != null && groqApiKey.length() >= 10 ? groqApiKey.substring(0, 10) : "N/A"));
        System.out.println("API Key has whitespace: " + (groqApiKey != null && !groqApiKey.equals(groqApiKey.trim())));
        
        // Check for hidden characters
        if (groqApiKey != null) {
            byte[] bytes = groqApiKey.getBytes();
            System.out.println("API Key byte length: " + bytes.length);
            System.out.println("API Key character length: " + groqApiKey.length());
            
            // Check for non-printable characters
            boolean hasNonPrintable = false;
            for (char c : groqApiKey.toCharArray()) {
                if (c < 32 || c > 126) {
                    hasNonPrintable = true;
                    break;
                }
            }
            System.out.println("API Key has non-printable chars: " + hasNonPrintable);
        }
        System.out.println("==================");
    }
}
