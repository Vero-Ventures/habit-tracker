import React, { useState, useEffect, useRef } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  Dimensions,
  Text,
  Image,
  Alert,
  TouchableOpacity,
  RefreshControl,
  TextInput,
} from "react-native";
import Default from "../../../assets/styles/Default";
import Colors from "../../../assets/styles/Colors";
import Fetching from "../../components/Fetching";
import Header from "../../components/Header";
import moment from "moment";
import { Button } from "react-native-elements";
import Icon from "react-native-vector-icons/FontAwesome5";
import { useSelector } from "react-redux";
import { getPost, storeComment } from "../../store/ducks/post";
import { storeReport } from "../../store/ducks/report";
import { LinearGradient } from "expo-linear-gradient";
import { Modalize } from "react-native-modalize";
import { getIconPost } from "../../utils/Utils";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

const ViewPost = (props) => {
  const [isSendingComment, setIsSendingComment] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [comments, setComments] = useState([]);
  const [user_post, setUserPost] = useState({});
  const [comment, setComment] = useState("");
  const [selected_comment, setSelectedComment] = useState("");
  const [id_comment, setIdComment] = useState(null);
  const [post, setPost] = useState([]);
  const [index_comment, setIndexComment] = useState([]);
  const [options_report, setOptionsReport] = useState([]);
  const [selected, setSelected] = useState(false);
  const [checked, setChecked] = useState("");
  const [topBar, setTopBar] = useState(false);
  const user = useSelector(({ user }) => user);
  const modalizeRef = useRef(null);

  useEffect(() => {
    setTopBar(false);
    setOptionsReport([
      { title: "Nudity or sexual activity" },
      { title: "Fake news" },
      { title: "Symbols or hate speech" },
      { title: "Scam or fraud" },
      { title: "I just didn't like it" },
      { title: "Bullying or harassment" },
      { title: "Health" },
      { title: "Policy" },
      { title: "Social theme" },
      { title: "Another thing" },
    ]);

    fetchPost(true, false);
  }, []);

  const fetchPost = (is_fetching, is_refresh) => {
    is_refresh ? setRefreshing(true) : is_fetching ? setFetching(true) : null;

    getPost(props.route.params.post.id_post)
      .catch((err) => {
        Alert.alert(
          "Ops!",
          "Something went wrong with our servers. Please contact us.",
        );
      })
      .then((res) => {
        if (res.data.errors) {
          Alert.alert("Ops!", res.data.errors[0]);
        } else {
          setUserPost(res.data.user);
          setComments(res.data.comments);
          setPost(res.data);
        }

        setFetching(false);
        setRefreshing(false);
      });
  };

  const sendComment = () => {
    if (comment.trim() === "") {
      Alert.alert(
        "Ops!",
        "You need to type something before posting a comment.",
      );
      return;
    }

    setIsSendingComment(true);

    let comment_aux = [];
    let request = { poc_comment: comment };

    storeComment(post.id, request)
      .catch((err) => {
        Alert.alert(
          "Ops!",
          "Something went wrong with our servers. Please contact us.",
        );
        setIsSendingComment(false);
      })
      .then((res) => {
        if (res?.data) {
          if (res.data.errors) {
            Alert.alert("Ops!", res.data.errors[0]);
          } else {
            comment_aux = comments;
            comment_aux = comment_aux.concat(res.data);

            setComments(comment_aux);
            setComment("");
          }
        }

        setIsSendingComment(false);
      });
  };

  const handleLongPress = (index, obj) => {
    setTopBar(true);
    setSelected(true);
    setIdComment(obj.id);
    setSelectedComment(obj.poc_comment);
    setIndexComment(index);
    onOpenModal();
  };

  const onOpenModal = () => {
    modalizeRef.current?.open();
  };

  const closeTopBar = () => {
    setTopBar(false);
    setSelected(false);
  };

  const sendReport = (type) => {
    setChecked(type);

    let request = {
      pcr_id_comment: id_comment,
      pcr_type: type,
    };

    storeReport(request)
      .catch((err) => {
        Alert.alert(
          "Ops!",
          "Something went wrong with our servers. Please contact us.",
        );
      })
      .then((res) => {
        if (res.data.errors) {
          Alert.alert("Ops!", res.data.errors[0]);
        } else {
          setChecked("");
          setSelected(false);
          setTopBar(false);
          setSelectedComment("");
          modalizeRef.current?.close();
          props.navigation.navigate("ReportSuccess");
        }
      });
  };

  const viewUser = (obj) => {
    if (user.id === obj.id) {
      props.navigation.navigate("Profile");
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
    <View style={Default.container}>
      <ScrollView
        scrollEnabled
        refreshControl={
          <RefreshControl
            colors={["#000"]}
            tintColor="#fff"
            onRefresh={() => fetchPost(false, true)}
            refreshing={refreshing}
          />
        }
      >
        <Header navigation={props.navigation} />

        <TouchableOpacity
          style={styles.backButtonStyle}
          onPress={() => props.navigation.pop()}
        >
          <Icon
            type="font-awesome"
            name="chevron-left"
            size={14}
            color={Colors.primary4}
          />
        </TouchableOpacity>

        <KeyboardAwareScrollView
          style={{ backgroundColor: Colors.background }}
          extraHeight={80}
          contentContainerStyle={Default.container}
        >
          <Fetching isFetching={fetching}>
            <View style={styles.container}>
              <View style={styles.containerHeader}>
                <View style={styles.containerImage}>
                  <Text style={styles.textName}>Friends Update</Text>
                </View>
              </View>

              <View style={[styles.containerSection, { marginBottom: 24 }]}>
                <View style={styles.containerTitle}>
                  <Text style={styles.textTitle}>Timeline</Text>
                </View>
                <View
                  style={[styles.containerGroup, { flexDirection: "column" }]}
                >
                  <LinearGradient
                    colors={[
                      "rgba(156, 198, 255, 0.042)",
                      "rgba(0, 37, 68, 0.15)",
                    ]}
                    start={{ x: 0, y: 0.5 }}
                    end={{ x: 1, y: 0.5 }}
                    style={styles.containerPost}
                  >
                    <View>
                      <View style={styles.containerItemPost}>
                        <TouchableOpacity
                          style={{ flexDirection: "row" }}
                          onPress={() => viewUser(user_post)}
                        >
                          {user_post?.image ? (
                            <Image
                              source={{ uri: user_post?.image.url }}
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
                              flexDirection: "column",
                              justifyContent: "flex-start",
                            }}
                          >
                            <Text style={styles.textUserName}>
                              {user_post.name}
                            </Text>
                            <Text style={styles.textSubtitle}>
                              {moment(post.created_at)
                                .local()
                                .startOf("second")
                                .fromNow()}
                            </Text>
                          </View>
                        </TouchableOpacity>
                      </View>
                      <View style={styles.containerDetails}>
                        <Text style={styles.textPost}>{post.pos_text}</Text>
                        {getIconPost(post.pos_type)}
                      </View>
                    </View>
                  </LinearGradient>
                </View>
                {comments.length > 0
                  ? comments.map((obj, i) => {
                      return (
                        <LinearGradient
                          key={i}
                          colors={
                            selected && index_comment === i
                              ? [
                                  "rgba(114, 198, 329, 0.3)",
                                  "rgba(0, 78, 143, 0)",
                                ]
                              : [Colors.primary, Colors.primary]
                          }
                          start={{ x: 0, y: 0.5 }}
                          end={{ x: 1, y: 0.5 }}
                          style={{
                            width: Dimensions.get("window").width,
                            marginLeft: -24,
                            flexDirection: "row",
                            alignItems: "center",
                            paddingVertical: 8,
                          }}
                        >
                          <TouchableOpacity
                            onLongPress={() => handleLongPress(i, obj)}
                            selectable={selected}
                            key={i}
                          >
                            <View
                              onLongPress={() => handleLongPress(i, obj)}
                              style={styles.containerComments}
                            >
                              <TouchableOpacity
                                style={{ flexDirection: "row" }}
                                onPress={() => viewUser(obj.user)}
                              >
                                {obj.user?.image ? (
                                  <Image
                                    source={{ uri: obj.user.image.url }}
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
                                    flexDirection: "column",
                                    justifyContent: "flex-start",
                                  }}
                                >
                                  <Text style={styles.textUserName}>
                                    {obj.user.name}
                                  </Text>
                                  <Text style={styles.textSubtitle}>
                                    {moment(obj.created_at)
                                      .local()
                                      .startOf("second")
                                      .fromNow()}
                                  </Text>
                                </View>
                              </TouchableOpacity>
                            </View>
                            <View
                              onStartShouldSetResponder={() => true}
                              style={styles.containerTextComment}
                            >
                              <Text style={styles.textComment}>
                                {obj.poc_comment}
                              </Text>
                            </View>
                          </TouchableOpacity>
                        </LinearGradient>
                      );
                    })
                  : null}
                <View style={styles.containerSendComment}>
                  <Text style={styles.titleComment}>Comment</Text>
                  <View style={styles.containerTextInput}>
                    {user?.image ? (
                      <Image
                        source={{ uri: user?.image.url }}
                        style={styles.userPhoto}
                      />
                    ) : (
                      <Image
                        source={require("../../../assets/images/no-profile.png")}
                        style={styles.userPhoto}
                      />
                    )}
                    <TextInput
                      value={comment}
                      numberOfLines={3}
                      multiline
                      onChangeText={setComment}
                      keyboardAppearance="dark"
                      style={styles.textInputStyle}
                      placeholder="Add a comment..."
                      placeholderTextColor={Colors.grey4}
                    />
                  </View>

                  <View style={styles.containerButton}>
                    <Button
                      buttonStyle={styles.buttonSend}
                      titleStyle={styles.titleInvite}
                      ViewComponent={LinearGradient}
                      linearGradientProps={{
                        colors: ["#72C6EF", "#004E8F"],
                        start: { x: 0, y: 0.5 },
                        end: { x: 1, y: 0.5 },
                      }}
                      onPress={() => sendComment()}
                      title="Send"
                      loading={isSendingComment}
                      disabled={isSendingComment}
                    />
                  </View>
                </View>
              </View>
            </View>
          </Fetching>
        </KeyboardAwareScrollView>
      </ScrollView>
      {topBar ? (
        <View style={styles.containerTopBar}>
          <View style={styles.containerCloseBar}>
            <TouchableOpacity
              style={styles.buttonTopBar}
              onPress={() => closeTopBar()}
            >
              <Icon
                type="font-awesome"
                name="times"
                size={20}
                color={Colors.primary4}
              />
            </TouchableOpacity>
            <Text style={styles.textTopBar}>1 Selected</Text>
          </View>
          <TouchableOpacity
            style={[
              styles.buttonTopBar,
              { alignSelf: "center", marginRight: 10 },
            ]}
            onPress={() => onOpenModal()}
          >
            <Icon
              type="font-awesome"
              name="info-circle"
              size={20}
              color={Colors.primary4}
            />
          </TouchableOpacity>
        </View>
      ) : null}
      <Modalize
        ref={modalizeRef}
        snapPoint={470}
        modalStyle={styles.modalize}
        handlePosition={"inside"}
        modalHeight={Dimensions.get("window").height - 140}
        handleStyle={{ backgroundColor: "white", marginTop: 10 }}
      >
        <View style={styles.containerModal}>
          <View style={styles.containerTitleModal}>
            <Text style={styles.textName}>Reporting</Text>
          </View>

          <View style={styles.containerHeaderModal}>
            <Text
              style={{
                fontSize: 16,
                color: Colors.text,
                lineHeight: 16,
                marginBottom: 16,
              }}
            >
              Comment
            </Text>
            <Text
              style={{
                fontSize: 12,
                color: Colors.text,
                lineHeight: 16,
                marginRight: 24,
              }}
            >
              {selected_comment}
            </Text>
          </View>

          <View style={styles.containerReport}>
            {options_report.map((opt, x) => {
              return (
                <TouchableOpacity
                  key={x}
                  style={styles.optionsReport}
                  onPress={() => sendReport(opt.title)}
                >
                  <Text style={styles.textOptionsReport}>{opt.title}</Text>
                  {checked === "Spam" ? (
                    <Image
                      source={require("../../../assets/icons/full-ellipse.png")}
                      resizeMode={"contain"}
                      style={styles.imageCheck}
                    />
                  ) : (
                    <Image
                      source={require("../../../assets/icons/ellipse.png")}
                      resizeMode={"contain"}
                      style={styles.imageCheck}
                    />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </Modalize>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: Dimensions.get("window").width,
    paddingHorizontal: 24,
  },
  containerSection: {
    flexDirection: "column",
    marginBottom: 0,
  },
  containerTopBar: {
    position: "absolute",
    backgroundColor: Colors.primary7,
    width: Dimensions.get("window").width,
    zIndex: 0,
    justifyContent: "space-between",
    flexDirection: "row",
    padding: 14,
  },
  containerCloseBar: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 10,
  },
  containerImage: {
    flexDirection: "row",
    justifyContent: "center",
  },
  containerTitleModal: {
    flex: 1,
    alignSelf: "center",
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 40,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#9CC6FF",
    width: Dimensions.get("window").width - 48,
    paddingBottom: 16,
  },
  containerHeaderModal: {
    flexDirection: "column",
    justifyContent: "center",
    marginTop: 24,
    marginLeft: 24,
  },
  containerModal: {
    flex: 1,
    flexDirection: "column",
  },
  containerReport: {
    flexDirection: "column",
    marginHorizontal: 24,
    marginTop: 16,
  },
  containerGroup: {
    flex: 1,
    flexDirection: "row",
    marginBottom: 24,
    justifyContent: "space-between",
    alignItems: "center",
  },
  containerPost: {
    flex: 1,
    width: Dimensions.get("window").width - 48,
    backgroundColor: "rgba(156, 198, 255, 0.042)",
    borderRadius: 8,
    paddingHorizontal: 16,
  },
  containerDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignSelf: "flex-start",
    alignItems: "center",
    marginBottom: 20,
    width: Dimensions.get("window").width - 80,
  },
  containerTextInput: {
    width: Dimensions.get("window").width - 44,
    height: 100,
    borderRadius: 2,
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "flex-start",
    backgroundColor: Colors.primary7,
    marginBottom: 32,
    marginTop: 8,
    padding: 8,
  },
  containerSendComment: {
    paddingTop: 40,
    flexDirection: "column",
    justifyContent: "flex-end",
    alignItems: "center",
    marginTop: 60,
  },
  containerTextComment: {
    flex: 1,
    alignSelf: "flex-start",
    width: Dimensions.get("window").width - 94,
    marginLeft: 64,
    marginTop: 4,
  },
  textSubtitle: {
    fontSize: 10,
    lineHeight: 16,
    width: 93,
    height: 16,
    color: Colors.text,
  },
  containerItemPost: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#264261",
    width: Dimensions.get("window").width - 80,
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 16,
    paddingBottom: 12,
    marginBottom: 20,
  },
  containerComments: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 24,
  },
  textUserName: {
    flex: 1,
    fontSize: 11,
    lineHeight: 16,
    color: Colors.primary4,
  },
  textPost: {
    justifyContent: "flex-start",
    fontSize: 16,
    fontWeight: "400",
    lineHeight: 16,
    color: Colors.text,
  },
  textComment: {
    justifyContent: "flex-start",
    fontSize: 12,
    fontWeight: "400",
    lineHeight: 16,
    color: Colors.text,
  },
  textTopBar: {
    fontSize: 16,
    fontWeight: "400",
    lineHeight: 24,
    color: Colors.text,
    marginLeft: 22,
  },
  textName: {
    fontSize: 24,
    color: Colors.text,
    alignSelf: "flex-start",
    lineHeight: 32,
  },
  titleComment: {
    paddingTop: 4,
    fontSize: 18,
    color: Colors.text,
    alignSelf: "flex-start",
    lineHeight: 16,
  },
  userPhoto: {
    width: 32,
    height: 32,
    borderRadius: 32,
    marginRight: 8,
  },
  backButtonStyle: {
    width: 50,
    height: 50,
    marginTop: -30,
    marginLeft: 12,
    marginRight: -10,
    marginBottom: -32,
  },
  buttonTopBar: {
    flexDirection: "row",
  },
  image: {
    alignSelf: "center",
    height: 121,
    marginLeft: 4,
    marginBottom: 0,
  },
  imageCheck: {
    alignSelf: "center",
    width: 16,
    height: 16,
    marginLeft: -50,
  },
  containerHeader: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
    marginBottom: 20,
  },
  textTitle: {
    fontSize: 16,
    color: Colors.text,
    fontWeight: "bold",
  },
  containerTitle: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#264261",
    paddingBottom: 8,
    marginBottom: 32,
  },
  textInputStyle: {
    alignSelf: "center",
    height: 78,
    fontSize: 12,
    lineHeight: 16,
    color: Colors.text,
    width: Dimensions.get("window").width - 150,
    textAlignVertical: "top",
    textAlign: "left",
  },
  containerButton: {
    alignItems: "center",
  },
  buttonSend: {
    height: 56,
    borderRadius: 30,
    borderWidth: StyleSheet.hairlineWidth,
    width: Dimensions.get("window").width - 44,
    marginHorizontal: 24,
    marginBottom: 16,
  },
  titleInvite: {
    fontSize: 16,
    lineHeight: 21,
    color: "white",
    alignContent: "center",
  },
  modalize: {
    backgroundColor: Colors.primary7,
    borderRadius: 8,
  },
  textOptionsReport: {
    fontSize: 16,
    lineHeight: 16,
    color: Colors.text,
  },
  optionsReport: {
    flex: 1,
    paddingVertical: 16,
    flexDirection: "row",
    justifyContent: "space-between",
  },
});

export default ViewPost;
