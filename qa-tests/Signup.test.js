import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import Auth from '../src/screens/SignupScreen';
import { supabase } from '../src/config/supabaseClient';

// Mocking the supabase client to prevent actual API calls
jest.mock('../src/config/supabaseClient', () => ({
  supabase: {
    auth: {
      signInWithPassword: jest.fn(),
      signUp: jest.fn(),
      startAutoRefresh: jest.fn(),
      stopAutoRefresh: jest.fn(),
    },
  },
}));

jest.spyOn(Alert, 'alert');

describe('Auth Component', () => {
  const mockOnSignIn = jest.fn();

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('signs up and notifies user to check email for verification', async () => {
    const { getByPlaceholderText, getByText } = render(
      <Auth onSignIn={mockOnSignIn} />
    );

    // Simulate user input
    fireEvent.changeText(
      getByPlaceholderText('email@address.com'),
      'test@example.com'
    );
    fireEvent.changeText(getByPlaceholderText('Password'), 'password');

    // Mock the signUp response
    supabase.auth.signUp.mockResolvedValueOnce({ error: null });

    fireEvent.press(getByText('Sign up'));

    await waitFor(() => {
      expect(supabase.auth.signUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password',
      });
      expect(Alert.alert).toHaveBeenCalledWith(
        'Signup Notification',
        'Please check your inbox for email verification!'
      );
    });
  });

  test('signs in successfully and calls onSignIn with user id', async () => {
    const { getByPlaceholderText, getByText } = render(
      <Auth onSignIn={mockOnSignIn} />
    );

    // Simulate user input
    fireEvent.changeText(
      getByPlaceholderText('email@address.com'),
      'test@example.com'
    );
    fireEvent.changeText(getByPlaceholderText('Password'), 'password');

    // Mock the signInWithPassword response
    supabase.auth.signInWithPassword.mockResolvedValueOnce({
      data: { session: { user: { id: 'user-id-123' } } },
      error: null,
    });

    fireEvent.press(getByText('Sign in'));

    await waitFor(() => {
      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password',
      });
      expect(mockOnSignIn).toHaveBeenCalledWith('user-id-123');
    });
  });

  // Sign in using unverified email, wrong password, wrong email, etc
  test('shows login error on sign in failure', async () => {
    // Set up test environment
    const { getByPlaceholderText, getByText } = render(
      <Auth onSignIn={mockOnSignIn} />
    );

    // Simulate user input
    fireEvent.changeText(
      getByPlaceholderText('email@address.com'),
      'test@example.com'
    );
    fireEvent.changeText(getByPlaceholderText('Password'), 'password');

    // Mock the signInWithPassword response
    supabase.auth.signInWithPassword.mockResolvedValueOnce({
      data: null,
      error: { message: 'Invalid login credentials' },
    });

    fireEvent.press(getByText('Sign in'));

    await waitFor(() => {
      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password',
      });
      expect(Alert.alert).toHaveBeenCalledWith(
        'Login Error',
        'Invalid login credentials'
      );
    });
  });
});
