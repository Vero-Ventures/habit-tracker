import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { supabase } from '../src/config/supabaseClient';
import { useNavigation, useRoute } from '@react-navigation/native';
import Habits from '../src/screens/habits/Habits';
import AddHabit from '../src/screens/habits/AddHabit';
import ViewHabit from '../src/screens/habits/ViewHabit';

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

jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn(),
  useRoute: jest.fn(),
}));

jest.spyOn(Alert, 'alert');

describe('Habits Component', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('navigates to habits page', async () => {
    const { getByText } = render(<Habits />);

    getByText('My Habits');
    getByText('ADD HABIT');
  });

  //   Come back to this later
  //   test('user creates a habit', async () => {
  //     const { getByText: getByTextHabit } = render(<Habits />);
  //     const { getByText: getByTextAddHabit, getAllByText, getByPlaceholderText } = render(<ViewHabit />);

  //     fireEvent.press(getByTextHabit('ADD HABIT'));

  //     await waitFor(() => {
  //         getByTextAddHabit('Create Habit');
  //         getByTextAddHabit('Name');
  //         getByTextAddHabit('Habit Description');
  //         getByTextAddHabit('Frequency');
  //         getByTextAddHabit('ADD CUSTOM HABIT');
  //     });
  //   });
});
