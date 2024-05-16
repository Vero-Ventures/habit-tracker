import React from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  Image,
  Dimensions,
} from "react-native";
import Default from "../../../../assets/styles/Default";
import Colors from "../../../../assets/styles/Colors";
import { Button } from "react-native-elements";
import { systemWeights } from "react-native-typography";

const HabitCommunitySuccess = (props) => {
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
              source={require("../../../../assets/icons/check.png")}
            />

            <Text style={styles.textSuccess}>
              {props.route?.params?.edit
                ? "Your edits have been\nsuccessfully saved."
                : "Your habit was shared\nsuccessfully."}
            </Text>
          </View>

          <View style={styles.containerButton}>
            <Image
              style={styles.imageLines}
              source={require("../../../../assets/images/lines-down.png")}
            />
            <Button
              buttonStyle={[Default.loginNextButton, {}]}
              titleStyle={Default.loginButtonBoldTitle}
              onPress={() =>
                props.navigation.navigate("AddCommunityHabit", {
                  community: { id: props.route?.params?.community?.id },
                })
              }
              title="CREATE ANOTHER HABIT"
            />

            <TouchableOpacity
              style={{ marginTop: 24 }}
              onPress={() =>
                props.navigation.navigate("FeedCommunity", {
                  community: { id: props.route?.params?.community?.id },
                })
              }
            >
              <View style={{ alignItems: "center" }}>
                <Text style={[systemWeights.bold, styles.createAccountText]}>
                  BACK TO COMMUNITY
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
    paddingHorizontal: 24,
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
    zIndex: 3,
    elevation: Platform.OS === "android" ? 3 : 0,
  },
  createAccountText: {
    fontSize: 16,
    color: "white",
    lineHeight: 21.79,
  },
  imageStyle: {
    width: 80,
    height: 80,
  },
  imageLines: {
    width: Dimensions.get("window").width,
    position: "absolute",
    bottom: -32,
  },
});

export default HabitCommunitySuccess;
