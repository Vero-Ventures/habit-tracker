import { LinearGradient } from "expo-linear-gradient";
import moment from "moment";
import React, { useEffect, useRef, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
  Alert,
  Dimensions,
  Modal,
  ActivityIndicator,
} from "react-native";
import { likePost, deletePost, savePost } from "../store/ducks/post";
import {
  likePost as likeCommunityPost,
  savePost as saveCommunityPost,
  deleteCommunityPost,
} from "../store/ducks/community";
import * as mime from "react-native-mime-types";
import { useSelector } from "react-redux";
import { Button } from "react-native-elements";
import Colors from "../../assets/styles/Colors";
import VideoCard from "./community/VideoCard";
import { getIconPost } from "../utils/Utils";

const CardPost = (props) => {
  const [showModalCardOptions, setShowModalCardOptions] = useState(false);
  const [isDeletingPost, setIsDeletingPost] = useState(false);
  const [successDeleting, setSuccessDeleting] = useState(false);

  const [stopVideo, setStopVideo] = useState(false);
  const video = useRef(null);
  const user = useSelector(({ user }) => user);

  const isPostFromUserLoggedIn = props.postUser.id === user.id;

  useEffect(() => {
    if (!showModalCardOptions && successDeleting) {
      Alert.alert("Success!", "Your post was deleted!");
      props.actions.onDeletePostSuccess(props.postId);
    }
  }, [showModalCardOptions, successDeleting]);

  const renderCardTop = () => (
    <LinearGradient
      colors={["rgba(156, 198, 255, 0.042)", "rgba(0, 37, 68, 0.15)"]}
      start={{ x: 0, y: 0.5 }}
      end={{ x: 1, y: 0.5 }}
      style={[styles.cardPostLinearGradientContainer]}
    >
      <TouchableOpacity onPress={viewUser}>
        <View style={styles.cardPostHeaderContainer}>
          {props.postUser?.imageUrl ? (
            <Image
              source={{ uri: props.postUser.imageUrl }}
              style={styles.cardPostIconPhoto}
            />
          ) : (
            <Image
              source={require("../../assets/images/no-profile.png")}
              style={styles.cardPostIconPhoto}
            />
          )}

          <View
            style={{
              flexDirection: "column",
              justifyContent: "flex-start",
              flexWrap: "nowrap",
              flex: 1,
              marginRight: isPostFromUserLoggedIn ? 8 : 32,
            }}
          >
            <Text style={styles.textUserName}>
              {props.postUser?.name ?? "Unknown User"}
            </Text>
            <Text style={styles.textSubtitle}>
              {props.createdAt
                ? moment(props.createdAt).local().startOf("second").fromNow()
                : "Unknown posted time"}
            </Text>
          </View>

          {isPostFromUserLoggedIn ? (
            <TouchableOpacity onPress={toggleModalOptions}>
              <Image
                source={require("../../assets/icons/ellipse-vertical.png")}
                style={styles.cardPostVerticalEllipsis}
              />
            </TouchableOpacity>
          ) : null}
        </View>
      </TouchableOpacity>
    </LinearGradient>
  );

  const viewUser = () => {
    if (isPostFromUserLoggedIn) {
      props.navigation.navigate("Home", {
        screen: "Profile",
        params: { screen: "ProfileIndex" },
      });
      return;
    }

    props.navigation.push("Home", {
      screen: "Profile",
      params: {
        screen: "UserProfile",
        params: { user: { id_user: props.postUser.id } },
      },
    });
  };

  const renderCommunity = () => (
    <TouchableOpacity onPress={viewCommunity}>
      <View style={[styles.cardPostCommunityContainer]}>
        {props.community?.imageUrl ? (
          <Image
            source={{ uri: props.community.imageUrl }}
            style={styles.cardPostIconCommunity}
          />
        ) : (
          <Image
            source={require("../../assets/images/no-profile.png")}
            style={styles.cardPostIconCommunity}
          />
        )}

        <Text style={styles.cardCommunityName}>
          {props.community?.name ?? "Unknown community"}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const viewCommunity = () => {
    const isUserOnCommunity = props.community?.community_member.find(
      (item) => item.cme_id_user === user.id,
    );

    if (
      isUserOnCommunity &&
      isUserOnCommunity.cme_active &&
      isUserOnCommunity.cme_approved
    ) {
      props.navigation.push("Home", {
        screen: "Community",
        params: {
          screen: "FeedCommunity",
          params: { community: { id: props.community.id }, backPop: true },
        },
      });
      return;
    }

    props.navigation.push("Home", {
      screen: "Community",
      params: {
        screen: "ViewCommunity",
        params: { community: { id: props.community.id }, backPop: true },
      },
    });
  };

  const renderCardCommunityPost = () => {
    if (props.postFile?.length > 0) {
      return (
        <>
          {props.postText ? (
            <LinearGradient
              colors={["rgba(156, 198, 255, 0.042)", "rgba(0, 37, 68, 0.15)"]}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={[
                styles.cardPostLinearGradientContainer,
                { paddingVertical: 12, paddingHorizontal: 16 },
              ]}
            >
              {props.postText ? (
                <>
                  {props.postType === "new_habit" ? (
                    <View
                      style={{
                        flexDirection: "column",
                        justifyContent: "flex-start",
                      }}
                    >
                      <Text style={styles.postText}>
                        {props.postText.slice(0, 19)}
                      </Text>

                      <View
                        style={{
                          flexDirection: "row",
                          justifyContent: "flex-start",
                        }}
                      >
                        <Text style={styles.textPostSub}>
                          {props.postText.slice(20, 35)}
                        </Text>

                        <Text style={styles.textPostBold}>
                          {props.postText.slice(35)}
                        </Text>
                      </View>
                    </View>
                  ) : props.postType === "score" ? (
                    <View
                      style={{
                        flexDirection: "column",
                        justifyContent: "flex-start",
                      }}
                    >
                      <Text style={styles.postText}>
                        {props.postText.slice(
                          0,
                          props.postText.indexOf(".") + 1,
                        )}
                      </Text>

                      <View
                        style={{
                          flexDirection: "row",
                          justifyContent: "flex-start",
                          alignItems: "flex-end",
                        }}
                      >
                        <Text style={styles.textPostSub}>
                          {props.postText.slice(
                            props.postText.indexOf(".") + 2,
                            props.postText.indexOf(":") + 1,
                          )}
                        </Text>

                        <Text style={styles.textPost}>
                          {props.postText.slice(
                            props.postText.indexOf(":") + 1,
                          )}
                        </Text>
                      </View>
                    </View>
                  ) : (
                    <Text style={styles.postText}>
                      {props.postText ?? "Unknown post text"}
                    </Text>
                  )}

                  {props.postType !== "feed"
                    ? getIconPost(props.postType)
                    : null}
                </>
              ) : null}
            </LinearGradient>
          ) : null}

          {renderCommunity()}

          <LinearGradient
            colors={["rgba(156, 198, 255, 0.042)", "rgba(0, 37, 68, 0.15)"]}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={[styles.cardPostLinearGradientContainer]}
          >
            {mime
              .lookup(props.postFile[0]?.file?.att_name)
              .includes("image") ? (
              <View styles={{ flex: 1, alignItems: "center" }}>
                <Image
                  source={{ uri: props.postFile[0]?.file?.url }}
                  style={styles.file}
                  resizeMode="contain"
                />
              </View>
            ) : mime
                .lookup(props.postFile[0]?.file?.att_name)
                .includes("video") ? (
              <View>
                <VideoCard
                  customVideoSize={{ maxWidth: "100%", height: 207 }}
                  video={props.postFile[0]?.file?.url}
                  stop={stopVideo}
                  navigation={props.navigation}
                />
              </View>
            ) : null}
          </LinearGradient>
        </>
      );
    }

    return (
      <>
        {renderCommunity()}

        <LinearGradient
          colors={["rgba(156, 198, 255, 0.042)", "rgba(0, 37, 68, 0.15)"]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={[styles.cardPostLinearGradientContainer]}
        >
          {props.postText ? (
            <View style={{ paddingVertical: 12, paddingHorizontal: 16 }}>
              {props.postType === "new_habit" ? (
                <View
                  style={{
                    flexDirection: "column",
                    justifyContent: "flex-start",
                  }}
                >
                  <Text style={styles.postText}>
                    {props.postText.slice(0, 19)}
                  </Text>

                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "flex-start",
                    }}
                  >
                    <Text style={styles.textPostSub}>
                      {props.postText.slice(20, 35)}
                    </Text>

                    <Text style={styles.textPostBold}>
                      {props.postText.slice(35)}
                    </Text>
                  </View>
                </View>
              ) : props.postType === "score" ? (
                <View
                  style={{
                    flexDirection: "column",
                    justifyContent: "flex-start",
                  }}
                >
                  <Text style={styles.postText}>
                    {props.postText.slice(0, props.postText.indexOf(".") + 1)}
                  </Text>

                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "flex-start",
                      alignItems: "flex-end",
                    }}
                  >
                    <Text style={styles.textPostSub}>
                      {props.postText.slice(
                        props.postText.indexOf(".") + 2,
                        props.postText.indexOf(":") + 1,
                      )}
                    </Text>

                    <Text style={styles.textPost}>
                      {props.postText.slice(props.postText.indexOf(":") + 1)}
                    </Text>
                  </View>
                </View>
              ) : (
                <Text style={styles.postText}>
                  {props.postText ?? "Unknown post text"}
                </Text>
              )}
              {props.postType !== "feed" ? getIconPost(props.postType) : null}
            </View>
          ) : null}
        </LinearGradient>
      </>
    );
  };

  const renderCardPost = () => (
    <LinearGradient
      colors={["rgba(156, 198, 255, 0.042)", "rgba(0, 37, 68, 0.15)"]}
      start={{ x: 0, y: 0.5 }}
      end={{ x: 1, y: 0.5 }}
      style={[
        styles.cardPostLinearGradientContainer,
        { paddingHorizontal: 16, paddingVertical: 12 },
      ]}
    >
      {props.postType === "new_habit" ? (
        <View style={{ flexDirection: "column", justifyContent: "flex-start" }}>
          <Text style={styles.postText}>{props.postText.slice(0, 19)}</Text>

          <View style={{ flexDirection: "row", justifyContent: "flex-start" }}>
            <Text style={styles.textPostSub}>
              {props.postText.slice(20, 35)}
            </Text>

            <Text style={styles.textPostBold}>{props.postText.slice(35)}</Text>
          </View>
        </View>
      ) : props.postType === "score" ? (
        <View style={{ flexDirection: "column", justifyContent: "flex-start" }}>
          <Text style={styles.postText}>
            {props.postText.slice(0, props.postText.indexOf(".") + 1)}
          </Text>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "flex-start",
              alignItems: "flex-end",
            }}
          >
            <Text style={styles.textPostSub}>
              {props.postText.slice(
                props.postText.indexOf(".") + 2,
                props.postText.indexOf(":") + 1,
              )}
            </Text>

            <Text style={styles.textPost}>
              {props.postText.slice(props.postText.indexOf(":") + 1)}
            </Text>
          </View>
        </View>
      ) : (
        <Text style={styles.postText}>
          {props.postText ?? "Unknown post text"}
        </Text>
      )}
      {getIconPost(props.postType)}
    </LinearGradient>
  );

  const renderCardActions = () => (
    <LinearGradient
      colors={["rgba(156, 198, 255, 0.042)", "rgba(0, 37, 68, 0.15)"]}
      start={{ x: 0, y: 0.5 }}
      end={{ x: 1, y: 0.5 }}
      style={[
        styles.cardPostLinearGradientContainer,
        { borderTopColor: `${Colors.white}14`, borderTopWidth: 1 },
      ]}
    >
      <View style={styles.containerActions}>
        <TouchableOpacity style={[styles.buttonActions]} onPress={onPressLike}>
          <Image
            resizeMode="cover"
            source={
              props.actions?.likeFromUser
                ? require("../../assets/icons/heart-full.png")
                : require("../../assets/icons/heart.png")
            }
            style={styles.imageMedal}
          />

          <Text style={styles.textPostActions}>
            {props.actions.countLikes > 0 ? props.actions.countLikes : null}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.buttonActions, { alignSelf: "center" }]}
          onPress={onPressComment}
        >
          <Image
            source={require("../../assets/icons/message-dots.png")}
            style={styles.imageMedal}
          />

          <Text style={styles.textPostActions}>
            {props.actions.countComments > 0
              ? props.actions.countComments
              : null}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.buttonActions]} onPress={onPressSave}>
          <Image
            source={
              props.actions.saveFromUser
                ? require("../../assets/icons/bookmark-selected.png")
                : require("../../assets/icons/bookmark.png")
            }
            style={styles.imageMedal}
          />
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );

  const onPressLike = () => {
    if (props.community) {
      likeCommunityPost(props.postId)
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
              props.actions.onLikePostSuccess(props.postId);
            }
          }
        });
      return;
    }

    likePost(props.postId)
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
            props.actions.onLikePostSuccess(props.postId);
          }
        }
      });
  };

  const onPressComment = () => {
    onPressPost();
  };

  const onPressSave = () => {
    if (props.community) {
      saveCommunityPost(props.postId)
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
              props.actions.onSavePostSuccess(props.postId);
            }
          }
        });
      return;
    }

    savePost(props.postId)
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
            props.actions.onSavePostSuccess(props.postId);
          }
        }
      });
  };

  const onPressPost = () => {
    if (props.community) {
      setStopVideo(true);
      video.current ? video.current.stopAsync() : null;
      props.navigation.push("Home", {
        screen: "Community",
        params: {
          screen: "ViewPostCommunity",
          params: { post: { id_post: props.postId } },
        },
      });
      return;
    }

    props.navigation.push("Home", {
      screen: "Timeline",
      params: {
        screen: "ViewPost",
        params: { post: { id_post: props.postId } },
      },
    });
  };

  const toggleModalOptions = () => {
    if (isPostFromUserLoggedIn) {
      props.setBlurActive(!showModalCardOptions);
      setShowModalCardOptions(!showModalCardOptions);
      return;
    }

    onPressPost();
  };

  const onPressDeleteOption = () => {
    setIsDeletingPost(true);

    if (props.community) {
      deleteCommunityPost(props.postId)
        .catch((err) => {
          setIsDeletingPost(false);
          Alert.alert(
            "Ops!",
            "Something went wrong with our servers. Please contact us.",
          );
        })
        .then((res) => {
          if (res?.status === 200) {
            if (res.data.erros) {
              setIsDeletingPost(false);
              Alert.alert("Ops!", res.data.errors[0]);
            } else {
              setSuccessDeleting(true);
            }
          }
        })
        .finally(() => {
          setShowModalCardOptions(false);
        });
      return;
    }

    deletePost(props.postId)
      .catch((err) => {
        setIsDeletingPost(false);
        Alert.alert(
          "Ops!",
          "Something went wrong with our servers. Please contact us.",
        );
      })
      .then((res) => {
        if (res?.status === 200) {
          if (res.data.erros) {
            setIsDeletingPost(false);
            Alert.alert("Ops!", res.data.errors[0]);
          } else {
            setSuccessDeleting(true);
          }
        }
      })
      .finally(() => {
        setShowModalCardOptions(false);
      });
  };

  const onEditPostPress = () => {
    setShowModalCardOptions(false);
    props.setBlurActive(false);

    if (props.community) {
      props.navigation.push("Home", {
        screen: "Timeline",
        params: {
          screen: "EditCommunityPost",
          params: { post: { id: props.postId } },
        },
      });
      return;
    }

    props.navigation.push("Home", {
      screen: "Timeline",
      params: { screen: "EditPost", params: { post: { id: props.postId } } },
    });
  };

  return (
    <React.Fragment>
      <TouchableOpacity
        onLongPress={toggleModalOptions}
        onPress={onPressPost}
        style={styles.cardShadow}
      >
        {renderCardTop()}

        {props.community ? renderCardCommunityPost() : renderCardPost()}

        {renderCardActions()}
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={showModalCardOptions}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <View style={styles.containerModal}>
              <TouchableOpacity
                style={styles.containerHeaderModal}
                onPress={toggleModalOptions}
              >
                <Image
                  style={styles.imageModalHeader}
                  source={require("../../assets/icons/close.png")}
                />
              </TouchableOpacity>

              {isDeletingPost ? (
                <>
                  <Text style={styles.textHeaderModal}>{"Deleting post"}</Text>

                  <Text style={styles.textDescriptionModal}>{"Wait..."}</Text>

                  <ActivityIndicator
                    style={{ marginTop: 16 }}
                    size="small"
                    color={Colors.text}
                  />
                </>
              ) : (
                <>
                  <Text style={styles.textHeaderModal}>{"Post options"}</Text>

                  <View style={styles.containerButton}>
                    <Button
                      buttonStyle={styles.confirmButton}
                      onPress={onPressDeleteOption}
                      title={"DELETE POST"}
                    />
                  </View>

                  {props.postType === "feed" ? (
                    <View style={styles.containerButton}>
                      <Button
                        buttonStyle={styles.editButton}
                        onPress={onEditPostPress}
                        title={"EDIT POST"}
                      />
                    </View>
                  ) : null}
                </>
              )}
            </View>
          </View>
        </View>
      </Modal>
    </React.Fragment>
  );
};

