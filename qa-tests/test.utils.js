import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { render } from '@testing-library/react-native';

const AllProviders = ({ children }) => {
  return <NavigationContainer>{children}</NavigationContainer>;
};

const customRender = (ui, options) => {
  return render(ui, { wrapper: AllProviders, ...options });
};

export * from '@testing-library/react-native';
export { customRender as render };
