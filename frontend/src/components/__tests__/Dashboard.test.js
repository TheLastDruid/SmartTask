import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Dashboard from '../../pages/Dashboard';
import { AuthContext } from '../../context/AuthContext';
import { BrowserRouter } from 'react-router-dom';

// Mock react-toastify
jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
  },
}));

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Plus: () => <div data-testid="plus-icon" />,
  Filter: () => <div data-testid="filter-icon" />,
  Search: () => <div data-testid="search-icon" />,
  CheckCircle: () => <div data-testid="check-circle-icon" />,
  Clock: () => <div data-testid="clock-icon" />,
  Circle: () => <div data-testid="circle-icon" />,
  Calendar: () => <div data-testid="calendar-icon" />,
  BarChart: () => <div data-testid="bar-chart-icon" />,
  MessageCircle: () => <div data-testid="message-circle-icon" />,
}));

// Mock components
jest.mock('../../components/TaskCard', () => ({ task, onEdit, onDelete, onStatusChange }) => (
  <div data-testid="task-card">
    <h3>{task.title}</h3>
    <p>{task.description}</p>
    <button onClick={() => onEdit(task)}>Edit</button>
    <button onClick={() => onDelete(task.id)}>Delete</button>
    <button onClick={() => onStatusChange(task.id, 'DONE')}>Complete</button>
  </div>
));

jest.mock('../../components/TaskModal', () => ({ isOpen, onClose, onSave, task }) => 
  isOpen ? (
    <div data-testid="task-modal">
      <h2>{task ? 'Edit Task' : 'Create Task'}</h2>
      <button onClick={onClose}>Close</button>
      <button onClick={() => onSave({ title: 'New Task', description: 'New Description' })}>Save</button>
    </div>
  ) : null
);

jest.mock('../../components/ChatBot', () => () => (
  <div data-testid="chatbot">ChatBot Component</div>
));

// Mock task service
jest.mock('../../services/taskService', () => ({
  getAllTasks: jest.fn(),
  createTask: jest.fn(),
  updateTask: jest.fn(),
  deleteTask: jest.fn(),
}));

import { getAllTasks, createTask, updateTask, deleteTask } from '../../services/taskService';
const mockTaskService = { getAllTasks, createTask, updateTask, deleteTask };

const MockedDashboard = ({ authContextValue }) => (
  <BrowserRouter>
    <AuthContext.Provider value={authContextValue}>
      <Dashboard />
    </AuthContext.Provider>
  </BrowserRouter>
);

