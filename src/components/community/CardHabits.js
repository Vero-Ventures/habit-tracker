import React from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
  Dimensions,
} from "react-native";
import Colors from "../../../assets/styles/Colors";

const CardHabits = (props) => {
  const onCardPress = () => {
    if (props.timeline) {
      props.navigation.push("Home", {
        screen: "Habits",
        params: { screen: "HabitSelected", params: { hab_id: props.habit.id } },
      });
      return;
    }

    if (props.myHabit) {
      props.navigation.push("Home", {
        screen: "Habits",
        params: {
          screen: "ViewHabit",
          params: { user_habit_id: props.userHabit },
        },
      });
      return;
    }

    props.navigation.push("Home", {
      screen: "Community",
      params: {
        screen: "ViewCommunityHabit",
        params: {
          habit: { id: props.communityHabit, admin: props.admin },
          community: { id: props.community.id },
          onlyViewMode: props.onlyViewMode,
        },
      },
    });
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.habit} onPress={onCardPress}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>
            {props.isMomentum
              ? props.habit?.category
              : props.habit?.category?.hac_name}
          </Text>
        </View>

        {props.habit?.image ? (
          <Image
            source={{ uri: props.habit?.image?.url }}
            style={styles.habitImage}
            resizeMode="cover"
          />
        ) : (
          <Image
            source={require("../../../assets/images/no-habits-photo.png")}
            style={styles.noHabitImage}
            resizeMode="contain"
          />
        )}

        <View style={styles.footer}>
          <Text numberOfLines={2} style={styles.habitTitle}>
            {props.habit?.hab_name}
          </Text>

          {props.isMomentum ? (
            <View style={styles.containerStreak}>
              <Text
                style={styles.textStreak}
              >{`${props.currentStreak}/30`}</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.containerShadow} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginLeft: 16,
    marginTop: 16,
  },
  habit: {
    flex: 1,
    justifyContent: "flex-end",
    width: (Dimensions.get("window").width - 48) / 2,
    height: ((Dimensions.get("window").width - 48) / 2) * 1.31,
  },
  containerShadow: {
    backgroundColor: "rgba(0,0,0,0.5)",
    width: (Dimensions.get("window").width - 48) / 2,
    height: ((Dimensions.get("window").width - 48) / 2) * 1.31,
    position: "absolute",
    borderRadius: 4,
  },
  containerStreak: {
    marginRight: 12,
    height: 36,
    width: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: "#318FC5",
    alignItems: "center",
    justifyContent: "center",
  },
  textStreak: {
    fontSize: 9,
    color: Colors.text,
  },
  header: {
    flexDirection: "row",
    justifyContent: "flex-start",
    top: 0,
    marginTop: 12,
    marginLeft: 12,
    zIndex: 3,
    elevation: 3,
    position: "absolute",
  },
  headerTitle: {
    color: Colors.text,
    fontWeight: "700",
    fontSize: 14,
    lineHeight: 19,
  },
  habitImage: {
    width: "100%",
    height: "100%",
    borderRadius: 4,
  },
  noHabitImage: {
    width: "60%",
    height: "60%",
    alignSelf: "center",
    justifyContent: "center",
    marginBottom: 48,
    borderRadius: 4,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    position: "absolute",
    alignSelf: "center",
    zIndex: 7,
    elevation: 7,
    width: 131,
    marginHorizontal: 12,
    paddingBottom: 12,
  },
  habitTitle: {
    color: Colors.text,
    fontWeight: "600",
    fontSize: 13,
    lineHeight: 16,
    textAlign: "left",
    width: "100%",
  },
});

export default CardHabits;
