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

const CardCommunity = (props) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.community}
        onPress={() =>
          props.type === "My Communities" ||
          props.community?.community_member?.length > 0
            ? props.navigation.push("Home", {
                screen: "Community",
                params: {
                  screen: "FeedCommunity",
                  params: { community: { id: props.community.id } },
                },
              })
            : props.navigation.navigate("Home", {
                screen: "Community",
                params: {
                  screen: "ViewCommunity",
                  params: { community: { id: props.community.id } },
                },
              })
        }
      >
        <Image
          source={{
            uri: props.community?.image?.url,
          }}
          style={styles.communityImage}
          resizeMode="cover"
        />
        <View style={styles.footer}>
          <Text numberOfLines={2} style={styles.communityTitle}>
            {props.community.com_name}
          </Text>
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
    width: (Dimensions.get("window").width - 48) / 2,
    height: ((Dimensions.get("window").width - 48) / 2) * 1.31,
  },
  community: {
    flex: 1,
    justifyContent: "flex-end",
    width: "100%",
    height: "100%",
  },
  containerShadow: {
    backgroundColor: "rgba(0,0,0,0.5)",
    width: (Dimensions.get("window").width - 48) / 2,
    height: ((Dimensions.get("window").width - 48) / 2) * 1.31,
    position: "absolute",
    borderRadius: 4,
  },
  header: {
    flexDirection: "row",
    justifyContent: "flex-start",
    top: 0,
    marginTop: 12,
    marginLeft: 19,
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
  communityImage: {
    width: "100%",
    height: "100%",
    borderRadius: 4,
  },
  footer: {
    position: "absolute",
    alignSelf: "center",
    zIndex: 7,
    elevation: 7,
    width: 131,
    marginHorizontal: 12,
    paddingBottom: 12,
  },
  communityTitle: {
    color: Colors.text,
    fontWeight: "600",
    fontSize: 13,
    lineHeight: 16,
    textAlign: "left",
  },
});

export default CardCommunity;
