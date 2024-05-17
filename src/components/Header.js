import React from "react";
import {
  StyleSheet,
  View,
  Dimensions,
  TouchableOpacity,
  Text,
  Image,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome5";
import Colors from "../../assets/styles/Colors";
import { systemWeights } from "react-native-typography";
// import { useSelector } from "react-redux";

const Header = (props) => {
  // const user = useSelector(({ user }) => user);

  return (
    <View
      style={[
        styles.headerContainer,
        props.backButton ? styles.containerBackButton : null,
        props.customHeaderStyle ?? null,
      ]}
    >
      {props.backButton ? (
        <TouchableOpacity
          style={styles.backButtonStyle}
          onPress={() => props.navigation.pop()}
        >
          <Icon
            type="font-awesome"
            name="chevron-left"
            size={16}
            color="white"
          />
        </TouchableOpacity>
      ) : null}

      {props.showBackgroundImage ? (
        <Image
          style={styles.image}
          source={require("../../assets/images/bg.png")}
        />
      ) : null}

      <View style={styles.containerContent}>
        {props.title ? (
          <TouchableOpacity
            disabled={props.backButton ? false : true}
            onPress={() => props.navigation.pop()}
          >
            <Text style={[styles.title, systemWeights.regular]}>
              {props.title}
            </Text>
          </TouchableOpacity>
        ) : null}

        {props.showMenu ? (
          // <TouchableOpacity onPress={() => props.navigation.navigate('Menu')}>
          // 	<Icon type='font-awesome' name="bars" size={25} color="white" />
          // </TouchableOpacity>
          user.image ? (
            <TouchableOpacity onPress={() => props.navigation.navigate("Menu")}>
              <Image
                source={{ uri: user.image.url }}
                style={styles.userPhoto}
              />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={() => props.navigation.navigate("Menu")}>
              <Image
                source={require("../../assets/images/no-profile.png")}
                style={styles.userPhoto}
              />
            </TouchableOpacity>
          )
        ) : null}

        {props.backMenu ? (
          <TouchableOpacity
            onPress={() =>
              props.navigation.navigate("Home", {
                screen: "Habit",
                params: { screen: "HabitsIndex" },
              })
            }
          >
            <Icon type="font-awesome" name="times" size={25} color="white" />
          </TouchableOpacity>
        ) : null}

        {props.customRightIcon ? props.customRightIcon : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    paddingTop: 58,
    width: Dimensions.get("window").width,
    backgroundColor: Colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 22,
  },
  containerBackButton: {
    justifyContent: "flex-start",
  },
  backButtonStyle: {
    paddingVertical: 10,
    paddingRight: 17,
  },
  title: {
    fontSize: 24,
    color: Colors.text,
  },
  containerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    flex: 1,
    alignItems: "center",
  },
  userPhoto: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  image: {
    position: "absolute",
    top: 0,
    left: 120,
    width: Dimensions.get("window").width,
    aspectRatio: 2.5 / 1,
    height: undefined,
  },
});

export default Header;
