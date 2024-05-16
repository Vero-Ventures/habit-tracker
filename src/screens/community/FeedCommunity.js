import React, { useState, useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  Text,
  RefreshControl,
  ScrollView,
  Image,
  FlatList,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Share,
} from "react-native";
import PostCommunity from "../../components/community/PostCommunity";
import PostHabits from "../../components/community/PostHabits";
import Default from "../../../assets/styles/Default";
import Colors from "../../../assets/styles/Colors";
import Fetching from "../../components/Fetching";
import Icon from "react-native-vector-icons/FontAwesome5";
import * as ImagePicker from "expo-image-picker";
import * as mime from "react-native-mime-types";
import { useSelector } from "react-redux";
import { LinearGradient } from "expo-linear-gradient";
import { Button } from "react-native-elements";
import CardHabits from "../../components/community/CardHabits";
import {
  get as getCommunity,
  listPosts,
  storePost,
  likePost,
  savePost,
  listHabits,
  leaveCommunity,
  updateMember,
  removeMember,
} from "../../store/ducks/community";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import moment from "moment";
import ActionSheet from "react-native-actionsheet";
import { Video } from "expo-av";
import * as FileSystem from "expo-file-system";
import { takeCamera, takeGaleria } from "../../utils/Utils";
import VideoCard from "../../components/community/VideoCard";

