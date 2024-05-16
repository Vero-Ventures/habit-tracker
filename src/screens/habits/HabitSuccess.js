import React from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  Image,
} from "react-native";
import Default from "../../../assets/styles/Default";
import Colors from "../../../assets/styles/Colors";
import Header from "../../components/Header";
import { Button } from "react-native-elements";
import { systemWeights } from "react-native-typography";

const HabitSuccess = (props) => {
  return (
    <View style={Default.container}>
      <ScrollView
        style={Default.container}
        contentContainerStyle={Default.contentContainer}
      >
        <View style={styles.container}>
          <View style={styles.innerContainer}>
            <Image
              style={styles.imageStyle}
              source={require("../../../assets/icons/check.png")}
            />

            <Text style={styles.textSuccess}>
              {"Your habit was shared\nsuccessfully."}
            </Text>
          </View>

          <View style={styles.containerButton}>
            <Button
              buttonStyle={[Default.loginNextButton]}
              titleStyle={Default.loginButtonBoldTitle}
              onPress={() => props.navigation.navigate("AddHabit")}
              title="ADD OTHER HABIT"
            />

            <TouchableOpacity
              style={{ marginTop: 16 }}
              onPress={() => props.navigation.navigate("HabitsIndex")}
            >
              <View style={{ alignItems: "center" }}>
                <Text style={[systemWeights.bold, styles.createAccountText]}>
                  Go to home
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 32,
    paddingHorizontal: 22,
  },
  innerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 100,
  },
  textSuccess: {
    fontSize: 24,
    color: Colors.text,
    marginTop: 27,
    textAlign: "center",
  },
  containerButton: {
    alignItems: "center",
  },
  createAccountText: {
    fontSize: 14,
    color: "white",
  },
  imageStyle: {
    width: 80,
    height: 80,
  },
});

export default HabitSuccess;
