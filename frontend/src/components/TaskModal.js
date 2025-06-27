import React, { useState, useEffect } from 'react';
import { X, Plus, Save, Calendar, Type, FileText, Flag } from 'lucide-react';
import Logger from '../utils/logger';

const TaskModal = ({ isOpen, onClose, onSubmit, task, isEditing }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'TODO',
    priority: 'MEDIUM',
    dueDate: '',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Priority configuration for consistent styling
  const getPriorityStyles = (priority) => {
    switch (priority) {
      case 'HIGH':
        return {
          bgColor: 'bg-red-50',
          borderColor: 'border-red-300',
          textColor: 'text-red-800',
          focusRing: 'focus:ring-red-500 focus:border-red-500'
        };
      case 'MEDIUM':
        return {
          bgColor: 'bg-amber-50',
          borderColor: 'border-amber-300',
          textColor: 'text-amber-800',
          focusRing: 'focus:ring-amber-500 focus:border-amber-500'
        };
      case 'LOW':
        return {
          bgColor: 'bg-emerald-50',
          borderColor: 'border-emerald-300',
          textColor: 'text-emerald-800',
          focusRing: 'focus:ring-emerald-500 focus:border-emerald-500'
        };
      default:
        return {
          bgColor: 'bg-slate-50',
          borderColor: 'border-slate-300',
          textColor: 'text-slate-800',
          focusRing: 'focus:ring-blue-500 focus:border-blue-500'
        };
    }
  };

  // Status configuration for consistent styling
  const getStatusStyles = (status) => {
    switch (status) {
      case 'TODO':
        return {
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-300',
          textColor: 'text-blue-800',
          focusRing: 'focus:ring-blue-500 focus:border-blue-500'
        };
      case 'IN_PROGRESS':
        return {
          bgColor: 'bg-purple-50',
          borderColor: 'border-purple-300',
          textColor: 'text-purple-800',
          focusRing: 'focus:ring-purple-500 focus:border-purple-500'
        };
      case 'DONE':
        return {
          bgColor: 'bg-emerald-50',
          borderColor: 'border-emerald-300',
          textColor: 'text-emerald-800',
          focusRing: 'focus:ring-emerald-500 focus:border-emerald-500'
        };
      default:
        return {
          bgColor: 'bg-slate-50',
          borderColor: 'border-slate-300',
          textColor: 'text-slate-800',
          focusRing: 'focus:ring-blue-500 focus:border-blue-500'
        };
    }
  };

  useEffect(() => {
    if (isOpen) {
      // Helper function to safely format date for input field
      const formatDateForInput = (dateValue) => {
        if (!dateValue) return '';
        
        try {
          // If it's already a string, try to parse it
          if (typeof dateValue === 'string') {
            const date = new Date(dateValue);
            if (!isNaN(date.getTime())) {
              return date.toISOString().split('T')[0];
            }
            return '';
          }
          
          // If it's an array (LocalDateTime serialized), create date from it
          if (Array.isArray(dateValue) && dateValue.length >= 3) {
            const [year, month, day] = dateValue;
            const date = new Date(year, month - 1, day); // month is 0-indexed in JS
            if (!isNaN(date.getTime())) {
              return date.toISOString().split('T')[0];
            }
            return '';
          }
          
          // If it's a Date object
          if (dateValue instanceof Date) {
            if (!isNaN(dateValue.getTime())) {
              return dateValue.toISOString().split('T')[0];
            }
            return '';
          }
          
          // If it's an object with date properties
          if (typeof dateValue === 'object' && dateValue.year) {
            const date = new Date(dateValue.year, (dateValue.month || 1) - 1, dateValue.day || 1);
            if (!isNaN(date.getTime())) {
              return date.toISOString().split('T')[0];
            }
            return '';
          }
          
          return '';
        } catch (error) {
          Logger.warn('Error formatting date for input:', error, dateValue);
          return '';
        }
      };

      setFormData({
        title: task?.title || '',
        description: task?.description || '',
        status: task?.status || 'TODO',
        priority: task?.priority || 'MEDIUM',
        dueDate: formatDateForInput(task?.dueDate),
      });
      setErrors({});
      setIsSubmitting(false);
    }
  }, [isOpen, task]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length > 100) {
      newErrors.title = 'Title must not exceed 100 characters';
    }
    
    if (formData.description.length > 500) {
      newErrors.description = 'Description must not exceed 500 characters';
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const taskData = {
        ...formData,
        dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : null,
      };

      await onSubmit(taskData);
      handleClose();
    } catch (error) {
      Logger.error('Error submitting task:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      title: '',
      description: '',
      status: 'TODO',
      priority: 'MEDIUM',
      dueDate: '',
    });
    setErrors({});
    setIsSubmitting(false);
    onClose();
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  if (!isOpen) return null;

  const statusStyles = getStatusStyles(formData.status);

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
    >
      <div className={`bg-white rounded-2xl shadow-2xl w-full max-w-md scale-in border-l-4 ${statusStyles.borderColor} overflow-hidden`}>
        {/* Header */}
        <div className={`flex items-center justify-between p-4 border-b border-gray-100 ${statusStyles.bgColor}`}>
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg border ${statusStyles.borderColor}`}>
              {isEditing ? (
                <Save className={`h-5 w-5 ${statusStyles.textColor}`} />
              ) : (
                <Plus className={`h-5 w-5 ${statusStyles.textColor}`} />
              )}
            </div>
            <h3 id="modal-title" className={`text-xl font-semibold ${statusStyles.textColor}`}>
              {isEditing ? 'Edit Task' : 'Create New Task'}
            </h3>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-300"
            disabled={isSubmitting}
            aria-label="Close modal"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div id="modal-description" className="sr-only">
            {isEditing ? 'Edit the details of your task including title, description, status, priority, and due date.' : 'Create a new task by filling in the title, description, status, priority, and due date.'}
          </div>
          
          {/* Title Field */}
          <div>
            <label htmlFor="title" className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
              <Type className="h-4 w-4" />
              <span>Task Title *</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              disabled={isSubmitting}
              className={`input-field ${
                errors.title ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''
              }`}
              placeholder="What needs to be done?"
              autoFocus
            />
            {errors.title && (
              <p className="mt-2 text-sm text-red-600 flex items-center space-x-1">
                <span className="w-1 h-1 bg-red-600 rounded-full"></span>
                <span>{errors.title}</span>
              </p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              {formData.title.length}/100 characters
            </p>
          </div>

          {/* Description Field */}
          <div>
            <label htmlFor="description" className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
              <FileText className="h-4 w-4" />
              <span>Description</span>
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              disabled={isSubmitting}
              rows={3}
              className={`input-field resize-none ${
                errors.description ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''
              }`}
              placeholder="Add more details about this task..."
            />
            {errors.description && (
              <p className="mt-2 text-sm text-red-600 flex items-center space-x-1">
                <span className="w-1 h-1 bg-red-600 rounded-full"></span>
                <span>{errors.description}</span>
              </p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              {formData.description.length}/500 characters
            </p>
          </div>

          {/* Status and Priority Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Status Field */}
            <div>
              <label htmlFor="status" className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                <Flag className="h-4 w-4" />
                <span>Status</span>
              </label>
              <div className="relative">
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  className={`select-field text-center ${getStatusStyles(formData.status).bgColor} ${getStatusStyles(formData.status).borderColor} ${getStatusStyles(formData.status).textColor} ${getStatusStyles(formData.status).focusRing}`}
                  aria-label="Task status"
                >
                  <option value="TODO" className="py-3 bg-white text-gray-900 text-center">To Do</option>
                  <option value="IN_PROGRESS" className="py-3 bg-white text-gray-900 text-center">In Progress</option>
                  <option value="DONE" className="py-3 bg-white text-gray-900 text-center">Completed</option>
                </select>
              </div>
            </div>

            {/* Priority Field */}
            <div>
              <label htmlFor="priority" className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                <Flag className="h-4 w-4" />
                <span>Priority</span>
              </label>
              <div className="relative">
                <select
                  id="priority"
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  className={`select-field text-center ${getPriorityStyles(formData.priority).bgColor} ${getPriorityStyles(formData.priority).borderColor} ${getPriorityStyles(formData.priority).textColor} ${getPriorityStyles(formData.priority).focusRing}`}
                  aria-label="Task priority"
                >
                  <option value="LOW" className="py-3 bg-white text-gray-900 text-center">Low</option>
                  <option value="MEDIUM" className="py-3 bg-white text-gray-900 text-center">Medium</option>
                  <option value="HIGH" className="py-3 bg-white text-gray-900 text-center">High</option>
                </select>
              </div>
            </div>
          </div>

          {/* Due Date Field - Full Width */}
          <div>
            <label htmlFor="dueDate" className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
              <Calendar className="h-4 w-4" />
              <span>Due Date</span>
            </label>
            <input
              type="date"
              id="dueDate"
              name="dueDate"
              value={formData.dueDate}
              onChange={handleChange}
              disabled={isSubmitting}
              min={new Date().toISOString().split('T')[0]}
              className="input-field focus:ring-blue-500 focus:border-blue-500 w-full"
              aria-label="Task due date"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between space-x-4 pt-6 mt-6 border-t border-gray-100">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="btn btn-secondary btn-md w-full focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
              aria-label="Cancel and close modal"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !formData.title.trim()}
              className={`btn btn-md w-full relative transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                isEditing ? 'btn-primary' : 'btn-primary'
              }`}
              aria-label={isEditing ? 'Update task' : 'Create new task'}
            >
              {isSubmitting ? (
                <>
                  <div className="spinner w-4 h-4 mr-2"></div>
                  {isEditing ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                <>
                  {isEditing ? (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Update Task
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Task
                    </>
                  )}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;
