import React from 'react';
import PropTypes from 'prop-types';
import { Image } from 'react-native';
import Colors from '../../assets/styles/Colors';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import Habits from '../screens/habits/Habits';
import AddHabit from '../screens/habits/AddHabit';
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
import checklist from '../../assets/icons/clipboard-check.png';
import checklistSelected from '../../assets/icons/clipboard-check-selected.png';
import Timeline from '../screens/timeline/Timeline';
import Community from '../screens/community/Community';
import CreateCommunity from '../screens/community/CreateCommunity';
import Profile from '../screens/profile/Profile';
import UpdateProfile from '../screens/profile/UpdateProfile';
import CheckoutScreen from '../components/CheckoutScreen';

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


const ProfileScreen = () => {
  return (
    <ProfileStack.Navigator
      initialRouteName="ProfileIndex"
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: Colors.navigator },
      
      }}>

  <ProfileStack.Screen name="ProfileIndex" component={Profile} />
      <ProfileStack.Screen name="UpdateProfile" component={UpdateProfile} />
      {/* <ProfileStack.Screen name="MyProducts" component={MyProducts} />
      <ProfileStack.Screen name="AddProducts" component={AddProducts} />
      <ProfileStack.Screen name="Success" component={Success} />
      <ProfileStack.Screen name="ScoreForm" component={ScoreForm} />
      <ProfileStack.Screen name="Connections" component={Connections} />
      <ProfileStack.Screen
        name="UserConnections"
        component={UserConnections}
      />
      <ProfileStack.Screen name="UserProfile" component={UserProfile} />
      <ProfileStack.Screen name="Ranking" component={Ranking} />
      <ProfileStack.Screen
        name="HealthHabitReport"
        component={HealthHabitReport}
      />
      <ProfileStack.Screen
        name="HealthHabitReportDetails"
        component={HealthHabitReportDetails}
      />
      <ProfileStack.Screen name="UserCommunity" component={UserCommunity} />
      <ProfileStack.Screen name="UserHabit" component={UserHabit} />
      <ProfileStack.Screen
        name="UpdateFavoriteFood"
        component={UpdateFavoriteFood}
      />
      <ProfileStack.Screen
        name="UpdateFavoriteBook"
        component={UpdateFavoriteBook}
      />
      <ProfileStack.Screen name="SavedPost" component={SavedPost} /> */}
    </ProfileStack.Navigator>

    )};


      
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
    </HabitsStack.Navigator>

  );
};

export default function Navigator({ route }) {
  // const { session } = route.params;
  const icons = (route, focused) => {
    const sizeStyle = { width: 24, height: 24 };

    switch (route.name) {
      case 'Timeline':
        return (
          <Image source={focused ? homeSelected : home} style={sizeStyle} />
        );
      case 'Checklist':
        return (
          <Image source={focused ? checklistSelected : checklist} style={sizeStyle} />
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
      })}>
      <Tab.Screen name="Timeline" component={Timeline} />
      <Tab.Screen name="Checklist" component={CheckoutScreen} />
      <Tab.Screen options={{ title: 'Habits' }} name="Habits" component={HabitsScreen}/>
      <Tab.Screen name="Community" component={CommunityScreen} />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen} // This used to be ProfileScreen, I am putting duplicate community screen temporarily since no Profile is available when not logged in
    // This used to be ProfileScreen, I am putting duplicate community screen temporarily since no Profile is available when not logged in
        // initialParams={{ session: session }}
      />
    </Tab.Navigator>
  );
}

Navigator.propTypes = {
  route: PropTypes.object,
};
