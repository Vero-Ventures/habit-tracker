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
import Community from '../screens/community/Community';
import CreateCommunity from '../screens/community/CreateCommunity';

const Tab = createBottomTabNavigator();
const CommunityStack = createStackNavigator();

const CommunityScreen = () => {
  return (
    <CommunityStack.Navigator
      initialRouteName="Community"
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: Colors.navigator },
      }}
    >
      <CommunityStack.Screen name="Community" component={Community} />
      <CommunityStack.Screen name="CreateCommunity" component={CreateCommunity} />
    </CommunityStack.Navigator>
  );
};

export default function Navigator() {
  const icons = (route, focused) => {
    const sizeStyle = { width: 24, height: 24 };

    switch (route.name) {
      case 'Timeline':
        return (
          <Image
            source={focused ? homeSelected : home}
            style={sizeStyle}
          />
        );
      case 'ExtraTips':
        return (
          <Image
            source={focused ? infoSelected : info}
            style={sizeStyle}
          />
        );
      case 'Stakes':
        return (
          <Image
            source={focused ? stakesSelected : stakes}
            style={sizeStyle}
          />
        );
      case 'My Habits':
        return (
          <Image
            source={focused ? activitySelected : activity}
            style={focused ? { width: 22, height: 20 } : sizeStyle}
          />
        );
      case 'Community':
        return (
          <Image
            source={focused ? usersSelected : users}
            style={sizeStyle}
          />
        );
      case 'Profile':
        return (
          <Image
            source={focused ? userSelected : user}
            style={sizeStyle}
          />
        );
      default:
        return null;
    }
  };

  return (
    <NavigationContainer>
      <Tab.Navigator
        initialRouteName="My Habits"
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
        })}
      >
        <Tab.Screen name="Timeline" component={Timeline} />
        <Tab.Screen name="Stakes" component={() => <></>} />
        <Tab.Screen name="My Habits" component={Habits} />
        <Tab.Screen name="Community" component={CommunityScreen} />
        <Tab.Screen name="Profile" component={() => <></>} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
