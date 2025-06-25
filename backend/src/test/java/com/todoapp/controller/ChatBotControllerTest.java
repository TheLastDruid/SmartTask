package com.todoapp.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.todoapp.dto.ChatRequest;
import com.todoapp.dto.ChatResponse;
import com.todoapp.dto.TaskRequest;
import com.todoapp.model.TaskStatus;
import com.todoapp.model.User;
import com.todoapp.repository.UserRepository;
import com.todoapp.service.ChatBotService;
import com.todoapp.service.FileProcessingService;
import com.todoapp.service.GroqService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class ChatBotControllerTest {

    @Mock
    private ChatBotService chatBotService;

    @Mock
    private FileProcessingService fileProcessingService;

    @Mock
    private UserRepository userRepository;

    @Mock
    private GroqService groqService;

    @Mock
    private SecurityContext securityContext;

    @Mock
    private Authentication authentication;

    @InjectMocks
    private ChatBotController chatBotController;

    private MockMvc mockMvc;
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(chatBotController).build();
        objectMapper = new ObjectMapper();        // Setup security context
        SecurityContextHolder.setContext(securityContext);
        lenient().when(securityContext.getAuthentication()).thenReturn(authentication);
        lenient().when(authentication.getName()).thenReturn("test@example.com");
        
        // Setup user repository mock
        User testUser = new User();
        testUser.setId("user123");
        testUser.setEmail("test@example.com");
        lenient().when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
        
        // Setup GroqService for health check
        lenient().when(groqService.isHealthy()).thenReturn(true);
    }

    @Test
    void processMessage_ValidRequest_ReturnsResponse() throws Exception {
        // Given
        ChatRequest chatRequest = new ChatRequest();
        chatRequest.setMessage("Create a task to buy groceries");
        chatRequest.setConversationId("conv123");

        ChatResponse chatResponse = new ChatResponse("I'll help you create a task for buying groceries.", "conv123");        when(chatBotService.processMessage(any(ChatRequest.class), eq("user123")))
                .thenReturn(chatResponse);

        // When & Then
        mockMvc.perform(post("/api/chat/message")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(chatRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("I'll help you create a task for buying groceries."))
                .andExpect(jsonPath("$.conversationId").value("conv123"));

        verify(chatBotService, times(1)).processMessage(any(ChatRequest.class), eq("user123"));
    }

    @Test
    void processMessage_ServiceException_ReturnsErrorResponse() throws Exception {
        // Given
        ChatRequest chatRequest = new ChatRequest();
        chatRequest.setMessage("Test message");
        chatRequest.setConversationId("conv123");        when(chatBotService.processMessage(any(ChatRequest.class), eq("user123")))
                .thenThrow(new RuntimeException("Service error"));

        // When & Then
        mockMvc.perform(post("/api/chat/message")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(chatRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Sorry, I encountered an error processing your request. Please try again."))
                .andExpect(jsonPath("$.conversationId").value("conv123"));

        verify(chatBotService, times(1)).processMessage(any(ChatRequest.class), eq("user123"));
    }

    @Test
    void uploadFile_ValidFile_ReturnsResponse() throws Exception {
        // Given
        MockMultipartFile file = new MockMultipartFile(
                "file", 
                "test.txt", 
                "text/plain", 
                "This is test content".getBytes()
        );

        String extractedText = "This is test content";
        ChatResponse chatResponse = new ChatResponse("File processed successfully.", null);

        when(fileProcessingService.isSupportedFileType("test.txt")).thenReturn(true);
        when(fileProcessingService.extractTextFromFile(any())).thenReturn(extractedText);        when(chatBotService.processFileUpload(eq(extractedText), eq("user123")))
                .thenReturn(chatResponse);

        // When & Then
        mockMvc.perform(multipart("/api/chat/upload")
                .file(file))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("File processed successfully."));

        verify(fileProcessingService, times(1)).isSupportedFileType("test.txt");
        verify(fileProcessingService, times(1)).extractTextFromFile(any());
        verify(chatBotService, times(1)).processFileUpload(eq(extractedText), eq("user123"));
    }

    @Test
    void uploadFile_EmptyFile_ReturnsBadRequest() throws Exception {
        // Given
        MockMultipartFile emptyFile = new MockMultipartFile(
                "file", 
                "empty.txt", 
                "text/plain", 
                new byte[0]
        );

        // When & Then
        mockMvc.perform(multipart("/api/chat/upload")
                .file(emptyFile))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Please select a file to upload"));

        verify(fileProcessingService, never()).isSupportedFileType(anyString());
        verify(fileProcessingService, never()).extractTextFromFile(any());
        verify(chatBotService, never()).processFileUpload(anyString(), anyString());
    }

    @Test
    void uploadFile_UnsupportedFileType_ReturnsBadRequest() throws Exception {
        // Given
        MockMultipartFile file = new MockMultipartFile(
                "file", 
                "test.exe", 
                "application/octet-stream", 
                "binary content".getBytes()
        );

        when(fileProcessingService.isSupportedFileType("test.exe")).thenReturn(false);

        // When & Then
        mockMvc.perform(multipart("/api/chat/upload")
                .file(file))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Unsupported file type. Please upload .txt, .pdf, or .docx files."));

        verify(fileProcessingService, times(1)).isSupportedFileType("test.exe");
        verify(fileProcessingService, never()).extractTextFromFile(any());
        verify(chatBotService, never()).processFileUpload(anyString(), anyString());
    }

    @Test
    void uploadFile_FileProcessingException_ReturnsBadRequest() throws Exception {
        // Given
        MockMultipartFile file = new MockMultipartFile(
                "file", 
                "test.pdf", 
                "application/pdf", 
                "corrupted pdf content".getBytes()
        );

        when(fileProcessingService.isSupportedFileType("test.pdf")).thenReturn(true);
        when(fileProcessingService.extractTextFromFile(any()))
                .thenThrow(new RuntimeException("Failed to process PDF"));

        // When & Then
        mockMvc.perform(multipart("/api/chat/upload")
                .file(file))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Failed to process the uploaded file: Failed to process PDF"));

        verify(fileProcessingService, times(1)).isSupportedFileType("test.pdf");
        verify(fileProcessingService, times(1)).extractTextFromFile(any());
        verify(chatBotService, never()).processFileUpload(anyString(), anyString());
    }

    @Test
    void confirmTaskCreation_ValidTasks_ReturnsResponse() throws Exception {
        // Given
        TaskRequest task1 = new TaskRequest();
        task1.setTitle("Task 1");
        task1.setDescription("Description 1");
        task1.setStatus(TaskStatus.TODO);

        TaskRequest task2 = new TaskRequest();
        task2.setTitle("Task 2");
        task2.setDescription("Description 2");
        task2.setStatus(TaskStatus.TODO);

        List<TaskRequest> tasks = Arrays.asList(task1, task2);

        ChatResponse chatResponse = new ChatResponse("Tasks created successfully!", null);        when(chatBotService.confirmTaskCreation(anyList(), eq("user123")))
                .thenReturn(chatResponse);

        // When & Then
        mockMvc.perform(post("/api/chat/confirm-tasks")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(tasks)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Tasks created successfully!"));

        verify(chatBotService, times(1)).confirmTaskCreation(anyList(), eq("user123"));
    }

    @Test
    void confirmTaskCreation_ServiceException_ReturnsErrorResponse() throws Exception {
        // Given
        TaskRequest task = new TaskRequest();
        task.setTitle("Task 1");
        List<TaskRequest> tasks = Arrays.asList(task);        when(chatBotService.confirmTaskCreation(anyList(), eq("user123")))
                .thenThrow(new RuntimeException("Database error"));

        // When & Then
        mockMvc.perform(post("/api/chat/confirm-tasks")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(tasks)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Sorry, I couldn't add the tasks. Please try again."));

        verify(chatBotService, times(1)).confirmTaskCreation(anyList(), eq("user123"));
    }    @Test
    void healthCheck_ReturnsStatus() throws Exception {
        // When & Then
        mockMvc.perform(get("/api/chat/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("UP"))
                .andExpect(jsonPath("$.service").value("ChatBot with Groq AI"))
                .andExpect(jsonPath("$.timestamp").exists());
    }

    @Test
    void processMessage_EmptyRequest_ReturnsBadRequest() throws Exception {
        // When & Then
        mockMvc.perform(post("/api/chat/message")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}"))
                .andExpect(status().isBadRequest());
    }
}
