package com.todoapp.controller;

import com.todoapp.dto.*;
import com.todoapp.repository.UserRepository;
import com.todoapp.service.ChatBotService;
import com.todoapp.service.GroqService;
import com.todoapp.service.FileProcessingService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/chat")
@CrossOrigin(origins = "*", maxAge = 3600)
public class ChatBotController {    @Autowired
    private ChatBotService chatBotService;

    @Autowired
    private GroqService groqService;

    @Autowired
    private FileProcessingService fileProcessingService;

    @Autowired
    private UserRepository userRepository;    @PostMapping("/message")
    public ResponseEntity<ChatResponse> processMessage(@Valid @RequestBody ChatRequest request) {
        try {
            String userId = getCurrentUserId();
            ChatResponse response = chatBotService.processMessage(request, userId);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            ChatResponse errorResponse = new ChatResponse(
                "Sorry, I encountered an error processing your request. Please try again.",
                request.getConversationId()
            );
            return ResponseEntity.ok(errorResponse);
        }
    }

    @PostMapping("/upload")
    public ResponseEntity<?> uploadFile(@RequestParam("file") MultipartFile file) {
        try {
            String userId = getCurrentUserId();
            
            if (file.isEmpty()) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "Please select a file to upload");
                return ResponseEntity.badRequest().body(error);
            }

            String fileName = file.getOriginalFilename();
            if (!fileProcessingService.isSupportedFileType(fileName)) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "Unsupported file type. Please upload .txt, .pdf, or .docx files.");
                return ResponseEntity.badRequest().body(error);
            }

            String extractedText = fileProcessingService.extractTextFromFile(file);
            ChatResponse response = chatBotService.processFileUpload(extractedText, userId);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Failed to process the uploaded file: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PostMapping("/confirm-tasks")
    public ResponseEntity<ChatResponse> confirmTaskCreation(@RequestBody List<TaskRequest> tasks) {
        try {
            String userId = getCurrentUserId();
            ChatResponse response = chatBotService.confirmTaskCreation(tasks, userId);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            ChatResponse errorResponse = new ChatResponse(
                "Sorry, I couldn't add the tasks. Please try again.",
                null
            );
            return ResponseEntity.ok(errorResponse);
        }
    }    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> healthCheck() {
        Map<String, String> status = new HashMap<>();
        status.put("service", "ChatBot with Groq AI");
        status.put("timestamp", String.valueOf(System.currentTimeMillis()));
        
        // Check Groq service health
        try {
            boolean isGroqHealthy = groqService.isHealthy();
            status.put("groq_status", isGroqHealthy ? "UP" : "DOWN");
            status.put("status", isGroqHealthy ? "UP" : "DEGRADED");
        } catch (Exception e) {
            status.put("groq_status", "ERROR");
            status.put("status", "DEGRADED");
            status.put("error", e.getMessage());
        }
        
        return ResponseEntity.ok(status);
    }    private String getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        return userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"))
            .getId();
    }
}
