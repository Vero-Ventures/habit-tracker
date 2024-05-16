import React, { useState, useEffect, useRef } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  Dimensions,
  Text,
  Image,
  Alert,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import Default from "../../../assets/styles/Default";
import Colors from "../../../assets/styles/Colors";
import Fetching from "../../components/Fetching";
import Icon from "react-native-vector-icons/FontAwesome5";
import { LinearGradient } from "expo-linear-gradient";
import * as mime from "react-native-mime-types";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import {
  getPost as getPostCommunity,
  updatePost,
} from "../../store/ducks/community";
import VideoCard from "../../components/community/VideoCard";
import { Platform } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useSelector } from "react-redux";
import { TextInput } from "react-native-paper";
import { Button } from "react-native-elements";
import { systemWeights } from "react-native-typography";
import ActionSheet from "react-native-actionsheet";
import { takeCamera, takeGaleria } from "../../utils/Utils";

const EditCommunityPost = (props) => {
  const [fetching, setFetching] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [post, setPost] = useState({});
  const [removedFileId, setRemovedFileId] = useState(null);
  const [userPost, setUserPost] = useState({});

  const [postFile, setPostFile] = useState(null);
  const ASPhotoOptions = useRef(null);

  const video = useRef(null);

  const user = useSelector(({ user }) => user);

  useEffect(() => {
    fetchPost(true, false);
    return () => {
      ASPhotoOptions.current = null;
      video.current = null;
    };
  }, [props]);

  const fetchPost = (is_fetching, is_refresh) => {
    is_refresh ? setRefreshing(true) : is_fetching ? setFetching(true) : null;

    getPostCommunity(props.route.params.post.id)
      .catch((err) => {
        Alert.alert(
          "Ops!",
          "Something went wrong with our servers. Please contact us.",
        );
      })
      .then((res) => {
        if (res?.status === 200) {
          if (res.data.errors) {
            Alert.alert("Ops!", res.data.errors[0]);
          } else {
            setUserPost(res.data.user);
            setPost(res.data);
          }
        }
      })
      .finally(() => {
        setFetching(false);
        setRefreshing(false);
      });
  };

  useEffect(() => {
    if (post?.file?.length > 0) {
      mime.lookup(post?.file[0]?.file?.att_name).includes("video")
        ? loadVideo(post?.file[0]?.file?.url)
        : null;
    }
  }, [post]);

  const loadVideo = async (source) => {
    if (source && video.current) {
      await unloadVideo();
      await video.current.loadAsync({ uri: source });
    }
  };

  async function unloadVideo() {
    if (video.current !== null) {
      await video.current.unloadAsync();
    }
  }

  const onSavePressed = async () => {
    setSaving(true);

    const formData = new FormData();

    formData.append("copText", post.cop_text);

    if (removedFileId) formData.append("removedFileId", removedFileId);

    if (postFile) {
      if (mime.lookup(postFile.uri).includes("video")) {
        let fileInfo = await FileSystem.getInfoAsync(postFile.uri);

        if (fileInfo.size > 20971520) {
          Alert.alert(
            "Ops",
            "Your file is too large, select a file up to 20 megabytes.",
          );
          setSaving(false);
          setPostFile(null);
          return;
        }

        verify_type_file = "video";
      } else {
        verify_type_file = "image";
      }

      if (verify_type_file === null) {
        Alert.alert("Ops!", "The file format is invalid. Please, try again.");
        setSaving(false);
        setPostFile(null);
        return;
      }

      formData.append("file_type", verify_type_file);
      formData.append("post_file", postFile);
    }

    updatePost(props.route.params.post.id, formData)
      .catch((err) => {
        Alert.alert(
          "Ops!",
          "Something went wrong with our servers. Please contact us.",
        );
      })
      .then((res) => {
        if (res?.status === 200) {
          if (res.data.errors) {
            Alert.alert("Ops!", res.data.errors[0]);
          } else {
            Alert.alert("Success!", "Post changed!");
            props.navigation.pop();
          }
        }
      })
      .finally(() => {
        setSaving(false);
      });
  };

  const handleActionSheet = async (index) => {
    if (index === 0) {
      let { status } = await ImagePicker.requestCameraPermissionsAsync();

      if (status === "granted") {
        pickCamera();
      } else {
        Alert.alert("Ops", "You need to allow access to the camera first.");
      }
    } else if (index === 1) {
      let { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status === "granted") {
        pickGaleria();
      } else {
        Alert.alert("Ops", "You need to allow access to the camera first.");
      }
    }
  };

  const pickCamera = async () => {
    let result = await takeCamera();

    if (result === "failed") {
      Alert.alert("Ops", "An error ocurred when trying to open the camera.");
      return;
    }

    if (result?.uri) {
      setAnexos(result);
    }
  };

  const pickGaleria = async () => {
    let result = await takeGaleria();

    if (result === "failed") {
      Alert.alert("Ops", "An error ocurred when trying to open the library.");
      return;
    }

    if (result?.uri) {
      setAnexos(result);
    }
  };

  const selectVideo = async () => {
    let { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status === "granted") {
      try {
        let result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Videos,
          base64: true,
          allowsEditing: true,
          quality: 0.5,
          presentationStyle: 0.5,
          videoQuality: 1,
        });

        if (!result.canceled) {
          const uri = result.assets[0].uri;

          setAnexos({
            name: uri.split("\\").pop().split("/").pop(),
            type: mime.lookup(uri),
            uri,
          });
        }
      } catch (err) {
        Alert.alert("Ops", "An error ocurred when trying to open the library.");
      }
    } else {
      Alert.alert("Ops", "You need to allow access to the camera first.");
    }
  };

  const setAnexos = (file) => {
    let auxFile = { ...file };
    auxFile.url = file.uri;

    setPostFile(auxFile);
  };

  const renderData = () => {
    return (
      <>
        <View style={styles.infoCommunity}>
          <View style={styles.containerItemPost}>
            {userPost?.image ? (
              <Image
                source={{ uri: userPost?.image?.url }}
                style={styles.userPhoto}
              />
            ) : (
              <Image
                source={require("../../../assets/images/no-profile.png")}
                style={styles.userPhoto}
              />
            )}
            <Text style={styles.textUserName}>{userPost.name}</Text>
          </View>

          <View style={styles.containerSendPost}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                zIndex: 9,
                elevation: 9,
                paddingHorizontal: 16,
              }}
            >
              <TextInput
                value={post.cop_text}
                multiline
                theme={{
                  colors: {
                    placeholder: "white",
                    text: "white",
                    primary: "white",
                    underlineColor: "transparent",
                  },
                }}
                onChangeText={(text) => setPost({ ...post, cop_text: text })}
                keyboardAppearance="dark"
                style={styles.inputPost}
                placeholder="Write something..."
                placeholderTextColor={"#9CC6FF"}
              />
            </View>
          </View>

          {post?.file?.length > 0 ? (
            <View>
              <TouchableOpacity
                style={styles.closeAttachment}
                onPress={() => {
                  setRemovedFileId(post.file[0].id);
                  setPost({ ...post, file: null });
                }}
              >
                <Image
                  source={require("../../../assets/icons/close-image.png")}
                  style={styles.removeAttachment}
                />
              </TouchableOpacity>

              {mime.lookup(post?.file[0]?.file?.att_name).includes("image") ? (
                <View styles={{ flex: 1, alignItems: "center" }}>
                  <Image
                    source={{ uri: post?.file[0]?.file?.url }}
                    style={styles.file}
                    resizeMode="contain"
                  />
                </View>
              ) : mime
                .lookup(post?.file[0]?.file?.att_name)
                .includes("video") ? (
                <VideoCard video={post?.file[0]?.file?.url} />
              ) : null}
            </View>
          ) : postFile ? (
            <View>
              <TouchableOpacity
                style={styles.closeAttachment}
                onPress={() => setPostFile(null)}
              >
                <Image
                  source={require("../../../assets/icons/close-image.png")}
                  style={styles.removeAttachment}
                />
              </TouchableOpacity>

              {["image/jpeg", "image/png"].includes(postFile.type) ? (
                <View styles={{ flex: 1, alignItems: "center" }}>
                  <Image
                    source={{ uri: postFile.url }}
                    style={styles.file}
                    resizeMode="contain"
                  />
                </View>
              ) : ["video/mp4", "video/quicktime"].includes(postFile.type) ? (
                <VideoCard video={postFile.url} />
              ) : null}
            </View>
          ) : null}

          <View style={styles.containerActionsPost}>
            <TouchableOpacity
              style={{ flexDirection: "row", alignItems: "center" }}
              onPress={() => ASPhotoOptions.current.show()}
              disabled={post?.file?.length > 0 || !!postFile}
            >
              <Image
                source={
                  post?.file?.length > 0
                    ? require("../../../assets/icons/image-plus-disabled.png")
                    : require("../../../assets/icons/image-plus.png")
                }
                style={styles.actionsIcons}
              />

              <Text
                style={[
                  styles.textCounter,
                  { color: "rgba(255, 255, 255, 0.48)" },
                ]}
              >
                Photo
              </Text>
            </TouchableOpacity>

            <View
              style={{
                borderLeftColor: "#264261",
                borderLeftWidth: StyleSheet.hairlineWidth,
              }}
            ></View>

            <TouchableOpacity
              style={{ flexDirection: "row", alignItems: "center" }}
              onPress={() => selectVideo()}
              disabled={post?.file?.length > 0 || !!postFile}
            >
              <Image
                source={
                  post?.file?.length > 0
                    ? require("../../../assets/icons/film-disabled.png")
                    : require("../../../assets/icons/film.png")
                }
                style={styles.actionsIcons}
              />

              <Text
                style={[
                  styles.textCounter,
                  { color: "rgba(255, 255, 255, 0.48)" },
                ]}
              >
                Video
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </>
    );
  };

  return (
    <KeyboardAwareScrollView
      extraScrollHeight={150}
      style={{ backgroundColor: Colors.background }}
    >
      <View style={Default.container}>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          refreshControl={
            <RefreshControl
              colors={["#fff"]}
              tintColor="#fff"
              onRefresh={() => fetchPost(false, true)}
              refreshing={refreshing}
            />
          }
        >
          <Fetching isFetching={fetching || saving}>
            <View style={styles.containerActions}>
              <TouchableOpacity
                style={styles.backButtonStyle}
                onPress={() => props.navigation.pop()}
              >
                <Icon
                  type="font-awesome"
                  name="chevron-left"
                  size={16}
                  color={"#FFFFFF"}
                />
              </TouchableOpacity>

              <Text
                style={styles.textUserHeaderName}
                type="font-awesome"
                size={14}
                color={Colors.text}
              >
                Edit post
              </Text>
            </View>
            {post ? (
              Platform.OS === "android" ? (
                <LinearGradient
                  colors={[
                    "rgba(156, 198, 255, 0.042)",
                    "rgba(0, 37, 68, 0.15)",
                  ]}
                  start={{ x: 0, y: 0.5 }}
                  end={{ x: 1, y: 0.5 }}
                  style={[styles.containerList]}
                >
                  {renderData()}
                </LinearGradient>
              ) : (
                <View style={[styles.containerList]}>{renderData()}</View>
              )
            ) : null}

            <View style={styles.buttonContainer}>
              <Button
                disabled={saving}
                buttonStyle={Default.loginNextButton}
                titleStyle={Default.loginButtonBoldTitle}
                onPress={onSavePressed}
                title="SAVE"
                disabledStyle={Default.loginNextButton}
              />

              <TouchableOpacity
                disabled={saving}
                style={{ marginTop: 16 }}
                onPress={() => props.navigation.pop()}
              >
                <View style={{ alignItems: "center" }}>
                  <Text style={[systemWeights.bold, { color: "#9CC6FF" }]}>
                    Back
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </Fetching>
        </ScrollView>

        <ActionSheet
          ref={ASPhotoOptions}
          options={["Camera", "Library", "Cancel"]}
          cancelButtonIndex={2}
          destructiveButtonIndex={2}
          buttonUnderlayColor={Colors.grey1}
          onPress={(index) => handleActionSheet(index)}
          styles={{
            buttonBox: Default.actionSheetButtonBox,
            body: Default.actionSheetBody,
            cancelButtonBox: Default.actionSheetCancelButtonBox,
          }}
        />
      </View>
    </KeyboardAwareScrollView>
  );
};

