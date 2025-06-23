import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { Plus, Filter, Search, CheckCircle2, Clock, Circle, Loader2, Wifi, WifiOff } from 'lucide-react';
import Navbar from '../components/Navbar';
import TaskCard from '../components/TaskCard';
import TaskModal from '../components/TaskModal';
import ChatBot from '../components/ChatBot';
import WebSocketDebugger from '../components/WebSocketDebugger';
import { taskService } from '../services/taskService';
import { useRealTimeTasks } from '../hooks/useRealTimeTasks';

const Dashboard = () => {
  const [initialTasks, setInitialTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [filter, setFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [showDebugger, setShowDebugger] = useState(false);
  // Use real-time tasks hook
  const { tasks, setTasks, isConnected } = useRealTimeTasks(initialTasks);

  const filterTasks = useCallback(() => {
    let filtered = [...tasks];

    // Apply status filter
    if (filter !== 'ALL') {
      filtered = filtered.filter(task => task.status === filter);
    }

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredTasks(filtered);  }, [tasks, filter, searchTerm]);

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const response = await taskService.getAllTasks();
      setInitialTasks(response.data);
      setTasks(response.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast.error('Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  }, [setTasks]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);
  useEffect(() => {
    filterTasks();
  }, [tasks, filter, searchTerm, filterTasks]);

  const handleCreateTask = async (taskData) => {
    try {
      const response = await taskService.createTask(taskData);
      setTasks(prev => [response.data, ...prev]);
      toast.success('Task created successfully!');
    } catch (error) {
      console.error('Error creating task:', error);
      toast.error('Failed to create task');
    }
  };

  const handleEditTask = async (taskData) => {
    try {
      const response = await taskService.updateTask(editingTask.id, taskData);
      setTasks(prev => prev.map(task => 
        task.id === editingTask.id ? response.data : task
      ));
      toast.success('Task updated successfully!');
      setEditingTask(null);
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error('Failed to update task');
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) {
      return;
    }

    try {
      await taskService.deleteTask(taskId);
      setTasks(prev => prev.filter(task => task.id !== taskId));
      toast.success('Task deleted successfully!');
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('Failed to delete task');
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const task = tasks.find(t => t.id === taskId);
      const response = await taskService.updateTask(taskId, { ...task, status: newStatus });
      setTasks(prev => prev.map(t => 
        t.id === taskId ? response.data : t
      ));
      toast.success('Task status updated!');
    } catch (error) {
      console.error('Error updating task status:', error);
      toast.error('Failed to update task status');
    }
  };

  const openCreateModal = () => {
    setEditingTask(null);
    setIsModalOpen(true);
  };

  const openEditModal = (task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTask(null);
  };
  const getTaskStats = () => {
    const total = tasks.length;
    const completed = tasks.filter(task => task.status === 'DONE').length;
    const inProgress = tasks.filter(task => task.status === 'IN_PROGRESS').length;
    const todo = tasks.filter(task => task.status === 'TODO').length;
    
    return { total, completed, inProgress, todo };
  };

  const toggleDebugger = () => {
    setShowDebugger(prev => !prev);
  };

  const stats = getTaskStats();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar onToggleDebugger={toggleDebugger} />
        <div className="flex items-center justify-center h-96">
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
            <p className="text-gray-600 font-medium">Loading your tasks...</p>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navbar onToggleDebugger={toggleDebugger} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="text-center mb-12">          <div className="flex flex-col sm:flex-row items-center justify-center mb-6 space-y-4 sm:space-y-0 sm:space-x-4">
            <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent fade-in">
              My Task Dashboard
            </h1>
            {/* Real-time connection status - only show when debug mode is active */}
            {showDebugger && (
              <div className={`flex items-center px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 shadow-sm ${
                isConnected 
                  ? 'bg-green-100 text-green-800 border border-green-200' 
                  : 'bg-red-100 text-red-800 border border-red-200'
              }`}>
                {isConnected ? (
                  <>
                    <Wifi className="h-4 w-4 mr-2" />
                    Live Updates
                  </>
                ) : (
                  <>
                    <WifiOff className="h-4 w-4 mr-2" />
                    Offline
                  </>
                )}
              </div>
            )}
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto fade-in leading-relaxed">
            Stay organized and productive with your intelligent task manager
          </p>
        </div>        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card p-6 scale-in bg-gradient-to-br from-white to-gray-50 hover:shadow-xl">
            <div className="flex items-center">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 shadow-sm">
                <Circle className="h-6 w-6 text-gray-600" />
              </div>
              <div className="ml-4">
                <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                <p className="text-sm text-gray-600 font-medium">Total Tasks</p>
              </div>
            </div>
          </div>

          <div className="card p-6 scale-in bg-gradient-to-br from-white to-blue-50 hover:shadow-xl" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-100 to-blue-200 shadow-sm">
                <Circle className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-3xl font-bold text-gray-900">{stats.todo}</p>
                <p className="text-sm text-gray-600 font-medium">To Do</p>
              </div>
            </div>
          </div>

          <div className="card p-6 scale-in bg-gradient-to-br from-white to-yellow-50 hover:shadow-xl" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-yellow-100 to-yellow-200 shadow-sm">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-3xl font-bold text-gray-900">{stats.inProgress}</p>
                <p className="text-sm text-gray-600 font-medium">In Progress</p>
              </div>
            </div>
          </div>

          <div className="card p-6 scale-in bg-gradient-to-br from-white to-green-50 hover:shadow-xl" style={{ animationDelay: '0.3s' }}>
            <div className="flex items-center">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-green-100 to-green-200 shadow-sm">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-3xl font-bold text-gray-900">{stats.completed}</p>
                <p className="text-sm text-gray-600 font-medium">Completed</p>
              </div>
            </div>
          </div>
        </div>        {/* Add Task Button */}
        <div className="text-center mb-8">
          <button
            onClick={openCreateModal}
            className="btn btn-primary btn-lg inline-flex items-center space-x-3 scale-in shadow-lg hover:shadow-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
            style={{ animationDelay: '0.4s' }}
          >
            <Plus className="h-5 w-5" />
            <span>Add New Task</span>
          </button>
        </div>        {/* Filter and Search Section */}
        <div className="card p-6 mb-8 slide-up shadow-lg bg-gradient-to-r from-white to-gray-50" style={{ animationDelay: '0.5s' }}>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-6">
            {/* Filter Dropdown */}
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Filter className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex items-center space-x-3">
                <label htmlFor="filter" className="text-sm font-semibold text-gray-700">
                  Filter:
                </label>
                <select
                  id="filter"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="input-field py-2 w-auto min-w-36 border-gray-300 rounded-lg shadow-sm"
                >
                  <option value="ALL">All Tasks</option>
                  <option value="TODO">To Do</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="DONE">Completed</option>
                </select>
              </div>
            </div>
            
            {/* Search Input */}
            <div className="flex items-center space-x-4 flex-1 max-w-md lg:max-w-lg">
              <div className="p-2 bg-gray-100 rounded-lg">
                <Search className="h-5 w-5 text-gray-600" />
              </div>
              <input
                type="text"
                id="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search tasks..."
                className="input-field flex-1 border-gray-300 rounded-lg shadow-sm"
              />
            </div>
          </div>
        </div>

        {/* Tasks Grid */}
        {filteredTasks.length === 0 ? (
          <div className="text-center py-16 slide-up" style={{ animationDelay: '0.6s' }}>
            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
              <Circle className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No tasks found</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              {searchTerm || filter !== 'ALL' 
                ? 'Try adjusting your search or filter criteria to find what you\'re looking for.'
                : 'You\'re all caught up! Create your first task to get started with your productivity journey.'
              }
            </p>
            {!searchTerm && filter === 'ALL' && (
              <button
                onClick={openCreateModal}
                className="btn btn-primary btn-md inline-flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Create Your First Task</span>
              </button>
            )}
          </div>        ) : (
          <div className="w-full px-4">
            <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredTasks.map((task, index) => (
                <div key={task.id} className="slide-up" style={{ animationDelay: `${0.6 + index * 0.05}s` }}>
                  <TaskCard
                    task={task}
                    onEdit={openEditModal}
                    onDelete={handleDeleteTask}
                    onStatusChange={handleStatusChange}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>      {/* Task Modal */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSubmit={editingTask ? handleEditTask : handleCreateTask}
        task={editingTask}
        isEditing={!!editingTask}
      />      {/* ChatBot - Available for authenticated users on dashboard */}
      <ChatBot />
      
      {/* WebSocket Debugger - Temporary for debugging */}
      <WebSocketDebugger 
        isVisible={showDebugger} 
        onClose={() => setShowDebugger(false)} 
      />
    </div>
  );
};

export default Dashboard;
