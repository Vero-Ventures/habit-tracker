import React from "react";
import { Image } from "react-native";
import Colors from "../../assets/styles/Colors";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

const Tab = createBottomTabNavigator();

export default function Navigator() {
  const icons = (route, focused) => {
    const sizeStyle = { width: 24, height: 24 };

    switch (route.name) {
      case "Home":
        return <Image source={focused ? require("../../assets/icons/home-selected.png") : require("../../assets/icons/home.png")} style={sizeStyle} />;
      case "ExtraTips":
        return <Image source={focused ? require("../../assets/icons/info-selected.png") : require("../../assets/icons/info.png")} style={sizeStyle} />;
      case "Stakes":
        return <Image source={focused ? require("../../assets/icons/stakes-selected.png") : require("../../assets/icons/stakes.png")} style={sizeStyle} />;
      case "My Habits":
        return <Image source={focused ? require("../../assets/icons/activity-selected.png") : require("../../assets/icons/activity.png")} style={focused ? { width: 22, height: 20 } : sizeStyle} />;
      case "Community":
        return <Image source={focused ? require("../../assets/icons/users-selected.png") : require("../../assets/icons/users.png")} style={sizeStyle} />;
      case "Profile":
        return <Image source={focused ? require("../../assets/icons/user-selected.png") : require("../../assets/icons/user.png")} style={sizeStyle} />;
      default:
        return null;
    }
  };

  return (
    <NavigationContainer>
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
        })}
      >
        <Tab.Screen name="Home" component={() => <></>} />
        <Tab.Screen name="Stakes" component={() => <></>} />
        <Tab.Screen name="My Habits" component={() => <></>} />
        <Tab.Screen name="Community" component={() => <></>} />
        <Tab.Screen name="Profile" component={() => <></>} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
