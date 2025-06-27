import React, { useState } from 'react';
import { 
  Edit3, 
  Trash2, 
  Calendar,
  MoreVertical
} from 'lucide-react';
import Logger from '../utils/logger';

const TaskCard = ({ task, onEdit, onDelete, onStatusChange }) => {
  const [showDropdown, setShowDropdown] = useState(false);

  const getPriorityConfig = (priority) => {
    switch (priority?.toUpperCase()) {
      case 'HIGH':
        return {
          color: 'bg-red-50 text-red-800 border-red-300 ring-red-100',
          bgColor: 'bg-red-50',
          borderColor: 'border-l-red-500',
          label: 'High Priority',
          icon: '🔴',
          accessibilityLabel: 'High priority task'
        };
      case 'MEDIUM':
        return {
          color: 'bg-amber-50 text-amber-800 border-amber-300 ring-amber-100',
          bgColor: 'bg-amber-50',
          borderColor: 'border-l-amber-500',
          label: 'Medium Priority', 
          icon: '🟡',
          accessibilityLabel: 'Medium priority task'
        };
      case 'LOW':
        return {
          color: 'bg-emerald-50 text-emerald-800 border-emerald-300 ring-emerald-100',
          bgColor: 'bg-emerald-50',
          borderColor: 'border-l-emerald-500',
          label: 'Low Priority',
          icon: '🟢',
          accessibilityLabel: 'Low priority task'
        };
      default:
        return {
          color: 'bg-slate-50 text-slate-700 border-slate-300 ring-slate-100',
          bgColor: 'bg-slate-50',
          borderColor: 'border-l-slate-400',
          label: 'Medium Priority',
          icon: '⚪',
          accessibilityLabel: 'Medium priority task'
        };
    }
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case 'TODO':
        return {
          bgColor: 'bg-blue-50',
          borderColor: 'border-l-blue-500',
          textColor: 'text-blue-900',
          statusBadge: 'bg-blue-100 text-blue-800 border-blue-200',
          accessibilityLabel: 'To do task'
        };
      case 'IN_PROGRESS':
        return {
          bgColor: 'bg-purple-50',
          borderColor: 'border-l-purple-500',
          textColor: 'text-purple-900',
          statusBadge: 'bg-purple-100 text-purple-800 border-purple-200',
          accessibilityLabel: 'In progress task'
        };
      case 'DONE':
        return {
          bgColor: 'bg-emerald-50',
          borderColor: 'border-l-emerald-500',
          textColor: 'text-emerald-900',
          statusBadge: 'bg-emerald-100 text-emerald-800 border-emerald-200',
          accessibilityLabel: 'Completed task'
        };
      default:
        return {
          bgColor: 'bg-slate-50',
          borderColor: 'border-l-slate-400',
          textColor: 'text-slate-900',
          statusBadge: 'bg-slate-100 text-slate-800 border-slate-200',
          accessibilityLabel: 'Unknown status task'
        };
    }
  };

  const getDueDateConfig = (dueDate) => {
    if (!dueDate) return null;
    
    const isTaskOverdue = isOverdue(dueDate);
    const today = new Date();
    let taskDate;
    
    try {
      if (Array.isArray(dueDate)) {
        const [year, month, day] = dueDate;
        taskDate = new Date(year, month - 1, day);
      } else {
        taskDate = new Date(dueDate);
      }
      
      const diffTime = taskDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (isTaskOverdue) {
        return {
          color: 'bg-red-100 text-red-800 border-red-300',
          icon: '⚠️',
          label: `Overdue`,
          accessibilityLabel: 'Overdue task'
        };
      } else if (diffDays <= 1) {
        return {
          color: 'bg-orange-100 text-orange-800 border-orange-300',
          icon: '⏰',
          label: diffDays === 0 ? 'Due today' : 'Due tomorrow',
          accessibilityLabel: diffDays === 0 ? 'Due today' : 'Due tomorrow'
        };
      } else if (diffDays <= 3) {
        return {
          color: 'bg-yellow-100 text-yellow-800 border-yellow-300',
          icon: '📅',
          label: 'Due soon',
          accessibilityLabel: 'Due soon'
        };
      } else {
        return {
          color: 'bg-blue-100 text-blue-800 border-blue-300',
          icon: '📋',
          label: 'Upcoming',
          accessibilityLabel: 'Upcoming task'
        };
      }
    } catch {
      return {
        color: 'bg-gray-100 text-gray-800 border-gray-300',
        icon: '❓',
        label: 'Unknown',
        accessibilityLabel: 'Unknown due date'
      };
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return null;
    
    try {
      let date;
      
      if (dateString instanceof Date) {
        date = dateString;
      } else if (typeof dateString === 'string') {
        date = new Date(dateString);
      } else if (Array.isArray(dateString)) {
        const [year, month, day, hour = 0, minute = 0, second = 0] = dateString;
        date = new Date(year, month - 1, day, hour, minute, second);
      } else {
        date = new Date(dateString);
      }
      
      if (isNaN(date.getTime())) {
        Logger.warn('Invalid date:', dateString);
        return 'Invalid Date';
      }
      
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
      });
    } catch (error) {
      Logger.error('Error formatting date:', error, dateString);
      return 'Invalid Date';
    }
  };

  const isOverdue = (dueDate) => {
    if (!dueDate) return false;
    try {
      let date;
      if (Array.isArray(dueDate)) {
        const [year, month, day] = dueDate;
        date = new Date(year, month - 1, day);
      } else {
        date = new Date(dueDate);
      }
      return date < new Date() && task.status !== 'DONE';
    } catch {
      return false;
    }
  };

  const priorityConfig = getPriorityConfig(task.priority);
  const statusConfig = getStatusConfig(task.status);
  const dueDateConfig = getDueDateConfig(task.dueDate);

  return (
    <div className="w-full">
      <div className={`bg-white rounded-xl shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${statusConfig.borderColor} border-l-4 min-h-[300px] ${statusConfig.bgColor}`}>
        <div className="p-6 h-full flex flex-col">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start space-x-3 flex-1 min-w-0">
              <div className="flex-1 min-w-0">
                <h3 className={`text-lg font-semibold transition-all duration-200 leading-tight break-words ${statusConfig.textColor}`} 
                    aria-level="3"
                    aria-label={`${task.title} - ${statusConfig.accessibilityLabel}`}>
                  {task.title}
                </h3>
              </div>
            </div>
            <div className="relative flex-shrink-0">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
                aria-label="Task options menu"
                aria-expanded={showDropdown}
                aria-haspopup="true"
              >
                <MoreVertical className="h-4 w-4" />
              </button>
              {showDropdown && (
                <>
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setShowDropdown(false)}
                    aria-hidden="true"
                  />
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-20" role="menu">
                    <button
                      onClick={() => {
                        onEdit(task);
                        setShowDropdown(false);
                      }}
                      className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150 focus:outline-none focus:bg-gray-50"
                      role="menuitem"
                      aria-label={`Edit task ${task.title}`}
                    >
                      <Edit3 className="h-4 w-4" />
                      <span>Edit Task</span>
                    </button>
                    <button
                      onClick={() => {
                        onDelete(task.id);
                        setShowDropdown(false);
                      }}
                      className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-150 focus:outline-none focus:bg-red-50"
                      role="menuitem"
                      aria-label={`Delete task ${task.title}`}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span>Delete Task</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
          {task.description && (
            <div className="mb-4 flex-grow">
              <p className="text-sm leading-relaxed transition-all duration-200 break-words text-gray-600">
                {task.description}
              </p>
            </div>
          )}
          
          {/* Priority and Due Date Section */}
          <div className="mb-4 space-y-3">
            {/* Priority Display */}
            {task.priority && (
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-500 font-medium">Priority:</span>
                <span className={`text-xs px-3 py-1 rounded-full border font-medium ${priorityConfig.color}`}
                      role="status"
                      aria-label={priorityConfig.accessibilityLabel}>
                  <span className="mr-1" aria-hidden="true">{priorityConfig.icon}</span>
                  {priorityConfig.label}
                </span>
              </div>
            )}
            
            {/* Due Date Display */}
            {task.dueDate && dueDateConfig && (
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-gray-400" aria-hidden="true" />
                <span className="text-xs text-gray-500 font-medium">Due:</span>
                <span className={`text-xs px-3 py-1 rounded-full border font-medium ${dueDateConfig.color}`}
                      role="status"
                      aria-label={dueDateConfig.accessibilityLabel}>
                  <span className="mr-1" aria-hidden="true">{dueDateConfig.icon}</span>
                  {formatDate(task.dueDate)}
                </span>
              </div>
            )}
          </div>
          
          <div className="mt-auto">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-gray-500 font-medium">Status:</span>
              <select
                value={task.status}
                onChange={(e) => onStatusChange(task.id, e.target.value)}
                className={`text-xs border rounded-md px-3 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 font-medium ${statusConfig.statusBadge}`}
                aria-label={`Change status for task ${task.title}. Current status: ${statusConfig.accessibilityLabel}`}
              >
                <option value="TODO">📋 To Do</option>
                <option value="IN_PROGRESS">⏳ In Progress</option>
                <option value="DONE">✅ Completed</option>
              </select>
            </div>
            <div className="text-xs text-gray-400 flex items-center justify-between pt-2 border-t border-gray-100">
              <span>Created {formatDate(task.createdAt)}</span>
              {task.updatedAt && task.updatedAt !== task.createdAt && (
                <span>Updated {formatDate(task.updatedAt)}</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
