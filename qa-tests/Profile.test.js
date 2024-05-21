import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import Account from '../src/screens/ProfileScreen';
import Auth from '../src/screens/SignupScreen';
import { supabase } from '../src/config/supabaseClient';
import store from '../src/store/storeConfig';

// Mocking the supabase client to prevent actual API calls
jest.mock('../src/config/supabaseClient', () => ({
  supabase: {
    auth: {
      signInWithPassword: jest.fn(),
      signUp: jest.fn(),
      startAutoRefresh: jest.fn(),
      stopAutoRefresh: jest.fn(),
      signOut: jest.fn(),
    },
    rpc: jest.fn().mockResolvedValue({ data: 'data' }),
  },
}));

// Mocking the store to include a session
jest.mock('../src/store/storeConfig', () => ({
  getState: () => ({
    user: {
      session: {
        user: {
          id: 'test-user-id',
          email: 'test@example.com',
          password: 'password',
        },
      },
    },
  }),
  subscribe: jest.fn(),
  dispatch: jest.fn(),
}));

describe('Account Component', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  // tests if all elements on the page renders
  test('navigates to account page', async () => {
    const { getByText, getAllByText, getByPlaceholderText } = render(
      <Account />
    );

    getAllByText('Hi, User');
    getByText('Profile Image URL');
    getByPlaceholderText('Enter profile image URL');
    getByText('Username');
    getByPlaceholderText('Enter username');
    getByText('Bio');
    getByPlaceholderText('Enter bio');
    getByText('Update');
    getByText('Sign Out');
    getByText('Delete Account');
    getByText('Download User Data');
  });

  test('user deletes their account', async () => {
    const { getByText } = render(<Account />);

    fireEvent.press(getByText('Delete Account'));

    await waitFor(() => {
      expect(supabase.auth.signOut).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(supabase.rpc).toHaveBeenCalledWith('delete_user_data', {
        user_id: 'test-user-id',
      });
    });

    await waitFor(() => {
      expect(supabase.auth.signOut).toHaveBeenCalled();
    });
  });
});
