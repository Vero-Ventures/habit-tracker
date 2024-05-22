import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import Account from '../src/screens/ProfileScreen';
import { Alert } from 'react-native';
import { supabase } from '../src/config/supabaseClient';

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
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockResolvedValue({}),
      single: jest.fn().mockResolvedValue({}),
      upsert: jest.fn().mockResolvedValue({}),
    })),
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

jest.spyOn(Alert, 'alert');

describe('Account Deletion', () => {
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
    getByText('Share My Profile');
    getByText('Edit Profile');
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

describe('CRUD operations on profile', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('user updates their profile & changes persist', async () => {
    const { getByText, getByPlaceholderText } = render(<Account />);

    fireEvent.press(getByText('Edit Profile'));

    fireEvent.changeText(
      getByPlaceholderText('Enter profile image URL'),
      'https://example.com/image.jpg'
    );
    fireEvent.changeText(getByPlaceholderText('Enter username'), 'testuser');
    fireEvent.changeText(
      getByPlaceholderText('Enter bio'),
      'This is a test bio'
    );
    fireEvent.press(getByText('Update'));

    // Mock the update response & check if profile is updated
    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'Success',
        'Profile updated successfully!'
      );

      expect(getByPlaceholderText('Enter profile image URL').props.value).toBe(
        'https://example.com/image.jpg'
      );
      expect(getByPlaceholderText('Enter username').props.value).toBe(
        'testuser'
      );
      expect(getByPlaceholderText('Enter bio').props.value).toBe(
        'This is a test bio'
      );
    });
  });
});
