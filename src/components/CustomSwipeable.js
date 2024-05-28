import React, { useRef } from "react";
import { StyleSheet, View, TouchableOpacity } from "react-native";
import { Text } from "react-native-elements";
import Icon from "react-native-vector-icons/FontAwesome5";
import Colors from "../../assets/styles/Colors";
import Swipeable from "react-native-gesture-handler/Swipeable";

const CustomSwipeable = (props) => {
  const swipeableRef = useRef();

  const rightContent = () => {
    return (
      <View style={styles.containerCheckItemRight}>
        <Icon size={26} color={Colors.text} name="check" />
      </View>
    );
  };

  const leftContent = () => {
    return (
      <View style={styles.containerCheckItemLeft}>
        <Icon size={26} color={Colors.text} name="redo" />
      </View>
    );
  };

  const getTextCheckedStyle = (obj) => {
    // if (moment(obj.ush_last_checked).format('MM/DD/YYYY') === moment(new Date()).format('MM/DD/YYYY')) {
    if (obj.user_habit_check) {
      if (obj.user_habit_check.uhc_checked) {
        return styles.textCheked;
      }
    }
    // }
  };

  const onLeftOpen = () => {
    swipeableRef.current.close();
    props.onSwipeableLeftOpen();
  };

  const onRightOpen = () => {
    swipeableRef.current.close();
    props.onSwipeableRightOpen();
  };

  return (
    <Swipeable
      renderLeftActions={leftContent}
      renderRightActions={rightContent}
      ref={swipeableRef}
      onSwipeableOpen={(direction) => {
        if (direction === 'left') {
          onLeftOpen();
        } else if (direction === 'right') {
          onRightOpen();
        }
      }}
    >
      <TouchableOpacity onPress={props.onPress}>
        <View style={styles.habitItem}>
          <Text
            style={[
              styles.textAccordionContent,
              getTextCheckedStyle(props.user_habit),
            ]}
          >
            {props.user_habit.habit.hab_name}
          </Text>
        </View>
      </TouchableOpacity>
    </Swipeable>
  );
};

const styles = StyleSheet.create({
  containerCheckItemRight: {
    backgroundColor: Colors.primary4,
    justifyContent: "center",
    alignItems: "flex-end",
    paddingRight: 22,
    flex: 1,
  },
  containerCheckItemLeft: {
    backgroundColor: Colors.primary3,
    justifyContent: "center",
    alignItems: "flex-start",
    paddingLeft: 22,
    flex: 1,
  },
  textCheked: {
    textDecorationLine: "line-through",
    color: Colors.primary4,
  },
  textAccordionContent: {
    fontSize: 14,
    color: Colors.text,
  },
  habitItem: {
    paddingVertical: 22,
    paddingHorizontal: 22,
    backgroundColor: Colors.primary6,
  },
});

export default CustomSwipeable;
