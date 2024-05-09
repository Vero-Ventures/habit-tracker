import { React, useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import Navigator from './src/navigator/Navigator';
import { supabase } from './src/config/supabaseClient';
import SignupScreen from './src/screens/SignupScreen';
import UserCreation from './src/screens/UserCreationScreen';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const Stack = createNativeStackNavigator();

export default function App() {
  const [session, setSession] = useState(null);
  const [hasProfile, setHasProfile] = useState(false);

  useEffect(() => {
    const checkProfile = async userId => {
      const { data } = await supabase
        .from('User')
        .select('user_id')
        .eq('user_id', userId)
        .single();

      setHasProfile(!!data);
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setSession(session);
        checkProfile(session.user.id);
      }
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setSession(session);
        checkProfile(session.user.id);
      } else {
        setSession(null);
        setHasProfile(false);
      }
    });
  }, []);

  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <Stack.Navigator
        screenOptions={() => ({
          headerShown: false,
        })}>
        {!session ? (
          <Stack.Screen
            name="Signup"
            component={SignupScreen}
            options={{ headerShown: false }}
          />
        ) : hasProfile ? (
          <Stack.Screen
            name="Navigator"
            component={Navigator}
            initialParams={{ session: session }}
          />
        ) : (
          <Stack.Screen
            name="Profile"
            component={UserCreation}
            initialParams={{
              session: session,
              hasProfile: hasProfile,
              setHasProfile: setHasProfile,
            }}
          />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
