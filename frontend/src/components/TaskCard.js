import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  Edit3, 
  Trash2, 
  Calendar,
  MoreVertical,
  CheckCircle
} from 'lucide-react';

const TaskCard = ({ task, onEdit, onDelete, onStatusChange }) => {
  const [showDropdown, setShowDropdown] = useState(false);

  const getStatusConfig = (status) => {
    switch (status) {
      case 'TODO':
        return {
          color: 'bg-gray-100 text-gray-700 border-gray-200',
          icon: Circle,
          iconColor: 'text-gray-500',
          bgColor: 'bg-gray-50'
        };
      case 'IN_PROGRESS':
        return {
          color: 'bg-blue-100 text-blue-700 border-blue-200',
          icon: Clock,
          iconColor: 'text-blue-500',
          bgColor: 'bg-blue-50'
        };
      case 'DONE':
        return {
          color: 'bg-green-100 text-green-700 border-green-200',
          icon: CheckCircle2,
          iconColor: 'text-green-500',
          bgColor: 'bg-green-50'
        };
      default:
        return {
          color: 'bg-gray-100 text-gray-700 border-gray-200',
          icon: Circle,
          iconColor: 'text-gray-500',
          bgColor: 'bg-gray-50'
        };
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'TODO':
        return 'To Do';
      case 'IN_PROGRESS':
        return 'In Progress';
      case 'DONE':
        return 'Completed';
      default:
        return status;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
    });
  };

  const isOverdue = (dueDate) => {
    if (!dueDate) return false;
    const today = new Date();
    const due = new Date(dueDate);
    today.setHours(0, 0, 0, 0);
    due.setHours(0, 0, 0, 0);
    return due < today && task.status !== 'DONE';
  };

  const statusConfig = getStatusConfig(task.status);
  const StatusIcon = statusConfig.icon;
  const isCompleted = task.status === 'DONE';

  const handleStatusToggle = () => {
    const newStatus = task.status === 'DONE' ? 'TODO' : 'DONE';
    onStatusChange(task.id, newStatus);
  };

  return (
    <div className={`card p-6 group hover:shadow-lg transition-all duration-300 border-l-4 ${
      isCompleted ? 'border-l-green-500 bg-green-50/30' : 
      task.status === 'IN_PROGRESS' ? 'border-l-blue-500' : 'border-l-gray-300'
    }`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start space-x-3 flex-1">
          {/* Status Toggle Button */}
          <button
            onClick={handleStatusToggle}
            className={`flex-shrink-0 mt-1 p-1 rounded-full transition-all duration-200 hover:scale-110 ${
              isCompleted 
                ? 'text-green-600 hover:bg-green-100' 
                : 'text-gray-400 hover:bg-gray-100 hover:text-green-500'
            }`}
            title={isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
          >
            {isCompleted ? (
              <CheckCircle2 className="h-5 w-5" />
            ) : (
              <Circle className="h-5 w-5" />
            )}
          </button>

          {/* Title */}
          <div className="flex-1 min-w-0">
            <h3 className={`text-lg font-semibold transition-all duration-200 ${
              isCompleted 
                ? 'text-gray-500 line-through' 
                : 'text-gray-900 group-hover:text-blue-600'
            }`}>
              {task.title}
            </h3>
          </div>
        </div>

        {/* Actions Dropdown */}
        <div className="relative flex-shrink-0">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors duration-200 opacity-0 group-hover:opacity-100"
          >
            <MoreVertical className="h-4 w-4" />
          </button>

          {showDropdown && (
            <>
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setShowDropdown(false)}
              />
              <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-20">
                <button
                  onClick={() => {
                    onEdit(task);
                    setShowDropdown(false);
                  }}
                  className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150"
                >
                  <Edit3 className="h-4 w-4" />
                  <span>Edit Task</span>
                </button>
                <button
                  onClick={() => {
                    onDelete(task.id);
                    setShowDropdown(false);
                  }}
                  className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-150"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Delete Task</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Description */}
      {task.description && (
        <p className={`text-sm mb-4 leading-relaxed transition-all duration-200 ${
          isCompleted ? 'text-gray-400' : 'text-gray-600'
        }`}>
          {task.description}
        </p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        {/* Status Badge */}
        <div className="flex items-center space-x-2">
          <StatusIcon className={`h-4 w-4 ${statusConfig.iconColor}`} />
          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusConfig.color}`}>
            {getStatusText(task.status)}
          </span>
        </div>

        {/* Due Date */}
        {task.dueDate && (
          <div className={`flex items-center space-x-1 text-xs ${
            isOverdue(task.dueDate) && !isCompleted
              ? 'text-red-600 font-medium' 
              : isCompleted 
                ? 'text-gray-400'
                : 'text-gray-500'
          }`}>
            <Calendar className="h-3 w-3" />
            <span>
              {formatDate(task.dueDate)}
              {isOverdue(task.dueDate) && !isCompleted && ' (Overdue)'}
            </span>
          </div>
        )}
      </div>

      {/* Status Change Dropdown */}
      <div className="mt-4 pt-3 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">Status:</span>
          <select
            value={task.status}
            onChange={(e) => onStatusChange(task.id, e.target.value)}
            className="text-xs border border-gray-200 rounded-lg px-3 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
          >
            <option value="TODO">To Do</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="DONE">Completed</option>
          </select>
        </div>
      </div>

      {/* Metadata */}
      <div className="mt-3 text-xs text-gray-400 flex items-center justify-between">
        <span>Created {formatDate(task.createdAt)}</span>
        {task.updatedAt && task.updatedAt !== task.createdAt && (
          <span>Updated {formatDate(task.updatedAt)}</span>
        )}
      </div>
    </div>
  );
};

export default TaskCard;