const FeedCommunity = (props) => {
  const [fetching, setFetching] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [load_more, setLoadMore] = useState(true);

  const [fetching_habits, setFetchingHabits] = useState(false);
  const [fetching_posts, setFetchingPosts] = useState(false);
  const [fetching_community, setFetchingCommunity] = useState(false);

  const [postFile, setPostFile] = useState(null);
  const [community, setCommunity] = useState({});
  const [list_posts, setListPosts] = useState([]);
  const [admins_info, setAdminsInfo] = useState("");
  const [moderators_info, setModeratorsInfo] = useState("");
  const [list_posts_habits, setListPostsHabits] = useState([]);
  const [text_post, setTextPost] = useState("");
  const [list_habits, setListHabits] = useState("");

  const [page, setPage] = useState(0);
  const [option_bar, setOptionBar] = useState(1);
  const [see_all, setSeeAll] = useState(false);

  const [status_video, setStatusVideo] = useState({});

  const video_post = useRef(null);
  const ASPhotoOptions = useRef();
  const ref = useRef(null);

  const user = useSelector(({ user }) => user);

  useEffect(() => {
    fetchCommunity(true, false);
    fetchPosts(false, false);
    return () => {
      video_post.current = null;
      setStatusVideo({});
    };
  }, []);

  useEffect(() => {
    if (option_bar === 1) {
      fetchPosts(true, false);
      return () => {
        setListPostsHabits([]);
      };
    } else if (option_bar === 2) {
      fetchPosts(true, false, false);
      fetchHabits();
      // return () => {
      // 	setListPosts([]);
      // }
    } else if (option_bar === 3) {
      return () => {
        setListPosts([]);
        setListPostsHabits([]);
      };
    }
  }, [option_bar]);

  useEffect(() => {
    const unsubscribe = props.navigation.addListener("focus", () => {
      if (option_bar === 1) {
        fetchPosts(false, false, true);
        return;
      }

      if (option_bar === 2) {
        fetchPosts(false, false, true);
        fetchHabits();
        return;
      }

      if (option_bar === 3) {
        fetchCommunity(false, false);
        return;
      }
    });

    return unsubscribe;
  }, [props.navigation, option_bar, fetchPosts, fetchHabits, fetchCommunity]);

  const fetchCommunity = (is_fetching, is_refreshing) => {
    is_fetching
      ? setFetching(true)
      : is_refreshing
        ? setRefreshing(true)
        : null;

    getCommunity(props.route.params.community.id)
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
            setCommunity(res.data);

            let admins = res.data?.admins_moderators.filter(
              (item) => item.cme_role === "ADMIN",
            );
            let moderators = res.data?.admins_moderators.filter(
              (item) => item.cme_role === "MODERATOR",
            );

            if (admins?.length === 1) {
              setAdminsInfo(
                admins[0]?.user?.name?.split(" ", 1) + " is administrator. ",
              );
            } else if (admins?.length > 1) {
              let aux = admins
                .map((obj, i) => {
                  return (
                    (i + 1 === admins.length
                      ? "and " + obj.user.name.split(" ", 1)
                      : obj.user.name.split(" ", 1)) +
                    (i + 2 === admins.length ? "" : ",")
                  );
                })
                .join(" ");

              setAdminsInfo(aux.slice(0, -1) + " are administrators. ");
            }

            if (moderators?.length === 1) {
              setModeratorsInfo(
                moderators[0]?.user?.name?.split(" ", 1) + " is moderator. ",
              );
            } else if (moderators?.length > 1) {
              let aux = moderators
                .map((obj, i) => {
                  return (
                    (i + 1 === moderators.length
                      ? "and " + obj.user.name.split(" ", 1)
                      : obj.user.name.split(" ", 1)) +
                    (i + 2 === moderators.length ? "" : ",")
                  );
                })
                .join(" ");

              setModeratorsInfo(aux.slice(0, -1) + " are moderators.");
            }

            props.route?.params?.community?.option ? setOptionBar(3) : null;
          }
        }

        if (res?.status === 244) {
          props.navigation.pop();
        }
      })
      .finally(() => {
        setFetching(false);
        setRefreshing(false);
      });
  };

  const sendPost = async () => {
    setSending(true);

    let verify_type_file = null;
    let postForm = new FormData();

    postForm.append("cop_id_community", community.id);
    postForm.append("cop_text", text_post);

    if (postFile !== null) {
      if (mime.lookup(postFile.uri).includes("video")) {
        let fileInfo = await FileSystem.getInfoAsync(postFile.uri);

        if (fileInfo.size > 20971520) {
          Alert.alert(
            "Ops",
            "Your file is too large, select a file up to 20 megabytes.",
          );
          setSending(false);
          setPostFile(null);
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

      postForm.append("file_type", verify_type_file);
      postForm.append("post_file", postFile);
    }

    await storePost(postForm)
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
            let post_aux = [...list_posts];
            post_aux.unshift(res.data);

            setListPosts(post_aux);
            setTextPost("");
            setPostFile(null);
          }
        }

        if (res?.status === 244) {
          props.navigation.pop();
        }
      })
      .finally(() => {
        setSending(false);
      });
  };

  const fetchHabits = () => {
    listHabits(community.id)
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
            setListHabits(res.data);
          }
        }
      });
  };

  const shareCommunity = async () => {
    const urlAndroid =
      "https://play.google.com/store/apps/details?id=com.alex.live.timeless";
    const urlApple =
      "https://apps.apple.com/br/app/live-timeless/id1556115926?l=en";
    const message =
      "Check my community " +
      community?.com_name +
      " on Live Timeless App.\nAndroid Link: " +
      urlAndroid +
      "\nApple Link: " +
      urlApple;

    try {
      const result = await Share.share({
        title: "Join to my community in Live Timeless App",
        message,
        url: urlApple,
      });
      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          // shared with activity type of result.activityType
        } else {
        }
      } else if (result.action === Share.dismissedAction) {
        // dismissed
      }
    } catch (error) {
      alert(error.message);
    }
  };

  const fetchPosts = (is_fetching, is_refreshing, force) => {
    setTextPost("");
    setPostFile(null);
    setSending(false);
    setSeeAll(false);

    if (force || is_fetching) {
      is_fetching && option_bar === 1
        ? setFetchingPosts(true)
        : is_fetching && option_bar === 2
          ? setFetchingHabits(true)
          : null;
      is_refreshing ? setRefreshing(true) : null;

      let request = {
        page: 0,
        cop_id_community: props.route?.params?.community?.id,
        cop_type: option_bar === 1 ? "feed" : "habit",
      };

      listPosts(request)
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
              option_bar === 1
                ? setListPosts(res.data?.data)
                : option_bar === 2
                  ? setListPostsHabits(res.data?.data)
                  : null;
              setPage(0);
            }

            if (res.data?.current_page === res.data?.last_page) {
              setLoadMore(false);
              setPage(0);
            } else {
              setLoadMore(true);
            }
          }

          if (res?.status === 244) {
            props.navigation.pop();
          }
        })
        .finally(() => {
          setRefreshing(false);
          setFetchingPosts(false);
          setFetchingHabits(false);
          setFetching(false);
        });
    }
  };

  const onPressLike = (id) => {
    likePost(id)
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
            if (option_bar === 1) {
              let posts = [...list_posts];

              posts.map((post, i) => {
                if (post.id === id) {
                  if (res.data) {
                    post.likes = [{ liked: true }];
                    post.count_likes += 1;
                  } else {
                    post.likes = [];
                    post.count_likes -= 1;
                  }
                }
              });

              setListPosts(posts);
            } else if (option_bar === 2) {
              let posts = [...list_posts_habits];

              posts.map((post, i) => {
                if (post.id === id) {
                  if (res.data) {
                    post.likes = [{ liked: true }];
                    post.count_likes += 1;
                  } else {
                    post.likes = [];
                    post.count_likes -= 1;
                  }
                }
              });

              setListPostsHabits(posts);
            }
          }
        }

        if (res?.status === 244) {
          props.navigation.pop();
        }
      });
  };

  const onPressSave = (id) => {
    savePost(id)
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
            if (option_bar === 1) {
              let posts = [...list_posts];

              posts.map((post, i) => {
                if (post.id === id) {
                  if (res.data) {
                    post.saved_post = [{ saved: true }];
                  } else {
                    post.saved_post = [];
                  }
                }
              });

              setListPosts(posts);
            } else if (option_bar === 2) {
              let posts = [...list_posts_habits];

              posts.map((post, i) => {
                if (post.id === id) {
                  if (res.data) {
                    post.saved_post = [{ saved: true }];
                  } else {
                    post.saved_post = [];
                  }
                }
              });

              setListPostsHabits(posts);
            }
          }
        }

        if (res?.status === 244) {
          props.navigation.pop();
        }
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

  const onHandleManage = () => {
    props.navigation.navigate("ManageCommunity", {
      community: { id: community?.id, private: community?.com_private },
    });
  };

  const setLeave = (request) => {
    setFetching(true),
      leaveCommunity(request)
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
              props.navigation.navigate("Home", {
                screen: "Community",
                params: { screen: "CommunityIndex" },
              });
            }
          }
        })
        .finally(() => {
          setFetching(false);
        });
  };

  const onHandleLeave = () => {
    let request = {
      cme_id_community: community.id,
    };

    if (community.user_member?.cme_role === "ADMIN") {
      if (community.members_count <= 1) {
        Alert.alert(
          user.name,
          "Are you sure you want to leave and delete this community?",
          [
            {
              text: "No",
              onPress: () => {
                setFetching(false);
              },
              style: "cancel",
            },
            {
              text: "Yes",
              onPress: () => [(request.delete = true), setLeave(request)],
            },
          ],
          { cancelable: false },
        );
      } else {
        let verify_admin = community?.admins_moderators?.filter(
          (item) => item.user.id !== user.id && item.cme_role === "ADMIN",
        );

        if (verify_admin.length === 0) {
          let verify_moderator = community?.admins_moderators?.filter(
            (item) => item.cme_role === "MODERATOR",
          );

          if (verify_moderator.length > 0) {
            let data = {
              cme_role: "ADMIN",
              cme_id_user: verify_moderator[0]?.user?.id,
              cme_id_community: community?.id,
            };

            Alert.alert(
              user.name,
              "Are you sure? you will be removed from admin and another member will become admin.",
              [
                {
                  text: "No",
                  onPress: () => {
                    setFetching(false);
                    modalizeRef.current?.close();
                  },
                  style: "cancel",
                },
                {
                  text: "Yes",
                  onPress: () =>
                    updateMember(data)
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
                            let request = {
                              cme_id_community: community.id,
                            };

                            setLeave(request);
                          }
                        }
                      })
                      .finally(() => {
                        setFetching(false);
                        props.navigation.pop();
                      }),
                },
              ],
              { cancelable: false },
            );
          }
        } else {
          Alert.alert(
            user.name,
            "Are you sure you want to leave this community?",
            [
              {
                text: "No",
                onPress: () => {
                  setFetching(false);
                },
                style: "cancel",
              },
              {
                text: "Yes",
                onPress: () => [setLeave({ cme_id_community: community.id })],
              },
            ],
            { cancelable: false },
          );
        }
      }
    } else {
      Alert.alert(
        user.name,
        "Are you sure you want to leave this community?",
        [
          {
            text: "No",
            onPress: () => {
              setFetching(false);
            },
            style: "cancel",
          },
          {
            text: "Yes",
            onPress: () => [
              setFetching(true),
              leaveCommunity(request)
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
                      props.navigation.navigate("Home", {
                        screen: "Community",
                        params: { screen: "CommunityIndex" },
                      });
                    }
                  }
                })
                .finally(() => {
                  setFetching(false);
                }),
            ],
          },
        ],
        { cancelable: false },
      );
    }
  };

  const inputSearchTheme = {
    colors: {
      primary: Colors.primary4,
      text: "#FFFFFF",
      placeholder: Colors.primary4,
    },
    fonts: {
      regular: {
        fontSize: 12,
        lineHeight: 16,
        fontWeight: "normal",
      },
    },
    roundness: 8,
  };

  const loadMore = () => {
    let post_aux = [];
    let number_page = page + 1;

    setPage(number_page);
    setLoading(true);

    let request = {
      page: number_page,
      cop_id_community: community.id,
      cop_type: option_bar === 1 ? "feed" : option_bar === 2 ? "habit" : null,
    };

    listPosts(request)
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
            post_aux = [...list_posts];
            post_aux = post_aux.concat(res.data?.data);

            option_bar === 1
              ? setListPosts(post_aux)
              : option_bar === 2
                ? setListPostsHabits(post_aux)
                : null;

            if (res.data?.current_page === res.data?.last_page) {
              setLoadMore(false);
              setPage(0);
            }
          }

          setLoading(false);
        }

        if (res?.status === 244) {
          props.navigation.pop();
        }
      });
  };

  const isCloseToBottom = ({
    layoutMeasurement,
    contentOffset,
    contentSize,
  }) => {
    const paddingToBottom = 20;
    return (
      layoutMeasurement.height + contentOffset.y >=
      contentSize.height - paddingToBottom
    );
  };

  const addHabit = () => {
    props.navigation.navigate("AddCommunityHabit", {
      community: { id: community?.id },
    });
  };

  const pushToAddAllCommunityHabits = () => {
    props.navigation.push("AddAllCommunityHabits", {
      community: { id: community.id },
    });
  };

  const renderEmptyList = () => (
    <Text style={styles.textDefault}>Nenhum vídeo encontrado.</Text>
  );

  return (
    <View style={Default.container}>
      <KeyboardAwareScrollView extraScrollHeight={150} enableOnAndroid={true}>
        <ScrollView
          scrollEventThrottle={38}
          onScroll={({ nativeEvent }) => {
            if (
              ((option_bar === 1 && list_posts?.data?.length > 0) ||
                (option_bar === 2 && list_posts_habits.length > 0)) &&
              load_more &&
              isCloseToBottom(nativeEvent)
            ) {
              loadMore();
            }
          }}
          scrollEnabled
          refreshControl={
            <RefreshControl
              colors={["#000"]}
              tintColor="#fff"
              onRefresh={() =>
                option_bar === 1 || option_bar === 2
                  ? fetchPosts(false, true, true)
                  : option_bar === 3
                    ? fetchCommunity()
                    : null
              }
              refreshing={refreshing}
            />
          }
        >
          <Fetching isFetching={fetching}>
            <View style={styles.container}>
              <SafeAreaView style={{ flex: 1 }}>
                <View style={styles.containerHeaderImage}>
                  <Image
                    source={{ uri: community.image?.url }}
                    style={styles.communityImage}
                    resizeMode="cover"
                  />

                  <TouchableOpacity
                    style={styles.backButton}
                    onPress={() =>
                      props.route.params?.backPop
                        ? props.navigation.pop()
                        : props.navigation.navigate("CommunityIndex")
                    }
                  >
                    <Icon
                      type="font-awesome"
                      name="chevron-left"
                      size={16}
                      color="white"
                    />
                  </TouchableOpacity>

                  {community.com_private ? (
                    <View style={styles.typeCommunity}>
                      <Image
                        source={require("../../../assets/icons/icon-privacy.png")}
                        style={styles.headerIcon}
                      />
                      <Text style={styles.typeCommunityText}>
                        Private community
                      </Text>
                    </View>
                  ) : null}
                </View>

                <View style={styles.containerTitle}>
                  <Text style={styles.textTitle}>{community.com_name}</Text>
                  <TouchableOpacity
                    style={{ alignContent: "flex-end", right: 0 }}
                    onPress={() =>
                      props.navigation.navigate("SettingsCommunity", {
                        community: { id: community?.id },
                      })
                    }
                  >
                    <Image
                      source={require("../../../assets/icons/cog.png")}
                      style={styles.cogIcon}
                    />
                  </TouchableOpacity>
                </View>

                {community.members?.length > 0 ? (
                  <View style={styles.containerMembers}>
                    {community.members?.length > 0 ? (
                      <TouchableOpacity
                        style={{ flexDirection: "row", alignItems: "center" }}
                        onPress={() =>
                          props.navigation.navigate("ViewMembers", {
                            community: {
                              id: community?.id,
                              private: community?.com_private,
                            },
                          })
                        }
                      >
                        {community.members.map((obj, i) => {
                          return obj.user?.image ? (
                            <Image
                              key={i}
                              style={[
                                styles.imageModalHeader,
                                { marginRight: -6 },
                              ]}
                              source={{ uri: obj.user?.image?.url }}
                            />
                          ) : (
                            <Image
                              key={i}
                              style={[
                                styles.imageModalHeader,
                                { marginRight: -6 },
                              ]}
                              source={require("../../../assets/images/no-profile.png")}
                            />
                          );
                        })}
                        <Image
                          source={require("../../../assets/icons/ellipse-separator.png")}
                          style={styles.ellipseIcon}
                        />
                        <Text style={styles.typeCommunityText}>
                          {community.members_count} members
                        </Text>
                      </TouchableOpacity>
                    ) : null}

                    {!community.com_private ? (
                      <Button
                        buttonStyle={styles.shareButton}
                        titleStyle={Default.loginButtonBoldTitle}
                        onPress={shareCommunity}
                        icon={{ name: "share", size: 20, color: "white" }}
                        title={"Share"}
                      />
                    ) : null}
                  </View>
                ) : null}

                <View style={styles.containerNavBar}>
                  <TouchableOpacity
                    style={[
                      styles.containerItemNavBar,
                      option_bar === 1
                        ? {
                          borderBottomColor: "rgba(153, 37, 56, 1)",
                          borderBottomWidth: 2,
                        }
                        : null,
                    ]}
                    onPress={() => setOptionBar(1)}
                  >
                    <Text style={styles.textPost}>Feed</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.containerItemNavBar,
                      option_bar === 2
                        ? {
                          borderBottomColor: "rgba(153, 37, 56, 1)",
                          borderBottomWidth: 2,
                        }
                        : null,
                    ]}
                    onPress={() => {
                      setOptionBar(2), setSeeAll(false);
                    }}
                  >
                    <Text style={styles.textPost}>Habits</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.containerItemNavBar,
                      option_bar === 3
                        ? {
                          borderBottomColor: "rgba(153, 37, 56, 1)",
                          borderBottomWidth: 2,
                        }
                        : null,
                    ]}
                    onPress={() => setOptionBar(3)}
                  >
                    <Text style={styles.textPost}>About</Text>
                  </TouchableOpacity>
                </View>

                {option_bar === 1 ? (
                  <>
                    <Fetching isFetching={fetching_posts}>
                      <LinearGradient
                        colors={[
                          "rgba(156, 198, 255, 0.042)",
                          "rgba(0, 37, 68, 0.15)",
                        ]}
                        start={{ x: 0, y: 0.5 }}
                        end={{ x: 1, y: 0.5 }}
                        style={styles.containerGradientSendPost}
                      >
                        <View style={styles.containerSendPost}>
                          <View
                            style={{
                              flexDirection: "row",
                              alignItems: "center",
                              zIndex: 9,
                              elevation: 9,
                              paddingVertical: 16,
                            }}
                          >
                            {user.image ? (
                              <Image
                                source={{ uri: user.image?.url }}
                                style={[styles.userPhoto, { marginLeft: 16 }]}
                              />
                            ) : (
                              <Image
                                source={require("../../../assets/images/no-profile.png")}
                                style={[styles.userPhoto, { marginLeft: 16 }]}
                              />
                            )}
                            <TextInput
                              value={text_post}
                              multiline
                              onChangeText={setTextPost}
                              keyboardAppearance="dark"
                              style={styles.inputPost}
                              placeholder="Write something..."
                              placeholderTextColor={"#9CC6FF"}
                            />
                          </View>
                          {postFile ? (
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

                              {["image/jpeg", "image/png"].includes(
                                postFile.type,
                              ) ? (
                                <View
                                  styles={{ flex: 1, alignItems: "center" }}
                                >
                                  <Image
                                    source={{ uri: postFile.url }}
                                    style={styles.file}
                                    resizeMode="contain"
                                  />
                                </View>
                              ) : ["video/mp4", "video/quicktime"].includes(
                                postFile.type,
                              ) ? (
                                <VideoCard video={postFile.url} />
                              ) : null}
                            </View>
                          ) : null}
                        </View>
                        <View style={styles.containerActionsPost}>
                          <TouchableOpacity
                            style={{
                              flexDirection: "row",
                              alignItems: "center",
                            }}
                            onPress={() => ASPhotoOptions.current.show()}
                            disabled={!!postFile}
                          >
                            <Image
                              source={
                                !!postFile
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
                            style={{
                              flexDirection: "row",
                              alignItems: "center",
                            }}
                            onPress={() => selectVideo()}
                            disabled={!!postFile}
                          >
                            <Image
                              source={
                                !!postFile
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
                      </LinearGradient>

                      {postFile || text_post || sending ? (
                        <View style={styles.containerButton}>
                          <Button
                            buttonStyle={styles.sendButton}
                            disabledStyle={{ backgroundColor: "#982538" }}
                            titleStyle={Default.loginButtonBoldTitle}
                            onPress={sendPost}
                            title={"SEND"}
                            loading={sending}
                            disabled={sending}
                          />
                        </View>
                      ) : null}

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

                      <View style={styles.containerBody}>
                        {list_posts.length > 0 ? (
                          list_posts.map((obj, i) => {
                            return (
                              <PostCommunity
                                key={i}
                                post={obj}
                                navigation={props.navigation}
                                like={() => onPressLike(obj.id)}
                                save={() => onPressSave(obj.id)}
                                liked={obj.likes?.length > 0}
                                saved={obj.saved_post?.length > 0}
                                countLikes={
                                  obj.count_likes ? obj.count_likes : null
                                }
                                countComments={
                                  obj.count_comments ? obj.count_comments : null
                                }
                              />
                            );
                          })
                        ) : (
                          <View style={styles.containerNoPost}>
                            <Text
                              style={[styles.textInfo, { alignSelf: "center" }]}
                            >
                              No posts in this community.
                            </Text>
                          </View>
                        )}

                        {loading ? (
                          <View
                            style={{
                              flex: 1,
                              justifyContent: "center",
                              alignSelf: "center",
                              paddingBottom: 16,
                            }}
                          >
                            <ActivityIndicator size="small" color="#fff" />
                          </View>
                        ) : null}
                      </View>
                    </Fetching>
                  </>
                ) : option_bar === 2 ? (
                  <>
                    <Fetching isFetching={fetching_habits}>
                      <LinearGradient
                        colors={
                          list_habits.length === 0 && see_all
                            ? ["rgba(0, 37, 68, 0.15)", "rgba(0, 37, 68, 0.15)"]
                            : [
                              "rgba(156, 198, 255, 0.042)",
                              "rgba(0, 37, 68, 0.15)",
                            ]
                        }
                        locations={[0, 0.21]}
                        start={{ x: 0, y: 0.5 }}
                        end={{ x: 1, y: 0.5 }}
                        style={
                          see_all
                            ? [
                              styles.containerViewSection,
                              { paddingBottom: 32 },
                            ]
                            : [styles.containerList, { marginBottom: 0 }]
                        }
                      >
                        <View
                          style={
                            see_all ? { marginBottom: 16 } : { marginBottom: 0 }
                          }
                        >
                          <Text style={styles.sectionHeader}>Daily Habits</Text>

                          <View style={styles.containerSeeAll}>
                            <View style={styles.textSeeAll}>
                              {list_habits.length > 0 ? (
                                <TouchableOpacity
                                  onPress={pushToAddAllCommunityHabits}
                                >
                                  <Text style={styles.sectionHeader}>
                                    {"Add All"}
                                  </Text>
                                </TouchableOpacity>
                              ) : null}

                              <TouchableOpacity
                                onPress={() => setSeeAll(!see_all)}
                              >
                                <Text style={styles.sectionHeader}>
                                  {see_all ? "Dismiss" : "See All"}
                                </Text>
                              </TouchableOpacity>
                            </View>
                          </View>
                        </View>

                        {!see_all ? (
                          <>
                            {list_habits.length > 0 ? (
                              <FlatList
                                key={!see_all ? "h" : "v"}
                                contentContainerStyle={{ paddingRight: 16 }}
                                horizontal={!see_all}
                                data={list_habits}
                                keyExtractor={(item, index) => String(index)}
                                showsHorizontalScrollIndicator={false}
                                scrollEnabled={!see_all}
                                snapToAlignment={"start"}
                                scrollEventThrottle={16}
                                decelerationRate="fast"
                                numColumns={see_all ? 2 : 0}
                                renderItem={({ item }) => (
                                  <CardHabits
                                    habit={item?.habit}
                                    community={community}
                                    type={list_habits.title}
                                    navigation={props.navigation}
                                    communityHabit={item?.id}
                                    admin={
                                      (community.user_member?.cme_role ==
                                        "ADMIN" &&
                                        community.user_member?.cme_active) ||
                                        (community.user_member?.cme_role ==
                                          "MODERATOR" &&
                                          community.user_member?.cme_active)
                                        ? true
                                        : false
                                    }
                                  />
                                )}
                              />
                            ) : (
                              <View style={styles.textEmpty}>
                                <Text style={styles.textNoHabits}>
                                  We don't have any Habits yet
                                </Text>
                              </View>
                            )}
                          </>
                        ) : (
                          <View
                            style={[styles.containerHabits, { marginTop: -16 }]}
                          >
                            {list_habits.length > 0
                              ? list_habits.map((obj, i) => {
                                return (
                                  <View key={i}>
                                    <CardHabits
                                      habit={obj?.habit}
                                      community={community}
                                      type={obj.title}
                                      navigation={props.navigation}
                                      communityHabit={obj?.id}
                                      admin={
                                        (community.user_member?.cme_role ==
                                          "ADMIN" &&
                                          community.user_member
                                            ?.cme_active) ||
                                          (community.user_member?.cme_role ==
                                            "MODERATOR" &&
                                            community.user_member?.cme_active)
                                          ? true
                                          : false
                                      }
                                    />
                                  </View>
                                );
                              })
                              : null}
                          </View>
                        )}

                        {(community.user_member?.cme_role === "ADMIN" &&
                          community.user_member?.cme_active) ||
                          (community.user_member?.cme_role === "MODERATOR" &&
                            community.user_member?.cme_active) ? (
                          <View style={styles.containerButtonCreateNewHAbit}>
                            <Button
                              buttonStyle={styles.createNewHAbitButton}
                              titleStyle={Default.loginButtonBoldTitle}
                              onPress={addHabit}
                              title={"CREATE NEW HABIT"}
                            />
                          </View>
                        ) : null}
                      </LinearGradient>

                      {!see_all ? (
                        <View style={styles.containerBody}>
                          {list_posts_habits.length > 0 ? (
                            list_posts_habits.map((obj, i) => {
                              return (
                                <PostHabits
                                  key={i}
                                  post={obj}
                                  navigation={props.navigation}
                                  like={() => onPressLike(obj.id)}
                                  save={() => onPressSave(obj.id)}
                                  liked={obj.likes?.length > 0}
                                  saved={obj.saved_post?.length > 0}
                                  countLikes={
                                    obj.count_likes ? obj.count_likes : null
                                  }
                                  countComments={
                                    obj.count_comments
                                      ? obj.count_comments
                                      : null
                                  }
                                />
                              );
                            })
                          ) : (
                            <View style={styles.containerNoPost}>
                              <Text
                                style={[
                                  styles.textInfo,
                                  { alignSelf: "center" },
                                ]}
                              >
                                No posts habits in this community.
                              </Text>
                            </View>
                          )}
                        </View>
                      ) : null}
                    </Fetching>
                  </>
                ) : option_bar === 3 ? (
                  <>
                    <Fetching isFetching={fetching_community}>
                      <View style={styles.containerButton}>
                        {(community.user_member?.cme_role === "ADMIN" &&
                          community.user_member?.cme_active) ||
                          (community.user_member?.cme_role === "MODERATOR" &&
                            community.user_member?.cme_active) ? (
                          <>
                            <Button
                              buttonStyle={[
                                styles.joinButton,
                                { marginBottom: 8 },
                              ]}
                              titleStyle={Default.loginButtonBoldTitle}
                              onPress={onHandleManage}
                              title={"MANAGE COMMUNITY"}
                            />
                            <Button
                              buttonStyle={styles.leaveButton}
                              titleStyle={Default.loginButtonBoldTitle}
                              onPress={onHandleLeave}
                              title={"LEAVE COMMUNITY"}
                            />
                          </>
                        ) : (
                          <Button
                            buttonStyle={styles.leaveButton}
                            titleStyle={Default.loginButtonBoldTitle}
                            onPress={onHandleLeave}
                            title={"LEAVE COMMUNITY"}
                          />
                        )}
                      </View>

                      <View style={styles.containerBody}>
                        <LinearGradient
                          colors={[
                            "rgba(156, 198, 255, 0.042)",
                            "rgba(0, 37, 68, 0.15)",
                          ]}
                          start={{ x: 0, y: 0.5 }}
                          end={{ x: 1, y: 0.5 }}
                          style={styles.containerListAbout}
                        >
                          <View style={styles.infoCommunity}>
                            <Text style={styles.textTitleSection}>About</Text>
                            <Text style={styles.textInfo}>
                              {community.com_description}
                            </Text>
                          </View>
                          <View style={styles.infoCommunity}>
                            <View style={styles.containerInfo}>
                              <Image
                                source={require("../../../assets/icons/icon-privacy.png")}
                                style={styles.infoIcon}
                              />
                              <Text style={styles.textTitleSection}>
                                {community.com_private ? "Private" : "Public"}
                              </Text>
                            </View>
                            <Text style={styles.textInfo}>
                              {community.com_private
                                ? "Only members can see who is in the Community  and what is published in it. "
                                : "Anyone can see who is in the group and what is posted in it. "}
                            </Text>
                          </View>
                          <View style={styles.infoCommunity}>
                            <View style={styles.containerInfo}>
                              <Image
                                source={require("../../../assets/icons/eye.png")}
                                style={styles.infoIcon}
                              />
                              <Text style={styles.textTitleSection}>
                                Visible
                              </Text>
                            </View>
                            <Text style={styles.textInfo}>
                              {community.com_private
                                ? "Anyone can find the Community "
                                : "Anyone can find the Community "}
                            </Text>
                          </View>
                        </LinearGradient>

                        <LinearGradient
                          colors={[
                            "rgba(156, 198, 255, 0.042)",
                            "rgba(0, 37, 68, 0.15)",
                          ]}
                          start={{ x: 0, y: 0.5 }}
                          end={{ x: 1, y: 0.5 }}
                          style={styles.containerListAbout}
                        >
                          <View style={styles.infoCommunity}>
                            <Text style={styles.textTitleSection}>
                              Administrators' Rules
                            </Text>
                            {community.rules?.length > 0
                              ? community.rules.map((rul, i) => {
                                return (
                                  <View key={i} style={{ marginBottom: 12 }}>
                                    <Text
                                      style={[
                                        styles.textTitleSection,
                                        {
                                          marginTop: 8,
                                          marginLeft: 4,
                                          marginBottom: -1,
                                        },
                                      ]}
                                    >
                                      {i + 1}. {rul.cor_title}
                                    </Text>
                                    <Text style={styles.textInfo}>
                                      {rul.cor_description}
                                    </Text>
                                  </View>
                                );
                              })
                              : null}
                          </View>
                        </LinearGradient>

                        <LinearGradient
                          colors={[
                            "rgba(156, 198, 255, 0.042)",
                            "rgba(0, 37, 68, 0.15)",
                          ]}
                          start={{ x: 0, y: 0.5 }}
                          end={{ x: 1, y: 0.5 }}
                          style={styles.containerListAbout}
                        >
                          <View style={styles.infoCommunity}>
                            <Text style={styles.textTitleSection}>
                              Administrators and moderators
                            </Text>
                            <View style={styles.containerAdmins}>
                              {community.admins_moderators?.length > 0
                                ? community.admins_moderators.map((obj, i) => {
                                  return (
                                    <View
                                      key={i}
                                      style={{
                                        flexDirection: "row",
                                        marginRight: 16,
                                        marginBottom: 16,
                                      }}
                                    >
                                      {obj.user.image ? (
                                        <Image
                                          source={{
                                            uri: obj.user.image?.url,
                                          }}
                                          style={styles.adminsPhoto}
                                        />
                                      ) : (
                                        <Image
                                          source={require("../../../assets/images/no-profile.png")}
                                          style={styles.adminsPhoto}
                                        />
                                      )}
                                      <View
                                        style={{
                                          flexDirection: "column",
                                          justifyContent: "flex-start",
                                        }}
                                      >
                                        <Text style={styles.textUserName}>
                                          {obj.user.name.split(" ", 1)}
                                        </Text>
                                        <Text style={styles.textSubtitle}>
                                          {obj.cme_role}
                                        </Text>
                                      </View>
                                    </View>
                                  );
                                })
                                : null}
                            </View>
                            <View>
                              <Text style={styles.textInfo}>
                                {admins_info + moderators_info}
                              </Text>
                            </View>
                          </View>
                        </LinearGradient>

                        <LinearGradient
                          colors={[
                            "rgba(156, 198, 255, 0.042)",
                            "rgba(0, 37, 68, 0.15)",
                          ]}
                          start={{ x: 0, y: 0.5 }}
                          end={{ x: 1, y: 0.5 }}
                          style={styles.containerListAbout}
                        >
                          <View style={styles.infoCommunity}>
                            <Text style={styles.textTitleSection}>
                              Community Activities
                            </Text>
                            <View
                              style={{
                                flexDirection: "row",
                                alignItems: "center",
                                marginTop: 17,
                              }}
                            >
                              <Image
                                source={require("../../../assets/icons/icon-comment.png")}
                                style={styles.infoIcon}
                              />
                              <Text style={styles.textUserName}>
                                {community.post_count} new publications today
                              </Text>
                            </View>

                            <Text style={styles.textCountPosts}>
                              {community.last_month_post_count} publications in
                              the last month
                            </Text>

                            <View
                              style={{
                                flexDirection: "row",
                                alignItems: "center",
                                marginTop: 17,
                              }}
                            >
                              <Image
                                source={require("../../../assets/icons/users-white.png")}
                                style={styles.infoIcon}
                              />
                              <Text style={styles.textUserName}>
                                Created{" "}
                                {moment().diff(
                                  moment(community?.created_at).format(
                                    "YYYY-MM-DD",
                                  ),
                                  "months",
                                )}{" "}
                                months ago
                              </Text>
                            </View>
                          </View>
                        </LinearGradient>
                      </View>
                    </Fetching>
                  </>
                ) : null}
              </SafeAreaView>
            </View>
          </Fetching>
        </ScrollView>
      </KeyboardAwareScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: Dimensions.get("window").width,
  },
  containerBody: {
    flex: 1,
    alignItems: "flex-start",
    paddingBottom: 32,
  },
  containerHeaderImage: {
    height: 189,
    flex: 1,
    justifyContent: "flex-end",
    width: Dimensions.get("window").width,
    zIndex: 0,
    elevation: 0,
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
  containerTitle: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignSelf: "center",
    paddingVertical: 16,
    width: Dimensions.get("window").width - 32,
  },
  containerGradientSendPost: {
    marginBottom: 8,
    marginTop: 16,
    zIndex: 1,
    elevation: 1,
    width: Dimensions.get("window").width,
  },
  containerKeyboardSendPost: {
    width: Dimensions.get("window").width,
    height: 20,
  },
  containerList: {
    //height: 268,
    marginBottom: 8,
    paddingVertical: 16,
    zIndex: 1,
    elevation: 1,
  },
  containerNoPost: {
    flex: 1,
    marginTop: 16,
    alignSelf: "center",
    width: Dimensions.get("window").width - 32,
  },
  removeAttachment: {
    width: "100%",
    height: "100%",
    alignItems: "flex-start",
    resizeMode: "contain",
  },
  containerAdmins: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "flex-start",
    marginTop: 16,
    marginBottom: 13,
  },
  containerNavBar: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    width: Dimensions.get("window").width - 32,
    alignSelf: "center",
    alignItems: "center",
  },
  containerViewSection: {
    flex: 1,
    paddingTop: 16,
    zIndex: 1,
    elevation: 1,
  },
  textNoHabits: {
    fontSize: 12,
    lineHeight: 16,
    height: 16,
    fontWeight: "bold",
    color: Colors.text,
    marginLeft: 16,
  },
  containerSeeAll: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignSelf: "flex-end",
    marginLeft: 16,
    zIndex: 4,
    elevation: 4,
    position: "absolute",
  },
  containerSendPost: {
    flexDirection: "column",
    justifyContent: "flex-start",
    //paddingVertical: 3,
    alignItems: "flex-start",
    borderBottomColor: "#264261",
    borderBottomWidth: StyleSheet.hairlineWidth,
    width: Dimensions.get("window").width,
    marginBottom: 16,
  },
  sendButton: {
    height: 64,
    borderRadius: 4,
    backgroundColor: "#982538",
    width: Dimensions.get("window").width - 32,
  },
  textSeeAll: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignSelf: "flex-end",
    marginRight: 16,
  },
  joinButton: {
    height: 64,
    borderRadius: 4,
    backgroundColor: "#982538",
    width: Dimensions.get("window").width - 32,
  },
  textEmpty: {
    alignSelf: "flex-start",
    marginRight: 16,
    marginTop: 16,
  },
  leaveButton: {
    height: 64,
    borderRadius: 4,
    backgroundColor: "#004B7D",
    width: Dimensions.get("window").width - 32,
  },
  createNewHAbitButton: {
    height: 64,
    alignSelf: "center",
    borderRadius: 4,
    backgroundColor: "#982538",
    width: Dimensions.get("window").width - 48,
  },
  containerTextPost: {
    width: Dimensions.get("window").width,
    borderBottomColor: "#264261",
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingBottom: 16,
  },
  containerItemNavBar: {
    alignItems: "center",
    width: (Dimensions.get("window").width - 32) / 3,
    paddingBottom: 8,
  },
  containerHabits: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    //alignItems: 'center',
  },
  headerIcon: {
    width: 18,
    height: 18,
    marginRight: 3,
  },
  buttonPlay: {
    alignSelf: "center",
    width: 72,
    height: 72,
  },
  infoIcon: {
    width: 24,
    height: 24,
    marginRight: 8,
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
  adminsPhoto: {
    width: 38,
    height: 38,
    borderRadius: 32,
    marginRight: 12,
    //marginLeft: 16,
  },
  actionsIcons: {
    width: 24,
    height: 24,
    marginRight: 4,
    alignSelf: "center",
    left: 0,
  },
  backButton: {
    marginLeft: 25,
    marginTop: 32,
    width: 60,
    flexDirection: "row",
    justifyContent: "flex-start",
    top: 0,
    zIndex: 3,
    elevation: 3,
    position: "absolute",
  },
  typeCommunity: {
    marginLeft: 32,
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(48, 46, 80, 0.5)",
    width: Dimensions.get("window").width - 215,
    borderRadius: 4,
    padding: 9,
  },
  containerInfo: {
    flexDirection: "row",
    alignItems: "center",
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
  sectionHeader: {
    fontWeight: "700",
    fontSize: 16,
    lineHeight: 16,
    color: "#FCFCFC",
    marginLeft: 16,
    zIndex: 2,
    elevation: 2,
  },
  inputPost: {
    flex: 1,
    fontSize: 16,
    color: "white",
    lineHeight: 16,
    backgroundColor: "transparent",
    alignSelf: "center",
  },
  shareButton: {
    height: 40,
    borderRadius: 4,
    padding: 8,
    backgroundColor: "rgba(153, 37, 56, 1)",
    width: 163,
  },
  containerHeader: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 18,
    marginTop: 16,
  },
  infoCommunity: {
    marginBottom: 19,
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
  textTitleSection: {
    fontWeight: "700",
    fontSize: 16,
    lineHeight: 16,
    color: "#FCFCFC",
  },
  textPost: {
    fontWeight: "400",
    fontSize: 14,
    lineHeight: 21,
    color: "#FFFFFF",
    marginHorizontal: 16,
  },
  textCounter: {
    fontWeight: "500",
    fontSize: 12,
    lineHeight: 18,
    color: "#FFFFFF",
  },
  textTitle: {
    fontWeight: "700",
    fontSize: 20,
    lineHeight: 30,
    color: "#FCFCFC",
    width: Dimensions.get("window").width - 78,
  },
  typeCommunityText: {
    fontWeight: "600",
    fontSize: 13,
    lineHeight: 16,
    color: "#FCFCFC",
  },
  textSubtitle: {
    fontWeight: "400",
    fontSize: 13,
    lineHeight: 18,
    color: "#FCFCFC",
  },
  communityImage: {
    width: "100%",
    height: "100%",
    position: "absolute",
  },
  containerListAbout: {
    marginBottom: 8,
    paddingHorizontal: 16,
    paddingTop: 16,
    zIndex: 1,
    elevation: 1,
    width: Dimensions.get("window").width,
  },
  containerButton: {
    justifyContent: "flex-end",
    alignItems: "center",
    marginBottom: 16,
    marginTop: 16,
  },
  containerButtonCreateNewHAbit: {
    alignItems: "center",
    marginBottom: 16,
    marginTop: 61,
    width: Dimensions.get("window").width,
  },
  textInfo: {
    fontWeight: "400",
    fontSize: 14,
    lineHeight: 19,
    color: "#FFFFFF",
    marginTop: 8,
  },
  containerMembers: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: 16,
    marginBottom: 16,
    height: 40,
  },
  infoMembers: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: Dimensions.get("window").width - 211,
  },
  containerAdmins: {
    flex: 1,
    flexDirection: "row",
    //justifyContent: 'flex-start',
    alignItems: "flex-start",
    flexWrap: "wrap",
    marginTop: 16,
  },
  textCountPosts: {
    flex: 1,
    fontSize: 14,
    fontWeight: "400",
    lineHeight: 21,
    color: Colors.text,
    marginTop: 9,
  },
  ellipseIcon: {
    width: 4,
    height: 4,
    marginLeft: 14,
    marginRight: 8,
    alignSelf: "center",
    left: 0,
  },
  cogIcon: {
    width: 24,
    height: 24,
    alignSelf: "center",
    left: 0,
  },
  imageModalHeader: {
    resizeMode: "cover",
    width: 24,
    height: 24,
    borderRadius: 62,
    //marginRight: 12,
    //marginLeft: 16,
  },
  typeCommunity: {
    marginLeft: 32,
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(48, 46, 80, 0.5)",
    width: Dimensions.get("window").width - 215,
    borderRadius: 4,
    padding: 9,
  },
  containerInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  inputSearch: {
    flex: 1,
    fontSize: 16,
    lineHeight: 16,
    backgroundColor: "#002544",
    borderRadius: 8,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  shareButton: {
    height: 40,
    borderRadius: 4,
    padding: 8,
    backgroundColor: "rgba(153, 37, 56, 1)",
    width: 163,
  },
  containerHeader: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 18,
    marginTop: 16,
  },
  infoCommunity: {
    marginBottom: 17,
  },
  textTitleSection: {
    fontWeight: "700",
    fontSize: 16,
    lineHeight: 16,
    color: "#FCFCFC",
  },
  textInfo: {
    fontWeight: "400",
    fontSize: 14,
    lineHeight: 19,
    color: "#FFFFFF",
    marginTop: 8,
  },
  textInfoModal: {
    fontWeight: "400",
    fontSize: 14,
    lineHeight: 21,
    color: "#FFFFFF",
  },
  textTitle: {
    fontWeight: "700",
    fontSize: 20,
    lineHeight: 30,
    color: "#FCFCFC",
    width: Dimensions.get("window").width - 78,
  },
  typeCommunityText: {
    fontWeight: "600",
    fontSize: 13,
    lineHeight: 16,
    color: "#FCFCFC",
  },
  communityImage: {
    width: "100%",
    height: "100%",
    position: "absolute",
  },
  file: {
    alignSelf: "center",
    width: Dimensions.get("window").width,
    height: 230,
  },
});

export default FeedCommunity;
