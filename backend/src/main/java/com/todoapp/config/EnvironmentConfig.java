package com.todoapp.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.PropertiesPropertySource;

import jakarta.annotation.PostConstruct;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.util.Properties;

@Configuration
public class EnvironmentConfig {

    private final ConfigurableEnvironment environment;

    public EnvironmentConfig(ConfigurableEnvironment environment) {
        this.environment = environment;
    }

    @PostConstruct
    public void loadEnvironmentVariables() {
        try {
            // Look for .env file in the project root (parent of backend directory)
            File envFile = new File("../.env");
            if (!envFile.exists()) {
                // Try current directory
                envFile = new File(".env");
            }
            if (!envFile.exists()) {
                // Try parent directory
                envFile = new File("../.env");
            }
            
            if (envFile.exists()) {
                System.out.println("Loading .env file from: " + envFile.getAbsolutePath());
                Properties props = new Properties();
                try (FileInputStream fis = new FileInputStream(envFile)) {
                    props.load(fis);
                }
                
                // Add properties to Spring environment
                PropertiesPropertySource propertySource = new PropertiesPropertySource("env-file", props);
                environment.getPropertySources().addFirst(propertySource);
                
                System.out.println("Loaded " + props.size() + " properties from .env file");
                
                // Debug: Print GROQ API key status
                String groqKey = props.getProperty("GROQ_API_KEY");
                System.out.println("GROQ_API_KEY loaded: " + (groqKey != null ? "YES (length: " + groqKey.length() + ")" : "NO"));
            } else {
                System.out.println("No .env file found. Checked paths:");
                System.out.println("  - " + new File("../.env").getAbsolutePath());
                System.out.println("  - " + new File(".env").getAbsolutePath());
            }
        } catch (IOException e) {
            System.err.println("Error loading .env file: " + e.getMessage());
        }
    }
}
