import React from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  Image,
  Text,
  Dimensions,
} from "react-native";
import Default from "../../assets/styles/Default";
import Colors from "../../assets/styles/Colors";
import Header from "../components/Header";
import { ListItem } from "react-native-elements";
import Icon from "react-native-vector-icons/FontAwesome5";
import { logout } from "../store/ducks/user";
import { useDispatch, useSelector } from "react-redux";

const Menu = (props) => {
  const userImage = useSelector(({ user }) => user.image);
  const userName = useSelector(({ user }) => user.name);

  const dispatch = useDispatch();

  return (
    <View style={Default.container}>
      <Header title="Menu" navigation={props.navigation} backMenu />

      <ScrollView>
        <View style={styles.container}>
          <View style={styles.containerHeader}>
            {userImage ? (
              <Image
                source={{ uri: userImage.url }}
                style={styles.profilePicture}
              />
            ) : (
              <Image
                source={require("../../assets/images/no-profile.png")}
                style={styles.profilePicture}
              />
            )}

            <Text style={styles.textName}>{`Hi, ${userName}!`}</Text>
          </View>

          <View>
            <ListItem
              containerStyle={styles.containerListItem}
              onPress={() => props.navigation.navigate("Checklist")}
            >
              <View style={styles.containerIcon}>
                <Image
                  source={require("../../assets/icons/calendar.png")}
                  style={styles.iconStyle}
                />
              </View>
              <ListItem.Content>
                <ListItem.Title style={styles.titleListItem}>
                  Daily Checklist
                </ListItem.Title>
              </ListItem.Content>
            </ListItem>

            <ListItem
              containerStyle={styles.containerListItem}
              onPress={() => props.navigation.navigate("Profile")}
            >
              <View style={styles.containerIcon}>
                <Image
                  source={require("../../assets/icons/bullseye.png")}
                  style={styles.iconStyle}
                />
              </View>
              <ListItem.Content>
                <ListItem.Title style={styles.titleListItem}>
                  Accomplishments
                </ListItem.Title>
              </ListItem.Content>
            </ListItem>

            <ListItem
              containerStyle={styles.containerListItem}
              onPress={() => props.navigation.navigate("Titans")}
            >
              <View style={styles.containerIcon}>
                <Image
                  source={require("../../assets/icons/omega.png")}
                  style={styles.iconStyle}
                />
              </View>
              <ListItem.Content>
                <ListItem.Title style={styles.titleListItem}>
                  Titan Habits
                </ListItem.Title>
              </ListItem.Content>
            </ListItem>

            <ListItem
              containerStyle={styles.containerListItem}
              onPress={() =>
                props.navigation.push("Home", {
                  screen: "Profile",
                  params: { screen: "MyProducts" },
                })
              }
            >
              <View style={styles.containerIcon}>
                <Image
                  source={require("../../assets/icons/store.png")}
                  style={styles.iconStyle}
                />
              </View>
              <ListItem.Content>
                <ListItem.Title style={styles.titleListItem}>
                  Products
                </ListItem.Title>
              </ListItem.Content>
            </ListItem>

            <ListItem
              containerStyle={styles.containerListItem}
              onPress={() =>
                props.navigation.push("Home", {
                  screen: "Profile",
                  params: { screen: "UpdateProfile" },
                })
              }
            >
              <View style={styles.containerIcon}>
                <Image
                  source={require("../../assets/icons/pencil.png")}
                  style={styles.iconStyle}
                />
              </View>
              <ListItem.Content>
                <ListItem.Title style={styles.titleListItem}>
                  Edit Profile
                </ListItem.Title>
              </ListItem.Content>
            </ListItem>

            <ListItem
              containerStyle={styles.containerListItem}
              onPress={() => {
                dispatch(logout());
                props.navigation.navigate("Auth");
              }}
            >
              <View style={styles.containerIcon}>
                <Image
                  source={require("../../assets/icons/exit.png")}
                  style={styles.iconStyle}
                />
              </View>
              <ListItem.Content>
                <ListItem.Title style={styles.titleListItem}>
                  Logout
                </ListItem.Title>
              </ListItem.Content>
            </ListItem>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 22,
    width: Dimensions.get("window").width,
    paddingBottom: 32,
  },
  containerHeader: {
    alignItems: "center",
    marginBottom: 28,
    marginTop: 20,
  },
  profilePicture: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  textName: {
    marginTop: 16,
    fontSize: 24,
    color: Colors.text,
  },
  containerListItem: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 0,
    borderBottomColor: "#264261",
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  titleListItem: {
    color: Colors.text,
    fontSize: 16,
    marginLeft: 15,
  },
  containerIcon: {
    width: 30,
    alignItems: "center",
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
});

export default Menu;
