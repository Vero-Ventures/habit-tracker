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

// import React from 'react';
// import { render, fireEvent, waitFor } from '@testing-library/react-native';
// import { Alert } from 'react-native';
// import Habits from '../src/screens/habits/Habits';
// import AddHabit from '../src/screens/habits/AddHabit';
// import ViewHabit from '../src/screens/habits/ViewHabit';
// import { NavigationContainer } from '@react-navigation/native';
// import { createStackNavigator } from '@react-navigation/stack';
// import { useNavigation, useRoute } from '@react-navigation/native';

// jest.mock('../src/config/supabaseClient', () => ({
//     supabase: {
//         auth: {
//             signInWithPassword: jest.fn(),
//             signUp: jest.fn(),
//             startAutoRefresh: jest.fn(),
//             stopAutoRefresh: jest.fn(),
//         },
//     },
// }));

// jest.mock('@react-navigation/native', () => ({
//     useNavigation: jest.fn(),
//     useRoute: jest.fn(),
// }));

// jest.mock('@react-navigation/stack', () => ({
//     useHeaderHeight: () => 0,
// }));

// jest.spyOn(Alert, 'alert');

// const Stack = createStackNavigator();

// const MockedNavigator = ({ component }) => {
//     return (
//         <NavigationContainer>
//             <Stack.Navigator>
//                 <Stack.Screen name="Habits" component={component} />
//                 <Stack.Screen name="AddHabit" component={AddHabit} />
//                 <Stack.Screen name="ViewHabit" component={ViewHabit} />
//             </Stack.Navigator>
//         </NavigationContainer>
//     );
// };

// describe('Habits Component', () => {
//     afterEach(() => {
//         jest.clearAllMocks();
//     });

//     test('navigates to habits page', () => {
//         const { getByText } = render(<MockedNavigator component={Habits} />);

//         getByText('My Habits');
//         getByText('ADD HABIT');
//     });

//     test('user creates a habit', async () => {
//         const mockNavigate = jest.fn();
//         useNavigation.mockReturnValue({ navigate: mockNavigate });

//         useRoute.mockReturnValue({
//             params: { habit: { habit_title: 'Test Habit', habit_description: 'Description' } },
//         });

//         const { getByText } = render(<MockedNavigator component={Habits} />);

//         fireEvent.press(getByText('ADD HABIT'));

//         await waitFor(() => {
//             expect(mockNavigate).toHaveBeenCalledWith('AddHabit');
//         });

//         // Assuming user navigates to ViewHabit after adding a habit
//         mockNavigate.mockImplementation((screen, params) => {
//             if (screen === 'ViewHabit') {
//                 render(<ViewHabit {...params} />);
//             }
//         });

//         await waitFor(() => {
//             getByText('Create Habit');
//         });
//     });
// });
