import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { supabase } from '../src/config/supabaseClient';
import Timeline from '../src/screens/timeline/Timeline';

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

jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn(),
  useRoute: jest.fn(),
}));

describe('Timeline Component', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('navigates to timeline page', async () => {
    const { getByText } = render(<Timeline />);

    getByText('Timeline');
    getByText('No posts to show'); // initial state
  });
});
