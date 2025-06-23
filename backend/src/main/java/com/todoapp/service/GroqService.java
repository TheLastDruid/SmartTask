package com.todoapp.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.todoapp.dto.TaskRequest;
import okhttp3.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import jakarta.annotation.PostConstruct;

import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.TimeUnit;

@Service
public class GroqService {

    @Value("${groq.api.key}")
    private String groqApiKey;

    @Value("${groq.api.url:https://api.groq.com/openai/v1/chat/completions}")
    private String groqApiUrl;

    @Value("${groq.model:llama-3.1-70b-versatile}")
    private String groqModel;

    private final OkHttpClient client = new OkHttpClient.Builder()
            .connectTimeout(30, TimeUnit.SECONDS)
            .writeTimeout(30, TimeUnit.SECONDS)
            .readTimeout(60, TimeUnit.SECONDS)
            .build();
    
    private final ObjectMapper objectMapper = new ObjectMapper();    public String processUserMessage(String message, String userId) throws IOException {
        System.out.println("DEBUG: GroqService processing message: " + message);
        String prompt = createTaskManagementPrompt(message);
        System.out.println("DEBUG: Generated prompt: " + prompt);
        try {
            String result = callGroq(prompt);
            System.out.println("DEBUG: Groq raw response: " + result);
            return result;
        } catch (IOException e) {
            System.err.println("ERROR: Exception in GroqService.processUserMessage: " + e.getMessage());
            
            // If it's an authentication error, provide a helpful fallback response
            if (e.getMessage().contains("Authentication Failed") || e.getMessage().contains("Invalid API Key")) {
                return createFallbackResponse(message);
            }
            
            e.printStackTrace();
            throw e;
        }
    }
    
    private String createFallbackResponse(String userMessage) {
        System.out.println("DEBUG: Using fallback response for: " + userMessage);
        
        // Simple keyword-based response when API is unavailable
        String lowerMessage = userMessage.toLowerCase();
        
        if (lowerMessage.contains("create") || lowerMessage.contains("add") || lowerMessage.contains("task")) {
            return "{\n" +
                   "  \"action\": \"CREATE_TASK\",\n" +
                   "  \"taskTitle\": \"" + extractTaskTitle(userMessage) + "\",\n" +
                   "  \"taskDescription\": \"Task created from: " + userMessage + "\",\n" +
                   "  \"dueDate\": null,\n" +
                   "  \"priority\": \"MEDIUM\",\n" +
                   "  \"searchQuery\": null,\n" +
                   "  \"response\": \"I'll help you create that task. Note: AI assistant is temporarily unavailable, using basic task creation.\"\n" +
                   "}";
        } else if (lowerMessage.contains("list") || lowerMessage.contains("show") || lowerMessage.contains("tasks")) {
            return "{\n" +
                   "  \"action\": \"LIST_TASKS\",\n" +
                   "  \"taskTitle\": null,\n" +
                   "  \"taskDescription\": null,\n" +
                   "  \"dueDate\": null,\n" +
                   "  \"priority\": \"MEDIUM\",\n" +
                   "  \"searchQuery\": null,\n" +
                   "  \"response\": \"Here are your tasks. Note: AI assistant is temporarily unavailable.\"\n" +
                   "}";
        } else {
            return "{\n" +
                   "  \"action\": \"GENERAL_HELP\",\n" +
                   "  \"taskTitle\": null,\n" +
                   "  \"taskDescription\": null,\n" +
                   "  \"dueDate\": null,\n" +
                   "  \"priority\": \"MEDIUM\",\n" +
                   "  \"searchQuery\": null,\n" +
                   "  \"response\": \"I'm here to help! AI assistant is temporarily unavailable. Please check the GROQ_API_KEY configuration. You can still create tasks, view your task list, and manage your todos.\"\n" +
                   "}";
        }
    }
    
    private String extractTaskTitle(String message) {
        // Simple extraction - remove common words
        String title = message.replaceAll("(?i)(create|add|task|a|the|to|please)", "").trim();
        if (title.isEmpty()) {
            title = "New Task";
        }
        return title.length() > 50 ? title.substring(0, 50) + "..." : title;
    }

