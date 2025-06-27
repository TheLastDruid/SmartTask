/**
 * Enhanced TasksScreen with filtering, search, and real-time updates
 * Based on frontend Dashboard functionality
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  Alert,
  TextInput,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Task, TaskStatus, TaskPriority } from '../../types';
import { apiService } from '../../services/apiService';
import { TaskForm } from '../../components/TaskForm';
import { useRealTimeTasks } from '../../hooks/useRealTime';

type FilterType = 'ALL' | TaskStatus;

interface TaskItemProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onStatusChange: (task: Task, newStatus: TaskStatus) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, onEdit, onDelete, onStatusChange }) => {
  const getPriorityColor = (priority: string) => {
    const taskPriority = priority as TaskPriority;
    switch (taskPriority) {
      case 'HIGH':
        return '#ef4444';
      case 'MEDIUM':
        return '#f59e0b';
      case 'LOW':
        return '#10b981';
      default:
        return '#6b7280';
    }
  };

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case 'TODO':
        return '#6b7280';
      case 'IN_PROGRESS':
        return '#3b82f6';
      case 'DONE':
        return '#10b981';
      default:
        return '#6b7280';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const isOverdue = (dueDateString?: string) => {
    if (!dueDateString) return false;
    const dueDate = new Date(dueDateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return dueDate < today && task.status !== 'DONE';
  };

  const showStatusOptions = () => {
    const statusOptions = [
      { label: 'To Do', value: 'TODO' as TaskStatus },
      { label: 'In Progress', value: 'IN_PROGRESS' as TaskStatus },
      { label: 'Done', value: 'DONE' as TaskStatus },
    ];

    Alert.alert(
      'Change Status',
      'Select new status:',
      [
        ...statusOptions.map(option => ({
          text: option.label,
          onPress: () => onStatusChange(task, option.value),
        })),
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const showActions = () => {
    Alert.alert(
      'Task Actions',
      `Actions for "${task.title}":`,
      [
        { text: 'Edit', onPress: () => onEdit(task) },
        { text: 'Change Status', onPress: showStatusOptions },
        { 
          text: 'Delete', 
          onPress: () => {
            Alert.alert(
              'Delete Task',
              `Are you sure you want to delete "${task.title}"?`,
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Delete', style: 'destructive', onPress: () => onDelete(task) },
              ]
            );
          },
          style: 'destructive'
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  return (
    <TouchableOpacity style={styles.taskItem} onPress={showActions}>
      <View style={styles.taskHeader}>
        <View style={styles.taskTitleRow}>
          <Text style={styles.taskTitle} numberOfLines={1}>
            {task.title}
          </Text>
          <View style={styles.taskMeta}>
            <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(task.priority) }]}>
              <Text style={styles.priorityText}>{task.priority}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(task.status) }]}>
              <Text style={styles.statusText}>{task.status.replace('_', ' ')}</Text>
            </View>
          </View>
        </View>
        
        {task.ticketNumber && (
          <Text style={styles.ticketNumber}>#{task.ticketNumber}</Text>
        )}
      </View>

      <Text style={styles.taskDescription} numberOfLines={2}>
        {task.description}
      </Text>

      <View style={styles.taskFooter}>
        {task.dueDate && (
          <View style={styles.dueDateContainer}>
            <Ionicons name="calendar-outline" size={16} color="#6b7280" />
            <Text style={[
              styles.dueDate,
              isOverdue(task.dueDate) && styles.overdue
            ]}>
              {formatDate(task.dueDate)}
            </Text>
          </View>
        )}
        
        <TouchableOpacity onPress={() => onEdit(task)}>
          <Ionicons name="pencil" size={20} color="#6b7280" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

export const TasksScreen: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<FilterType>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [taskFormLoading, setTaskFormLoading] = useState(false);

  // Real-time task updates
  const { 
    tasks: realTimeTasks, 
    lastUpdate, 
    setTasks: setRealTimeTasks
  } = useRealTimeTasks();

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const fetchedTasks = await apiService.getTasks();
      setTasks(fetchedTasks);
      setRealTimeTasks(fetchedTasks); // Initialize real-time tasks
    } catch (error) {
      console.error('Error fetching tasks:', error);
      Alert.alert('Error', 'Failed to fetch tasks. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [setRealTimeTasks]);

  // Merge real-time updates with local tasks
  useEffect(() => {
    if (realTimeTasks.length > 0) {
      setTasks(realTimeTasks);
    }
  }, [realTimeTasks, lastUpdate]);

  const filterTasks = useCallback(() => {
    let filtered = [...tasks];

    // Apply status filter
    if (filter !== 'ALL') {
      filtered = filtered.filter(task => task.status === filter);
    }

    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(searchLower) ||
        task.description?.toLowerCase().includes(searchLower) ||
        task.ticketNumber?.toString().includes(searchTerm)
      );
    }

    setFilteredTasks(filtered);
  }, [tasks, filter, searchTerm]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  useEffect(() => {
    filterTasks();
  }, [filterTasks]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchTasks();
    setRefreshing(false);
  };

  const handleCreateTask = async (taskData: any) => {
    try {
      setTaskFormLoading(true);
      const newTask = await apiService.createTask(taskData);
      setTasks(prev => [newTask, ...prev]);
      setShowTaskForm(false);
      Alert.alert('Success', 'Task created successfully!');
    } catch (error) {
      console.error('Error creating task:', error);
      Alert.alert('Error', 'Failed to create task. Please try again.');
    } finally {
      setTaskFormLoading(false);
    }
  };

  const handleUpdateTask = async (taskData: any) => {
    if (!editingTask) return;

    try {
      setTaskFormLoading(true);
      const updatedTask = await apiService.updateTask(editingTask.id, taskData);
      setTasks(prev => prev.map(task => 
        task.id === editingTask.id ? updatedTask : task
      ));
      setEditingTask(null);
      setShowTaskForm(false);
      Alert.alert('Success', 'Task updated successfully!');
    } catch (error) {
      console.error('Error updating task:', error);
      Alert.alert('Error', 'Failed to update task. Please try again.');
    } finally {
      setTaskFormLoading(false);
    }
  };

  const handleDeleteTask = async (task: Task) => {
    try {
      await apiService.deleteTask(task.id);
      setTasks(prev => prev.filter(t => t.id !== task.id));
      Alert.alert('Success', 'Task deleted successfully!');
    } catch (error) {
      console.error('Error deleting task:', error);
      Alert.alert('Error', 'Failed to delete task. Please try again.');
    }
  };

  const handleStatusChange = async (task: Task, newStatus: TaskStatus) => {
    try {
      const updatedTask = await apiService.updateTask(task.id, { status: newStatus });
      setTasks(prev => prev.map(t => 
        t.id === task.id ? updatedTask : t
      ));
    } catch (error) {
      console.error('Error updating task status:', error);
      Alert.alert('Error', 'Failed to update task status. Please try again.');
    }
  };

  const getFilterCount = (filterType: FilterType) => {
    if (filterType === 'ALL') return tasks.length;
    return tasks.filter(task => task.status === filterType).length;
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="clipboard-outline" size={64} color="#d1d5db" />
      <Text style={styles.emptyTitle}>
        {searchTerm || filter !== 'ALL' ? 'No tasks found' : 'No tasks yet'}
      </Text>
      <Text style={styles.emptyDescription}>
        {searchTerm || filter !== 'ALL' 
          ? 'Try adjusting your search or filter'
          : 'Create your first task to get started'
        }
      </Text>
      {!searchTerm && filter === 'ALL' && (
        <TouchableOpacity 
          style={styles.createFirstTaskButton}
          onPress={() => setShowTaskForm(true)}
        >
          <Text style={styles.createFirstTaskText}>Create First Task</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Tasks</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setShowTaskForm(true)}
        >
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={20} color="#6b7280" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search tasks..."
            value={searchTerm}
            onChangeText={setSearchTerm}
          />
          {searchTerm ? (
            <TouchableOpacity onPress={() => setSearchTerm('')}>
              <Ionicons name="close-circle" size={20} color="#6b7280" />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        {(['ALL', 'TODO', 'IN_PROGRESS', 'DONE'] as FilterType[]).map((filterType) => (
          <TouchableOpacity
            key={filterType}
            style={[
              styles.filterTab,
              filter === filterType && styles.activeFilterTab,
            ]}
            onPress={() => setFilter(filterType)}
          >
            <Text style={[
              styles.filterText,
              filter === filterType && styles.activeFilterText,
            ]}>
              {filterType === 'ALL' ? 'All' : filterType.replace('_', ' ')}
            </Text>
            <View style={[
              styles.filterCount,
              filter === filterType && styles.activeFilterCount,
            ]}>
              <Text style={[
                styles.filterCountText,
                filter === filterType && styles.activeFilterCountText,
              ]}>
                {getFilterCount(filterType)}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Task List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text style={styles.loadingText}>Loading tasks...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredTasks}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TaskItem
              task={item}
              onEdit={(task) => {
                setEditingTask(task);
                setShowTaskForm(true);
              }}
              onDelete={handleDeleteTask}
              onStatusChange={handleStatusChange}
            />
          )}
          contentContainerStyle={styles.taskList}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          ListEmptyComponent={renderEmptyState}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Task Form Modal */}
      <Modal
        visible={showTaskForm}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => {
          setShowTaskForm(false);
          setEditingTask(null);
        }}
      >
        <TaskForm
          task={editingTask || undefined}
          onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
          onCancel={() => {
            setShowTaskForm(false);
            setEditingTask(null);
          }}
          isLoading={taskFormLoading}
        />
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  addButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#374151',
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  filterTab: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginHorizontal: 4,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    gap: 4,
  },
  activeFilterTab: {
    backgroundColor: '#3b82f6',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  activeFilterText: {
    color: 'white',
  },
  filterCount: {
    backgroundColor: '#e5e7eb',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
  },
  activeFilterCount: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  filterCountText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
  },
  activeFilterCountText: {
    color: 'white',
  },
  taskList: {
    padding: 20,
    paddingBottom: 100,
  },
  taskItem: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  taskHeader: {
    marginBottom: 8,
  },
  taskTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    flex: 1,
    marginRight: 8,
  },
  taskMeta: {
    flexDirection: 'row',
    gap: 6,
  },
  priorityBadge: {
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '600',
    color: 'white',
  },
  statusBadge: {
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    color: 'white',
  },
  ticketNumber: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  taskDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    marginBottom: 8,
  },
  taskFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dueDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dueDate: {
    fontSize: 12,
    color: '#6b7280',
  },
  overdue: {
    color: '#ef4444',
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    gap: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    paddingHorizontal: 32,
    lineHeight: 24,
  },
  createFirstTaskButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
    marginTop: 8,
  },
  createFirstTaskText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
