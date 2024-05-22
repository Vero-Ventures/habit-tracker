import React, { useRef, useState } from "react";
import {
  StyleSheet,
  Dimensions,
  View,
  Text,
  TouchableOpacity,
  Image,
  Platform,
} from "react-native";
import Colors from "../../../assets/styles/Colors";
import { LinearGradient } from "expo-linear-gradient";
import * as mime from "react-native-mime-types";
import VideoCard from "../../components/community/VideoCard";
import { useSelector } from "react-redux";

const PostCommunity = (props) => {
  const video = useRef(null);
  const [status, setStatus] = useState({});
  const [stopVideo, setStopVideo] = useState(false);
  const user = useSelector(({ user }) => user);

  const viewPost = () => {
    setStopVideo(true);
    props.navigation.navigate("ViewPostCommunity", {
      post: { id_post: props.post.id, savedPost: props.savedPost ?? false },
    });
  };

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

  const renderData = () => {
    return (
      <>
        <TouchableOpacity onPress={viewPost}>
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
              <Text style={styles.textUserName}>{props.post?.user?.name}</Text>
            </TouchableOpacity>
            <View style={styles.containerTextPost}>
              {props.post?.cop_text ? (
                <Text style={styles.textPost}>{props.post?.cop_text}</Text>
              ) : null}
              {props.post?.file?.length > 0 ? (
                mime
                  .lookup(props.post?.file[0]?.file?.att_name)
                  .includes("image") ? (
                  <View styles={{ flex: 1, alignItems: "center" }}>
                    <Image
                      source={{ uri: props.post?.file[0]?.file?.url }}
                      style={styles.file}
                      resizeMode="contain"
                    />
                  </View>
                ) : mime
                    .lookup(props.post?.file[0]?.file?.att_name)
                    .includes("video") ? (
                  <View>
                    <VideoCard
                      video={props.post?.file[0]?.file?.url}
                      stop={stopVideo}
                      navigation={props.navigation}
                    />
                  </View>
                ) : null
              ) : null}
            </View>
          </View>
          <TouchableOpacity onPress={viewPost} disabled={status.isPlaying}>
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
                onPress={() => {
                  props.navigation.navigate("ViewPostCommunity", {
                    post: { id_post: props.post.id },
                  }),
                    video.current ? video.current.stopAsync() : null;
                }}
              >
                <Image
                  source={require("../../../assets/icons/message-dots.png")}
                  style={styles.actionsIcons}
                />
                <Text style={styles.textCounter}>
                  {props.countComments ? props.countComments : null}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{ alignItems: "center" }}
                onPress={() => props.save()}
              >
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
          </TouchableOpacity>
        </TouchableOpacity>
      </>
    );
  };

  return Platform.OS === "android" ? (
    <LinearGradient
      colors={["rgba(156, 198, 255, 0.042)", "rgba(0, 37, 68, 0.15)"]}
      start={{ x: 0, y: 0.5 }}
      end={{ x: 1, y: 0.5 }}
      style={styles.containerList}
    >
      {renderData()}
    </LinearGradient>
  ) : (
    <View style={styles.containerList}>{renderData()}</View>
  );
};

const styles = StyleSheet.create({
  video: {
    alignSelf: "center",
    width: Dimensions.get("window").width,
    height: 230,
  },
  buttons: {
    top: 75,
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignSelf: "center",
    alignItems: "center",
    position: "absolute",
  },
  containerList: {
    marginBottom: 8,
    paddingTop: 16,
    zIndex: 2,
    elevation: 2,
    backgroundColor:
      Platform.OS === "ios" ? "rgba(0, 37, 68, 0.75)" : "transparent",
    width: Dimensions.get("window").width,
  },
  infoCommunity: {
    marginBottom: 21,
    zIndex: 3,
    elevation: 3,
  },
  containerItemPost: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 14,
    marginHorizontal: 16,
  },
  containerTextPost: {
    width: Dimensions.get("window").width,
    borderBottomColor: "#264261",
    borderBottomWidth: StyleSheet.hairlineWidth,
    //paddingBottom: 16,
  },
  textCounter: {
    fontWeight: "500",
    fontSize: 12,
    lineHeight: 18,
    color: "#FFFFFF",
    //marginLeft: 7,
  },
  actionsIcons: {
    width: 24,
    height: 24,
    marginRight: 4,
    alignSelf: "center",
    left: 0,
  },
  buttonPlay: {
    alignSelf: "center",
    width: 72,
    height: 72,
  },
  containerActionsPost: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignSelf: "center",
    width: Dimensions.get("window").width - 74,
    marginBottom: 19,
  },
  textPost: {
    fontWeight: "400",
    fontSize: 14,
    lineHeight: 21,
    color: "#FFFFFF",
    marginHorizontal: 16,
    marginBottom: 16,
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
  file: {
    alignSelf: "center",
    width: Dimensions.get("window").width,
    height: 230,
  },
});

export default PostCommunity;
