import React from "react";
import {
  StyleSheet,
  Dimensions,
  View,
  Text,
  TouchableOpacity,
  Image,
} from "react-native";
import Colors from "../../../assets/styles/Colors";
import { LinearGradient } from "expo-linear-gradient";
import { useSelector } from "react-redux";

const PostHabits = (props) => {
  const user = useSelector(({ user }) => user);

  const viewUser = (obj) => {
    if (user.id === obj.id) {
      props.navigation.navigate("Home", {
        screen: "Profile",
        params: { screen: "ProfileIndex" },
      });
    } else {
      props.navigation.push("Home", {
        screen: "Profile",
        params: {
          screen: "UserProfile",
          params: { user: { id_user: obj.id } },
        },
      });
    }
  };

  return (
    <>
      <TouchableOpacity
        onPress={() =>
          props.navigation.navigate("ViewPostCommunity", {
            post: { id_post: props.post.id, savedPost: props.savedPost },
          })
        }
      >
        <LinearGradient
          colors={["rgba(156, 198, 255, 0.042)", "rgba(0, 37, 68, 0.15)"]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={styles.containerList}
        >
          <View style={styles.infoCommunity}>
            <TouchableOpacity
              style={styles.containerItemPost}
              onPress={() => viewUser(props.post?.user)}
            >
              {props.post?.user?.image ? (
                <Image
                  source={{ uri: props.post?.user?.image?.url }}
                  style={styles.userPhoto}
                />
              ) : (
                <Image
                  source={require("../../../assets/images/no-profile.png")}
                  style={styles.userPhoto}
                />
              )}
              <View
                style={{
                  flex: 1,
                  flexDirection: "column",
                  justifyContent: "flex-start",
                }}
              >
                <Text style={styles.textUserName}>
                  {props.post?.user?.name}
                </Text>
                <Text style={styles.textSubtitle}>Automatic Posting</Text>
              </View>
            </TouchableOpacity>
            <View style={styles.containerTextPost}>
              {props.post?.cop_type === "new_habit" ? (
                <Text style={styles.textPost}>
                  {props.post?.user?.name} {props.post?.cop_text.slice(0, 19)}
                  {props.post?.cop_text.slice(34)}
                </Text>
              ) : (
                <Text style={styles.textPost}>{props.post?.cop_text}</Text>
              )}
              <LinearGradient
                style={styles.containerGradientPost}
                colors={
                  props.post?.cop_type === "new_habit"
                    ? ["#01325B", "#302E50", "#ED1C24"]
                    : ["#EF9324", "#89510F"]
                }
                locations={
                  props.post?.cop_type === "new_habit" ? [0, 0.21, 1] : [0, 1]
                }
                start={
                  props.post?.cop_type === "new_habit"
                    ? { x: 0, y: 0 }
                    : { x: 0, y: 1 }
                }
                end={
                  props.post?.cop_type === "new_habit"
                    ? { x: 1, y: 2 }
                    : { x: 1, y: 3 }
                }
              >
                <View style={{ width: "80%" }}>
                  {props.post?.cop_type === "new_habit" ? (
                    <>
                      <Text style={styles.textCardPost}>
                        {props.post?.cop_text.slice(0, 19)}
                      </Text>
                      <Text style={styles.textPost}>
                        {props.post?.cop_text.slice(20)}
                      </Text>
                    </>
                  ) : (
                    <>
                      <Text style={styles.textCardPost}>
                        {props.post?.cop_text.slice(
                          0,
                          props.post?.cop_text.indexOf(".") + 1,
                        )}
                      </Text>
                      <Text style={styles.textPost}>
                        {props.post?.cop_text.slice(
                          props.post?.cop_text.indexOf(".") + 1,
                        )}
                      </Text>
                    </>
                  )}
                </View>
                <Image
                  source={require("../../../assets/icons/medal-post.png")}
                  style={styles.imagemContador}
                />
              </LinearGradient>
            </View>
          </View>
          <View style={styles.containerActionsPost}>
            <TouchableOpacity
              style={{ flexDirection: "row", alignItems: "center" }}
              onPress={() => props.like()}
            >
              <Image
                source={
                  props.liked
                    ? require("../../../assets/icons/heart-full.png")
                    : require("../../../assets/icons/heart.png")
                }
                style={styles.actionsIcons}
              />
              <Text style={styles.textCounter}>
                {props.countLikes ? props.countLikes : null}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{ flexDirection: "row", alignItems: "center" }}
              onPress={() =>
                props.navigation.navigate("ViewPostCommunity", {
                  post: { id_post: props.post.id },
                })
              }
            >
              <Image
                source={require("../../../assets/icons/message-dots.png")}
                style={styles.actionsIcons}
              />
              <Text style={styles.textCounter}>
                {props.countComments ? props.countComments : null}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={{}} onPress={() => props.save()}>
              <Image
                source={
                  props.saved
                    ? require("../../../assets/icons/bookmark-selected.png")
                    : require("../../../assets/icons/bookmark.png")
                }
                style={styles.actionsIcons}
              />
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </>
  );
};

const styles = StyleSheet.create({
  containerList: {
    marginBottom: 8,
    paddingTop: 16,
    zIndex: 1,
    elevation: 1,
    width: Dimensions.get("window").width,
  },
  textSubtitle: {
    fontSize: 14,
    lineHeight: 19,
    fontWeight: "400",
    color: "rgba(255, 255, 255, 0.5)",
  },
  infoCommunity: {
    marginBottom: 21,
  },
  containerItemPost: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginLeft: 16,
    marginBottom: 13,
  },
  containerGradientPost: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
    paddingVertical: 16,
    marginHorizontal: 16,
    borderRadius: 4,
    width: Dimensions.get("window").width - 32,
  },
  containerTextPost: {
    width: Dimensions.get("window").width,
    borderBottomColor: "#264261",
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingBottom: 16,
  },
  textCounter: {
    fontWeight: "500",
    fontSize: 12,
    lineHeight: 18,
    color: "#FFFFFF",
  },
  actionsIcons: {
    width: 24,
    height: 24,
    marginRight: 4,
    alignSelf: "center",
    left: 0,
  },
  containerActionsPost: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignSelf: "center",
    width: Dimensions.get("window").width - 74,
    marginBottom: 19,
  },
  textCardPost: {
    fontWeight: "700",
    fontSize: 16,
    lineHeight: 24,
    color: "#FFFFFF",
    marginHorizontal: 16,
  },
  textPost: {
    fontWeight: "400",
    fontSize: 14,
    lineHeight: 21,
    color: "#FFFFFF",
    marginHorizontal: 16,
  },
  textUserName: {
    flex: 1,
    fontSize: 16,
    fontWeight: "700",
    lineHeight: 22,
    color: Colors.text,
  },
  userPhoto: {
    width: 32,
    height: 32,
    borderRadius: 32,
    marginRight: 12,
  },
  imagemContador: {
    width: 40,
    height: 40,
    borderRadius: 32,
    marginRight: 16,
  },
});

export default PostHabits;
