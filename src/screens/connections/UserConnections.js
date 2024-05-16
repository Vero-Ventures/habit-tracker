import React, { useState, useEffect } from "react";
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
  Keyboard,
} from "react-native";
import Default from "../../../assets/styles/Default";
import Colors from "../../../assets/styles/Colors";
import Fetching from "../../components/Fetching";
import { useSelector } from "react-redux";
import Header from "../../components/Header";
import Icon from "react-native-vector-icons/FontAwesome5";
import {
  listConnectionByUser,
  storeConnection,
  answerConnection,
  deleteConnection,
  cancelConnection,
} from "../../store/ducks/connection";
import { LinearGradient } from "expo-linear-gradient";
import { Button } from "react-native-elements";
import { TextInput as TextInputPaper } from "react-native-paper";

const UserConnections = (props) => {
  const [fetching, setFetching] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [flag_filter, setFlagFilter] = useState(0);
  const [list_connections, setListConnections] = useState([]);
  const [list_aux_connections, setListAuxConnections] = useState([]);
  const [search, setSearch] = useState("");

  const user = useSelector(({ user }) => user);

  useEffect(() => {
    fetchConnections(false, true, false);
  }, []);

  useEffect(() => {
    const unsubscribe = props.navigation.addListener("focus", () => {
      fetchConnections(false, false, false);
    });

    return unsubscribe;
  }, [props.navigation, fetchConnections]);

  const fetchConnections = async (isRefresh, is_fetching, force) => {
    if (search === "" || force) {
      isRefresh ? setRefreshing(true) : is_fetching ? setFetching(true) : null;

      await listConnectionByUser(props.route.params.user.id)
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
              setListConnections(res.data);
              setListAuxConnections(res.data);
            }
          }
        });

      setRefreshing(false);
      setFetching(false);
    }
  };

  const sendInvite = (obj) => {
    let data = { usc_id_user_received_request: obj.id };

    storeConnection(data)
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
            fetchConnections();
          }
        }
      });
  };

  const answerInvite = (accept) => {
    let data = { accepted: accept };

    answerConnection(props.route.params.user.id_connection, data)
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
            fetchConnections();
          }
        }
      });
  };

  const doCancelConnection = (obj) => {
    cancelConnection(obj?.id_connection_pending)
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
            fetchConnections(false, false, true);
          }
        }
      });
  };

  const breakConnection = (obj) => {
    let connection = {};
    connection = obj.user_connections.filter(
      (item) =>
        item.usc_id_user_received_request === user.id ||
        item.usc_id_user_send_request === user.id,
    );

    Alert.alert(
      user.name,
      "Are you sure you want to break this connection?",
      [
        {
          text: "No",
          style: "cancel",
        },
        {
          text: "Yes",
          onPress: () =>
            deleteConnection(connection[0].id)
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
                    fetchConnections(false, false, true);
                  }
                }
              }),
        },
      ],
      { cancelable: false },
    );
  };

  const searchUsers = async (filter) => {
    setFetching(true);

    let aux = [];

    const common_user_filtered = list_aux_connections.common.filter((value) =>
      value.name.toLowerCase().includes(filter.toLowerCase()),
    );
    const not_common_user_filtered = list_aux_connections.not_common.filter(
      (value) => value.name.toLowerCase().includes(filter.toLowerCase()),
    );

    aux.common = common_user_filtered;
    aux.not_common = not_common_user_filtered;
    setListConnections(aux);

    setFetching(false);
  };

  const onChangeSearchText = (filter) => {
    setSearch(filter);
    searchUsers(filter);
  };

  const viewUser = (id_user, id_connection, obj, type) => {
    props.navigation.push("Home", {
      screen: "Profile",
      params: {
        screen: "UserProfile",
        params: {
          user: {
            id_user,
            id_connection,
            type_connection: type,
            invited: obj.invited,
          },
        },
      },
    });
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

  return (
    <View style={Default.container}>
      <ScrollView
        contentContainerStyle={{ flexGrow: 0 }}
        refreshControl={
          <RefreshControl
            colors={["#fff"]}
            tintColor="#fff"
            onRefresh={() => fetchConnections(true, false, false)}
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
                Invite your Connections
              </Text>
            </View>
          </View>

          <View style={styles.containerButtonsFilters}>
            <TouchableOpacity
              style={{ backgroundColor: Colors.primary }}
              onPress={() => setFlagFilter(0)}
            >
              <LinearGradient
                colors={
                  !flag_filter
                    ? ["rgba(0, 75, 125, 1)", "rgba(0, 75, 125, 1)"]
                    : ["rgba(156, 198, 255, 0.042)", "rgba(0, 37, 68, 0.15)"]
                }
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={styles.filtersButtons}
              >
                <Text
                  style={styles.textButtonFilters}
                  type="font-awesome"
                  name="chevron-left"
                  size={14}
                  color={Colors.text}
                >
                  In common
                </Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity
              style={{ backgroundColor: Colors.primary }}
              onPress={() => setFlagFilter(1)}
            >
              <LinearGradient
                colors={
                  flag_filter
                    ? ["rgba(0, 75, 125, 1)", "rgba(0, 75, 125, 1)"]
                    : ["rgba(156, 198, 255, 0.042)", "rgba(0, 37, 68, 0.15)"]
                }
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={styles.filtersButtons}
              >
                <Text
                  style={styles.textButtonFilters}
                  type="font-awesome"
                  name="chevron-left"
                  size={14}
                  color={Colors.text}
                >
                  connections
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {flag_filter ? (
            <>
              <View style={styles.containerSearch}>
                <TextInputPaper
                  keyboardAppearance="dark"
                  onSubmitEditing={Keyboard.dismiss}
                  returnKeyType="done"
                  outlineColor="transparent"
                  placeholder="Search"
                  selectionColor="#9CC6FF"
                  underlineColor="white"
                  mode="outlined"
                  style={styles.inputSearch}
                  left={
                    <TextInputPaper.Icon
                      color={Colors.primary8}
                      name="magnify"
                    />
                  }
                  theme={inputSearchTheme}
                  onChangeText={(e) => onChangeSearchText(e)}
                  blurOnSubmit={false}
                />
              </View>
              <View
                style={[
                  styles.containerConnection,
                  {
                    width: Dimensions.get("window").width - 32,
                    alignSelf: "center",
                  },
                ]}
              />
            </>
          ) : null}

          {list_connections.common?.length > 0 ? (
            <View
              style={[
                styles.container,
                !flag_filter ? { marginBottom: 24 } : { marginBottom: 0 },
              ]}
            >
              <View style={styles.innerContainer}>
                {!flag_filter ? (
                  <View style={styles.containerConnection}>
                    <Text style={styles.textConnection}>
                      Connection in Common
                    </Text>
                  </View>
                ) : null}

                {list_connections.common?.map((obj, i) => {
                  return (
                    <TouchableOpacity
                      key={i}
                      onPress={() => {
                        viewUser(obj.id, null, obj, "not_connection");
                      }}
                      style={styles.containerGroup}
                    >
                      <LinearGradient
                        colors={[
                          "rgba(156, 198, 255, 0.042)",
                          "rgba(0, 37, 68, 0.15)",
                        ]}
                        start={{ x: 0, y: 0.5 }}
                        end={{ x: 1, y: 0.5 }}
                        style={styles.containerTouchable}
                      >
                        <View style={styles.containerItemConnection}>
                          {obj?.image ? (
                            <Image
                              source={{ uri: obj?.image?.url }}
                              style={styles.userPhoto}
                            />
                          ) : (
                            <Image
                              source={require("../../../assets/images/no-profile.png")}
                              style={styles.userPhoto}
                            />
                          )}
                          <Text style={styles.textUserName}>{obj.name}</Text>
                          <Button
                            buttonStyle={[
                              styles.connectionButton,
                              { backgroundColor: "rgba(153, 37, 56, 1)" },
                            ]}
                            titleStyle={styles.textButtonConnect}
                            onPress={() => breakConnection(obj)}
                            title={"Connected"}
                          />
                        </View>
                      </LinearGradient>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          ) : null}

          {list_connections.not_common?.length > 0 ? (
            <View style={styles.container}>
              <View style={[styles.innerContainer, { paddingTop: 0 }]}>
                {!flag_filter ? (
                  <View style={styles.containerConnection}>
                    <Text style={styles.textConnection}>
                      Suggestions for you
                    </Text>
                  </View>
                ) : null}

                {list_connections.not_common?.map((obj, i) => {
                  return (
                    <TouchableOpacity
                      key={i}
                      onPress={() => {
                        viewUser(obj.id, null, obj, "not_connection");
                      }}
                      style={styles.containerGroup}
                    >
                      <LinearGradient
                        colors={[
                          "rgba(156, 198, 255, 0.042)",
                          "rgba(0, 37, 68, 0.15)",
                        ]}
                        start={{ x: 0, y: 0.5 }}
                        end={{ x: 1, y: 0.5 }}
                        style={styles.containerTouchable}
                      >
                        <View style={styles.containerItemConnection}>
                          {obj?.image ? (
                            <Image
                              source={{ uri: obj?.image?.url }}
                              style={styles.userPhoto}
                            />
                          ) : (
                            <Image
                              source={require("../../../assets/images/no-profile.png")}
                              style={styles.userPhoto}
                            />
                          )}
                          <Text style={styles.textUserName}>{obj.name}</Text>
                          {obj?.pending_status ? (
                            <Button
                              buttonStyle={[
                                styles.connectionButton,
                                { backgroundColor: Colors.primary3 },
                              ]}
                              titleStyle={styles.textButtonConnect}
                              onPress={() => doCancelConnection(obj)}
                              title={"Undo"}
                            />
                          ) : (
                            <Button
                              buttonStyle={styles.connectionButton}
                              titleStyle={styles.textButtonConnect}
                              onPress={() => sendInvite(obj)}
                              title={"Connect"}
                            />
                          )}
                        </View>
                      </LinearGradient>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          ) : search === "" ? (
            <View style={styles.container}>
              <View style={styles.innerContainer}>
                <View style={styles.containerConnection}>
                  <Text style={styles.textConnection}>My Connections</Text>
                </View>
                <Text style={styles.textNotConnection}>
                  You don't have connections
                </Text>
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
    flex: 1,
    alignItems: "center",
    width: Dimensions.get("window").width,
    paddingHorizontal: 16,
  },
  containerTouchable: {
    flex: 1,
    width: Dimensions.get("window").width - 48,
    backgroundColor: "rgba(156, 198, 255, 0.042)",
    borderRadius: 8,
    paddingHorizontal: 16,
  },
  innerContainer: {
    flexDirection: "column",
    flex: 1,
    alignItems: "center",
  },
  containerGroup: {
    flexDirection: "row",
    marginBottom: 8,
    justifyContent: "space-between",
    alignItems: "center",
  },
  containerActions: {
    flexDirection: "row",
    width: Dimensions.get("window").width - 48,
    marginTop: -16,
  },
  containerConnection: {
    borderBottomColor: "#264261",
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingBottom: 16,
    marginBottom: 16,
  },
  titleInvite: {
    flex: 1,
    flexDirection: "column",
    alignSelf: "flex-start",
    alignItems: "center",
  },
  textUserHeaderName: {
    color: Colors.text,
    fontWeight: "400",
    fontSize: 20,
    lineHeight: 27,
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
  textNotConnection: {
    fontSize: 10,
    lineHeight: 16,
    width: 128,
    height: 16,
    fontWeight: "bold",
    color: Colors.primary4,
    width: Dimensions.get("window").width - 44,
  },
  textSubtitle: {
    fontSize: 10,
    lineHeight: 16,
    width: 71,
    height: 16,
    color: Colors.text,
    width: Dimensions.get("window").width - 44,
  },
  containerItemConnection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
  },
  containerButtonsFilters: {
    marginTop: 22,
    marginBottom: 24,
    flexDirection: "row",
    alignItems: "flex-start",
    alignSelf: "flex-start",
    marginHorizontal: 16,
  },
  filtersButtons: {
    borderRadius: 900,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
  },
  textButtonFilters: {
    color: "#FCFCFC",
    fontSize: 16,
    fontWeight: "700",
    lineHeight: 22,
    paddingBottom: 2,
  },
  textUserName: {
    flex: 1,
    fontWeight: "700",
    fontSize: 16,
    lineHeight: 16,
    color: Colors.text,
  },
  userPhoto: {
    width: 32,
    height: 32,
    borderRadius: 32,
    marginRight: 8,
  },
  containerSearch: {
    height: 64,
    paddingHorizontal: 16,
    flexDirection: "row",
    width: Dimensions.get("window").width,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
  },
  inputSearch: {
    flex: 1,
    fontSize: 14,
    backgroundColor: "#002544",
    paddingHorizontal: 8,
    borderRadius: 8,
    justifyContent: "center",
    width: Dimensions.get("window").width - 48,
  },
  iconSearch: {
    position: "absolute",
    paddingTop: 5,
    marginLeft: 42,
    alignSelf: "center",
  },
  backButtonStyle: {
    // width: 50,
    // height: 50,
    // marginTop: -33,
    // marginLeft: 16,
    // marginBottom: -42
    width: 50,
    height: 50,
    marginTop: 5,
    marginLeft: 24,
    marginBottom: -22,
    alignSelf: "flex-start",
  },
  connectionButton: {
    borderRadius: 8,
    backgroundColor: "#004B7D",
    width: 96,
    paddingVertical: 7,
    paddingHorizontal: 16,
  },
  textButtonConnect: {
    color: "#FCFCFC",
    fontSize: 13,
    fontWeight: "700",
    width: 96,
    lineHeight: 18,
    overflow: "hidden",
  },
});

export default UserConnections;