const styles = StyleSheet.create({
  cardShadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 7,
  },
  cardPostLinearGradientContainer: {
    flex: 1,
    backgroundColor: "rgba(156, 198, 255, 0.042)",
  },
  cardPostHeaderContainer: {
    display: "flex",
    flexDirection: "row",
    padding: 16,
  },
  cardPostIconPhoto: {
    width: 38,
    height: 38,
    borderRadius: 32,
    marginRight: 8,
  },
  textUserName: {
    flex: 1,
    fontSize: 16,
    fontWeight: "700",
    lineHeight: 16,
    color: Colors.text,
  },
  textSubtitle: {
    fontSize: 14,
    lineHeight: 19,
    fontWeight: "400",
    color: Colors.text,
  },
  cardPostVerticalEllipsis: {
    height: 24,
    width: 24,
  },
  textPost: {
    justifyContent: "flex-start",
    fontSize: 16,
    fontWeight: "700",
    lineHeight: 16,
    color: Colors.text,
    width: "100%",
    flexShrink: 1,
    paddingRight: 8,
  },
  cardPostCommunityContainer: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    backgroundColor: Colors.background,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  cardPostIconCommunity: {
    width: 24,
    height: 24,
    borderRadius: 32,
  },
  cardCommunityName: {
    fontSize: 14,
    lineHeight: 16.8,
    fontWeight: "700",
    color: Colors.text,
    marginLeft: 12,
  },
  postText: {
    fontSize: 14,
    lineHeight: 16.8,
    fontWeight: "700",
    color: Colors.text,
    flexShrink: 1,
  },
  textPostSub: {
    justifyContent: "flex-start",
    fontSize: 13,
    fontWeight: "400",
    lineHeight: 17,
    color: Colors.text,
  },
  textPostBold: {
    justifyContent: "flex-start",
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 17,
    color: Colors.text,
    flexShrink: 1,
  },
  containerActions: {
    flex: 1,
    backgroundColor: "rgba(156, 198, 255, 0.042)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 32,
  },
  buttonActions: {
    flexDirection: "row",
    alignItems: "center",
    paddingRight: 100,
    justifyContent: "space-between",
  },
  textPostActions: {
    justifyContent: "flex-start",
    fontWeight: "400",
    lineHeight: 16,
    color: Colors.text,
    marginLeft: 6,
    fontSize: 12,
  },
  imageMedal: {
    width: 24,
    height: 24,
  },
  file: {
    alignSelf: "center",
    width: Dimensions.get("window").width,
    height: 230,
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
  centeredView: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
  containerModal: {
    flexDirection: "column",
    alignSelf: "center",
    alignItems: "center",
    width: Dimensions.get("window").width - 76,
  },
  containerHeaderModal: {
    flexDirection: "row",
    alignSelf: "flex-end",
    marginBottom: 8,
  },
  imageModalHeader: {
    resizeMode: "cover",
    width: 24,
    height: 24,
    borderRadius: 62,
    //marginRight: 12,
    //marginLeft: 16,
  },
  containerButton: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
    width: "100%",
  },
  textHeaderModal: {
    textAlign: "center",
    fontSize: 24,
    fontWeight: "700",
    lineHeight: 33,
    color: Colors.text,
  },
  textDescriptionModal: {
    textAlign: "center",
    fontSize: 14,
    fontWeight: "400",
    lineHeight: 21,
    marginTop: 16,
    color: Colors.text,
  },
  confirmButton: {
    height: 64,
    borderRadius: 4,
    minWidth: 200,
    backgroundColor: "#982538",
  },
  editButton: {
    height: 64,
    borderRadius: 4,
    minWidth: 200,
    backgroundColor: "#004B7D",
  },
});

export default CardPost;
