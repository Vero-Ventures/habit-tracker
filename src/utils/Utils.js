import React from "react";
import { Image, Platform } from "react-native";
import Default from "../../assets/styles/Default";
import * as ImagePicker from "expo-image-picker";
import * as mime from "react-native-mime-types";
import { manipulateAsync } from "expo-image-manipulator";

export const getIcon = (hac_name, icon) => {
  if (icon !== null) {
    return <Image source={{ uri: icon.url }} style={Default.iconStyle} />;
  } else {
    switch (hac_name) {
      case "Sleep":
        return (
          <Image
            source={require("../../assets/icons/bed.png")}
            style={Default.iconStyle}
          />
        );
      case "Stress":
        return (
          <Image
            source={require("../../assets/icons/alert.png")}
            style={Default.iconStyle}
          />
        );
      case "Fuel":
        return (
          <Image
            source={require("../../assets/icons/battery.png")}
            style={Default.iconStyle}
          />
        );
      case "Movement":
        return (
          <Image
            source={require("../../assets/icons/bolt.png")}
            style={Default.iconStyle}
          />
        );
      default:
        return (
          <Image
            source={require("../../assets/icons/bed.png")}
            style={Default.iconStyle}
          />
        );
    }
  }
};

export const getFrequencyTypes = () => {
  return ["EVERYDAY", "WEEKDAY", "CUSTOM"];
};

export function getAchievements(data) {
  let achievements = [];
  data.map((cat, cat_i) => {
    return cat.habits.map((hab, hab_i) => {
      if (hab.ush_current_streak > 29) {
        hab.hac_name = cat.hac_name;

        achievements.push(hab);
      }
    });
  });
  return achievements;
}

export function getIconPost(type_post) {
  switch (type_post) {
    case "connection":
      return (
        <Image
          source={require("../../assets/icons/users-white.png")}
          style={{ width: 38, height: 38 }}
        />
      );
    case "community":
      return (
        <Image
          source={require("../../assets/icons/users-white.png")}
          style={{ width: 38, height: 38 }}
        />
      );
    case "score":
      return (
        <Image
          source={require("../../assets/icons/bookmark-white.png")}
          style={{ width: 38, height: 38 }}
        />
      );
    case "check_habit":
      return (
        <Image
          source={require("../../assets/icons/bookmark-white.png")}
          style={{ width: 38, height: 38 }}
        />
      );
    default:
      return (
        <Image
          source={require("../../assets/icons/bookmark-white.png")}
          style={{ width: 38, height: 38 }}
        />
      );
  }
}

export const takeCamera = async () => {
  try {
    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      base64: true,
    });

    if (!result.canceled) {
      const manipulateResult = await manipulateAsync(
        result.assets[0].uri,
        [{ resize: { width: 756 } }],
        { compress: 0.5 }, // from 0 to 1 "1 for best quality"
      );

      return {
        name: manipulateResult.uri.split("\\").pop().split("/").pop(),
        type: mime.lookup(manipulateResult.uri),
        uri:
          Platform.OS === "android"
            ? manipulateResult.uri
            : manipulateResult.uri.replace("file://", ""),
      };
    }
  } catch (err) {
    return "failed";
  }
};

export const takeGaleria = async () => {
  try {
    let result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      base64: true,
    });

    if (!result.canceled) {
      const manipulateResult = await manipulateAsync(
        result.assets[0].uri,
        [{ resize: { width: 756 } }],
        { compress: 0.5 }, // from 0 to 1 "1 for best quality"
      );

      return {
        name: manipulateResult.uri.split("\\").pop().split("/").pop(),
        type: mime.lookup(manipulateResult.uri),
        uri:
          Platform.OS === "android"
            ? manipulateResult.uri
            : manipulateResult.uri.replace("file://", ""),
      };
    }
  } catch (err) {
    return "failed";
  }
};

export const percentageOfValueFromTotal = (value, total) =>
  Math.floor((value * 100) / total);
