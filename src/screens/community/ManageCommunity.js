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
  Modal,
} from "react-native";
import Default from "../../../assets/styles/Default";
import Colors from "../../../assets/styles/Colors";
import Fetching from "../../components/Fetching";
import Header from "../../components/Header";
import Icon from "react-native-vector-icons/FontAwesome5";
import {
  getMembers,
  updateMember,
  answerRequest,
  removeMember,
  getOldestMember,
  leaveCommunity,
} from "../../store/ducks/community";
import { Button } from "react-native-elements";
import { useSelector } from "react-redux";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { Modalize } from "react-native-modalize";

const ManageCommunity = (props) => {
  const user = useSelector(({ user }) => user);

  const [fetching, setFetching] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [index, setIndex] = useState(null);
  const [permission, setPermission] = useState(null);
  const [community, setCommunity] = useState(null);
  const [flag_admin, setFlagAdmin] = useState(false);
  const [flag_create, setFlagCreate] = useState(false);
  const [page, setPage] = useState(0);
  const [load_more, setLoadMore] = useState(true);
  const [list_users_pending, setListUsersPending] = useState([]);
  const [user_selected, setUserSelected] = useState({});
  const [list_members, setListMembers] = useState([]);
  const [list_admins_moderators, setListAdminsModerators] = useState([]);
  const modalizeRef = useRef(null);

  useEffect(() => {
    setCommunity(props.route?.params?.community?.id);
    fetchMembers(false, true);

    return () => {
      modalizeRef.current = false;
    };
  }, [props]);

  const fetchMembers = async (is_refreshing, is_fetching) => {
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
            setListUsersPending(res.data?.members_pending);
            setListMembers(res.data?.members?.data);
            setListAdminsModerators(res.data?.admins_moderators);
            setPage(0);
          }

          if (res.data?.members?.current_page === res.data?.members?.last_page) {
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
  };

  const onChangePermission = (obj, index, admin = false) => {
    setUserSelected(obj);
    setIndex(index);
    setFlagAdmin(admin);
    modalizeRef.current?.open();
  };

  const handleChangePermission = (value) => {
    let verify_user = list_admins_moderators.filter(
      (item) => item.user.id === user.id && item.cme_role === "ADMIN",
    );

    let verify_qtde_admins = list_admins_moderators.filter(
      (item) => item.cme_role === "ADMIN",
    );

    let verify_user_member = list_members.filter(
      (item) =>
        item.user.id === user_selected?.user?.id && item.cme_role === "MEMBER",
    );

    if (verify_user.length === 0) {
      Alert.alert("Ops!", "you are not allowed to perform this operation.");
      setPermission(null);
      setUserSelected({});
      setIndex(null);
      setFlagAdmin(false);

      modalizeRef.current?.close();
      return;
    }

    if (
      verify_qtde_admins.length === 1 &&
      value === 1 &&
      verify_user_member === 0
    ) {
      Alert.alert("Ops!", "At least one admin must exist for community.");
      setPermission(null);
      setUserSelected({});
      setIndex(null);
      setFlagAdmin(false);

      modalizeRef.current?.close();
      return;
    }

    setPermission(value);

    let data = {
      cme_role: value ? "MODERATOR" : "ADMIN",
      cme_id_user: user_selected?.user?.id,
      cme_id_community: community,
    };

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
            if (flag_admin) {
              list_admins_moderators.splice(index, 1);
            } else {
              list_members.splice(index, 1);
            }

            let aux_list_admins = list_admins_moderators;
            aux_list_admins.push(res.data);
            setListAdminsModerators(aux_list_admins);

            setPermission(null);
            setUserSelected({});
            setIndex(null);
            setFlagAdmin(false);

            modalizeRef.current?.close();
          }
        }
      });
  };

  const fetchUpdatePermissions = (data, pop = false) => {
    setFetching(true);

    updateMember(data)
      .catch((err) => {
        Alert.alert(
          "Ops!",
          "Something went wrong with our servers. Please contact uss.",
        );
      })
      .then((res) => {
        if (res?.status === 200) {
          if (res.data.errors) {
            Alert.alert("Ops!", res.data.errors[0]);
          } else {
            list_admins_moderators.splice(index, 1);

            let aux_list_members = [...list_members];
            aux_list_members.push(res.data);

            setListMembers(aux_list_members);
          }
        }
      })
      .finally(() => {
        setFetching(false);
      });
  };
  const removeYouAdminsModerators = (data) => {
    setFetching(true);

    Alert.alert(
      user.name,
      "Are you sure? you will be removed from admin and another member will become admin, after the operation you will be redirected to the previous screen..",
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
                    let aux_list_admins = list_admins_moderators;
                    aux_list_admins.push(res.data);
                    setListAdminsModerators(aux_list_admins);

                    data.cme_role = "MEMBER";
                    data.cme_id_user = user_selected?.user?.id;

                    fetchUpdatePermissions(data);
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
              props.navigation.navigate("Home", { screen: "CommunityIndex" });
            }
          }
        })
        .finally(() => {
          setFetching(false);
        });
  };

  const onRemoveMember = async () => {
    let verify_user = list_admins_moderators.filter(
      (item) => item.user.id === user.id,
    );

    if (list_admins_moderators.includes(user_selected)) {
      if (list_admins_moderators.length === 1 && list_members.length === 0) {
        let request = {
          cme_id_community: community,
          delete: true,
        };

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
              onPress: () => [setLeave(request)],
            },
          ],
          { cancelable: false },
        );
        return;
      }

      if (
        verify_user[0]?.cme_role === "MODERATOR" &&
        user_selected.user?.id !== user.id
      ) {
        Alert.alert("Ops!", "You are not allowed to perform this operation.");
        return;
      }

      let data = {
        cme_role: "MEMBER",
        cme_id_user: user_selected?.user?.id,
        cme_id_community: community,
      };

      let verify_admin_exists = list_admins_moderators.filter(
        (item) => item.cme_role === "ADMIN" && item.user.id !== user.id,
      );

      if (
        verify_user.length > 0 &&
        verify_user[0]?.cme_role === "ADMIN" &&
        user_selected.user?.id === user.id &&
        list_admins_moderators.length === 1
      ) {
        setFetching(true);

        await getOldestMember(community)
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
                data.cme_role = "ADMIN";
                data.cme_id_user = res.data?.cme_id_user;
              }
            }
          })
          .finally(() => {
            removeYouAdminsModerators(data);
          });

        return;
      } else if (
        verify_admin_exists.length > 0 &&
        user_selected.user?.id === user.id
      ) {
        Alert.alert(
          user.name,
          "Are you sure? you will be removed from moderator and will be redirected to the previous screen.",
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
              onPress: () => [
                fetchUpdatePermissions(data),
                props.navigation.pop(),
              ],
            },
          ],
          { cancelable: false },
        );
        return;
      } else if (user_selected.user?.id === user.id) {
        let moderator = list_admins_moderators.filter(
          (item) => item.cme_role === "MODERATOR" && item.user.id !== user.id,
        );

        data.cme_role = "ADMIN";
        data.cme_id_user = moderator[0]?.user?.id;

        removeYouAdminsModerators(data);
        return;
      }

      if (verify_user.length > 0 && verify_user[0]?.cme_role === "ADMIN") {
        fetchUpdatePermissions(data);
      }
    } else {
      if (verify_user.length === 0) {
        Alert.alert("Ops!", "you are not allowed to perform this operation.");
        return;
      }

      let request = {
        cme_id_user: user_selected?.user?.id,
        cme_id_community: community,
      };

      Alert.alert(
        user.name,
        "Are you sure you want to remove this member?",
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
              removeMember(request)
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
                      list_members.splice(index, 1);
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

    setPermission(null);
    setUserSelected({});
    setIndex(null);

    modalizeRef.current?.close();
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

  const allowMember = (user, i) => {
    setFetching(false);

    let data = {
      accepted: 1,
      cme_id_user: user.user?.id,
      cme_id_community: community,
    };

    answerRequest(data)
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
            list_users_pending.splice(i, 1);

            let aux_list_members = [...list_members];
            aux_list_members.push(res.data);

            setListMembers(aux_list_members);
          }
        }
      })
      .finally(() => {
        setFetching(false);
      });
  };

  const denyMember = (user, i) => {
    setFetching(true);

    let data = {
      accepted: 0,
      cme_id_user: user.user?.id,
      cme_id_community: community,
    };

    answerRequest(data)
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
            list_users_pending.splice(i, 1);
          }
        }
      })
      .finally(() => {
        setFetching(false);
      });
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
            onRefresh={() => fetchMembers(true, false)}
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
                Community Permissions
              </Text>
            </View>
          </View>

          {list_users_pending.length > 0 && !flag_create ? (
            <View style={styles.container}>
              <View style={styles.innerContainer}>
                <View style={styles.containerConnection}>
                  <Text style={styles.textConnection}>Pending Request</Text>
                </View>
                {list_users_pending.map((obj, i) => {
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
                          <Text style={styles.textUserName}>
                            {obj.user?.name}
                          </Text>
                        </TouchableOpacity>
                        <View
                          style={{
                            flexDirection: "row",
                            justifyContent: "space-between",
                            width: Dimensions.get("window").width - 80,
                            marginBottom: 16,
                          }}
                        >
                          <Button
                            buttonStyle={styles.buttonRequest}
                            titleStyle={styles.titleButtonRequest}
                            onPress={() => allowMember(obj, i)}
                            title={"Allow"}
                          />
                          <Button
                            buttonStyle={[
                              styles.buttonRequest,
                              {
                                marginLeft: 8,
                                backgroundColor: "rgba(153, 37, 56, 1)",
                              },
                            ]}
                            titleStyle={styles.titleButtonRequest}
                            onPress={() => denyMember(obj, i)}
                            title={"Deny"}
                          />
                        </View>
                      </LinearGradient>
                    </View>
                  );
                })}
              </View>
            </View>
          ) : null}

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
                          <TouchableOpacity
                            onPress={() => onChangePermission(obj, i, true)}
                          >
                            <Image
                              source={require("../../../assets/icons/ellipse-vertical.png")}
                              style={styles.circleIcon}
                            />
                          </TouchableOpacity>
                        </TouchableOpacity>
                      </LinearGradient>
                    </View>
                  );
                })
              ) : (
                <View style={styles.containerNotConnections}>
                  <Text style={styles.textNoPeopleToConnect}>
                    No admins and moderators in this community.
                  </Text>
                </View>
              )}
            </View>
          </View>

          {list_members.length > 0 ? (
            <View style={styles.container}>
              <View style={styles.innerContainer}>
                <View style={styles.containerConnection}>
                  <Text style={styles.textConnection}>Members</Text>
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
                          <TouchableOpacity
                            onPress={() => onChangePermission(obj, i)}
                          >
                            <Image
                              source={require("../../../assets/icons/ellipse-vertical.png")}
                              style={styles.circleIcon}
                            />
                          </TouchableOpacity>
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

      <Modalize
        ref={modalizeRef}
        snapPoint={570}
        modalStyle={styles.modalize}
        handlePosition={"inside"}
        modalHeight={420}
        handleStyle={{ backgroundColor: "white", marginTop: 10 }}
      >
        <LinearGradient
          colors={["rgba(156, 198, 255, 0.084)", "rgba(0, 37, 68, 0.3)"]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={styles.containerModal}
        >
          <View style={styles.containerTitleModal}>
            {user_selected.user?.image ? (
              <Image
                source={{ uri: user_selected.user?.image?.url }}
                style={styles.userPhotoModal}
              />
            ) : (
              <Image
                source={require("../../../assets/images/no-profile.png")}
                style={styles.userPhotoModal}
              />
            )}
            <Text style={styles.textName}>{user_selected.user?.name}</Text>
          </View>

          <View style={styles.containerReport}>
            <TouchableOpacity
              onPress={() => handleChangePermission(0)}
              style={styles.containerOptionPrivacy}
            >
              <Text style={styles.textTitleSection}>ADD AS ADMIN</Text>
              {permission === 0 ? (
                <Image
                  source={require("../../../assets/icons/circle-selected.png")}
                  style={styles.circleIcon}
                />
              ) : (
                <Image
                  source={require("../../../assets/icons/circle.png")}
                  style={styles.circleIcon}
                />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleChangePermission(1)}
              style={styles.containerOptionPrivacy}
            >
              <Text style={styles.textTitleSection}>ADD AS MODERATOR</Text>
              {permission === 1 ? (
                <Image
                  source={require("../../../assets/icons/circle-selected.png")}
                  style={styles.circleIcon}
                />
              ) : (
                <Image
                  source={require("../../../assets/icons/circle.png")}
                  style={styles.circleIcon}
                />
              )}
            </TouchableOpacity>

            <View style={styles.containerButton}>
              <Button
                buttonStyle={Default.loginNextButton}
                titleStyle={Default.loginButtonBoldTitle}
                onPress={onRemoveMember}
                title={`REMOVE ${user_selected.user?.name?.toUpperCase()}`}
              />
            </View>
          </View>
        </LinearGradient>
      </Modalize>
    </View>
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
    flexDirection: "row",
    width: Dimensions.get("window").width - 48,
    marginTop: 0,
    marginBottom: 16,
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
    marginBottom: -24,
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

export default ManageCommunity;
