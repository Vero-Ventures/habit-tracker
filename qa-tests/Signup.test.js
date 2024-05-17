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

describe('User Account Management', () => {
  // Tests sign in with successful email and password
  it('Call signInWithEmail and handle success', async () => {
    const onSignInMock = jest.fn();
    supabase.auth.signInWithPassword.mockResolvedValue({
      data: { session: { user: { id: '123' } } },
      error: null,
    });

    const { getByPlaceholderText, getByText } = render(
      <Auth onSignIn={onSignInMock} />
    );

    fireEvent.changeText(
      getByPlaceholderText('email@address.com'),
      'test@example.com'
    );
    fireEvent.changeText(getByPlaceholderText('Password'), 'password123');
    fireEvent.press(getByText('Sign in'));

    await waitFor(() => {
      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
      expect(onSignInMock).toHaveBeenCalledWith('123');
    });
  });

  // Tests sign in with unsuccessful email and password
  it('Call signInWithEmail and handle error', async () => {
    const onSignInMock = jest.fn();
    supabase.auth.signInWithPassword.mockResolvedValue({
      data: null,
      error: { message: 'Login error' },
    });

    const { getByPlaceholderText, getByText } = render(
      <Auth onSignIn={onSignInMock} />
    );

    fireEvent.changeText(getByPlaceholderText('email@address.com'), '');
    fireEvent.changeText(getByPlaceholderText('Password'), '');
    fireEvent.press(getByText('Sign in'));

    await waitFor(() => {
      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: '',
        password: '',
      });
      expect(onSignInMock).not.toHaveBeenCalled();
    });
  });

  // Tests sign up with successful email and password
  it('Call signUpWithEmail and handle success', async () => {
    supabase.auth.signUp.mockResolvedValue({ error: null });

    const { getByPlaceholderText, getByText } = render(<Auth />);

    fireEvent.changeText(
      getByPlaceholderText('email@address.com'),
      'test@example.com'
    );
    fireEvent.changeText(getByPlaceholderText('Password'), 'password123');
    fireEvent.press(getByText('Sign up'));

    await waitFor(() => {
      expect(supabase.auth.signUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
      expect(Alert.alert).toHaveBeenCalledWith(
        'Signup Notification',
        'Please check your inbox for email verification!'
      );
    });
  });

  // Tests sign up with unsuccessful email and password
  it('Call signUpWithEmail and handle error', async () => {
    supabase.auth.signUp.mockResolvedValue({
      error: { message: 'Signup error' },
    });

    const { getByPlaceholderText, getByText } = render(<Auth />);

    fireEvent.changeText(
      getByPlaceholderText('email@address.com'),
      'test@example.com'
    );
    fireEvent.changeText(getByPlaceholderText('Password'), 'password123');
    fireEvent.press(getByText('Sign up'));

    await waitFor(() => {
      expect(supabase.auth.signUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
      expect(Alert.alert).toHaveBeenCalledWith('Signup Error', 'Signup error');
    });
  });
});
