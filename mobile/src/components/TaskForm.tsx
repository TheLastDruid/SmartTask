/**
 * TaskForm component for creating and editing tasks
 * Based on frontend TaskModal functionality
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Task, CreateTaskRequest, UpdateTaskRequest, TaskStatus, TaskPriority } from '../types';

interface TaskFormProps {
  task?: Task;
  onSubmit: (taskData: CreateTaskRequest | UpdateTaskRequest) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export const TaskForm: React.FC<TaskFormProps> = ({
  task,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState({
    title: task?.title || '',
    description: task?.description || '',
    status: (task?.status || 'TODO') as TaskStatus,
    priority: (task?.priority || 'MEDIUM') as TaskPriority,
    dueDate: task?.dueDate ? new Date(task.dueDate) : null,
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      const taskData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        status: formData.status as any,
        priority: formData.priority as any,
        dueDate: formData.dueDate?.toISOString(),
      };

      await onSubmit(taskData);
    } catch (error) {
      Alert.alert('Error', 'Failed to save task. Please try again.');
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return '#ef4444'; // red
      case 'MEDIUM':
        return '#f59e0b'; // amber
      case 'LOW':
        return '#10b981'; // green
      default:
        return '#6b7280'; // gray
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'TODO':
        return '#6b7280'; // gray
      case 'IN_PROGRESS':
        return '#3b82f6'; // blue
      case 'DONE':
        return '#10b981'; // green
      default:
        return '#6b7280';
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>
          {task ? 'Edit Task' : 'Create New Task'}
        </Text>
        <TouchableOpacity onPress={onCancel} style={styles.closeButton}>
          <Ionicons name="close" size={24} color="#374151" />
        </TouchableOpacity>
      </View>

      <View style={styles.form}>
        {/* Title Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Title *</Text>
          <TextInput
            style={[styles.input, errors.title && styles.inputError]}
            value={formData.title}
            onChangeText={(text) => setFormData({ ...formData, title: text })}
            placeholder="Enter task title"
            maxLength={100}
          />
          {errors.title && <Text style={styles.errorText}>{errors.title}</Text>}
        </View>

        {/* Description Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Description *</Text>
          <TextInput
            style={[styles.textArea, errors.description && styles.inputError]}
            value={formData.description}
            onChangeText={(text) => setFormData({ ...formData, description: text })}
            placeholder="Enter task description"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
          {errors.description && <Text style={styles.errorText}>{errors.description}</Text>}
        </View>

        {/* Priority Selection */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Priority</Text>
          <View style={styles.optionGroup}>
            {['LOW', 'MEDIUM', 'HIGH'].map((priority) => (
              <TouchableOpacity
                key={priority}
                style={[
                  styles.optionButton,
                  { borderColor: getPriorityColor(priority) },
                  formData.priority === priority && {
                    backgroundColor: getPriorityColor(priority),
                  },
                ]}
                onPress={() => setFormData({ ...formData, priority: priority as TaskPriority })}
              >
                <Text
                  style={[
                    styles.optionText,
                    { color: getPriorityColor(priority) },
                    formData.priority === priority && { color: 'white' },
                  ]}
                >
                  {priority}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Status Selection */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Status</Text>
          <View style={styles.optionGroup}>
            {['TODO', 'IN_PROGRESS', 'DONE'].map((status) => (
              <TouchableOpacity
                key={status}
                style={[
                  styles.optionButton,
                  { borderColor: getStatusColor(status) },
                  formData.status === status && {
                    backgroundColor: getStatusColor(status),
                  },
                ]}
                onPress={() => setFormData({ ...formData, status: status as TaskStatus })}
              >
                <Text
                  style={[
                    styles.optionText,
                    { color: getStatusColor(status) },
                    formData.status === status && { color: 'white' },
                  ]}
                >
                  {status.replace('_', ' ')}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Due Date */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Due Date</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Ionicons name="calendar-outline" size={20} color="#374151" />
            <Text style={styles.dateText}>
              {formData.dueDate
                ? formData.dueDate.toLocaleDateString()
                : 'Select due date (optional)'}
            </Text>
          </TouchableOpacity>
          {formData.dueDate && (
            <TouchableOpacity
              style={styles.clearDateButton}
              onPress={() => setFormData({ ...formData, dueDate: null })}
            >
              <Text style={styles.clearDateText}>Clear date</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonGroup}>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={onCancel}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.submitButton]}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <Text style={styles.submitButtonText}>Saving...</Text>
            ) : (
              <Text style={styles.submitButtonText}>
                {task ? 'Update' : 'Create'} Task
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Date Picker */}
      {showDatePicker && (
        <DateTimePicker
          value={formData.dueDate || new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(event: any, selectedDate: Date | undefined) => {
            setShowDatePicker(false);
            if (selectedDate) {
              setFormData({ ...formData, dueDate: selectedDate });
            }
          }}
          minimumDate={new Date()}
        />
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  closeButton: {
    padding: 4,
  },
  form: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9fafb',
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9fafb',
    minHeight: 100,
  },
  inputError: {
    borderColor: '#ef4444',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 14,
    marginTop: 4,
  },
  optionGroup: {
    flexDirection: 'row',
    gap: 8,
  },
  optionButton: {
    flex: 1,
    borderWidth: 2,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  optionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#f9fafb',
  },
  dateText: {
    fontSize: 16,
    color: '#374151',
  },
  clearDateButton: {
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  clearDateText: {
    color: '#ef4444',
    fontSize: 14,
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  cancelButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#3b82f6',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
