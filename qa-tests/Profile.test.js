import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import Account from '../src/screens/ProfileScreen';
import SettingsScreen from '../src/screens/SettingsScreen';
import { Alert } from 'react-native';
import { supabase } from '../src/config/supabaseClient';
import store from '../src/store/storeConfig';

const setIsLoggedIn = jest.fn();

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
      single: jest.fn().mockResolvedValue({
        data: {
          username: 'testuser',
          bio: 'This is a test bio',
          profile_image: 'https://example.com/image.jpg',
        },
      }),
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

jest.mock('expo-file-system', () => ({
  documentDirectory: 'mockDocumentDirectory/',
  writeAsStringAsync: jest.fn(),
  EncodingType: {
    UTF8: 'utf8',
  },
}));

jest.mock('expo-sharing', () => ({
  shareAsync: jest.fn(),
}));

jest.spyOn(Alert, 'alert');

describe('Profile Component', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  // tests if all elements on the page renders
  test('navigates to account page', async () => {
    const { getByText, getByPlaceholderText } = render(
      <NavigationContainer>
        <Provider store={store}>
          <Account />
        </Provider>
      </NavigationContainer>
    );

    getByText('Hi, User');
    getByText('followers');
    getByText('following');
    getByText('posts');
    getByText('Share My Profile');
    getByText('Edit Profile');
    getByText('Find Users');
    getByText('Username');
    getByPlaceholderText('Enter username');
    getByText('Bio');
    getByPlaceholderText('Enter bio');
    getByText('Update Profile');
  });

  test('loads data from the store', async () => {
    // Mock supabase response
    supabase.from.mockImplementationOnce(table => {
      if (table === 'User') {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({
            data: {
              username: 'testuser',
              bio: 'Test bio',
              profile_image: 'https://example.com/test.jpg',
            },
            error: null,
            status: 200,
          }),
        };
      }
      return {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: null,
          status: 200,
        }),
      };
    });

    const { getByText, getByDisplayValue } = render(
      <NavigationContainer>
        <Provider store={store}>
          <Account />
        </Provider>
      </NavigationContainer>
    );

    await waitFor(() => {
      getByText('Hi, testuser');
      getByDisplayValue('testuser');
      getByDisplayValue('Test bio');
    });
  });

  test('user signs out of their account', async () => {
    const { getByText } = render(
      <NavigationContainer>
        <SettingsScreen setIsLoggedIn={setIsLoggedIn} />
      </NavigationContainer>
    );

    fireEvent.press(getByText('Sign Out'));

    await waitFor(() => {
      expect(supabase.auth.signOut).toHaveBeenCalled();
    });
  });

  test('user deletes their account', async () => {
    const { getByText } = render(
      <NavigationContainer>
        <SettingsScreen setIsLoggedIn={setIsLoggedIn} />
      </NavigationContainer>
    );

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

  test('catches error when deleting account', async () => {
    supabase.rpc.mockRejectedValueOnce(new Error('Error deleting user'));
    const { getByText } = render(
      <NavigationContainer>
        <SettingsScreen setIsLoggedIn={setIsLoggedIn} />
      </NavigationContainer>
    );

    fireEvent.press(getByText('Delete Account'));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Error', 'Error deleting user');
    });
  });
});

describe('CRUD operations on profile', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('user updates their username and bio & changes persist', async () => {
    const { getByText, getByPlaceholderText } = render(
      <NavigationContainer>
        <Account />
      </NavigationContainer>
    );

    fireEvent.press(getByText('Edit Profile'));

    fireEvent.changeText(getByPlaceholderText('Enter username'), 'testuser');
    fireEvent.changeText(
      getByPlaceholderText('Enter bio'),
      'This is a test bio'
    );
    fireEvent.press(getByText('Update Profile'));

    // Mock the update response & check if profile is updated
    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'Success',
        'Profile updated successfully!'
      );

      expect(getByPlaceholderText('Enter username').props.value).toBe(
        'testuser'
      );
      expect(getByPlaceholderText('Enter bio').props.value).toBe(
        'This is a test bio'
      );
    });
  });

  test('user updates their profile image', async () => {
    const { getByTestId } = render(
      <NavigationContainer>
        <Account />
      </NavigationContainer>
    );

    fireEvent.press(getByTestId('profile'));
  });
});

describe('Data export', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('user downloads their data', async () => {
    const { getByText } = render(
      <NavigationContainer>
        <SettingsScreen setIsLoggedIn={setIsLoggedIn} />
      </NavigationContainer>
    );

    fireEvent.press(getByText('Download User Data'));

    await waitFor(() => {
      expect(supabase.rpc).toHaveBeenCalledWith('get_user_data', {
        p_user_id: 'test-user-id',
      });
      expect(Alert.alert).toHaveBeenCalledWith(
        'Success',
        'User data saved as user_data.json'
      );
    });
  });

  test('catches error when downloading data', async () => {
    supabase.rpc.mockRejectedValueOnce(new Error('Error fetching data'));
    const { getByText } = render(
      <NavigationContainer>
        <SettingsScreen setIsLoggedIn={setIsLoggedIn} />
      </NavigationContainer>
    );

    fireEvent.press(getByText('Download User Data'));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'Error',
        'Unexpected error: Error fetching data'
      );
    });
  });
});