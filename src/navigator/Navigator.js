import React from 'react';
import PropTypes from 'prop-types';
import { Image } from 'react-native';
import Colors from '../../assets/styles/Colors';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import Habits from '../screens/habits/Habits';
import ViewHabit from '../screens/habits/ViewHabit';
import AddHabit from '../screens/habits/AddHabit';
import ProfileScreen from '../screens/ProfileScreen';
import FollowScreen from '../screens/FollowScreen';
import FollowersScreen from '../screens/FollowersScreen';
import SettingsScreen from '../screens/SettingsScreen';
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
import clipboardCheckSelected from '../../assets/icons/clipboard-check-selected.png';
import clipboardCheck from '../../assets/icons/clipboard-check.png';
import Timeline from '../screens/timeline/Timeline';
import Community from '../screens/community/Community';
import CreateCommunity from '../screens/community/CreateCommunity';
import Profile from '../screens/profile/Profile';
import UpdateProfile from '../screens/profile/UpdateProfile';
import ChatbotScreen from '../screens/ChatbotScreen';
import UserDataScreen from '../screens/UserDataScreen';
import ChecklistScreen from '../screens/checklist/Checklist';

const Tab = createBottomTabNavigator();
const CommunityStack = createStackNavigator();
const ProfileStack = createStackNavigator();
const HabitsStack = createStackNavigator();

const CommunityScreen = () => {
  return (
    <CommunityStack.Navigator
      initialRouteName="Community"
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: Colors.navigator },
      }}>
      <CommunityStack.Screen name="Community" component={Community} />
      <CommunityStack.Screen
        name="CreateCommunity"
        component={CreateCommunity}
      />
    </CommunityStack.Navigator>
  );
};

const HabitsScreen = () => {
  return (
    <HabitsStack.Navigator
      initialRouteName="HabitsIndex"
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: Colors.navigator },
      }}>
      <HabitsStack.Screen name="HabitsIndex" component={Habits} />
      <HabitsStack.Screen name="AddHabit" component={AddHabit} />
      <HabitsStack.Screen name="ViewHabit" component={ViewHabit} />
    </HabitsStack.Navigator>
  );
};

const ProfilesScreen = ({ setIsLoggedIn }) => {
  return (
    <ProfileStack.Navigator
      initialRouteName="ProfileScreen"
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: Colors.navigator },
      }}>
      <ProfileStack.Screen name="ProfileScreen" component={ProfileScreen}/>
      <ProfileStack.Screen name="UserDataScreen" component={UserDataScreen} />
      <ProfileStack.Screen name="FollowScreen" component={FollowScreen} />
      <ProfileStack.Screen name="FollowersScreen" component={FollowersScreen} />
      <ProfileStack.Screen name="SettingsScreen">
        {() => <SettingsScreen setIsLoggedIn={setIsLoggedIn} />}
      </ProfileStack.Screen>
    </ProfileStack.Navigator>
  );
};

export default function Navigator({ setIsLoggedIn }) {
  const icons = (route, focused) => {
    const sizeStyle = { width: 24, height: 24 };

    switch (route.name) {
      case 'Timeline':
        return (
          <Image source={focused ? homeSelected : home} style={sizeStyle} />
        );
      case 'ExtraTips':
        return (
          <Image source={focused ? infoSelected : info} style={sizeStyle} />
        );
      case 'Checklist':
        return (
          <Image source={focused ? clipboardCheckSelected : clipboardCheck} style={sizeStyle} />
        );
      case 'Habits':
        return (
          <Image
            source={focused ? activitySelected : activity}
            style={focused ? { width: 22, height: 20 } : sizeStyle}
          />
        );
      case 'Community':
        return (
          <Image source={focused ? usersSelected : users} style={sizeStyle} />
        );
      case 'Profile':
        return (
          <Image source={focused ? userSelected : user} style={sizeStyle} />
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
      <Tab.Screen name="Checklist" component={ChecklistScreen} />
      <Tab.Screen name="Habits" component={HabitsScreen} />
      <Tab.Screen name="Community" component={CommunityScreen} />
      <Tab.Screen name="Profile">
        {() => <ProfilesScreen setIsLoggedIn={setIsLoggedIn} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

Navigator.propTypes = {
  route: PropTypes.object,
  setIsLoggedIn: PropTypes.func,
};
