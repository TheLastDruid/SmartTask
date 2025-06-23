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
public class ChatBotService {    @Autowired
    private GroqService groqService;

    @Autowired
    private TaskService taskService;

    @Autowired
    private FileProcessingService fileProcessingService;

    @Autowired
    private ChatConversationService chatConversationService;

    private final ObjectMapper objectMapper = new ObjectMapper();    public ChatResponse processMessage(ChatRequest request, String userId) {        try {
            System.out.println("DEBUG: ChatBotService processing message: " + request.getMessage());
            
            // Save user message to conversation
            String conversationId = request.getConversationId();
            if (conversationId == null || conversationId.trim().isEmpty()) {
                conversationId = "main_" + userId;
            }
            chatConversationService.saveMessage(userId, conversationId, "user", request.getMessage());
            
            String response = groqService.processUserMessage(request.getMessage(), userId);
            System.out.println("DEBUG: Groq response: " + response);
            
            ChatResponse chatResponse = parseAndExecuteAction(response, userId, conversationId);
              // Save assistant response to conversation
            chatConversationService.saveMessage(userId, conversationId, "assistant", chatResponse.getMessage());
            
            return chatResponse;
        } catch (Exception e) {
            System.err.println("ERROR: Exception in ChatBotService.processMessage: " + e.getMessage());
            e.printStackTrace();
            return new ChatResponse("Sorry, I encountered an error processing your request. Please try again.", 
                                  request.getConversationId());
        }
    }    public ChatResponse processFileUpload(String extractedText, String userId) {
        try {
            // Generate a conversation ID for this session
            String conversationId = "main_" + userId;
            
            // Save file upload message
            chatConversationService.saveFileMessage(userId, conversationId, 
                "File uploaded with content: " + extractedText.substring(0, Math.min(100, extractedText.length())) + "...", 
                "uploaded_file");
            
            List<TaskRequest> extractedTasks = groqService.extractTasksFromText(extractedText);
            
            String responseMessage;
            ChatResponse chatResponse;
            
            if (extractedTasks.isEmpty()) {
                responseMessage = "I couldn't find any actionable tasks in the uploaded file.";
                chatResponse = new ChatResponse(responseMessage, conversationId);
            } else {
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

                responseMessage = String.format("I found %d potential tasks in your file. Would you like me to add them to your task list?", 
                                               extractedTasks.size());
                chatResponse = new ChatResponse(responseMessage, conversationId);
                chatResponse.setSuggestedTasks(suggestedTasks);
                chatResponse.setRequiresConfirmation(true);
                chatResponse.setAction("ADD_EXTRACTED_TASKS");
            }
            
            // Save assistant response
            chatConversationService.saveMessage(userId, conversationId, "assistant", responseMessage);
            
            return chatResponse;
        } catch (Exception e) {
            return new ChatResponse("Sorry, I encountered an error processing the uploaded file.", 
                                  "main_" + userId);
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
    }    private ChatResponse parseAndExecuteAction(String ollamaResponse, String userId, String conversationId) {
        try {
            JsonNode responseJson = objectMapper.readTree(ollamaResponse);
            
            // Safely extract action and response with null checks
            JsonNode actionNode = responseJson.get("action");
            JsonNode responseNode = responseJson.get("response");
            
            String action = (actionNode != null && !actionNode.isNull()) ? actionNode.asText() : "GENERAL_HELP";
            String responseMessage = (responseNode != null && !responseNode.isNull()) ? responseNode.asText("I'm here to help with your tasks!") : "I'm here to help with your tasks!";

            ChatResponse chatResponse = new ChatResponse(responseMessage, conversationId);            switch (action) {
                case "CREATE_TASK":
                    return handleCreateTask(responseJson, userId, conversationId);
                
                case "LIST_TASKS":
                    return handleListTasks(responseJson, userId, conversationId);
                
                case "UPDATE_TASK":
                case "DELETE_TASK":
                case "MARK_COMPLETE":
                    return handleTaskModification(action, responseJson, userId, conversationId);
                
                case "BULK_MARK_COMPLETE":
                    return handleBulkMarkComplete(userId, conversationId);
                
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
            
            // Safely extract fields with null checks
            JsonNode titleNode = responseJson.get("taskTitle");
            JsonNode descriptionNode = responseJson.get("taskDescription");
            JsonNode priorityNode = responseJson.get("priority");
            
            String title = (titleNode != null && !titleNode.isNull()) ? titleNode.asText() : "";
            String description = (descriptionNode != null && !descriptionNode.isNull()) ? descriptionNode.asText("") : "";
            String priority = (priorityNode != null && !priorityNode.isNull()) ? priorityNode.asText("MEDIUM") : "MEDIUM";
            
            // Validate that we have at least a title
            if (title.trim().isEmpty()) {
                System.out.println("DEBUG: No title provided, returning error message");
                return new ChatResponse("I need more details to create a task. Please tell me what you'd like to accomplish.", conversationId);
            }
            
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
    }    private ChatResponse handleTaskModification(String action, JsonNode responseJson, String userId, String conversationId) {
        try {
            // Extract information from the AI response
            JsonNode searchQueryNode = responseJson.get("searchQuery");
            JsonNode taskTitleNode = responseJson.get("taskTitle");
            JsonNode responseMessageNode = responseJson.get("response");
            
            String searchQuery = (searchQueryNode != null && !searchQueryNode.isNull()) ? searchQueryNode.asText() : null;
            String taskTitle = (taskTitleNode != null && !taskTitleNode.isNull()) ? taskTitleNode.asText() : null;
            String responseMessage = (responseMessageNode != null && !responseMessageNode.isNull()) ? 
                responseMessageNode.asText() : "I'll help you with that task.";
            
            // Get all user tasks to search through
            List<TaskResponse> allTasks = taskService.getAllTasksForUser(userId);
            
            if (allTasks.isEmpty()) {
                return new ChatResponse("You don't have any tasks to modify. Would you like to create a new task instead?", conversationId);
            }
            
            // Find the task to modify
            TaskResponse targetTask = null;
            String searchTerm = searchQuery != null ? searchQuery : taskTitle;
            
            if (searchTerm != null && !searchTerm.trim().isEmpty()) {
                // Search for task by title (case-insensitive partial match)
                for (TaskResponse task : allTasks) {
                    if (task.getTitle().toLowerCase().contains(searchTerm.toLowerCase())) {
                        targetTask = task;
                        break;
                    }
                }
            }
            
            if (targetTask == null) {
                // If no specific task found, show available tasks
                StringBuilder message = new StringBuilder();
                message.append("I couldn't find a specific task to modify. Here are your current tasks:\n\n");
                for (int i = 0; i < allTasks.size(); i++) {
                    TaskResponse task = allTasks.get(i);
                    message.append(String.format("%d. %s (%s)\n", i + 1, task.getTitle(), task.getStatus()));
                }
                message.append("\nPlease specify which task you'd like to ").append(
                    switch (action) {
                        case "UPDATE_TASK" -> "update";
                        case "DELETE_TASK" -> "delete";
                        case "MARK_COMPLETE" -> "mark as complete";
                        default -> "modify";
                    }
                ).append(" by mentioning its name.");
                
                return new ChatResponse(message.toString(), conversationId);
            }
            
            // Perform the requested action
            switch (action) {
                case "UPDATE_TASK":
                    return handleUpdateTask(targetTask, responseJson, userId, conversationId);
                    
                case "DELETE_TASK":
                    taskService.deleteTask(targetTask.getId(), userId);
                    return new ChatResponse(String.format("✅ Successfully deleted the task '%s'.", targetTask.getTitle()), conversationId);
                    
                case "MARK_COMPLETE":
                    TaskRequest updateRequest = new TaskRequest();
                    updateRequest.setStatus(TaskStatus.DONE);
                    TaskResponse updatedTask = taskService.updateTask(targetTask.getId(), updateRequest, userId);
                    return new ChatResponse(String.format("✅ Marked '%s' as complete! Great job!", updatedTask.getTitle()), conversationId);
                    
                default:
                    return new ChatResponse("I can help you update, delete, or mark tasks as complete. What would you like to do?", conversationId);
            }
            
        } catch (Exception e) {
            System.err.println("ERROR: Exception in handleTaskModification: " + e.getMessage());
            e.printStackTrace();
            String message = switch (action) {
                case "UPDATE_TASK" -> "Sorry, I couldn't update the task. Please try again with the task name.";
                case "DELETE_TASK" -> "Sorry, I couldn't delete the task. Please try again with the task name.";
                case "MARK_COMPLETE" -> "Sorry, I couldn't mark the task as complete. Please try again with the task name.";
                default -> "Sorry, I couldn't perform that task operation. Please try again.";
            };
            return new ChatResponse(message, conversationId);
        }
    }
    
    private ChatResponse handleUpdateTask(TaskResponse targetTask, JsonNode responseJson, String userId, String conversationId) {
        try {
            TaskRequest updateRequest = new TaskRequest();
            boolean hasUpdates = false;
            StringBuilder changesSummary = new StringBuilder();
            
            // Check for title updates
            JsonNode taskTitleNode = responseJson.get("taskTitle");
            if (taskTitleNode != null && !taskTitleNode.isNull()) {
                String newTitle = taskTitleNode.asText().trim();
                if (!newTitle.isEmpty() && !newTitle.equals(targetTask.getTitle())) {
                    updateRequest.setTitle(newTitle);
                    changesSummary.append(String.format("• Title: '%s' → '%s'\n", targetTask.getTitle(), newTitle));
                    hasUpdates = true;
                }
            }
            
            // Check for description updates
            JsonNode taskDescriptionNode = responseJson.get("taskDescription");
            if (taskDescriptionNode != null && !taskDescriptionNode.isNull()) {
                String newDescription = taskDescriptionNode.asText().trim();
                if (!newDescription.isEmpty()) {
                    updateRequest.setDescription(newDescription);
                    changesSummary.append(String.format("• Description updated\n"));
                    hasUpdates = true;
                }
            }
            
            // Check for priority updates
            JsonNode priorityNode = responseJson.get("priority");
            if (priorityNode != null && !priorityNode.isNull()) {
                String newPriority = priorityNode.asText().toUpperCase();
                if (newPriority.matches("HIGH|MEDIUM|LOW")) {
                    updateRequest.setPriority(newPriority);
                    changesSummary.append(String.format("• Priority: %s\n", newPriority));
                    hasUpdates = true;
                }
            }
            
            // Check for due date updates
            JsonNode dueDateNode = responseJson.get("dueDate");
            if (dueDateNode != null && !dueDateNode.isNull()) {
                String dateString = dueDateNode.asText();
                try {
                    LocalDateTime dueDate = LocalDateTime.parse(dateString + "T00:00:00");
                    updateRequest.setDueDate(dueDate);
                    changesSummary.append(String.format("• Due date: %s\n", dateString));
                    hasUpdates = true;
                } catch (Exception e) {
                    System.out.println("DEBUG: Could not parse due date: " + dateString);
                }
            }
            
            if (!hasUpdates) {
                return new ChatResponse(String.format("I found the task '%s' but I'm not sure what changes you want to make. Please specify what you'd like to update (title, description, priority, or due date).", targetTask.getTitle()), conversationId);
            }
            
            // Apply the updates
            TaskResponse updatedTask = taskService.updateTask(targetTask.getId(), updateRequest, userId);
            
            String message = String.format("✅ Successfully updated '%s'!\n\nChanges made:\n%s", 
                updatedTask.getTitle(), changesSummary.toString());
            
            return new ChatResponse(message, conversationId);
            
        } catch (Exception e) {
            System.err.println("ERROR: Exception in handleUpdateTask: " + e.getMessage());
            e.printStackTrace();
            return new ChatResponse(String.format("Sorry, I couldn't update the task '%s'. Please try again.", targetTask.getTitle()), conversationId);
        }
    }
    
    private ChatResponse handleBulkMarkComplete(String userId, String conversationId) {
        try {
            int updatedCount = taskService.bulkMarkTasksComplete(userId);
            
            if (updatedCount == 0) {
                return new ChatResponse("All your tasks are already complete! 🎉", conversationId);
            } else if (updatedCount == 1) {
                return new ChatResponse("✅ Marked 1 task as complete! Great job! 🎉", conversationId);
            } else {
                return new ChatResponse(String.format("✅ Marked %d tasks as complete! Amazing work! 🎉", updatedCount), conversationId);
            }
            
        } catch (Exception e) {
            System.err.println("ERROR: Exception in handleBulkMarkComplete: " + e.getMessage());
            e.printStackTrace();
            return new ChatResponse("Sorry, I couldn't mark all tasks as complete. Please try again.", conversationId);
        }
    }
}
