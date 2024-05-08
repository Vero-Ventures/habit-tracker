import React, { useRef, useState, useEffect } from "react";
import {
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { Video } from "expo-av";

const VideoCard = (props) => {
  const videoRef = useRef(null);
  const [status, setStatus] = useState({});
  const [isPreloading, setIsPreloading] = useState(false);

  useEffect(() => {
    videoRef.current ? videoRef.current.stopAsync() : null;
  }, [props?.navigation]);

  useEffect(() => {
    return () => {
      videoRef.current ? videoRef.current.stopAsync() : null;
      setStatus({});
    };
  }, [props?.stop]);

  useEffect(() => {
    loadVideo(props.video);
  }, [props?.video]);

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

  return (
    <TouchableOpacity styles={{ flex: 1, alignItems: "center" }}>
      {isPreloading ? (
        <ActivityIndicator
          animating
          color={"gray"}
          size="large"
          style={{ flex: 1, position: "absolute", top: "40%", left: "45%" }}
        />
      ) : null}
      {props?.video ? (
        <Video
          rate={1.0}
          volume={1.0}
          ref={videoRef}
          style={[styles.file, props.customVideoSize ?? null]}
          onLoadStart={() => setIsPreloading(true)}
          onReadyForDisplay={() => setIsPreloading(false)}
          useNativeControls={!isPreloading}
          resizeMode="contain"
          isLooping={false}
          onPlaybackStatusUpdate={(status) => setStatus(() => status)}
        />
      ) : null}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginLeft: 16,
    marginTop: 16,
    width: (Dimensions.get("window").width - 48) / 2,
    height: ((Dimensions.get("window").width - 48) / 2) * 1.31,
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
  file: {
    alignSelf: "center",
    width: Dimensions.get("window").width,
    height: 230,
  },
});

export default VideoCard;