    public List<TaskRequest> extractTasksFromText(String text) throws IOException {
        String prompt = createTaskExtractionPrompt(text);
        String response = callGroq(prompt);
        return parseTasksFromResponse(response);
    }    private String createTaskManagementPrompt(String userMessage) {
        return """
            You are a helpful task management assistant. Analyze the user's message and extract specific information to determine what action they want to perform.
            
            User message: "%s"
            
            IMPORTANT: Extract ACTUAL information from the user's message. Do NOT use placeholder text.
            
            Examples:
            - "Create a task to buy groceries" → taskTitle: "Buy groceries", taskDescription: "Purchase groceries", action: "CREATE_TASK"
            - "Add task Study Math with Sarah tomorrow at 3pm high priority" → taskTitle: "Study Math with Sarah", taskDescription: "Study session with Sarah", dueDate: "2025-06-23", priority: "HIGH", action: "CREATE_TASK"
            - "Update task buy groceries to high priority" → searchQuery: "buy groceries", priority: "HIGH", action: "UPDATE_TASK"
            - "Change the due date of math homework to tomorrow" → searchQuery: "math homework", dueDate: "2025-06-23", action: "UPDATE_TASK"
            - "Mark buy groceries as complete" → searchQuery: "buy groceries", action: "MARK_COMPLETE"
            - "Delete the task study math" → searchQuery: "study math", action: "DELETE_TASK"
            - "Show my tasks" → action: "LIST_TASKS"
            - "I need help" → action: "GENERAL_HELP"
            
            For UPDATE_TASK, DELETE_TASK, and MARK_COMPLETE actions:
            - Use searchQuery to identify which task the user is referring to
            - Extract any new values they want to change (title, description, priority, dueDate)
            - searchQuery should contain the task name/keywords the user mentioned
            
            Possible actions:
            1. CREATE_TASK - User wants to add a new task
            2. LIST_TASKS - User wants to see their tasks  
            3. UPDATE_TASK - User wants to modify an existing task (change title, description, priority, due date)
            4. DELETE_TASK - User wants to remove a task
            5. MARK_COMPLETE - User wants to mark a task as done
            6. GENERAL_HELP - User needs help or has a general question
            
            Response format (JSON only, no extra text):
            {
              "action": "CREATE_TASK|LIST_TASKS|UPDATE_TASK|DELETE_TASK|MARK_COMPLETE|GENERAL_HELP",
              "taskTitle": "actual extracted title from user message or null",
              "taskDescription": "actual extracted description from user message or null", 
              "dueDate": "YYYY-MM-DD format if date mentioned, or null",
              "priority": "HIGH|MEDIUM|LOW if mentioned, or MEDIUM",
              "searchQuery": "search terms to find existing task (for UPDATE_TASK, DELETE_TASK, MARK_COMPLETE), or null",
              "response": "friendly response confirming the action"
            }
            
            Extract REAL values from the user's message. If creating a task, the taskTitle must be the actual task name the user wants, not placeholder text.
            For task modifications, searchQuery should contain the actual task name/keywords the user mentioned.
            """.formatted(userMessage);
    }

    private String createTaskExtractionPrompt(String text) {
        return """
            Extract potential tasks and action items from the following text. Look for:
            - Action verbs (schedule, call, send, review, prepare, etc.)
            - Deadlines and dates
            - Assignments and responsibilities
            - Things that need to be done
            
            Text: "%s"
            
            Respond with JSON format containing an array of tasks:
            {
              "tasks": [
                {
                  "title": "task title",
                  "description": "task description",
                  "priority": "HIGH|MEDIUM|LOW",
                  "dueDate": "YYYY-MM-DD or null"
                }
              ]
            }
            
            If no actionable tasks are found, return:
            {"tasks": []}
            """.formatted(text);
    }    private String callGroq(String prompt) throws IOException {
        if (groqApiKey == null || groqApiKey.trim().isEmpty()) {
            throw new RuntimeException("Groq API key is not configured. Please set groq.api.key in application.properties");
        }

        // Debug: Print API key details (first 10 chars only for security)
        System.out.println("DEBUG: API Key being used: " + 
            (groqApiKey.length() >= 10 ? groqApiKey.substring(0, 10) + "..." : groqApiKey));
        System.out.println("DEBUG: API Key length: " + groqApiKey.length());
        System.out.println("DEBUG: API Key starts with 'gsk_': " + groqApiKey.startsWith("gsk_"));
        System.out.println("DEBUG: API Key contains whitespace: " + !groqApiKey.equals(groqApiKey.trim()));

        // Create the request body in OpenAI-compatible format
        ObjectNode requestBody = objectMapper.createObjectNode();
        requestBody.put("model", groqModel);
        requestBody.put("temperature", 0.1);
        requestBody.put("max_tokens", 1024);
        requestBody.put("top_p", 1);
        requestBody.put("stream", false); // We'll use non-streaming for simplicity

        ArrayNode messages = objectMapper.createArrayNode();
        ObjectNode message = objectMapper.createObjectNode();
        message.put("role", "user");
        message.put("content", prompt);
        messages.add(message);
        requestBody.set("messages", messages);

        RequestBody body = RequestBody.create(
            requestBody.toString(),
            MediaType.get("application/json; charset=utf-8")
        );

        Request request = new Request.Builder()
                .url(groqApiUrl)
                .post(body)
                .addHeader("Authorization", "Bearer " + groqApiKey)
                .addHeader("Content-Type", "application/json")
                .build();        try (Response response = client.newCall(request).execute()) {
            if (!response.isSuccessful()) {
                String errorBody = response.body() != null ? response.body().string() : "No error details";
                System.err.println("Groq API error response: " + errorBody);
                
                // Handle specific error cases
                if (response.code() == 401) {
                    System.err.println("API Key Authentication Failed!");
                    System.err.println("Please check your GROQ_API_KEY in the .env file");
                    System.err.println("Visit https://console.groq.com/keys to get a valid API key");
                    throw new IOException("Groq API Authentication Failed: Invalid API Key. Please check your GROQ_API_KEY configuration.");
                }
                
                throw new IOException("Groq API call failed: " + response.code() + " - " + errorBody);
            }

            String responseBody = response.body().string();
            System.out.println("DEBUG: Raw Groq API response: " + responseBody);

            // Parse the response to extract the content
            JsonNode jsonResponse = objectMapper.readTree(responseBody);
            JsonNode choices = jsonResponse.get("choices");            if (choices != null && choices.isArray() && choices.size() > 0) {
                JsonNode firstChoice = choices.get(0);
                JsonNode messageNode = firstChoice.get("message");
                if (messageNode != null) {
                    JsonNode content = messageNode.get("content");
                    if (content != null) {
                        return content.asText();
                    }
                }
            }

            throw new IOException("Invalid response format from Groq API");
        }
    }

