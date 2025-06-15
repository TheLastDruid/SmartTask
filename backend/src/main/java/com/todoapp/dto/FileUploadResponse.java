package com.todoapp.dto;

public class FileUploadResponse {
    private String message;
    private String extractedText;
    private int tasksFound;
    private boolean success;

    public FileUploadResponse() {}

    public FileUploadResponse(String message, String extractedText, int tasksFound, boolean success) {
        this.message = message;
        this.extractedText = extractedText;
        this.tasksFound = tasksFound;
        this.success = success;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getExtractedText() {
        return extractedText;
    }

    public void setExtractedText(String extractedText) {
        this.extractedText = extractedText;
    }

    public int getTasksFound() {
        return tasksFound;
    }

    public void setTasksFound(int tasksFound) {
        this.tasksFound = tasksFound;
    }

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }
}
