import React, { useState, useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  Text,
  Image,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Pressable,
  FlatList,
  Platform,
} from "react-native";
import Default from "../../../assets/styles/Default";
import Colors from "../../../assets/styles/Colors";
import Fetching from "../../components/Fetching";
import {
  getTimelineAllPosts,
  getTimelineMyPosts,
  randomHabits,
  listRandomHabits,
} from "../../store/ducks/post";
import { LinearGradient } from "expo-linear-gradient";
import SelectDropdown from "react-native-select-dropdown";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import Header from "../../components/Header";
import CardHabits from "../../components/community/CardHabits";
import { BlurView } from "expo-blur";
import CardPost from "../../components/CardPost";

const Timeline = (props) => {
  const [fetching, setFetching] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [see_all, setSeeAll] = useState(false);
  const [loading, setLoading] = useState(false);
  const [load_more, setLoadMore] = useState(true);
  const [press_comment, setPressComment] = useState(false);
  const [my_post, setMyPost] = useState(false);
  const [habits, setHabits] = useState("");
  const [list_habits, setListHabits] = useState("");
  const [length_post, setLengthPost] = useState(0);
  const [timelinePosts, setTimelinePosts] = useState([]);
  const [page, setPage] = useState(0);
  const [page_habits, setPageHabits] = useState(0);
  const [loading_habits, setLoadingHabits] = useState(false);
  const [load_more_habits, setLoadMoreHabits] = useState(true);
  const [blurActive, setBlurActive] = useState(false);

  useEffect(() => {
    fetchPosts(true, false, false);
    setSeeAll(false);
  }, []);

  const fetchPosts = async (is_fetching, is_refresh, force) => {
    setPressComment(false);

    if (force || is_fetching) {
      is_refresh ? setRefreshing(true) : is_fetching ? setFetching(true) : null;

      await getTimelineAllPosts({ rows: 10, page: 0 })
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
              setTimelinePosts(res.data.data);
              setLengthPost(res.data.data.length);

              if (res.data.current_page === res.data.last_page) {
                setLoadMore(false);
                setPage(0);
              } else {
                setLoadMore(true);
              }
            }
          }
        });

      await randomHabits()
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
              setHabits(res.data);
            }

            setFetching(false);
          }
        })
        .finally(() => {
          setRefreshing(false);
          setFetching(false);
        });
    }
  };

  const fetchListHabits = () => {
    setFetching(true);
    let request = {
      page: 0,
    };

    listRandomHabits(request)
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
            setListHabits(res.data?.data);

            if (res.data.current_page === res.data.last_page) {
              setLoadMoreHabits(false);
              setPageHabits(0);
            } else {
              setLoadMoreHabits(true);
            }
          }
        }
      })
      .finally(() => {
        setFetching(false);
      });
  };

  const onSeeAll = (value) => {
    setSeeAll(value);
    if (value) {
      fetchListHabits();
    } else {
      setLoadMoreHabits(false);
      setPageHabits(0);
    }
  };

  const loadMoreHabits = () => {
    let habits_aux = [];
    let number_page = page_habits + 1;

    setPageHabits(number_page);
    setLoadingHabits(true);

    let request = {
      page: number_page,
    };

    listRandomHabits(request)
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
            habits_aux = [...list_habits];
            habits_aux = habits_aux.concat(res.data?.data);

            setListHabits(habits_aux);

            if (res.data.current_page === res.data.last_page) {
              setLoadMoreHabits(false);
              setPageHabits(0);
            }
          }

          setLoadingHabits(false);
        }
      });
  };

  const fetchMyPosts = (is_fetching, is_refresh, force) => {
    setPressComment(false);

    if (force || is_fetching) {
      is_refresh ? setRefreshing(true) : is_fetching ? setFetching(true) : null;

      let request = { page: 0 };

      getTimelineMyPosts(request)
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
              setTimelinePosts(res.data.data);
              setLengthPost(res.data.data.length);

              if (res.data.current_page === res.data.last_page) {
                setLoadMore(false);
                setPage(0);
              } else {
                setLoadMore(true);
              }
            }

            setRefreshing(false);
            setFetching(false);
          }
        });
    }
  };

  const loadMore = () => {
    let post_aux = [];
    let number_page = page + 1;

    setPage(number_page);
    setLoading(true);

    let request = {
      page: number_page,
    };

    if (my_post) {
      getTimelineMyPosts(request)
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
              post_aux = timelinePosts;
              post_aux = post_aux.concat(res.data.data);

              setTimelinePosts(post_aux);
              setLengthPost(post_aux.length);

              if (res.data.current_page === res.data.last_page) {
                setLoadMore(false);
                setPage(0);
              }
            }

            setLoading(false);
          }
        });
    } else {
      getTimelineAllPosts(request)
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
              post_aux = timelinePosts;
              post_aux = post_aux.concat(res.data.data);

              setTimelinePosts(post_aux);
              setLengthPost(post_aux.length);

              if (res.data.current_page === res.data.last_page) {
                setLoadMore(false);
                setPage(0);
              } else {
                setLoadMore(true);
              }
            }

            setLoading(false);
          }
        });
    }
  };

  const fetchSelectedPost = (index) => {
    if (index === 0) {
      setMyPost(false);
      fetchPosts(true, false, false);
    } else {
      setMyPost(true);
      fetchMyPosts(true, false, false);
    }
  };

  const isCloseToBottom = ({
    layoutMeasurement,
    contentOffset,
    contentSize,
  }) => {
    const paddingToBottom = 10;
    return (
      layoutMeasurement.height + contentOffset.y >=
      contentSize.height - paddingToBottom
    );
  };

  const onLikePostSuccess = (postIndex) => {
    const timelineAllPostsCLone = [...timelinePosts];

    timelineAllPostsCLone[postIndex].likeFromUser =
      !timelineAllPostsCLone[postIndex].likeFromUser;

    if (timelineAllPostsCLone[postIndex].likeFromUser) {
      timelineAllPostsCLone[postIndex].countLikes++;
    } else {
      timelineAllPostsCLone[postIndex].countLikes--;
    }

    setTimelinePosts(timelineAllPostsCLone);
  };

  const onSavePostSuccess = (postIndex) => {
    const timelineAllPostsCLone = [...timelinePosts];

    timelineAllPostsCLone[postIndex].saveFromUser =
      !timelineAllPostsCLone[postIndex].saveFromUser;

    setTimelinePosts(timelineAllPostsCLone);
  };

  const onDeletePostSuccess = (postIndex) => {
    const timelineAllPostsCLone = [...timelinePosts].filter(
      (_item, postIndexFromItem) => postIndexFromItem !== postIndex,
    );

    setTimelinePosts(timelineAllPostsCLone);
    setBlurActive(false);
  };

  return (
    <View style={Default.container}>
      <KeyboardAwareScrollView
        extraHeight={80}
        style={{ backgroundColor: Colors.background }}
        contentContainerStyle={{ flexGrow: 1 }}
        enableOnAndroid={true}
        enableAutomaticScroll={Platform.OS === "ios"}
        scrollEnabled={press_comment ? false : true}
        onScroll={({ nativeEvent }) => {
          if (
            see_all &&
            list_habits?.length > 0 &&
            load_more_habits &&
            isCloseToBottom(nativeEvent)
          ) {
            loadMoreHabits();
          }
        }}
        refreshControl={
          <RefreshControl
            colors={["#000"]}
            tintColor="#fff"
            onRefresh={() =>
              my_post
                ? fetchMyPosts(false, true, true)
                : fetchPosts(false, true, true)
            }
            refreshing={refreshing}
          />
        }
      >
        <Fetching isFetching={fetching}>
          <Header navigation={props.navigation} showBackgroundImage />
          {!see_all ? (
            <View style={styles.containerOptions}>
              <SelectDropdown
                data={["View all posts", "View my posts"]}
                defaultValueByIndex={1}
                renderCustomizedButtonChild={() => {
                  return (
                    <Image
                      source={require("../../../assets/icons/cog.png")}
                      style={{ width: 25, height: 25 }}
                    />
                  );
                }}
                buttonStyle={styles.buttonDropdown}
                buttonTextStyle={styles.buttonTextDropdown}
                dropdownStyle={styles.dropdown}
                rowStyle={styles.row}
                rowTextStyle={styles.rowText}
                onSelect={(selectedItem, index) => {
                  fetchSelectedPost(index);
                }}
                buttonTextAfterSelection={(selectedItem, index) => {
                  return selectedItem;
                }}
                rowTextForSelection={(item, index) => {
                  return item;
                }}
              />
            </View>
          ) : null}

          <View style={styles.container}>
            <View style={styles.containerHeader}>
              <View style={styles.containerImage}>
                <Text style={styles.textName}>
                  {my_post && !see_all
                    ? "My Update"
                    : see_all
                      ? "Habits"
                      : "Timeline"}
                </Text>
              </View>
            </View>

            <LinearGradient
              colors={["rgba(156, 198, 255, 0.042)", "rgba(0, 37, 68, 0.15)"]}
              locations={[0, 0.21]}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={
                see_all
                  ? [styles.containerViewSection, { paddingBottom: 32 }]
                  : [styles.containerList, { marginBottom: 0 }]
              }
            >
              {!see_all ? (
                <>
                  <View>
                    <Text style={styles.sectionHeader}>Suggested Habits</Text>
                    <TouchableOpacity
                      style={styles.containerSeeAll}
                      onPress={() => onSeeAll(true)}
                    >
                      <View style={styles.textSeeAll}>
                        <Text style={styles.sectionHeader}>
                          {see_all ? "Dismiss" : "See All"}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  </View>
                  {habits.length > 0 ? (
                    <FlatList
                      key={!see_all ? "h" : "v"}
                      contentContainerStyle={{ paddingRight: 16 }}
                      horizontal={!see_all}
                      data={habits}
                      keyExtractor={(item, index) => String(index)}
                      showsHorizontalScrollIndicator={false}
                      scrollEnabled={!see_all}
                      snapToAlignment={"start"}
                      scrollEventThrottle={16}
                      decelerationRate="fast"
                      numColumns={see_all ? 2 : 0}
                      renderItem={({ item }) => (
                        <CardHabits
                          habit={item}
                          type={item?.category?.hac_name}
                          navigation={props.navigation}
                          communityHabit={item?.id}
                          admin={false}
                          timeline={true}
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
                <>
                  <View>
                    <Text style={styles.sectionHeader}>Suggested Habits</Text>
                    <TouchableOpacity
                      style={styles.containerSeeAll}
                      onPress={() => onSeeAll(false)}
                    >
                      <View style={styles.textSeeAll}>
                        <Text style={styles.sectionHeader}>
                          {see_all ? "Dismiss" : "See All"}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  </View>
                  <View style={styles.containerHabits}>
                    {list_habits?.length > 0
                      ? list_habits?.map((obj, i) => {
                          return (
                            <View key={i}>
                              <CardHabits
                                habit={obj}
                                type={obj?.category?.hac_name}
                                navigation={props.navigation}
                                communityHabit={obj?.id}
                                admin={false}
                                timeline={true}
                              />
                            </View>
                          );
                        })
                      : null}
                  </View>
                  {loading_habits ? (
                    <View
                      style={{
                        flex: 1,
                        justifyContent: "center",
                        marginBottom: 40,
                        marginTop: 8,
                      }}
                    >
                      <ActivityIndicator size="small" color="#fff" />
                    </View>
                  ) : null}
                </>
              )}
            </LinearGradient>

            {!see_all ? (
              <View
                style={[
                  styles.containerSection,
                  { marginBottom: 24, marginTop: 16 },
                ]}
              >
                <View style={styles.containerTitle}>
                  <Text style={styles.textTitle}>{`Updates ${
                    my_post ? "- My posts" : "- All"
                  }`}</Text>
                </View>

                {timelinePosts.length > 0 ? (
                  timelinePosts.map((timelinePost, index) => {
                    return (
                      <View
                        key={`timeline-post-${timelinePost.id}-${
                          timelinePost.community ? "community" : "post"
                        }-${index}`}
                        style={{ marginTop: index === 0 ? 0 : 16 }}
                      >
                        <CardPost
                          navigation={props.navigation}
                          postId={timelinePost.id}
                          postUser={{
                            id: timelinePost.user?.id ?? null,
                            name: timelinePost.user?.name ?? null,
                            imageUrl: timelinePost.user?.image?.url ?? null,
                          }}
                          postFile={timelinePost.file}
                          length_post={length_post}
                          createdAt={timelinePost.created_at}
                          postText={timelinePost.postText}
                          postType={timelinePost.postType}
                          community={
                            timelinePost.community
                              ? {
                                  id: timelinePost.community?.id,
                                  name: timelinePost.community?.com_name,
                                  imageUrl: timelinePost.community?.image?.url,
                                  community_member:
                                    timelinePost.community?.community_member,
                                }
                              : null
                          }
                          actions={{
                            likeFromUser: timelinePost.likeFromUser,
                            countLikes: timelinePost.countLikes,
                            onLikePostSuccess: (postId) =>
                              onLikePostSuccess(index),

                            countComments: timelinePost.countComments,

                            saveFromUser: timelinePost.saveFromUser,
                            onSavePostSuccess: (postId) =>
                              onSavePostSuccess(index),

                            onDeletePostSuccess: (postId) =>
                              onDeletePostSuccess(index),
                          }}
                          setBlurActive={setBlurActive}
                        />
                      </View>
                    );
                  })
                ) : (
                  <Text style={styles.textNotConnection}>
                    No posts to show at the moment
                  </Text>
                )}

                {loading ? (
                  <View
                    style={{
                      flex: 1,
                      justifyContent: "center",
                      marginBottom: 40,
                      marginTop: 16,
                    }}
                  >
                    <ActivityIndicator size="small" color="#fff" />
                  </View>
                ) : load_more && timelinePosts.length > 0 ? (
                  <TouchableOpacity
                    style={styles.buttonLoadMore}
                    onPress={() => loadMore()}
                  >
                    <Text style={styles.titleLoadMore}>Load More</Text>
                  </TouchableOpacity>
                ) : null}

                {press_comment ? (
                  <Pressable
                    onPress={() => setPressComment(false)}
                    style={[
                      styles.containerShadow,
                      {
                        width:
                          length_post <= 15
                            ? Dimensions.get("window").width * 5
                            : Dimensions.get("window").width *
                              (length_post / 2),
                        height:
                          length_post <= 15
                            ? Dimensions.get("window").height * 5
                            : Dimensions.get("window").height *
                              (length_post / 3),
                        top:
                          length_post < 15
                            ? -length_post * 56
                            : -length_post * 20,
                      },
                    ]}
                  ></Pressable>
                ) : null}
              </View>
            ) : null}
          </View>
        </Fetching>
      </KeyboardAwareScrollView>

      {blurActive ? (
        <>
          <BlurView style={styles.containerBlur} tint="dark" intensity={20} />
          <View style={styles.containerShadow}></View>
        </>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    //paddingTop: 58,
    width: Dimensions.get("window").width,
    paddingHorizontal: 24,
    zIndex: 1,
    elevation: 1,
  },
  containerShadow: {
    backgroundColor: "rgba(0,0,0,0.6)",
    zIndex: 1,
    elevation: 1,
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  },
  containerBlur: {
    zIndex: 1,
    elevation: 1,
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    marginTop: -3,
  },
  containerOpacity: {
    backgroundColor: Colors.primary,
    shadowColor: "#000",
    shadowOffset: { width: 100, height: 10 },
    shadowOpacity: 0.9,
    shadowRadius: 12,
  },
  containerSection: {
    marginBottom: 40,
  },
  containerViewSection: {
    flex: 1,
    paddingTop: 16,
    zIndex: 1,
    elevation: 1,
    width: Dimensions.get("window").width,
    alignSelf: "center",
    backgroundColor: Colors.primary,
  },
  containerList: {
    alignSelf: "center",
    backgroundColor: Colors.primary,
    marginBottom: 8,
    paddingVertical: 16,
    zIndex: 1,
    elevation: 1,
    width: Dimensions.get("window").width,
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
  containerSeeAll: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignSelf: "flex-end",
    marginLeft: 16,
    zIndex: 4,
    elevation: 4,
    position: "absolute",
  },
  textSeeAll: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignSelf: "flex-end",
    marginRight: 16,
  },
  textEmpty: {
    alignSelf: "flex-start",
    marginRight: 16,
    marginTop: 16,
  },
  textNoHabits: {
    fontSize: 12,
    lineHeight: 16,
    height: 16,
    fontWeight: "bold",
    color: Colors.text,
    marginLeft: 16,
  },
  containerHabits: {
    //flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    //alignItems: 'center',
  },
  containerOptions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignSelf: "flex-end",
    marginTop: 16,
    zIndex: 100,
    elevation: 100,
    position: "absolute",
  },
  containerImage: {
    flexDirection: "row",
    justifyContent: "center",
  },
  containerGroup: {
    flex: 1,
    flexDirection: "row",
    marginBottom: 8,
    justifyContent: "space-between",
    alignItems: "center",
  },
  containerPost: {
    flex: 1,
    width: Dimensions.get("window").width - 32,
    backgroundColor: "rgba(156, 198, 255, 0.042)",
    borderRadius: 8,
    paddingHorizontal: 16,
  },
  containerDetails: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#264261",
    width: Dimensions.get("window").width - 32,
    paddingHorizontal: 16,
    paddingBottom: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignSelf: "center",
    alignItems: "center",
    flexWrap: "wrap",
  },
  containerActions: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  textSubtitle: {
    fontSize: 14,
    lineHeight: 19,
    fontWeight: "400",
    color: Colors.text,
  },
  containerItemPost: {
    flex: 1,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#264261",
    width: Dimensions.get("window").width - 32,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 16,
    marginBottom: 20,
    zIndex: 3,
  },
  textUserName: {
    flex: 1,
    fontSize: 16,
    fontWeight: "700",
    lineHeight: 16,
    color: Colors.text,
  },
  textPost: {
    justifyContent: "flex-start",
    fontSize: 16,
    fontWeight: "700",
    lineHeight: 16,
    color: Colors.text,
    width: "100%",
    //flexWrap: 'wrap',
    paddingRight: 8,
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
  },
  textPostActions: {
    justifyContent: "flex-start",
    fontSize: 16,
    fontWeight: "400",
    lineHeight: 16,
    color: Colors.text,
    marginLeft: 6,
    fontSize: 12,
  },
  textName: {
    fontSize: 24,
    color: Colors.text,
    alignSelf: "center",
    lineHeight: 32,
  },
  userPhoto: {
    width: 38,
    height: 38,
    borderRadius: 32,
    marginRight: 8,
  },
  backButtonStyle: {
    width: 50,
    height: 50,
    marginLeft: 12,
    marginRight: -10,
    marginBottom: -42,
  },
  buttonActions: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingRight: 100,
    justifyContent: "space-between",
  },
  image: {
    alignSelf: "center",
    height: 121,
    marginLeft: 4,
    marginBottom: 0,
  },
  containerHeader: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
    marginBottom: 20,
    marginTop: 9,
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
    paddingBottom: 16,
    marginBottom: 16,
  },
  imageMedal: {
    width: 24,
    height: 24,
  },
  buttonLoadMore: {
    height: 56,
    borderRadius: 30,
    backgroundColor: "transparent",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#9CC6FF",
    width: Dimensions.get("window").width - 44,
    justifyContent: "center",
    alignSelf: "center",
    alignItems: "center",
    marginTop: 24,
    marginBottom: 16,
  },
  titleLoadMore: {
    fontSize: 16,
    lineHeight: 21,
    color: Colors.primary4,
    alignSelf: "center",
  },
  containerTextInput: {
    flex: 1,
    width: Dimensions.get("window").width - 44,
    height: 40,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 8,
    backgroundColor: Colors.primary7,
    marginTop: 12,
    paddingVertical: 28,
    paddingLeft: 16,
  },
  containerCommentSended: {
    width: Dimensions.get("window").width - 44,
    height: 40,
    flexDirection: "column",
    alignItems: "flex-start",
    borderRadius: 8,
    justifyContent: "flex-start",
    marginTop: 8,
    marginLeft: 2,
  },
  containerInputItems: {
    width: Dimensions.get("window").width - 44,
    flexDirection: "row",
  },
  textInputStyle: {
    width: Dimensions.get("window").width - 170,
    fontSize: 16,
    color: Colors.text,
  },
  textNotConnection: {
    fontSize: 10,
    lineHeight: 16,
    width: 128,
    height: 16,
    fontWeight: "bold",
    color: Colors.primary4,
    width: Dimensions.get("window").width - 44,
  },
  rowText: {
    textAlign: "left",
    color: Colors.text,
    fontSize: 12,
    lineHeight: 16,
  },
  row: {
    textAlign: "left",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.primary4,

    marginHorizontal: 8,
  },
  dropdown: {
    borderRadius: 4,
    width: 129,
    marginTop: 2,
    backgroundColor: "rgba(29, 67, 105, 1)",
    marginLeft: -98,
    borderBottomColor: Colors.primary6,
  },
  buttonDropdown: {
    backgroundColor: "transparent",
    borderRadius: 4,
    width: 60,
    height: 32,
    marginLeft: -12,
  },
  buttonTextDropdown: {
    marginLeft: -2,
    fontSize: 16,
    color: Colors.text,
    textAlign: "left",
  },
  containerBottomSheet: {
    alignItems: "center",
    backgroundColor: Colors.primary,
  },
  containerTextBottomSheet: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  warningIconStyle: {
    width: 80,
    height: 80,
  },
  textDelete: {
    marginTop: 26,
    fontSize: 14,
    color: Colors.text,
  },
  buttonContainer: {
    marginBottom: 30,
    alignItems: "center",
  },
  createAccountText: {
    fontSize: 14,
    color: "white",
  },
});

export default Timeline;
