import React, { useState, useEffect } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  Dimensions,
  Image,
  Text,
  Alert,
} from "react-native";
import Default from "../../../assets/styles/Default";
import Colors from "../../../assets/styles/Colors";
import Fetching from "../../components/Fetching";
import Header from "../../components/Header";
import AddHabit from "./AddHabit";
import { Button } from "react-native-elements";
import { getAllCategoryUserHabits } from "../../store/ducks/habit";
import UserHabit from "../../components/UserHabit";
import * as Notifications from "expo-notifications";
import { sendPush } from "../../store/ducks/user";
import { useNavigation } from '@react-navigation/native';
const Habits = (props) => {
  const navigation = useNavigation();
  const [fetching, setFetching] = useState(false);
  const [user_habits, setUserHabits] = useState([]);

  useEffect(() => {
    fetchUserHabits(true);

    Notifications.cancelAllScheduledNotificationsAsync();

    registerPush();
  }, []);

  useEffect(() => {
    const unsubscribe = props.navigation.addListener("focus", () => {
      fetchUserHabits(false);
    });

    return unsubscribe;
  }, [props.navigation, fetchUserHabits]);

  const fetchUserHabits = async (is_fetching) => {
    is_fetching ? setFetching(true) : null;

    getAllCategoryUserHabits()
      .catch((err) => {
        // Alert.alert(
        //   "Ops!",
        //   "Something went wrong with our servers. Please contact us.",
        // );
      })
      .then((res) => {
        if (res?.status === 200) {
          if (res.data.errors) {
            // Alert.alert("Ops!", res.data.errors[0]);
          } else {
            setUserHabits(res.data);
          }
        }

        setFetching(false);
      });
  };

  const addHabit = () => {
    navigation.navigate('AddHabit');
  };

  registerPush = async () => {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();

    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      return;
    }

    let token = await Notifications.getExpoPushTokenAsync();

    sendPush({ usr_push_token: token.data }).catch((err) => {
      Alert.alert(
        "Ops",
        "Tivemos um problema ao registrar suas notificações. Entre em contato com o suporte.",
      );
    });
  };

  return (
    <View style={Default.container}>
      <Fetching isFetching={fetching}>
        {user_habits.length > 0 ? (
          <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
            <Header title="Habits" navigation={props.navigation} showMenu />

            <View style={styles.container}>
              <View style={[styles.innerContainer, { paddingTop: 0, flex: 1 }]}>
                <View style={styles.containerTitle}>
                  <Text style={styles.textTitle}>Habits</Text>
                </View>

                <View style={styles.containerMomentum}>
                  <Text style={styles.textMomentum}>My Momentum</Text>
                </View>

                <UserHabit
                  navigation={props.navigation}
                  user_habits={user_habits}
                  onRefresh={fetchUserHabits}
                  deleteHabit
                />
              </View>

              <View style={styles.containerButton}>
                <Button
                  buttonStyle={[
                    Default.loginCreateAccountButton,
                    { marginBottom: 16 },
                  ]}
                  titleStyle={Default.loginButtonBoldTitle}
                  onPress={() => props.navigation.navigate("Titans")}
                  title="SEE TITANS HABITS"
                />

                <Button
                  buttonStyle={Default.loginNextButton}
                  titleStyle={Default.loginButtonBoldTitle}
                  onPress={addHabit}
                  title="CREATE NEW HABIT"
                />
              </View>
            </View>
          </ScrollView>
        ) : (
          <View style={styles.container}>
            <View style={styles.innerContainer}>
              <Text style={styles.text1}>What can we improve in</Text>
              <Text style={styles.text2}>your life today?</Text>
            </View>

            <View style={styles.containerImage}>
              <Image
                source={require("../../../assets/images/Click.png")}
                style={styles.imageDetail}
              />
            </View>

            <View style={styles.containerButton}>
              <Button
                buttonStyle={Default.loginNextButton}
                titleStyle={Default.loginButtonBoldTitle}
                onPress={addHabit}
                title="ADD YOUR FIRST HABIT"
              />
            </View>
          </View>
        )}
      </Fetching>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "column",
    flex: 1,
    alignItems: "center",
    paddingVertical: 14,
    width: Dimensions.get("window").width,
    paddingHorizontal: 22,
  },
  innerContainer: {
    flexDirection: "column",
    alignItems: "center",
    paddingTop: 57,
  },
  containerImage: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
  },
  imageDetail: {
    width: 120,
    height: 120,
  },
  text1: {
    fontSize: 24,
    color: "white",
    fontWeight: "400",
    alignSelf: "center",
  },
  text2: {
    fontSize: 32,
    color: "white",
    fontWeight: "700",
    alignSelf: "center",
  },
  containerTitle: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 20,
    width: Dimensions.get("window").width - 44,
  },
  textTitle: {
    fontSize: 24,
    color: Colors.text,
    marginRight: 32,
  },
  containerMomentum: {
    borderBottomColor: Colors.text,
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingBottom: 9,
    marginBottom: 20,
  },
  textMomentum: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.text,
    width: Dimensions.get("window").width - 44,
  },
  containerButton: {
    marginTop: 60,
    marginBottom: 22,
  },
});

export default Habits;
