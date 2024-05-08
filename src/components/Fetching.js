import React from "react";
import { StyleSheet, View, Dimensions, ActivityIndicator } from "react-native";
import Colors from "../../assets/styles/Colors";

const Fetching = (props) => {
  return (
    <View style={styles.container}>
      {props.isFetching ? (
        <View style={[styles.content, props.containerStyle]}>
          <ActivityIndicator size="small" color={Colors.text} />
        </View>
      ) : (
        <View style={styles.container}>{props.children}</View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    height: Dimensions.get("window").height - 250,
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default Fetching;
