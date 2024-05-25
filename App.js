import React, { useState, useEffect, useRef } from 'react';
import {
  Image,
  Text,
  View,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  PanResponder,
} from 'react-native';
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

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const TOOLTIP_SIZE = 60;

export default function App() {
  const [session, setSession] = useState(null);
  const [isChatVisible, setIsChatVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const pan = useRef(new Animated.ValueXY()).current;

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        setSession(session);
        store.dispatch(userLogin(session));
        setIsLoggedIn(true);
        setIsLoading(false);
      } else {
        setIsLoading(false);
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

  const handlePress = () => {
    setIsChatVisible(true);
  };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        pan.setOffset({
          x: pan.x._value,
          y: pan.y._value,
        });
      },
      onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], {
        useNativeDriver: false,
      }),
      onPanResponderRelease: (e, gesture) => {
        pan.flattenOffset();
        const newX = Math.max(
          0,
          Math.min(SCREEN_WIDTH - TOOLTIP_SIZE, pan.x._value)
        );
        const newY = Math.max(
          0,
          Math.min(SCREEN_HEIGHT - TOOLTIP_SIZE - 80, pan.y._value)
        ); // Adjust for bottom spacing
        Animated.spring(pan, {
          toValue: { x: newX, y: newY },
          useNativeDriver: false,
        }).start(() => {
          if (Math.abs(gesture.dx) < 5 && Math.abs(gesture.dy) < 5) {
            handlePress();
          }
        });
      },
    })
  ).current;

  return (
    <Provider store={store}>
      <NavigationContainer>
        <StatusBar style="auto" />
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {isLoggedIn ? (
            <Stack.Screen name="Navigator">
              {() => <Navigator setIsLoggedIn={setIsLoggedIn} />}
            </Stack.Screen>
          ) : isLoading ? (
            <Stack.Screen name="Loading" component={LoadingScreen} />
          ) : (
            <Stack.Screen name="Signup">
              {() => <SignupScreen setIsLoggedIn={setIsLoggedIn} />}
            </Stack.Screen>
          )}
        </Stack.Navigator>
        {session && (
          <>
            {/* <Modal
              isVisible={isChatVisible}
              onBackdropPress={() => setIsChatVisible(false)}
              style={styles.modal}>
              <View style={styles.modalContent}>
                <ChatBotScreen
                  navigation={{ goBack: () => setIsChatVisible(false) }}
                />
              </View>
            </Modal> */}
            {/* <Animated.View
              {...panResponder.panHandlers}
              style={[pan.getLayout(), styles.tooltipButton]}> */}
            {/* <TouchableOpacity
                style={styles.tooltipCircle}
                onPress={handlePress}>
                <Image
                  source={require('./assets/images/Chatbot.png')}
                  style={styles.tooltipImage}
                />
              </TouchableOpacity> */}
            {/* </Animated.View> */}
          </>
        )}
      </NavigationContainer>
    </Provider>
  );
}

export function LoadingScreen() {
  return (
    <View>
      <Text>Loading...</Text>
    </View>
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
