import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  Edit3, 
  Trash2, 
  Calendar,
  MoreVertical
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
        return 'Unknown';
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
        console.warn('Invalid date:', dateString);
        return 'Invalid Date';
      }
      
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
      });
    } catch (error) {
      console.error('Error formatting date:', error, dateString);
      return 'Invalid Date';
    }
  };

  const isCompleted = task.status === 'DONE';

  return (
    <div className="w-full">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border-l-4 min-h-[300px]">
        <div className="p-6 h-full flex flex-col">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start space-x-3 flex-1 min-w-0">
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold transition-all duration-200 leading-tight break-words text-gray-900">
                  {task.title}
                </h3>
              </div>
            </div>
            <div className="relative flex-shrink-0">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors duration-200"
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
          {task.description && (
            <div className="mb-4 flex-grow">
              <p className="text-sm leading-relaxed transition-all duration-200 break-words text-gray-600">
                {task.description}
              </p>
            </div>
          )}
          <div className="mt-auto">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-gray-500">Status:</span>
              <select
                value={task.status}
                onChange={(e) => onStatusChange(task.id, e.target.value)}
                className="text-xs border border-gray-200 rounded-md px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
              >
                <option value="TODO">To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="DONE">Completed</option>
              </select>
            </div>
            <div className="text-xs text-gray-400 flex items-center justify-between pt-2 border-t border-gray-50">
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
