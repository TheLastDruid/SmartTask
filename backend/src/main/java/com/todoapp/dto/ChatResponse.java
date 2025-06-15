package com.todoapp.dto;

import java.util.List;

public class ChatResponse {
    private String message;
    private String conversationId;
    private List<TaskResponse> suggestedTasks;
    private boolean requiresConfirmation;
    private String action;

    public ChatResponse() {}

    public ChatResponse(String message, String conversationId) {
        this.message = message;
        this.conversationId = conversationId;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getConversationId() {
        return conversationId;
    }

    public void setConversationId(String conversationId) {
        this.conversationId = conversationId;
    }

    public List<TaskResponse> getSuggestedTasks() {
        return suggestedTasks;
    }

    public void setSuggestedTasks(List<TaskResponse> suggestedTasks) {
        this.suggestedTasks = suggestedTasks;
    }

    public boolean isRequiresConfirmation() {
        return requiresConfirmation;
    }

    public void setRequiresConfirmation(boolean requiresConfirmation) {
        this.requiresConfirmation = requiresConfirmation;
    }

    public String getAction() {
        return action;
    }

    public void setAction(String action) {
        this.action = action;
    }
}
