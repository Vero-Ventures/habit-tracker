import React from "react";
import { View, StyleSheet, Dimensions, Text, Image } from "react-native";
import Default from "../../assets/styles/Default";
import Colors from "../../assets/styles/Colors";
import Header from "../components/Header";
import { Button } from "react-native-elements";

const Success = (props) => {
  const goBack = () => {
    props.navigation.navigate(
      props.route.params.screen,
      props.route.params.data ? props.route.params.data : null,
    );
  };

  return (
    <View style={Default.container}>
      <Header navigation={props.navigation} title="" />

      <View style={styles.container}>
        <View style={styles.textContainer}>
          <Image
            style={styles.imageStyle}
            source={require("../../assets/icons/check.png")}
          />

          <Text
            style={styles.textSuccess}
          >{`${props.route.params.message} added successfully.`}</Text>
        </View>

        <View style={styles.containerButton}>
          <Button
            buttonStyle={Default.loginNextButton}
            titleStyle={Default.loginButtonBoldTitle}
            onPress={goBack}
            title={props.route.params.buttonTitle}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: Dimensions.get("window").width,
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 22,
    paddingVertical: 32,
  },
  textSuccess: {
    color: Colors.text,
    fontSize: 24,
    paddingHorizontal: 40,
    textAlign: "center",
    marginTop: 27,
  },
  containerButton: {
    flex: 1,
    justifyContent: "flex-end",
  },
  textContainer: {
    marginTop: 90,
    alignItems: "center",
  },
  imageStyle: {
    width: 80,
    height: 80,
  },
});

export default Success;