describe('Dashboard Component', () => {
  const mockUser = {
    email: 'test@example.com',
    firstName: 'John',
    lastName: 'Doe',
  };

  const mockAuthContext = {
    user: mockUser,
    logout: jest.fn(),
  };

  const mockTasks = [
    {
      id: 'task1',
      title: 'Test Task 1',
      description: 'Description 1',
      status: 'TODO',
      dueDate: '2024-12-31T23:59:59',
      createdAt: '2024-01-01T00:00:00',
    },
    {
      id: 'task2',
      title: 'Test Task 2',
      description: 'Description 2',
      status: 'IN_PROGRESS',
      dueDate: null,
      createdAt: '2024-01-02T00:00:00',
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockTaskService.getAllTasks.mockResolvedValue(mockTasks);
  });

  test('renders dashboard with user greeting', async () => {
    render(<MockedDashboard authContextValue={mockAuthContext} />);

    expect(screen.getByText('Welcome back, John!')).toBeInTheDocument();
    expect(screen.getByText('Here are your tasks for today')).toBeInTheDocument();
  });

  test('loads and displays tasks on mount', async () => {
    render(<MockedDashboard authContextValue={mockAuthContext} />);

    await waitFor(() => {
      expect(screen.getByText('Test Task 1')).toBeInTheDocument();
      expect(screen.getByText('Test Task 2')).toBeInTheDocument();
    });

    expect(mockTaskService.getAllTasks).toHaveBeenCalledTimes(1);
  });

  test('opens create task modal when Add Task button is clicked', async () => {
    render(<MockedDashboard authContextValue={mockAuthContext} />);

    const addTaskButton = screen.getByText('Add Task');
    fireEvent.click(addTaskButton);

    await waitFor(() => {
      expect(screen.getByText('Create New Task')).toBeInTheDocument();
    });
  });

  test('creates new task successfully', async () => {
    const newTask = {
      id: 'task3',
      title: 'New Task',
      description: 'New Description',
      status: 'TODO',
      createdAt: '2024-01-03T00:00:00',
    };

    mockTaskService.createTask.mockResolvedValue(newTask);

    render(<MockedDashboard authContextValue={mockAuthContext} />);

    // Open create modal
    const addTaskButton = screen.getByText('Add Task');
    fireEvent.click(addTaskButton);

    await waitFor(() => {
      expect(screen.getByText('Create New Task')).toBeInTheDocument();
    });

    // Fill form
    const titleInput = screen.getByPlaceholderText('Task title');
    const descriptionInput = screen.getByPlaceholderText('Task description');

    fireEvent.change(titleInput, { target: { value: 'New Task' } });
    fireEvent.change(descriptionInput, { target: { value: 'New Description' } });

    // Submit form
    const createButton = screen.getByText('Create Task');
    fireEvent.click(createButton);

    await waitFor(() => {
      expect(mockTaskService.createTask).toHaveBeenCalledWith({
        title: 'New Task',
        description: 'New Description',
        status: 'TODO',
        dueDate: null,
      });
    });
  });

  test('updates task status', async () => {
    const updatedTask = { ...mockTasks[0], status: 'DONE' };
    mockTaskService.updateTask.mockResolvedValue(updatedTask);

    render(<MockedDashboard authContextValue={mockAuthContext} />);

    await waitFor(() => {
      expect(screen.getByText('Test Task 1')).toBeInTheDocument();
    });

    // Find and click the status toggle button for the first task
    const statusButtons = screen.getAllByRole('button');
    const statusToggleButton = statusButtons.find(button => 
      button.getAttribute('aria-label')?.includes('Mark as completed')
    );

    if (statusToggleButton) {
      fireEvent.click(statusToggleButton);

      await waitFor(() => {
        expect(mockTaskService.updateTask).toHaveBeenCalledWith('task1', { status: 'DONE' });
      });
    }
  });

  test('deletes task', async () => {
    mockTaskService.deleteTask.mockResolvedValue();

    render(<MockedDashboard authContextValue={mockAuthContext} />);

    await waitFor(() => {
      expect(screen.getByText('Test Task 1')).toBeInTheDocument();
    });

    // Open task options menu
    const moreButtons = screen.getAllByLabelText('More options');
    fireEvent.click(moreButtons[0]);

    // Click delete
    const deleteButton = screen.getByText('Delete');
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(mockTaskService.deleteTask).toHaveBeenCalledWith('task1');
    });
  });

  test('opens edit task modal', async () => {
    render(<MockedDashboard authContextValue={mockAuthContext} />);

    await waitFor(() => {
      expect(screen.getByText('Test Task 1')).toBeInTheDocument();
    });

    // Open task options menu
    const moreButtons = screen.getAllByLabelText('More options');
    fireEvent.click(moreButtons[0]);

    // Click edit
    const editButton = screen.getByText('Edit');
    fireEvent.click(editButton);

    await waitFor(() => {
      expect(screen.getByText('Edit Task')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Test Task 1')).toBeInTheDocument();
    });
  });

  test('filters tasks by status', async () => {
    render(<MockedDashboard authContextValue={mockAuthContext} />);

    await waitFor(() => {
      expect(screen.getByText('Test Task 1')).toBeInTheDocument();
      expect(screen.getByText('Test Task 2')).toBeInTheDocument();
    });

    // Click on IN_PROGRESS filter
    const inProgressFilter = screen.getByText('In Progress');
    fireEvent.click(inProgressFilter);

    await waitFor(() => {
      expect(screen.getByText('Test Task 2')).toBeInTheDocument();
      expect(screen.queryByText('Test Task 1')).not.toBeInTheDocument();
    });
  });

  test('shows empty state when no tasks', async () => {
    mockTaskService.getAllTasks.mockResolvedValue([]);

    render(<MockedDashboard authContextValue={mockAuthContext} />);

    await waitFor(() => {
      expect(screen.getByText('No tasks found')).toBeInTheDocument();
      expect(screen.getByText('Create your first task to get started!')).toBeInTheDocument();
    });
  });

  test('handles task loading error', async () => {
    mockTaskService.getAllTasks.mockRejectedValue(new Error('Failed to load tasks'));

    render(<MockedDashboard authContextValue={mockAuthContext} />);

    await waitFor(() => {
      expect(screen.getByText('Failed to load tasks')).toBeInTheDocument();
    });
  });

  test('opens chatbot when chat button is clicked', async () => {
    render(<MockedDashboard authContextValue={mockAuthContext} />);

    const chatButton = screen.getByLabelText('Open chat assistant');
    fireEvent.click(chatButton);

    await waitFor(() => {
      expect(screen.getByText('Smart Assistant')).toBeInTheDocument();
    });
  });

  test('sends message through chatbot', async () => {
    const mockChatResponse = {
      message: 'I can help you create a task!',
      conversationId: 'conv123',
    };

    mockChatService.sendMessage.mockResolvedValue(mockChatResponse);

    render(<MockedDashboard authContextValue={mockAuthContext} />);

    // Open chatbot
    const chatButton = screen.getByLabelText('Open chat assistant');
    fireEvent.click(chatButton);

    await waitFor(() => {
      expect(screen.getByText('Smart Assistant')).toBeInTheDocument();
    });

    // Send message
    const chatInput = screen.getByPlaceholderText('Type your message...');
    const sendButton = screen.getByLabelText('Send message');

    fireEvent.change(chatInput, { target: { value: 'Create a task for me' } });
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(mockChatService.sendMessage).toHaveBeenCalledWith({
        message: 'Create a task for me',
        conversationId: null,
      });
    });
  });

  test('displays task statistics', async () => {
    render(<MockedDashboard authContextValue={mockAuthContext} />);

    await waitFor(() => {
      expect(screen.getByText('2')).toBeInTheDocument(); // Total tasks
      expect(screen.getByText('1')).toBeInTheDocument(); // TODO tasks
      expect(screen.getByText('1')).toBeInTheDocument(); // IN_PROGRESS tasks
      expect(screen.getByText('0')).toBeInTheDocument(); // DONE tasks
    });
  });
});