const styles = StyleSheet.create({
  containerActions: {
    flexDirection: "column",
    marginBottom: 16,
    marginTop: 32,
  },
  backButtonStyle: {
    marginLeft: 16,
    width: 40,
    alignSelf: "flex-start",
    marginBottom: -23,
  },
  closeAttachment: {
    position: "absolute",
    alignSelf: "flex-end",
    width: 24,
    height: 24,
    marginRight: 16,
    zIndex: 10,
    right: 0,
    marginTop: 16,
  },
  inputPost: {
    fontSize: 16,
    color: Colors.white,
    width: "100%",
    lineHeight: 16,
    backgroundColor: "transparent",
    alignSelf: "center",
  },
  containerSendPost: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    width: Dimensions.get("window").width,

    marginBottom: 16,
  },
  containerGradientSendPost: {
    marginBottom: 8,
    zIndex: 1,
    elevation: 1,
    backgroundColor:
      Platform.OS === "ios" ? "rgba(0, 37, 68, 0.75)" : "transparent",
    width: Dimensions.get("window").width,
  },
  textUserName: {
    flex: 1,
    fontSize: 16,
    lineHeight: 16,
    fontWeight: "700",
    color: Colors.text,
  },
  userPhoto: {
    width: 32,
    height: 32,
    borderRadius: 32,
    marginRight: 8,
  },
  textUserHeaderName: {
    color: Colors.text,
    fontWeight: "400",
    fontSize: 20,
    lineHeight: 27,
    alignSelf: "center",
  },
  file: {
    alignSelf: "center",
    width: Dimensions.get("window").width,
    height: 230,
  },
  containerList: {
    marginBottom: 8,
    paddingTop: 16,
    backgroundColor:
      Platform.OS === "ios" ? "rgba(0, 37, 68, 0.75)" : "transparent",
    width: Dimensions.get("window").width,
  },
  infoCommunity: {
    marginBottom: 21,
  },
  containerItemPost: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 14,
    marginHorizontal: 16,
  },
  textCounter: {
    fontWeight: "500",
    fontSize: 12,
    lineHeight: 18,
    color: "#FFFFFF",
    //marginLeft: 7,
  },
  removeAttachment: {
    width: "100%",
    height: "100%",
    alignItems: "flex-start",
    resizeMode: "contain",
  },
  userPhoto: {
    width: 32,
    height: 32,
    borderRadius: 32,
    marginRight: 12,
  },
  containerActionsPost: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignSelf: "center",
    width: Dimensions.get("window").width - 74,
    marginBottom: 19,
    marginTop: 16,
  },
  actionsIcons: {
    width: 24,
    height: 24,
    marginRight: 4,
    alignSelf: "center",
    left: 0,
  },
  buttonContainer: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
});

export default EditCommunityPost;
