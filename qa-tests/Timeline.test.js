import React from 'react';
import configureMockStore from 'redux-mock-store';
import { render, waitFor, screen } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import Timeline from '../src/screens/timeline/Timeline';
import { supabase } from '../src/config/supabaseClient';
import { TextInputBase } from 'react-native';

// Mock necessary modules
jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn(),
}));
jest.mock('../src/config/supabaseClient', () => ({
  supabase: {
    from: jest.fn(),
  },
}));
const mockStore = configureMockStore();
const store = mockStore({
  user: {
    session: {
      user: {
        id: 'user-id-123',
      },
    },
  },
});

const mockPosts = [
  {
    post_id: 'post-1',
    user_id: 'user-id-123',
    schedule_id: 'schedule-1',
    post_title: 'First Post',
    post_description: 'This is the first post',
    created_at: '2024-01-01T00:00:00Z',
  },
];

const mockUsers = [
  {
    user_id: 'user-id-123',
    username: 'Test User',
    profile_image: 'https://example.com/profile.jpg',
  },
];

const mockSchedules = [
  {
    schedule_id: 'schedule-1',
    habit_id: 'habit-1',
  },
];

const mockHabits = [
  {
    habit_id: 'habit-1',
    habit_name: 'Test Habit',
  },
];

describe('Timeline component', () => {
  test('fetch posts when there are no followed users', async () => {
    const { getByText } = render(
      <Provider store={store}>
        <Timeline />
      </Provider>
    );

    await waitFor(() => {
      expect(getByText('No posts to show')).toBeTruthy();
    });
  });

  beforeEach(() => {
    // Mock the supabase responses
    supabase.from.mockImplementation(table => {
      switch (table) {
        case 'Following':
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockResolvedValue({
              data: [{ following: 'user-id-123' }],
              error: null,
            }),
          };
        case 'Post':
          return {
            select: jest.fn().mockReturnThis(),
            in: jest.fn().mockReturnThis(),
            order: jest.fn().mockReturnThis(),
            range: jest.fn().mockResolvedValue({
              data: mockPosts,
              error: null,
            }),
          };
        case 'User':
          return {
            select: jest.fn().mockReturnThis(),
            in: jest.fn().mockResolvedValue({
              data: mockUsers,
              error: null,
            }),
          };
        case 'Schedule':
          return {
            select: jest.fn().mockReturnThis(),
            in: jest.fn().mockResolvedValue({
              data: mockSchedules,
              error: null,
            }),
          };
        case 'Habit':
          return {
            select: jest.fn().mockReturnThis(),
            in: jest.fn().mockResolvedValue({
              data: mockHabits,
              error: null,
            }),
          };
        default:
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
          };
      }
    });
  });

  test('renders a post on the timeline', async () => {
    const { getByText } = render(
      <Provider store={store}>
        <Timeline />
      </Provider>
    );

    await waitFor(() => {
      expect(getByText('First Post')).toBeTruthy();
      expect(getByText('This is the first post')).toBeTruthy();
    });
  });
});
