import React, { useState, useEffect } from 'react';
import { Image, Text, View, TouchableOpacity, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import Navigator from './src/navigator/Navigator';
import { supabase } from './src/config/supabaseClient';
import SignupScreen from './src/screens/SignupScreen';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Provider } from 'react-redux';
import store from './src/store/storeConfig';
import { userLogin } from './src/store/ducks/user';
import ChatBotScreen from './src/screens/ChatbotScreen';
import Modal from 'react-native-modal';

const Stack = createStackNavigator();

export default function App() {
  const [session, setSession] = useState(null);
  const [isChatVisible, setIsChatVisible] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        setSession(session);
        store.dispatch(userLogin(session));
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
    <Provider store={store}>
      <NavigationContainer>
        <StatusBar style="auto" />
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {!session ? (
            <Stack.Screen name="Signup" component={SignupScreen} />
          ) : (
            <Stack.Screen name="Navigator" component={Navigator} />
          )}
        </Stack.Navigator>
        <Modal
          isVisible={isChatVisible}
          onBackdropPress={() => setIsChatVisible(false)}
          style={styles.modal}>
          <View style={styles.modalContent}>
            <ChatBotScreen
              navigation={{ goBack: () => setIsChatVisible(false) }}
            />
          </View>
        </Modal>
        <TouchableOpacity
          style={styles.tooltipButton}
          onPress={() => setIsChatVisible(true)}>
          <View style={styles.tooltipCircle}>
            <Image
              source={require('./assets/images/Chatbot.png')} // Ensure the path to your image is correct
              style={styles.tooltipImage}
            />
          </View>
        </TouchableOpacity>
      </NavigationContainer>
    </Provider>
  );
}

const styles = StyleSheet.create({
  tooltipButton: {
    position: 'absolute',
    bottom: 80,
    right: 30,
    zIndex: 1000,
  },
  tooltipCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'lightblue',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 5,
  },
  tooltipImage: {
    width: 50,
    height: 50,
    resizeMode: 'contain',
  },
  modal: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '100%',
    height: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
  },
});
