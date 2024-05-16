import React, { useState, useEffect, useRef } from "react";
import {
  View,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
  Text,
  Image,
  Alert,
  RefreshControl,
  TouchableOpacity,
  Keyboard,
} from "react-native";
import Default from "../../../assets/styles/Default";
import Colors from "../../../assets/styles/Colors";
import Fetching from "../../components/Fetching";
import Header from "../../components/Header";
import Icon from "react-native-vector-icons/FontAwesome5";
import { getMembers } from "../../store/ducks/community";
import { useSelector } from "react-redux";
import { LinearGradient } from "expo-linear-gradient";
import debounce from "lodash.debounce";
import { TextInput } from "react-native-paper";

const ViewMembers = (props) => {
  const user = useSelector(({ user }) => user);

  const [fetching, setFetching] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [community, setCommunity] = useState(null);
  const [page, setPage] = useState(0);
  const [load_more, setLoadMore] = useState(true);
  const [list_members, setListMembers] = useState([]);
  const [list_admins_moderators, setListAdminsModerators] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    setCommunity(props.route?.params?.community?.id);
    fetchMembers(false, true, false);
  }, [props]);

  const fetchMembers = async (is_refreshing, is_fetching, force) => {
    if (search === "" || force) {
      is_fetching
        ? setFetching(true)
        : is_refreshing
          ? setRefreshing(true)
          : null;

      let request = {
        page: 0,
        cme_id_community: props.route?.params?.community?.id,
      };

      getMembers(request)
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
              setListMembers(res.data?.members?.data);
              setListAdminsModerators(res.data?.admins_moderators);
              setPage(0);
            }

            if (
              res.data?.members?.current_page === res.data?.members?.last_page
            ) {
              setLoadMore(false);
              setPage(0);
            } else {
              setLoadMore(true);
            }
          }
        })
        .finally(() => {
          setFetching(false);
          setRefreshing(false);
        });
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
    let members_aux = [];
    let number_page = page + 1;

    setPage(number_page);
    setLoading(true);

    let request = {
      page: number_page,
      cme_id_community: community,
    };

    getMembers(request)
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
            members_aux = [...list_members];
            members_aux = members_aux.concat(res.data?.members?.data);

            setListMembers(members_aux);

            if (
              res.data?.members?.current_page === res.data?.members?.last_page
            ) {
              setLoadMore(false);
              setPage(0);
            }
          }

          setLoading(false);
        }
      });
  };

  const searchUsersByTermo = (search) => {
    if (search === "") {
      fetchMembers(false, false, true);
    } else {
      let request = {
        page: 0,
        cme_id_community: props.route?.params?.community?.id,
        filter: search,
      };

      getMembers(request)
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
              setListMembers(res.data?.members?.data);
              setListAdminsModerators(res.data?.admins_moderators);
              setPage(0);
            }

            if (
              res.data?.members?.current_page === res.data?.members?.last_page
            ) {
              setLoadMore(false);
              setPage(0);
            } else {
              setLoadMore(true);
            }
          }
        })
        .finally(() => {
          setFetching(false);
          setRefreshing(false);
        });
    }
  };

  const searchUsers = debounce((filter) => {
    searchUsersByTermo(filter);
  }, 700);

  const onChangeSearchText = (filter) => {
    setSearch(filter);
    searchUsers(filter);
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

  return (
    <View style={Default.container}>
      <ScrollView
        onScroll={({ nativeEvent }) => {
          if (
            load_more &&
            list_members.length > 0 &&
            isCloseToBottom(nativeEvent)
          ) {
            loadMore();
          }
        }}
        contentContainerStyle={{ flexGrow: 1 }}
        refreshControl={
          <RefreshControl
            colors={["#fff"]}
            tintColor="#fff"
            onRefresh={() => fetchMembers(true, false, true)}
            refreshing={refreshing}
          />
        }
      >
        <Fetching isFetching={fetching}>
          <Header navigation={props.navigation} showBackgroundImage />
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

            <View style={styles.titleInvite}>
              <Text
                style={styles.textUserHeaderName}
                type="font-awesome"
                name="chevron-left"
                size={14}
                color={Colors.text}
              >
                Members
              </Text>
            </View>
          </View>

          <View style={styles.containerSearch}>
            <TextInput
              keyboardAppearance="dark"
              onSubmitEditing={Keyboard.dismiss}
              returnKeyType="done"
              outlineColor="transparent"
              placeholder="Search"
              selectionColor="#9CC6FF"
              underlineColor="white"
              mode="outlined"
              style={styles.inputSearch}
              left={<TextInput.Icon color={"white"} name="magnify" />}
              theme={inputSearchTheme}
              onChangeText={(e) => onChangeSearchText(e)}
              blurOnSubmit={false}
            />
          </View>

          <View style={styles.container}>
            <View style={styles.innerContainer}>
              <View style={styles.containerConnection}>
                <Text style={styles.textConnection}>Admins and Moderatos</Text>
              </View>

              {list_admins_moderators.length > 0 ? (
                list_admins_moderators.map((obj, i) => {
                  return (
                    <View key={i} style={styles.containerGroup}>
                      <LinearGradient
                        colors={[
                          "rgba(156, 198, 255, 0.042)",
                          "rgba(0, 37, 68, 0.15)",
                        ]}
                        start={{ x: 0, y: 0.5 }}
                        end={{ x: 1, y: 0.5 }}
                        style={styles.containerUser}
                      >
                        <TouchableOpacity
                          style={styles.containerItemConnection}
                          onPress={() => viewUser(obj.user)}
                        >
                          {obj.user?.image ? (
                            <Image
                              source={{ uri: obj.user?.image?.url }}
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
                              {obj.user?.name}
                            </Text>
                            <Text style={styles.textSubtitle}>
                              {obj.cme_role === "ADMIN" ? "Admin" : "Moderator"}
                            </Text>
                          </View>
                          <View>
                            <Icon
                              type="font-awesome"
                              name="chevron-right"
                              size={16}
                              color={"#FFFFFF"}
                            />
                          </View>
                        </TouchableOpacity>
                      </LinearGradient>
                    </View>
                  );
                })
              ) : (
                <View style={styles.containerNotConnections}>
                  <Text style={styles.textNoPeopleToConnect}>
                    No admins and moderators with that name.
                  </Text>
                </View>
              )}
            </View>
          </View>

          {list_members.length > 0 ? (
            <View style={styles.container}>
              <View style={styles.innerContainer}>
                <View style={styles.containerConnection}>
                  <Text style={styles.textConnection}>Friends</Text>
                </View>
                {list_members.map((obj, i) => {
                  return (
                    <View key={i} style={styles.containerGroup}>
                      <LinearGradient
                        colors={[
                          "rgba(156, 198, 255, 0.042)",
                          "rgba(0, 37, 68, 0.15)",
                        ]}
                        start={{ x: 0, y: 0.5 }}
                        end={{ x: 1, y: 0.5 }}
                        style={[styles.containerUser]}
                      >
                        <TouchableOpacity
                          style={styles.containerItemConnection}
                          onPress={() => viewUser(obj.user)}
                        >
                          {obj.user?.image ? (
                            <Image
                              source={{ uri: obj.user?.image?.url }}
                              style={styles.userPhoto}
                            />
                          ) : (
                            <Image
                              source={require("../../../assets/images/no-profile.png")}
                              style={styles.userPhoto}
                            />
                          )}
                          <Text style={styles.textUserName}>
                            {obj.user?.name}
                          </Text>
                          <View>
                            <Icon
                              type="font-awesome"
                              name="chevron-right"
                              size={16}
                              color={"#FFFFFF"}
                            />
                          </View>
                        </TouchableOpacity>
                      </LinearGradient>
                    </View>
                  );
                })}

                {loading ? (
                  <View
                    style={{
                      flex: 1,
                      justifyContent: "center",
                      marginBottom: 16,
                    }}
                  >
                    <ActivityIndicator size="small" color="#fff" />
                  </View>
                ) : null}
              </View>
            </View>
          ) : null}
        </Fetching>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "column",
    flex: 0,
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
    flexDirection: "row",
    width: Dimensions.get("window").width - 48,
    marginTop: 0,
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
    marginBottom: 32,
    alignItems: "center",
  },
  containerSearch: {
    flexDirection: "row",
    width: Dimensions.get("window").width - 32,
    alignSelf: "center",
    marginBottom: 16,
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
  buttonRequest: {
    minHeight: 32,
    borderRadius: 8,
    backgroundColor: "rgba(0, 75, 125, 1)",
    width: 143,
    alignItems: "flex-start",
    paddingVertical: 7,
  },
  titleButtonRequest: {
    textAlign: "center",
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 18,
    color: Colors.text,
  },
  containerTextModal: {
    alignContent: "center",
  },
  containerSectionSucessModal: {
    alignSelf: "center",
    width: Dimensions.get("window").width - 76,
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
    backgroundColor: "rgba(0, 37, 68, 1)",
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  containerNotConnections: {
    flex: 1,
    marginTop: 16,
    alignSelf: "center",
    marginBottom: 16,
    width: Dimensions.get("window").width - 32,
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
    minHeight: 16,
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
    minHeight: 16,
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
    flexDirection: "column",
    alignSelf: "flex-start",
    alignItems: "center",
  },
  textNoPeopleToConnect: {
    fontSize: 14,
    lineHeight: 16,
    textAlign: "center",
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
    width: 50,
    height: 50,
    marginTop: 5,
    marginLeft: 24,
    marginBottom: -22,
    alignSelf: "flex-start",
  },
  textUserHeaderName: {
    color: Colors.text,
    fontWeight: "400",
    fontSize: 20,
    lineHeight: 27,
  },
});

export default ViewMembers;
