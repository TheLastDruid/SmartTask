import { render, screen } from '@testing-library/react';
import App from './App';

test('renders SmartTask application', () => {
  render(<App />);
  // The app should redirect to login when not authenticated
  expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
});
