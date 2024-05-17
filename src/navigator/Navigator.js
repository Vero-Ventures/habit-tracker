import React from 'react';
import { Image } from 'react-native';
import Colors from '../../assets/styles/Colors';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import Habits from '../screens/habits/Habits';
import homeSelected from '../../assets/icons/home-selected.png';
import home from '../../assets/icons/home.png';
import infoSelected from '../../assets/icons/info-selected.png';
import info from '../../assets/icons/info.png';
import stakesSelected from '../../assets/icons/stakes-selected.png';
import stakes from '../../assets/icons/stakes.png';
import activitySelected from '../../assets/icons/activity-selected.png';
import activity from '../../assets/icons/activity.png';
import usersSelected from '../../assets/icons/users-selected.png';
import users from '../../assets/icons/users.png';
import userSelected from '../../assets/icons/user-selected.png';
import user from '../../assets/icons/user.png';
import Timeline from '../screens/timeline/Timeline';
import AddHabit from '../screens/habits/AddHabit';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

export default function Navigator() {
  const icons = (route, focused) => {
    const sizeStyle = { width: 24, height: 24 };

    switch (route.name) {
      case 'Timeline':
        return (
          <Image
            source={
              focused
                ? { uri: Image.resolveAssetSource(homeSelected).uri }
                : { uri: Image.resolveAssetSource(home).uri }
            }
            style={sizeStyle}
          />
        );
      case 'ExtraTips':
        return (
          <Image
            source={
              focused
                ? { uri: Image.resolveAssetSource(infoSelected).uri }
                : { uri: Image.resolveAssetSource(info).uri }
            }
            style={sizeStyle}
          />
        );
      case 'Stakes':
        return (
          <Image
            source={
              focused
                ? { uri: Image.resolveAssetSource(stakesSelected).uri }
                : { uri: Image.resolveAssetSource(stakes).uri }
            }
            style={sizeStyle}
          />
        );
      case 'Habits':
        return (
          <Image source={focused ? activitySelected : activity} style={sizeStyle} />
        );
      case 'Community':
        return (
          <Image
            source={
              focused
                ? { uri: Image.resolveAssetSource(usersSelected).uri }
                : { uri: Image.resolveAssetSource(users).uri }
            }
            style={sizeStyle}
          />
        );
      case 'Profile':
        return (
          <Image
            source={
              focused
                ? { uri: Image.resolveAssetSource(userSelected).uri }
                : { uri: Image.resolveAssetSource(user).uri }
            }
            style={sizeStyle}
          />
        );
      default:
        return null;
    }
  };
  return (
    <Tab.Navigator
      initialRouteName="Habits"
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused }) => icons(route, focused),
        tabBarShowLabel: true,
        tabBarActiveTintColor: Colors.primary8,
        tabBarInactiveTintColor: Colors.primary9,
        tabBarStyle: {
          backgroundColor: Colors.navigator,
          borderTopWidth: 0,
          height: 82,
          paddingTop: 20,
          paddingBottom: 24,
        },
      })}>
      <Tab.Screen name="Timeline" component={Timeline} />
      <Tab.Screen name="Stakes" component={ChatbotScreen} />
      {/* Used to be the stakes screen, but I am putting the chatbot screen here temporarily */}
      <Tab.Screen name="Habits" component={HabitsScreen} />
      <Tab.Screen name="Community" component={CommunityScreen} />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen} // This used to be ProfileScreen, I am putting duplicate community screen temporarily since no Profile is available when not logged in
        initialParams={{ session: session }}
      />
    </Tab.Navigator>
  );
}

const HabitsStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Habits" component={Habits} />
      <Stack.Screen name="AddHabit" component={AddHabit} />
    </Stack.Navigator>
  );
};