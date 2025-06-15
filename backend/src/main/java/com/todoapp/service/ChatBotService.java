package com.todoapp.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.todoapp.dto.*;
import com.todoapp.model.TaskStatus;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Service
public class ChatBotService {

    @Autowired
    private OllamaService ollamaService;

    @Autowired
    private TaskService taskService;

    @Autowired
    private FileProcessingService fileProcessingService;

    private final ObjectMapper objectMapper = new ObjectMapper();    public ChatResponse processMessage(ChatRequest request, String userId) {
        try {
            System.out.println("DEBUG: ChatBotService processing message: " + request.getMessage());
            String response = ollamaService.processUserMessage(request.getMessage(), userId);
            System.out.println("DEBUG: Ollama response: " + response);
            return parseAndExecuteAction(response, userId, request.getConversationId());
        } catch (Exception e) {
            System.err.println("ERROR: Exception in ChatBotService.processMessage: " + e.getMessage());
            e.printStackTrace();
            return new ChatResponse("Sorry, I encountered an error processing your request. Please try again.", 
                                  request.getConversationId());
        }
    }

    public ChatResponse processFileUpload(String extractedText, String userId) {
        try {
            List<TaskRequest> extractedTasks = ollamaService.extractTasksFromText(extractedText);
            
            if (extractedTasks.isEmpty()) {
                return new ChatResponse("I couldn't find any actionable tasks in the uploaded file.", 
                                      UUID.randomUUID().toString());
            }

            List<TaskResponse> suggestedTasks = new ArrayList<>();
            for (TaskRequest taskRequest : extractedTasks) {
                TaskResponse taskResponse = new TaskResponse();
                taskResponse.setTitle(taskRequest.getTitle());
                taskResponse.setDescription(taskRequest.getDescription());
                taskResponse.setPriority(taskRequest.getPriority());
                taskResponse.setDueDate(taskRequest.getDueDate());
                taskResponse.setStatus(TaskStatus.PENDING);
                suggestedTasks.add(taskResponse);
            }

            ChatResponse chatResponse = new ChatResponse(
                String.format("I found %d potential tasks in your file. Would you like me to add them to your task list?", 
                             extractedTasks.size()),
                UUID.randomUUID().toString()
            );
            chatResponse.setSuggestedTasks(suggestedTasks);
            chatResponse.setRequiresConfirmation(true);
            chatResponse.setAction("ADD_EXTRACTED_TASKS");

            return chatResponse;
        } catch (Exception e) {
            return new ChatResponse("Sorry, I encountered an error processing the uploaded file.", 
                                  UUID.randomUUID().toString());
        }
    }

    public ChatResponse confirmTaskCreation(List<TaskRequest> tasks, String userId) {
        try {
            List<TaskResponse> createdTasks = new ArrayList<>();
            for (TaskRequest taskRequest : tasks) {
                TaskResponse created = taskService.createTask(taskRequest, userId);
                createdTasks.add(created);
            }

            return new ChatResponse(
                String.format("Successfully added %d tasks to your list!", createdTasks.size()),
                UUID.randomUUID().toString()
            );
        } catch (Exception e) {
            return new ChatResponse("Sorry, I couldn't add the tasks. Please try again.", 
                                  UUID.randomUUID().toString());
        }
    }

