import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import Navigator from './src/navigator/Navigator';
import { supabase } from './src/config/supabaseClient';
import SignupScreen from './src/screens/SignupScreen';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const Stack = createNativeStackNavigator();

export default function App() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        setSession(session);
      }
    };

    checkSession();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );

    return () => {
      listener.unsubscribe();
    };
  }, []);

  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!session ? (
          <Stack.Screen name="Signup" component={SignupScreen} />
        ) : (
          <Stack.Screen
            name="Navigator"
            component={Navigator}
            initialParams={{ session: session }}
          />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
