import React, { useEffect } from "react";
import { View, StyleSheet, Dimensions, Text, Image } from "react-native";
import Colors from "../../../assets/styles/Colors";

const ViewPost = (props) => {
  useEffect(() => {
    setTimeout(() => {
      props.navigation.pop();
    }, 2000);
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.containerSection}>
        <Image
          source={require("../../../assets/icons/check.png")}
          resizeMode={"contain"}
          style={styles.image}
        />
        <View style={styles.containerThanks}>
          <Text style={[styles.text, { fontWeight: "bold" }]}>Thank you</Text>
          <Text style={styles.text}>
            for you collaborating with Live Timeless.
          </Text>
        </View>
        <View style={styles.containerText}>
          <Text style={styles.textSubtitle}>
            Your participation is essential for us to continue on the path of
            good habits.
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: Dimensions.get("window").width,
    backgroundColor: Colors.primary,
  },
  containerSection: {
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  containerThanks: {
    width: Dimensions.get("window").width - 78,
    marginTop: 42,
  },
  containerText: {
    width: Dimensions.get("window").width - 48,
    marginTop: 16,
  },
  text: {
    fontSize: 24,
    color: Colors.text,
    lineHeight: 32,
    textAlign: "center",
  },
  textSubtitle: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 21,
    textAlign: "center",
  },
  image: {
    width: 111,
    height: 111,
  },
});

export default ViewPost;