    private ChatResponse parseAndExecuteAction(String ollamaResponse, String userId, String conversationId) {
        try {
            JsonNode responseJson = objectMapper.readTree(ollamaResponse);
            String action = responseJson.get("action").asText();
            String responseMessage = responseJson.get("response").asText();

            ChatResponse chatResponse = new ChatResponse(responseMessage, conversationId);

            switch (action) {
                case "CREATE_TASK":
                    return handleCreateTask(responseJson, userId, conversationId);
                
                case "LIST_TASKS":
                    return handleListTasks(responseJson, userId, conversationId);
                
                case "UPDATE_TASK":
                case "DELETE_TASK":
                case "MARK_COMPLETE":
                    return handleTaskModification(action, responseJson, userId, conversationId);
                
                default:
                    return chatResponse;
            }
        } catch (Exception e) {
            // Fallback to generic response
            return new ChatResponse("I understand you want help with your tasks. Could you be more specific about what you'd like to do?", 
                                  conversationId);
        }
    }    private ChatResponse handleCreateTask(JsonNode responseJson, String userId, String conversationId) {
        try {
            System.out.println("DEBUG: handleCreateTask called with JSON: " + responseJson.toString());
            
            TaskRequest taskRequest = new TaskRequest();
            String title = responseJson.get("taskTitle").asText();
            String description = responseJson.get("taskDescription").asText("");
            String priority = responseJson.get("priority").asText("MEDIUM");
            
            // Skip creation if we get template text instead of real values
            if (title.contains("extracted task title") || title.contains("if creating")) {
                System.out.println("DEBUG: Detected template text, skipping task creation");
                return new ChatResponse("I understand you want to create a task. Could you please provide more specific details about what you'd like to accomplish?", conversationId);
            }
            
            taskRequest.setTitle(title);
            taskRequest.setDescription(description);
            taskRequest.setPriority(priority);
            
            JsonNode dueDateNode = responseJson.get("dueDate");
            if (dueDateNode != null && !dueDateNode.isNull()) {
                try {
                    String dateString = dueDateNode.asText();
                    System.out.println("DEBUG: Parsing date string: " + dateString);
                    
                    // Skip if it's template text
                    if (dateString.contains("extracted") || dateString.contains("YYYY-MM-DD")) {
                        System.out.println("DEBUG: Detected template date text, setting to null");
                        taskRequest.setDueDate(null);
                    } else {
                        // Try parsing as just date first (YYYY-MM-DD)
                        try {
                            LocalDateTime dueDate = LocalDateTime.parse(dateString + "T00:00:00");
                            taskRequest.setDueDate(dueDate);
                            System.out.println("DEBUG: Successfully parsed date: " + dueDate);
                        } catch (Exception e1) {
                            // Try as full datetime
                            try {
                                LocalDateTime dueDate = LocalDateTime.parse(dateString, DateTimeFormatter.ISO_LOCAL_DATE_TIME);
                                taskRequest.setDueDate(dueDate);
                                System.out.println("DEBUG: Successfully parsed datetime: " + dueDate);
                            } catch (Exception e2) {
                                System.out.println("DEBUG: Date parsing failed, setting to null: " + e2.getMessage());
                                taskRequest.setDueDate(null);
                            }
                        }
                    }
                } catch (Exception e) {
                    System.out.println("DEBUG: Date parsing exception: " + e.getMessage());
                    taskRequest.setDueDate(null);
                }
            }

            System.out.println("DEBUG: Creating task with title: " + taskRequest.getTitle());
            TaskResponse created = taskService.createTask(taskRequest, userId);
            System.out.println("DEBUG: Task created successfully with ID: " + created.getId());
            
            return new ChatResponse(
                String.format("✅ I've created the task '%s' for you!", created.getTitle()),
                conversationId
            );
        } catch (Exception e) {
            System.err.println("ERROR: Exception in handleCreateTask: " + e.getMessage());
            e.printStackTrace();
            return new ChatResponse("Sorry, I couldn't create the task. Please try again.", conversationId);
        }
    }

    private ChatResponse handleListTasks(JsonNode responseJson, String userId, String conversationId) {
        try {
            List<TaskResponse> tasks = taskService.getAllTasksForUser(userId);
            
            if (tasks.isEmpty()) {
                return new ChatResponse("You don't have any tasks yet. Would you like me to help you add some?", 
                                      conversationId);
            }

            StringBuilder message = new StringBuilder("Here are your current tasks:\n\n");
            for (int i = 0; i < tasks.size(); i++) {
                TaskResponse task = tasks.get(i);
                message.append(String.format("%d. %s (%s)\n", 
                    i + 1, task.getTitle(), task.getStatus()));
                
                if (task.getDueDate() != null) {
                    message.append(String.format("   Due: %s\n", task.getDueDate()));
                }
            }

            return new ChatResponse(message.toString(), conversationId);
        } catch (Exception e) {
            return new ChatResponse("Sorry, I couldn't retrieve your tasks. Please try again.", conversationId);
        }
    }

    private ChatResponse handleTaskModification(String action, JsonNode responseJson, String userId, String conversationId) {
        // For now, return a helpful message about task modification
        String message = switch (action) {
            case "UPDATE_TASK" -> "To update a task, please specify which task you'd like to modify and what changes you want to make.";
            case "DELETE_TASK" -> "To delete a task, please specify which task you'd like to remove.";
            case "MARK_COMPLETE" -> "To mark a task as complete, please specify which task you've finished.";
            default -> "I can help you manage your tasks. What would you like to do?";
        };
        
        return new ChatResponse(message, conversationId);
    }
}
