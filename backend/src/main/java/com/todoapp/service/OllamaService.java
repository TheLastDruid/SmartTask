package com.todoapp.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
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
public class OllamaService {

    @Value("${ollama.base-url:http://ollama:11434}")
    private String ollamaBaseUrl;

    private final OkHttpClient client = new OkHttpClient.Builder()
            .connectTimeout(30, TimeUnit.SECONDS)
            .writeTimeout(30, TimeUnit.SECONDS)
            .readTimeout(60, TimeUnit.SECONDS)
            .build();
    private final ObjectMapper objectMapper = new ObjectMapper();public String processUserMessage(String message, String userId) throws IOException {
        System.out.println("DEBUG: OllamaService processing message: " + message);
        String prompt = createTaskManagementPrompt(message);
        System.out.println("DEBUG: Generated prompt: " + prompt);
        try {
            String result = callOllama(prompt);
            System.out.println("DEBUG: Ollama raw response: " + result);
            return result;
        } catch (Exception e) {
            System.err.println("ERROR: Exception in OllamaService.processUserMessage: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    public List<TaskRequest> extractTasksFromText(String text) throws IOException {
        String prompt = createTaskExtractionPrompt(text);
        String response = callOllama(prompt);
        return parseTasksFromResponse(response);
    }    private String createTaskManagementPrompt(String userMessage) {
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
                  "priority": "HIGH/MEDIUM/LOW",
                  "dueDate": "YYYY-MM-DD if date mentioned, null otherwise"
                }
              ]
            }
            
            Only extract clear, actionable tasks. Don't include vague statements.
            """.formatted(text);
    }    private String callOllama(String prompt) throws IOException {
        System.out.println("DEBUG: Calling Ollama with URL: " + ollamaBaseUrl + "/api/generate");
        String jsonBody = """
            {
              "model": "llama3.2:1b",
              "prompt": "%s",
              "stream": false,
              "options": {
                "temperature": 0.7,
                "top_p": 0.9
              }
            }
            """.formatted(prompt.replace("\"", "\\\"").replace("\n", "\\n"));

        System.out.println("DEBUG: Request body: " + jsonBody);
        
        RequestBody body = RequestBody.create(jsonBody, MediaType.parse("application/json"));
        Request request = new Request.Builder()
                .url(ollamaBaseUrl + "/api/generate")
                .post(body)
                .build();

        try (Response response = client.newCall(request).execute()) {
            System.out.println("DEBUG: HTTP response code: " + response.code());
            if (!response.isSuccessful()) {
                String errorBody = response.body() != null ? response.body().string() : "No error body";
                System.err.println("ERROR: Ollama request failed with code " + response.code() + ", body: " + errorBody);
                throw new IOException("Ollama request failed: " + response.code() + " - " + errorBody);
            }
            
            ResponseBody responseBody = response.body();
            if (responseBody == null) {
                System.err.println("ERROR: Empty response from Ollama");
                throw new IOException("Empty response from Ollama");
            }
            
            String responseString = responseBody.string();
            System.out.println("DEBUG: Raw Ollama response: " + responseString);
            
            JsonNode jsonResponse = objectMapper.readTree(responseString);
            String result = jsonResponse.get("response").asText();
            System.out.println("DEBUG: Extracted response text: " + result);
            return result;
        } catch (Exception e) {
            System.err.println("ERROR: Exception during Ollama call: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    private List<TaskRequest> parseTasksFromResponse(String response) {
        List<TaskRequest> tasks = new ArrayList<>();
        
        try {
            // Try to parse as JSON first
            JsonNode jsonNode = objectMapper.readTree(response);
            JsonNode tasksArray = jsonNode.get("tasks");
            
            if (tasksArray != null && tasksArray.isArray()) {
                for (JsonNode taskNode : tasksArray) {
                    TaskRequest task = new TaskRequest();
                    task.setTitle(taskNode.get("title").asText());
                    task.setDescription(taskNode.get("description").asText());
                    
                    String priority = taskNode.get("priority").asText("MEDIUM");
                    task.setPriority(priority);
                      JsonNode dueDateNode = taskNode.get("dueDate");
                    if (dueDateNode != null && !dueDateNode.isNull()) {
                        try {
                            String dateString = dueDateNode.asText();
                            LocalDateTime dueDate = LocalDateTime.parse(dateString, DateTimeFormatter.ISO_LOCAL_DATE_TIME);
                            task.setDueDate(dueDate);
                        } catch (Exception e) {
                            // If date parsing fails, set to null or handle gracefully
                            task.setDueDate(null);
                        }
                    }
                    
                    tasks.add(task);
                }
            }
        } catch (Exception e) {
            // Fallback: extract tasks using regex patterns
            tasks.addAll(extractTasksWithRegex(response));
        }
        
        return tasks;
    }

    private List<TaskRequest> extractTasksWithRegex(String text) {
        List<TaskRequest> tasks = new ArrayList<>();
        
        // Pattern to match task-like statements
        Pattern taskPattern = Pattern.compile(
            "(?i)(?:need to|should|must|have to|will|going to|plan to|\\d+\\.\\s*)([^.!?\\n]{10,100})", 
            Pattern.MULTILINE
        );
        
        Matcher matcher = taskPattern.matcher(text);
        while (matcher.find()) {
            String taskText = matcher.group(1).trim();
            if (isValidTask(taskText)) {
                TaskRequest task = new TaskRequest();
                task.setTitle(taskText);
                task.setDescription("Extracted from uploaded file");
                task.setPriority("MEDIUM");
                tasks.add(task);
            }
        }
        
        return tasks;
    }

    private boolean isValidTask(String text) {
        // Basic validation for task text
        return text.length() > 5 && 
               text.length() < 200 && 
               !text.toLowerCase().contains("the document") &&
               !text.toLowerCase().contains("this file");
    }
}
