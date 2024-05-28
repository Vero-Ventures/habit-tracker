import React from 'react';
import FollowScreen from '../src/screens/FollowScreen';
import {
  render,
  fireEvent,
  waitFor,
  screen,
} from '@testing-library/react-native';
import { supabase } from '../src/config/supabaseClient';
import store from '../src/store/storeConfig';
import { Alert } from 'react-native';

const mockUser = {
  id: 'user2',
  username: 'testuser',
  profile_image: 'https://example.com/image.jpg',
};

// Mock modules and functions
jest.mock('../src/config/supabaseClient', () => ({
  supabase: {
    auth: {
      signInWithPassword: jest.fn(),
      signUp: jest.fn(),
      startAutoRefresh: jest.fn(),
      stopAutoRefresh: jest.fn(),
    },
    from: jest.fn(),
  },
}));

jest.mock('../src/store/storeConfig', () => ({
  getState: jest.fn(),
}));

jest.spyOn(Alert, 'alert');

describe('FollowScreen Component', () => {
  beforeEach(() => {
    store.getState.mockReturnValue({
      user: { session: { user: { id: 'user1' } } },
    });
    supabase.from.mockClear();
    Alert.alert.mockClear();
  });

  test('should render FollowScreen component', () => {
    const { getByPlaceholderText } = render(<FollowScreen />);
    expect(getByPlaceholderText('Search by username')).toBeTruthy();
  });

  test('fetchFollowingList should fetch following list on session change', async () => {
    supabase.from.mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({
          data: [{ following: mockUser }],
          error: null,
        }),
      }),
    });

    const { getByText } = render(<FollowScreen />);

    await waitFor(() =>
      expect(supabase.from).toHaveBeenCalledWith('Following')
    );
    await waitFor(() => expect(getByText('testuser')).toBeTruthy());
  });

  test('fetchFollowingList should handle error', async () => {
    supabase.from.mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({
          data: null,
          error: new Error('Fetch error'),
        }),
      }),
    });

    render(<FollowScreen />);
    await waitFor(() =>
      expect(Alert.alert).toHaveBeenCalledWith('Error', 'Fetch error')
    );
  });

  test('handleSearch should fetch search results based on query', async () => {
    const { getByPlaceholderText, getByDisplayValue } = render(
      <FollowScreen />
    );

    supabase.from.mockReturnValue({
      select: jest.fn().mockReturnValue({
        ilike: jest.fn().mockResolvedValue({
          data: { mockUser },
          error: null,
        }),
      }),
    });

    fireEvent.changeText(
      getByPlaceholderText('Search by username'),
      'testuser'
    );
    await waitFor(() =>
      expect(supabase.from).toHaveBeenCalledWith('Following')
    );
    await waitFor(() =>
      expect(screen.getByDisplayValue('testuser')).toBeTruthy()
    );
  });

  test('fetchFollowingList should handle error', async () => {
    supabase.from.mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({
          data: null,
          error: new Error('Fetch error'),
        }),
      }),
    });

    render(<FollowScreen />);
    await waitFor(() =>
      expect(Alert.alert).toHaveBeenCalledWith('Error', 'Fetch error')
    );
  });

  test('handleSearch should clear search results for empty query', async () => {
    const { getByPlaceholderText, queryByText } = render(<FollowScreen />);

    fireEvent.changeText(getByPlaceholderText('Search by username'), 'test');
    fireEvent.changeText(getByPlaceholderText('Search by username'), '');

    await waitFor(() => expect(queryByText('Search Results')).toBeNull());
  });
});
