import React from 'react';
import { Provider } from 'react-redux';
import { render } from '@testing-library/react-native';
import store from '../src/store/storeConfig';
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
    const { getByText } = render(
      <Provider store={store}>
        <Timeline />
      </Provider>
    );

    getByText('Timeline');
    getByText('No posts to show'); // initial state
  });
});
