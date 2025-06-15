import React, { useState, useEffect } from 'react';
import { X, Plus, Save, Calendar, Type, FileText, Flag } from 'lucide-react';

const TaskModal = ({ isOpen, onClose, onSubmit, task, isEditing }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'TODO',
    dueDate: '',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        title: task?.title || '',
        description: task?.description || '',
        status: task?.status || 'TODO',
        dueDate: task?.dueDate ? task.dueDate.split('T')[0] : '',
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
      console.error('Error submitting task:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      title: '',
      description: '',
      status: 'TODO',
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

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden scale-in">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              {isEditing ? (
                <Save className="h-5 w-5 text-blue-600" />
              ) : (
                <Plus className="h-5 w-5 text-blue-600" />
              )}
            </div>
            <h3 className="text-xl font-semibold text-gray-900">
              {isEditing ? 'Edit Task' : 'Create New Task'}
            </h3>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            disabled={isSubmitting}
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
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
              rows={4}
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

          {/* Status and Due Date Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Status Field */}
            <div>
              <label htmlFor="status" className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                <Flag className="h-4 w-4" />
                <span>Status</span>
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                disabled={isSubmitting}
                className="input-field"
              >
                <option value="TODO">To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="DONE">Completed</option>
              </select>
            </div>

            {/* Due Date Field */}
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
                className="input-field"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-100">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="btn btn-secondary btn-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !formData.title.trim()}
              className="btn btn-primary btn-md relative"
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
