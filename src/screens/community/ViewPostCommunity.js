import React, { useState, useEffect, useRef, createRef } from "react";
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
  TextInput,
  ActivityIndicator,
} from "react-native";
import Default from "../../../assets/styles/Default";
import PostComment from "../../components/community/PostComment";
import Colors from "../../../assets/styles/Colors";
import Fetching from "../../components/Fetching";
import Icon from "react-native-vector-icons/FontAwesome5";
import { Button } from "react-native-elements";
import { useSelector } from "react-redux";
import { LinearGradient } from "expo-linear-gradient";
import * as Permissions from "expo-permissions";
import * as ImagePicker from "expo-image-picker";
import * as mime from "react-native-mime-types";
import { Video, AVPlaybackStatus } from "expo-av";
import ActionSheet from "react-native-actionsheet";
import moment from "moment";
import {
  getPost as getPostCommunity,
  storeComment,
  likePost,
  savePost,
} from "../../store/ducks/community";
import * as FileSystem from "expo-file-system";
import VideoCard from "../../components/community/VideoCard";
import { Platform } from "react-native";
import { takeCamera, takeGaleria } from "../../utils/Utils";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

const ViewPostCommunity = (props) => {
  const user = useSelector(({ user }) => user);

  const [fetching, setFetching] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [sending, setSending] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isSendingComment, setIsSendingComment] = useState(false);

  const [post, setPost] = useState({});
  const [user_post, setUserPost] = useState({});

  const [commentAttachment, setCommentAttachment] = useState(null);
  const [comments, setComments] = useState([]);
  const [text_comment, setTextComment] = useState("");

  const [show_button, setShowButton] = useState(false);
  const [status, setStatus] = useState({});

  const video = useRef(null);

  const lineRefs = useRef([]);

  const ASPhotoOptions = useRef(null);

  useEffect(() => {
    fetchPost(true, false);
    return () => {
      ASPhotoOptions.current = null;
      video.current = null;
      setStatus({});
    };
  }, [props]);

  const fetchPost = (is_fetching, is_refresh) => {
    setTextComment("");
    setCommentAttachment(null);

    is_refresh ? setRefreshing(true) : is_fetching ? setFetching(true) : null;

    getPostCommunity(props.route.params.post.id_post)
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
            setComments(res.data.comments);
            setPost(res.data);
          }
        }
      })
      .finally(() => {
        setFetching(false);
        setRefreshing(false);
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

  const setAnexos = (foto) => {
    let auxFoto = { ...foto };
    auxFoto.url = foto.uri;

    setCommentAttachment(auxFoto);
  };

  const onPressLike = () => {
    setSending(true);
    likePost(post.id)
      .catch((err) => {
        Alert.alert(
          "Ops!",
          "Something went wrong with our servers. Please contact us.",
        );
      })
      .then((res) => {
        if (res?.status === 200) {
          if (res.data.erros) {
            Alert.alert("Ops!", res.data.errors[0]);
          } else {
            let post_aux = post;

            if (res.data) {
              post_aux.likes = [{ liked: true }];
              post_aux.count_likes += 1;
            } else {
              post_aux.likes = [];
              post_aux.count_likes -= 1;
            }

            setPost(post_aux);
          }
        }
      })
      .finally(() => {
        setSending(false);
      });
  };

  const onPressSave = () => {
    setSaving(true);
    savePost(post.id)
      .catch((err) => {
        Alert.alert(
          "Ops!",
          "Something went wrong with our servers. Please contact us.",
        );
      })
      .then((res) => {
        if (res?.status === 200) {
          if (res.data.erros) {
            Alert.alert("Ops!", res.data.errors[0]);
          } else {
            let aux = post;

            if (res.data) {
              aux.saved_post = [{ liked: true }];
            } else {
              aux.saved_post = [];
            }

            setPost(aux);
          }
        }
      })
      .finally(() => {
        setSaving(false);
      });
  };

  const sendComment = async () => {
    setIsSendingComment(true);

    let verify_type_file = null;
    let commentForm = new FormData();

    commentForm.append("cpc_id_community_post", post.id);
    commentForm.append("cpc_text", text_comment);

    if (commentAttachment !== null) {
      if (mime.lookup(commentAttachment.uri).includes("video")) {
        let fileInfo = await FileSystem.getInfoAsync(commentAttachment.uri);

        if (fileInfo.size > 20971520) {
          Alert.alert(
            "Ops",
            "Your file is too large, select a file up to 20 megabytes.",
          );
          setIsSendingComment(false);
          setCommentAttachment(null);
          return;
        }

        verify_type_file = "video";
      } else {
        verify_type_file = "image";
      }

      if (verify_type_file === null) {
        Alert.alert("Ops!", "The file format is invalid. Please, try again.");
        return;
      }

      commentForm.append("file_type", verify_type_file);
      commentForm.append("comment_file", commentAttachment);
    }

    storeComment(post.id, commentForm)
      .catch((err) => {
        Alert.alert(
          "Ops!",
          "Something went wrong with our servers. Please contact us.",
        );
      })
      .then((res) => {
        if (res?.status === 200) {
          if (res.data.erros) {
            Alert.alert("Ops!", res.data.errors[0]);
          } else {
            let comment_aux = [];
            comment_aux = [...comments];
            comment_aux = comment_aux.concat(res.data);

            setComments(comment_aux);
          }
        }
      })
      .finally(() => {
        setIsSendingComment(false);
        setTextComment("");
        setCommentAttachment(null);
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

  const renderData = () => {
    return (
      <>
        <View style={styles.infoCommunity}>
          <View style={styles.containerItemPost}>
            {user_post?.image ? (
              <Image
                source={{ uri: user_post?.image?.url }}
                style={styles.userPhoto}
              />
            ) : (
              <Image
                source={require("../../../assets/images/no-profile.png")}
                style={styles.userPhoto}
              />
            )}
            <Text style={styles.textUserName}>{user_post.name}</Text>
          </View>
          <View style={styles.containerTextPost}>
            {post?.cop_type === "new_habit" ? (
              <Text style={styles.textPost}>
                {post?.user?.name} {post?.cop_text.slice(0, 19)}
                {post?.cop_text.slice(34)}
              </Text>
            ) : post?.cop_type === "score" ? (
              <Text style={styles.textPost}>{post?.cop_text}</Text>
            ) : null}

            {post?.cop_type === "feed" && post?.cop_text ? (
              <Text style={styles.textPost}>{post.cop_text}</Text>
            ) : null}

            {post?.cop_type === "feed" ? (
              post?.file?.length > 0 ? (
                mime.lookup(post?.file[0]?.file?.att_name).includes("image") ? (
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
                ) : null
              ) : null
            ) : null}

            {post?.cop_type !== "feed" ? (
              <LinearGradient
                style={styles.containerGradientPost}
                colors={
                  post?.cop_type === "new_habit"
                    ? ["#01325B", "#302E50", "#ED1C24"]
                    : ["#EF9324", "#89510F"]
                }
                locations={
                  post?.cop_type === "new_habit" ? [0, 0.21, 1] : [0, 1]
                }
                start={
                  post?.cop_type === "new_habit"
                    ? { x: 0, y: 0 }
                    : { x: 0, y: 1 }
                }
                end={
                  post?.cop_type === "new_habit"
                    ? { x: 1, y: 1 }
                    : { x: 1, y: 3 }
                }
              >
                <View style={{ width: "80%" }}>
                  {post?.cop_type === "new_habit" ? (
                    <>
                      <Text style={styles.textCardPost}>
                        {post?.cop_text?.slice(0, 19)}
                      </Text>
                      <Text style={styles.textPost}>
                        {post?.cop_text?.slice(20)}
                      </Text>
                    </>
                  ) : (
                    <>
                      <Text style={styles.textCardPost}>
                        {post?.cop_text?.slice(
                          0,
                          post?.cop_text.indexOf(".") + 1,
                        )}
                      </Text>
                      <Text style={styles.textPost}>
                        {post?.cop_text?.slice(post?.cop_text.indexOf(".") + 1)}
                      </Text>
                    </>
                  )}
                </View>
                <Image
                  source={require("../../../assets/icons/medal-post.png")}
                  style={styles.imagemContador}
                />
              </LinearGradient>
            ) : null}
            <Text style={styles.textCreatedAt}>
              {moment(post.created_at).format("HH:mm - MM/DD/YYYY")}
            </Text>
          </View>
        </View>
        <View style={styles.containerActionsPost}>
          {!sending ? (
            <TouchableOpacity
              style={{ flexDirection: "row", alignItems: "center" }}
              onPress={() => onPressLike()}
            >
              <Image
                source={
                  post?.likes?.length > 0
                    ? require("../../../assets/icons/heart-full.png")
                    : require("../../../assets/icons/heart.png")
                }
                style={styles.actionsIcons}
              />
              <Text style={styles.textCounter}>
                {post.count_likes ? post.count_likes : null}
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={{ flexDirection: "row", alignItems: "center" }}
            >
              <Image
                source={
                  post?.likes?.length > 0
                    ? require("../../../assets/icons/heart-full.png")
                    : require("../../../assets/icons/heart.png")
                }
                style={styles.actionsIcons}
              />
              <Text style={styles.textCounter}>
                {post.count_likes ? post.count_likes : null}
              </Text>
            </TouchableOpacity>
          )}

          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Image
              source={require("../../../assets/icons/message-dots.png")}
              style={[styles.actionsIcons, { opacity: 0.2 }]}
            />
            <Text style={styles.textCounter}>
              {post.count_comments ? post.count_comments : null}
            </Text>
          </View>

          {!saving ? (
            <TouchableOpacity
              style={{ alignItems: "center" }}
              onPress={() => onPressSave()}
            >
              <Image
                source={
                  post.saved_post?.length > 0
                    ? require("../../../assets/icons/bookmark-selected.png")
                    : require("../../../assets/icons/bookmark.png")
                }
                style={styles.actionsIcons}
              />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={{ alignItems: "center" }}>
              <Image
                source={
                  post.saved_post?.length > 0
                    ? require("../../../assets/icons/bookmark-selected.png")
                    : require("../../../assets/icons/bookmark.png")
                }
                style={styles.actionsIcons}
              />
            </TouchableOpacity>
          )}
        </View>
      </>
    );
  };

  const renderSendComment = () => {
    return (
      <>
        <View style={styles.containerSendPost}>
          {user.image ? (
            <Image
              source={{ uri: user.image?.url }}
              style={[styles.userPhoto]}
            />
          ) : (
            <Image
              source={require("../../../assets/images/no-profile.png")}
              style={[styles.userPhoto]}
            />
          )}
          <TextInput
            value={text_comment}
            multiline
            onBlur={() => setShowButton(false)}
            onPressIn={() => setShowButton(true)}
            onChangeText={setTextComment}
            keyboardAppearance="dark"
            style={[styles.inputPost, { flexGrow: 1 }]}
            placeholder="Write something..."
            placeholderTextColor={"#9CC6FF"}
          />
        </View>

        {commentAttachment ? (
          <View>
            <TouchableOpacity
              style={styles.closeAttachment}
              onPress={() => setCommentAttachment(null)}
            >
              <Image
                source={require("../../../assets/icons/close-image.png")}
                style={styles.removeAttachment}
              />
            </TouchableOpacity>

            {["image/jpeg", "image/png"].includes(commentAttachment.type) ? (
              <View styles={{ flex: 1, alignItems: "center" }}>
                <Image
                  source={{ uri: commentAttachment.url }}
                  style={styles.file}
                  resizeMode="contain"
                />
              </View>
            ) : ["video/mp4", "video/quicktime"].includes(
              commentAttachment.type,
            ) ? (
              <VideoCard video={commentAttachment.url} />
            ) : null}
          </View>
        ) : null}

        <View style={styles.containerActionsPost}>
          <TouchableOpacity
            style={{ flexDirection: "row", alignItems: "center" }}
            onPress={() => ASPhotoOptions.current.show()}
            disabled={!!commentAttachment}
          >
            <Image
              source={
                !!commentAttachment
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
            disabled={!!commentAttachment}
          >
            <Image
              source={
                !!commentAttachment
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

        {show_button || commentAttachment || text_comment !== "" ? (
          <View style={styles.containerButton}>
            <Button
              buttonStyle={styles.sendButton}
              disabledStyle={{ backgroundColor: "#982538" }}
              titleStyle={Default.loginButtonBoldTitle}
              onPress={sendComment}
              title={"SEND"}
              disabled={isSendingComment}
              loading={isSendingComment}
            />
          </View>
        ) : null}
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
          <Fetching isFetching={fetching}>
            <View style={styles.containerActions}>
              <TouchableOpacity
                style={styles.backButtonStyle}
                onPress={() =>
                  props.route.params.post.savedPost
                    ? props.navigation.navigate("SavedPost")
                    : props.navigation.pop()
                }
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
                View community post
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
                  style={[
                    styles.containerList,
                    comments.length > 0 || commentAttachment
                      ? { marginBottom: 0 }
                      : null,
                  ]}
                >
                  {renderData()}
                </LinearGradient>
              ) : (
                <View
                  style={[
                    styles.containerList,
                    comments.length > 0 || commentAttachment
                      ? { marginBottom: 0 }
                      : null,
                  ]}
                >
                  {renderData()}
                </View>
              )
            ) : null}

            {comments.length > 0
              ? comments.map((obj, i) => {
                return <PostComment key={i} comment={obj} />;
              })
              : null}

            {Platform.OS === "android" ? (
              <LinearGradient
                colors={["rgba(156, 198, 255, 0.042)", "rgba(0, 37, 68, 0.15)"]}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={styles.containerGradientSendPost}
              >
                {renderSendComment()}
              </LinearGradient>
            ) : (
              <View style={styles.containerGradientSendPost}>
                {renderSendComment()}
              </View>
            )}

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
          </Fetching>
        </ScrollView>
      </View>
    </KeyboardAwareScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "column",
    flex: 1,
    alignItems: "center",
    width: Dimensions.get("window").width,
    paddingHorizontal: 16,
    zIndex: 1,
    elevation: 1,
  },
  innerContainer: {
    flexDirection: "column",
    flex: 1,
    alignItems: "center",
    marginBottom: 24,
  },
  containerActions: {
    flexDirection: "column",
    marginBottom: 16,
    marginTop: 32,
  },
  containerBlur: {
    zIndex: 1,
    elevation: 1,
    position: "absolute",
    left: 0,
    bottom: 0,
    right: 0,
    marginTop: -3,
  },
  containerButton: {
    flex: 1,
    justifyContent: "flex-end",
    marginBottom: 10,
    alignItems: "center",
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
  imagemContador: {
    width: 40,
    height: 40,
    borderRadius: 32,
    marginRight: 16,
  },
  containerShadow: {
    backgroundColor: "rgba(0,0,0,0.6)",
    zIndex: 5,
    elevation: 5,
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  },
  containerOptionPrivacy: {
    marginBottom: 8,
    paddingLeft: 16,
    paddingRight: 22,
    paddingVertical: 24,
    backgroundColor: "#004B7D",
    width: Dimensions.get("window").width - 48,
    borderRadius: 4,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  containerAttachment: {
    width: 176,
    height: 176,
    flex: 1,
    justifyContent: "flex-start",
    marginLeft: 32,
    marginTop: 16,
  },
  closeAttachment: {
    position: "absolute",
    alignSelf: "flex-end",
    width: 24,
    height: 24,
    right: 16,
    top: 10,
    zIndex: 10,
  },
  commentAttachment: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
    borderRadius: 16,
  },
  containerTitleModal: {
    flex: 1,
    alignSelf: "center",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 40,
    width: Dimensions.get("window").width - 48,
    paddingBottom: 16,
  },
  textName: {
    fontSize: 24,
    color: Colors.text,
    fontWeight: "400",
    alignSelf: "center",
    lineHeight: 32,
    marginTop: 8,
  },
  inputPost: {
    fontSize: 16,
    color: "white",
    lineHeight: 16,
    backgroundColor: "transparent",
    alignSelf: "center",
  },
  containerSendPost: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    borderBottomColor: "#264261",
    borderBottomWidth: StyleSheet.hairlineWidth,
    width: Dimensions.get("window").width,
    marginBottom: 16,
    padding: 16,
  },
  containerGradientSendPost: {
    marginBottom: 8,
    zIndex: 1,
    elevation: 1,
    backgroundColor:
      Platform.OS === "ios" ? "rgba(0, 37, 68, 0.75)" : "transparent",
    width: Dimensions.get("window").width,
  },
  centeredView: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
  modalView: {
    borderRadius: 4,
    marginHorizontal: 32,
    alignItems: "flex-start",
    shadowColor: "#000",
    paddingBottom: 50,
    paddingTop: 16,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    width: Dimensions.get("window").width - 44,
    shadowOpacity: 0.25,
    shadowRadius: 4,
    backgroundColor: "#082139",
  },
  containerTextModal: {
    alignContent: "center",
  },
  containerSectionSucessModal: {
    alignSelf: "center",
    width: Dimensions.get("window").width - 76,
  },
  sendButton: {
    height: 64,
    borderRadius: 4,
    backgroundColor: "#982538",
    width: Dimensions.get("window").width - 32,
  },
  containerHeaderModal: {
    flexDirection: "column",
    justifyContent: "center",
    alignSelf: "flex-end",
    marginLeft: 24,
  },
  containerModal: {
    flex: 1,
    flexDirection: "column",
  },
  containerReport: {
    flexDirection: "column",
    marginHorizontal: 24,
  },
  containerGroup: {
    flexDirection: "row",
    marginBottom: 8,
    justifyContent: "space-between",
    alignItems: "center",
  },
  containerUser: {
    flex: 1,
    width: Dimensions.get("window").width - 48,
    backgroundColor: "rgba(156, 198, 255, 0.042)",
    borderRadius: 8,
    paddingHorizontal: 16,
  },
  containerConnection: {
    width: Dimensions.get("window").width - 32,
    borderBottomColor: "#264261",
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingBottom: 16,
    marginBottom: 16,
  },
  modalize: {
    backgroundColor: "rgba(0, 37, 68, 0.8)",
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  containerNotConnections: {
    marginTop: 16,
    alignSelf: "center",
  },
  textSucessModal: {
    textAlign: "center",
    fontSize: 24,
    fontWeight: "700",
    lineHeight: 33,
    color: Colors.text,
  },
  typeCommunity: {
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "center",
    borderRadius: 4,
    padding: 9,
  },
  headerIcon: {
    width: 18,
    height: 18,
    marginRight: 3,
  },
  textSubtitle: {
    fontSize: 10,
    lineHeight: 16,
    width: 93,
    height: 16,
    color: Colors.text,
  },
  imageModalHeader: {
    width: 24,
    resizeMode: "contain",
    height: 24,
  },
  typeCommunityText: {
    fontWeight: "600",
    fontSize: 13,
    lineHeight: 16,
    color: "#FCFCFC",
  },
  textConnection: {
    fontSize: 16,
    lineHeight: 16,
    width: 128,
    height: 16,
    fontWeight: "bold",
    color: Colors.text,
    width: Dimensions.get("window").width - 44,
  },
  circleIcon: {
    width: 26,
    height: 26,
  },
  textTitleSection: {
    fontWeight: "700",
    fontSize: 16,
    lineHeight: 16,
    color: Colors.text,
  },
  titleInvite: {
    flex: 1,
    alignItems: "center",
    alignSelf: "center",
    backgroundColor: "white",
  },
  textNoPeopleToConnect: {
    fontSize: 16,
    lineHeight: 16,
    fontWeight: "400",
    color: Colors.text,
  },
  containerItemConnection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
  },
  textUserName: {
    flex: 1,
    fontSize: 16,
    lineHeight: 16,
    fontWeight: "700",
    color: Colors.text,
  },
  textComment: {
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
  userPhotoModal: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  inputSearch: {
    flex: 1,
    fontSize: 16,
    lineHeight: 16,
    backgroundColor: "#002544",
    borderRadius: 8,
  },
  backButtonStyle: {
    marginLeft: 16,
    width: 40,
    alignSelf: "flex-start",
    marginBottom: -23,
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
  buttons: {
    top: "40%",
    alignSelf: "center",
    position: "absolute",
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
    //marginLeft: 7,
  },
  textCreatedAt: {
    fontWeight: "400",
    fontSize: 12,
    lineHeight: 18,
    color: "rgba(255, 255, 255, 0.64)",
    marginLeft: 16,
    marginTop: 12,
  },
  textCreatedAtComment: {
    fontWeight: "400",
    fontSize: 12,
    lineHeight: 18,
    color: "rgba(255, 255, 255, 0.64)",
    marginTop: 12,
  },
  actionsIcons: {
    width: 24,
    height: 24,
    marginRight: 4,
    alignSelf: "center",
    left: 0,
  },
  attachmentComments: {
    width: Dimensions.get("window").width - 48,
    resizeMode: "cover",
    borderRadius: 16,
    marginBottom: 12,
    height: 326,
  },
  removeAttachment: {
    width: "100%",
    height: "100%",
    alignItems: "flex-start",
    resizeMode: "contain",
  },
  buttonPlay: {
    //alignSelf: 'center',
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
    marginTop: 16,
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
  userPhoto: {
    width: 32,
    height: 32,
    borderRadius: 32,
    marginRight: 12,
  },
});

export default ViewPostCommunity;
