import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import Login from '../../pages/Login';
import { AuthContext } from '../../context/AuthContext';

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
  CheckSquare: () => <div data-testid="check-square-icon" />,
  Mail: () => <div data-testid="mail-icon" />,
  Lock: () => <div data-testid="lock-icon" />,
  Eye: () => <div data-testid="eye-icon" />,
  EyeOff: () => <div data-testid="eye-off-icon" />,
  ArrowRight: () => <div data-testid="arrow-right-icon" />,
}));

const MockedLogin = ({ authContextValue }) => (
  <BrowserRouter>
    <AuthContext.Provider value={authContextValue}>
      <Login />
    </AuthContext.Provider>
  </BrowserRouter>
);

describe('Login Component', () => {
  const mockLogin = jest.fn();
  const mockAuthContext = {
    login: mockLogin,
    user: null,
    loading: false,
    isAuthenticated: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders login form', () => {
    render(<MockedLogin authContextValue={mockAuthContext} />);
    
    expect(screen.getByText('Welcome back')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter your email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter your password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });
  test('handles form submission with valid data', async () => {
    mockLogin.mockResolvedValue({ success: true });
    
    render(<MockedLogin authContextValue={mockAuthContext} />);
    
    const emailInput = screen.getByPlaceholderText('Enter your email');
    const passwordInput = screen.getByPlaceholderText('Enter your password');
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
    });
  });

  test('shows validation errors for empty fields', async () => {
    render(<MockedLogin authContextValue={mockAuthContext} />);
    
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Email is required')).toBeInTheDocument();
      expect(screen.getByText('Password is required')).toBeInTheDocument();
    });
  });

  test('shows error message on login failure', async () => {
    mockLogin.mockRejectedValue(new Error('Invalid credentials'));
    
    render(<MockedLogin authContextValue={mockAuthContext} />);
    
    const emailInput = screen.getByPlaceholderText('Enter your email');
    const passwordInput = screen.getByPlaceholderText('Enter your password');
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Login failed. Please try again.')).toBeInTheDocument();
    });
  });

  test('validates email format', async () => {
    render(<MockedLogin authContextValue={mockAuthContext} />);
    
    const emailInput = screen.getByPlaceholderText('Enter your email');
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Email is invalid')).toBeInTheDocument();
    });
  });
  test('shows loading state during login', async () => {
    const loadingAuthContext = { ...mockAuthContext, loading: true };
    render(<MockedLogin authContextValue={loadingAuthContext} />);
    
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  test('navigates to register page when clicking sign up link', () => {
    render(<MockedLogin authContextValue={mockAuthContext} />);
    
    const signUpLink = screen.getByText('Create one now');
    expect(signUpLink).toBeInTheDocument();
    expect(signUpLink.closest('a')).toHaveAttribute('href', '/register');
  });

  test('toggles password visibility', () => {
    render(<MockedLogin authContextValue={mockAuthContext} />);
    
    const passwordInput = screen.getByPlaceholderText('Enter your password');
    const toggleButton = screen.getByTestId('eye-icon').parentElement;
    
    expect(passwordInput).toHaveAttribute('type', 'password');
    fireEvent.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'text');
  });
});
