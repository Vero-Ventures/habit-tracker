import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Provider } from 'react-redux'; // Import Provider
import store from '../src/store/storeConfig'; // Import your Redux store
import Habits from '../src/screens/habits/Habits';

jest.mock('../src/config/supabaseClient', () => ({
  supabase: {
    auth: {
      signInWithPassword: jest.fn(),
      signUp: jest.fn(),
      startAutoRefresh: jest.fn(),
      stopAutoRefresh: jest.fn(),
    },
    from: () => ({
      select: () => ({
        eq: () => ({
          data: [
            {
              habit_id: 'mock_habit_id',
              habit_title: 'Mock Habit',
              habit_description: 'Mock Habit Description',
            },
          ],
          error: null,
        }),
      }),
    }),
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

  // test('renders loading indicator initially', () => {
  //   const { getByTestId } = render(
  //     <Provider store={store}>
  //       <Habits />
  //     </Provider>
  //   );
  //   expect(getByTestId('loading-indicator')).toBeTruthy();
  // });

  // test('renders habit items after loading', async () => {
  //   const { getByText } = render(
  //     <Provider store={store}>
  //       <Habits />
  //     </Provider>
  //   );
  //   await waitFor(() => {
  //     getByText('Mock Habit');
  //     getByText('Mock Habit Description');
  //   });
  // });

  // test('navigates to AddHabit screen on button press', () => {
  //   const { getByText } = render(
  //     <Provider store={store}>
  //       <Habits />
  //     </Provider>
  //   );
  //   fireEvent.press(getByText('ADD HABIT'));
  // });
});
