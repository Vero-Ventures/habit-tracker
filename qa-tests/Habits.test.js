import React from 'react';
import { fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { supabase } from '../src/config/supabaseClient';
import { render } from './test.utils';
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

jest.spyOn(Alert, 'alert');

describe('Habits Component', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('navigates to habits page', async () => {
    const { getByText, getAllByText, getByPlaceholderText } = render(
      <Habits />
    );

    getByText('My Habits');
    getByText('ADD HABIT');
  });
});
