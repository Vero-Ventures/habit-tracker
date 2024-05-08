import React from "react";
import { StyleSheet, View, Dimensions } from "react-native";
import { Text, Divider } from "react-native-elements";
import Icon from "react-native-vector-icons/FontAwesome5";
import Colors from "../../assets/styles/Colors";
import { systemWeights } from "react-native-typography";

const EmptyContent = () => {
  let offset = props.offset ? props.offset : 0;

  return (
    <View
      style={[
        styles.content,
        { height: Dimensions.get("window").height - 280 - offset },
      ]}
    >
      <Icon
        type="font-awesome"
        name={props.iconName}
        size={100}
        color={Colors.grey3}
      />
      <Text style={[systemWeights.semibold, styles.title]}>{props.title}</Text>
      <Divider />

      <Text style={[systemWeights.light, styles.subtitle]}>
        {props.subtitle}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  subtitle: {
    color: Colors.grey3,
    textAlign: "center",
    marginTop: 1,
    marginHorizontal: 30,
    fontSize: 17,
  },
  title: {
    color: Colors.grey3,
    marginTop: 25,
    marginHorizontal: 30,
    marginBottom: 10,
    fontSize: 30,
    textAlign: "center",
  },
});

export default EmptyContent;
