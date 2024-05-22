import React, { useRef, useState, useEffect } from "react";
import {
  StyleSheet,
  Dimensions,
  View,
  Image,
  Text,
  ActivityIndicator,
  Platform,
} from "react-native";
import Colors from "../../../assets/styles/Colors";
import { Video } from "expo-av";
import { LinearGradient } from "expo-linear-gradient";
import moment from "moment";
import * as mime from "react-native-mime-types";

const PostComment = (props) => {
  const videoRef = useRef(null);
  const [statusVideoComment, setStatusVideoComment] = useState({});
  const [isPreloading, setIsPreloading] = useState(false);

  useEffect(() => {
    return () => {
      setStatusVideoComment({});
    };
  }, []);

  useEffect(() => {
    if (props.comment?.file) {
      mime.lookup(props.comment?.file?.att_name).includes("video")
        ? loadVideo(props.comment?.file?.url)
        : null;
    }
  }, [props.comment]);

  const loadVideo = async (source) => {
    if (source && videoRef.current) {
      await unloadVideo();
      await videoRef.current.loadAsync({ uri: source });
    }
  };

  async function unloadVideo() {
    if (videoRef.current !== null) {
      await videoRef.current.unloadAsync();
    }
  }

  const renderData = () => {
    return (
      <>
        <View style={styles.containerComment}>
          {props.comment?.user?.image ? (
            <Image
              source={{ uri: props.comment?.user?.image?.url }}
              style={styles.userPhoto}
            />
          ) : (
            <Image
              source={require("../../../assets/images/no-profile.png")}
              style={styles.userPhoto}
            />
          )}
          <Text style={styles.textUserName}>{props.comment?.user?.name}</Text>
        </View>
        <View style={styles.containerInfoComment}>
          {props.comment?.file ? (
            mime.lookup(props.comment?.file?.att_name).includes("image") ? (
              <Image
                source={{ uri: props.comment?.file?.url }}
                style={styles.attachmentComments}
              />
            ) : mime.lookup(props.comment?.file?.att_name).includes("video") ? (
              <View
                styles={{
                  justifyContent: "center",
                  alignItems: "center",
                  position: "relative",
                }}
              >
                {isPreloading && (
                  <ActivityIndicator
                    animating
                    color={"gray"}
                    size="large"
                    style={{
                      flex: 1,
                      position: "absolute",
                      top: "40%",
                      left: "45%",
                    }}
                  />
                )}
                <Video
                  ref={videoRef}
                  style={styles.attachmentComments}
                  onLoadStart={() => setIsPreloading(true)}
                  onReadyForDisplay={() => setIsPreloading(false)}
                  source={{
                    uri: props.comment?.file?.url,
                  }}
                  useNativeControls={!isPreloading}
                  resizeMode="contain"
                  isLooping
                  onPlaybackStatusUpdate={(status) =>
                    setStatusVideoComment(() => status)
                  }
                />
              </View>
            ) : null
          ) : null}

          {props.comment?.cpc_text !== "" && props.comment?.cpc_text ? (
            <Text style={styles.textComment}>{props.comment?.cpc_text}</Text>
          ) : null}
          <Text style={styles.textCreatedAtComment}>
            {moment(props.comment?.created_at).format("HH:mm - MM/DD/YYYY")}
          </Text>
        </View>
      </>
    );
  };

  return Platform.OS === "android" ? (
    <LinearGradient
      colors={["rgba(156, 198, 255, 0.042)", "rgba(0, 37, 68, 0.15)"]}
      start={{ x: 0, y: 0.5 }}
      end={{ x: 1, y: 0.5 }}
      style={styles.containerGradientSendPost}
    >
      {renderData()}
    </LinearGradient>
  ) : (
    <View style={styles.containerGradientSendPost}>{renderData()}</View>
  );
};

const styles = StyleSheet.create({
  containerGradientSendPost: {
    marginBottom: 8,
    zIndex: 1,
    elevation: 1,
    backgroundColor:
      Platform.OS === "ios" ? "rgba(0, 37, 68, 0.75)" : "transparent",
    width: Dimensions.get("window").width,
  },
  containerInfoComment: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "flex-start",
    alignSelf: "center",
    width: Dimensions.get("window").width - 48,
    marginBottom: 19,
  },
  containerComment: {
    flexDirection: "row",
    justifyContent: "flex-start",
    paddingVertical: 3,
    alignItems: "center",
    width: Dimensions.get("window").width,
    marginBottom: 16,
    marginHorizontal: 24,
    paddingTop: 16,
  },
  textCreatedAtComment: {
    fontWeight: "400",
    fontSize: 12,
    lineHeight: 18,
    color: "rgba(255, 255, 255, 0.64)",
    marginTop: 12,
  },
  attachmentComments: {
    width: Dimensions.get("window").width - 48,
    resizeMode: "cover",
    borderRadius: 16,
    marginBottom: 12,
    height: 326,
  },
  textComment: {
    fontSize: 16,
    lineHeight: 16,
    fontWeight: "700",
    color: Colors.text,
    paddingTop: 2,
  },
  buttons: {
    top: "40%",
    alignSelf: "center",
    position: "absolute",
  },
  buttonPlay: {
    width: 72,
    height: 72,
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
});

export default PostComment;
