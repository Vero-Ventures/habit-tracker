import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import store from '../src/store/storeConfig';
import Habits from '../src/screens/habits/Habits';
import { supabase } from '../src/config/supabaseClient';

jest.mock('../src/config/supabaseClient', () => ({
  supabase: {
    auth: {
      signInWithPassword: jest.fn(),
      signUp: jest.fn(),
      startAutoRefresh: jest.fn(),
      stopAutoRefresh: jest.fn(),
      signOut: jest.fn(),
    },
    from: jest.fn(() => ({
      single: jest.fn().mockResolvedValue({
        data: {
          habit_id: 'test-habit-id',
          habit_title: 'Mock Habit',
          habit_description: 'Mock Habit Description',
        },
      }),
      single: jest.fn().mockResolvedValue({}),
      upsert: jest.fn().mockResolvedValue({}),
    })),
  },
}));

jest.mock('@react-navigation/native', () => {
  return {
    ...jest.requireActual('@react-navigation/native'),
    useNavigation: jest.fn(),
  };
});

jest.mock('@react-navigation/native', () => {
  const actual = jest.requireActual('@react-navigation/native');
  return {
    ...actual,
    useNavigation: jest.fn(),
    useFocusEffect: jest.fn(),
  };
});

describe('Habits Component', () => {
  test('renders correctly', () => {
    const { getByText } = render(
      <Provider store={store}>
        <Habits />
      </Provider>
    );
    getByText('My Habits');
    getByText('ADD HABIT');
  });
});