    private List<TaskRequest> parseTasksFromResponse(String response) {
        List<TaskRequest> tasks = new ArrayList<>();
        try {
            // Clean the response to extract JSON
            String jsonResponse = extractJsonFromResponse(response);
            JsonNode rootNode = objectMapper.readTree(jsonResponse);
            JsonNode tasksNode = rootNode.get("tasks");
            
            if (tasksNode != null && tasksNode.isArray()) {
                for (JsonNode taskNode : tasksNode) {
                    TaskRequest task = new TaskRequest();
                    task.setTitle(getJsonString(taskNode, "title"));
                    task.setDescription(getJsonString(taskNode, "description"));
                      String priorityStr = getJsonString(taskNode, "priority");
                    if (priorityStr != null) {
                        // Validate priority values
                        if (priorityStr.toUpperCase().matches("HIGH|MEDIUM|LOW")) {
                            task.setPriority(priorityStr.toUpperCase());
                        } else {
                            task.setPriority("MEDIUM");
                        }
                    } else {
                        task.setPriority("MEDIUM");
                    }
                    
                    String dueDateStr = getJsonString(taskNode, "dueDate");
                    if (dueDateStr != null && !dueDateStr.equals("null")) {
                        try {
                            task.setDueDate(LocalDateTime.parse(dueDateStr + "T10:00:00"));
                        } catch (Exception e) {
                            System.err.println("Error parsing due date: " + dueDateStr);
                        }
                    }
                    
                    if (task.getTitle() != null && !task.getTitle().trim().isEmpty()) {
                        tasks.add(task);
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("Error parsing tasks from response: " + e.getMessage());
            e.printStackTrace();
        }
        return tasks;
    }

    private String extractJsonFromResponse(String response) {
        // Try to find JSON in the response
        int jsonStart = response.indexOf('{');
        int jsonEnd = response.lastIndexOf('}');
        
        if (jsonStart >= 0 && jsonEnd >= jsonStart) {
            return response.substring(jsonStart, jsonEnd + 1);
        }
        
        return response.trim();
    }

    private String getJsonString(JsonNode node, String fieldName) {
        JsonNode field = node.get(fieldName);
        if (field != null && !field.isNull()) {
            String value = field.asText();
            return value.equals("null") ? null : value;
        }
        return null;
    }

    public boolean isHealthy() {
        try {
            // Simple health check - try to make a basic API call
            String testPrompt = "Respond with 'OK' if you can process this message.";
            String response = callGroq(testPrompt);
            return response != null && !response.trim().isEmpty();
        } catch (Exception e) {
            System.err.println("Groq health check failed: " + e.getMessage());
            return false;
        }
    }

    @PostConstruct
    public void validateConfiguration() {
        System.out.println("DEBUG: GroqService initializing...");
        System.out.println("DEBUG: API Key present: " + (groqApiKey != null && !groqApiKey.trim().isEmpty()));
        System.out.println("DEBUG: API Key starts with 'gsk_': " + (groqApiKey != null && groqApiKey.startsWith("gsk_")));
        System.out.println("DEBUG: API Key length: " + (groqApiKey != null ? groqApiKey.length() : 0));
        System.out.println("DEBUG: API URL: " + groqApiUrl);
        System.out.println("DEBUG: Model: " + groqModel);
        
        if (groqApiKey == null || groqApiKey.trim().isEmpty() || groqApiKey.equals("your-groq-api-key-here")) {
            System.err.println("WARNING: Groq API key is not properly configured!");
            System.err.println("Current API key value: '" + groqApiKey + "'");
            System.err.println("Please check your .env file and ensure GROQ_API_KEY is set correctly.");
        }
    }
}
