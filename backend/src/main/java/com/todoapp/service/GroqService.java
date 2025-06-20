package com.todoapp.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.todoapp.dto.TaskRequest;
import okhttp3.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
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
    
    private final ObjectMapper objectMapper = new ObjectMapper();

    public String processUserMessage(String message, String userId) throws IOException {
        System.out.println("DEBUG: GroqService processing message: " + message);
        String prompt = createTaskManagementPrompt(message);
        System.out.println("DEBUG: Generated prompt: " + prompt);
        try {
            String result = callGroq(prompt);
            System.out.println("DEBUG: Groq raw response: " + result);
            return result;
        } catch (Exception e) {
            System.err.println("ERROR: Exception in GroqService.processUserMessage: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    public List<TaskRequest> extractTasksFromText(String text) throws IOException {
        String prompt = createTaskExtractionPrompt(text);
        String response = callGroq(prompt);
        return parseTasksFromResponse(response);
    }

    private String createTaskManagementPrompt(String userMessage) {
        return """
            You are a helpful task management assistant. Analyze the user's message and extract specific information to determine what action they want to perform.
            
            User message: "%s"
            
            IMPORTANT: Extract ACTUAL information from the user's message. Do NOT use placeholder text.
            
            Examples:
            - "Create a task to buy groceries" → taskTitle: "Buy groceries", taskDescription: "Purchase groceries", action: "CREATE_TASK"
            - "Add task Study Math with Sarah tomorrow at 3pm high priority" → taskTitle: "Study Math with Sarah", taskDescription: "Study session with Sarah", dueDate: "2025-06-16", priority: "HIGH", action: "CREATE_TASK"
            - "Show my tasks" → action: "LIST_TASKS"
            - "I need help" → action: "GENERAL_HELP"
            
            Possible actions:
            1. CREATE_TASK - User wants to add a new task
            2. LIST_TASKS - User wants to see their tasks  
            3. UPDATE_TASK - User wants to modify an existing task
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
              "searchQuery": "search terms if looking for specific tasks, or null",
              "response": "friendly response confirming the action"
            }
            
            Extract REAL values from the user's message. If creating a task, the taskTitle must be the actual task name the user wants, not placeholder text.
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
    }

    private String callGroq(String prompt) throws IOException {
        if (groqApiKey == null || groqApiKey.trim().isEmpty()) {
            throw new RuntimeException("Groq API key is not configured. Please set groq.api.key in application.properties");
        }

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
                .build();

        try (Response response = client.newCall(request).execute()) {
            if (!response.isSuccessful()) {
                String errorBody = response.body() != null ? response.body().string() : "No error details";
                System.err.println("Groq API error response: " + errorBody);
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
}
