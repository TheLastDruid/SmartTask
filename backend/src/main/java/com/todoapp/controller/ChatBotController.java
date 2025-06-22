package com.todoapp.controller;

import com.todoapp.dto.*;
import com.todoapp.model.ChatConversation;
import com.todoapp.repository.UserRepository;
import com.todoapp.service.ChatBotService;
import com.todoapp.service.ChatConversationService;
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
    private ChatConversationService chatConversationService;

    @Autowired
    private GroqService groqService;

    @Autowired
    private FileProcessingService fileProcessingService;

    @Autowired
    private UserRepository userRepository;@PostMapping("/message")
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
    }    @PostMapping("/upload")
    public ResponseEntity<ChatResponse> uploadFile(@RequestParam("file") MultipartFile file) {
        try {
            String userId = getCurrentUserId();
            
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body(new ChatResponse("Please select a file to upload", null));
            }

            String fileName = file.getOriginalFilename();
            if (!fileProcessingService.isSupportedFileType(fileName)) {
                return ResponseEntity.badRequest().body(new ChatResponse("Unsupported file type. Please upload .txt, .pdf, or .docx files.", null));
            }

            String extractedText = fileProcessingService.extractTextFromFile(file);
            ChatResponse response = chatBotService.processFileUpload(extractedText, userId);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ChatResponse("Failed to process the uploaded file: " + e.getMessage(), null));
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
    }

    @GetMapping("/conversation/{conversationId}")
    public ResponseEntity<ChatConversation> getConversation(@PathVariable String conversationId) {
        try {
            String userId = getCurrentUserId();
            return chatConversationService.getConversation(conversationId)
                    .filter(conv -> conv.getUserId().equals(userId))
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/conversations")
    public ResponseEntity<List<ChatConversation>> getUserConversations() {
        try {
            String userId = getCurrentUserId();
            List<ChatConversation> conversations = chatConversationService.getUserConversations(userId);
            return ResponseEntity.ok(conversations);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/conversation/main")
    public ResponseEntity<ChatConversation> getMainConversation() {
        try {
            String userId = getCurrentUserId();
            ChatConversation conversation = chatConversationService.getMainConversation(userId);
            return ResponseEntity.ok(conversation);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/health")
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
            status.put("error", e.getMessage());        }
        
        return ResponseEntity.ok(status);
    }

    private String getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        return userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"))
            .getId();
    }
}
