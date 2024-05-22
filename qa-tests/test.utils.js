import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { render } from '@testing-library/react-native';

const Stack = createStackNavigator();

const AllProviders = ({ children }) => {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Habits" component={Habits} />
        <Stack.Screen name="AddHabit" component={AddHabit} />
        <Stack.Screen name="ViewHabit" component={ViewHabit} />
        {children}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const customRender = (ui, options) => {
  return render(ui, { wrapper: AllProviders, ...options });
};

export * from '@testing-library/react-native';
export { customRender as mockRender };
export { AllProviders };
