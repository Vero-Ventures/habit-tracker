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
import Header from "../../components/Header";
import Icon from "react-native-vector-icons/FontAwesome5";
import {
  listConnection,
  searchConnection,
  getPending,
} from "../../store/ducks/connection";
import debounce from "lodash.debounce";
import { TextInput } from "react-native-paper";

const Connections = (props) => {
  const [fetching, setFetching] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [list_pending_connections, setListPendingConnections] = useState([]);
  const [list_connections, setListConnections] = useState([]);
  const [list_not_connections, setListNotConnections] = useState([]);
  const [search, setSearch] = useState("");

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

      await getPending()
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
              setListPendingConnections(res.data);
            }
          }
        });

      await listConnection()
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
            }
          }
        });

      setRefreshing(false);
      setFetching(false);
    }
  };

  const searchUsersByTermo = (search) => {
    if (search === "") {
      fetchConnections(false, true, true);
      setListNotConnections([]);
    } else {
      searchConnection({ search })
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
              setListConnections(res.data.connections);
              setListNotConnections(res.data.not_connections);
            }
          }
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
      <Header navigation={props.navigation} showBackgroundImage />

      <TouchableOpacity
        style={[styles.backButtonStyle]}
        onPress={() => props.navigation.pop()}
      >
        <Icon
          type="font-awesome"
          name="chevron-left"
          size={14}
          color={Colors.primary4}
        />
      </TouchableOpacity>

      <View style={styles.containerSearch}>
        <TextInput
          keyboardAppearance="dark"
          onSubmitEditing={Keyboard.dismiss}
          returnKeyType="done"
          outlineColor="transparent"
          placeholder="Email or username"
          selectionColor="#9CC6FF"
          underlineColor="white"
          mode="outlined"
          style={styles.inputSearch}
          dense
          left={<Icon name="chevron-right" size={14} color={"#fff"} />}
          theme={inputSearchTheme}
          onChangeText={(e) => onChangeSearchText(e)}
          blurOnSubmit={false}
        />
        <Icon
          size={15}
          style={styles.iconSearch}
          color={Colors.primary4}
          name={"search"}
        />
      </View>

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
          {list_pending_connections.length > 0 && search === "" ? (
            <View style={styles.container}>
              <View style={styles.innerContainer}>
                <View style={styles.containerConnection}>
                  <Text style={styles.textConnection}>Connection requests</Text>
                </View>

                {list_pending_connections.map((obj, i) => {
                  return (
                    <TouchableOpacity
                      key={i}
                      onPress={() => {
                        viewUser(obj.id, obj.id_connection, obj, "pending");
                      }}
                    >
                      <View style={styles.containerItemConnection}>
                        {obj.image ? (
                          <Image
                            source={{ uri: obj.image.url }}
                            style={styles.userPhoto}
                          />
                        ) : (
                          <Image
                            source={require("../../../assets/images/no-profile.png")}
                            style={styles.userPhoto}
                          />
                        )}
                        <Text style={styles.textUserName}>{obj.name}</Text>
                        <Icon
                          name="chevron-right"
                          size={14}
                          color={Colors.primary4}
                        />
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          ) : null}

          {list_connections.length > 0 ? (
            <View style={styles.container}>
              <View style={[styles.innerContainer, { paddingTop: 0 }]}>
                <View style={styles.containerConnection}>
                  <Text style={styles.textConnection}>My Connections</Text>
                </View>

                <Text style={styles.textSubtitle}>Connections</Text>

                {list_connections.map((obj, i) => {
                  return (
                    <TouchableOpacity
                      key={i}
                      onPress={() => {
                        viewUser(obj.connection.id, obj.id, obj, "connection");
                      }}
                    >
                      <View style={styles.containerItemConnection}>
                        {obj.connection?.image ? (
                          <Image
                            source={{ uri: obj.connection?.image.url }}
                            style={styles.userPhoto}
                          />
                        ) : (
                          <Image
                            source={require("../../../assets/images/no-profile.png")}
                            style={styles.userPhoto}
                          />
                        )}
                        <Text style={styles.textUserName}>
                          {obj.connection.name}
                        </Text>
                        <Icon
                          name="chevron-right"
                          size={14}
                          color={Colors.primary4}
                        />
                      </View>
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

          {list_not_connections.length > 0 ? (
            <View style={styles.container}>
              <View style={[styles.innerContainer, { paddingTop: 0 }]}>
                <View style={styles.containerConnection}>
                  <Text style={styles.textConnection}>Search results</Text>
                </View>

                {list_not_connections.map((obj, i) => {
                  return (
                    <TouchableOpacity
                      key={i}
                      onPress={() => {
                        viewUser(obj.id, null, obj, "not_connection");
                      }}
                    >
                      <View style={styles.containerItemConnection}>
                        {obj.image ? (
                          <Image
                            source={{ uri: obj.image.url }}
                            style={styles.userPhoto}
                          />
                        ) : (
                          <Image
                            source={require("../../../assets/images/no-profile.png")}
                            style={styles.userPhoto}
                          />
                        )}
                        <Text style={styles.textUserName}>{obj.name}</Text>
                        <Icon
                          name="chevron-right"
                          size={14}
                          color={Colors.primary4}
                        />
                      </View>
                    </TouchableOpacity>
                  );
                })}
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
    paddingVertical: 24,
    width: Dimensions.get("window").width,
    paddingHorizontal: 24,
  },
  innerContainer: {
    flexDirection: "column",
    flex: 1,
    alignItems: "center",
  },
  containerConnection: {
    borderBottomColor: "#264261",
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingBottom: 8,
    marginBottom: 8,
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
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#264261",
    width: Dimensions.get("window").width - 44,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
  },
  textUserName: {
    flex: 1,
    fontSize: 11,
    lineHeight: 16,
    color: Colors.primary4,
  },
  userPhoto: {
    width: 32,
    height: 32,
    borderRadius: 32,
    marginRight: 8,
  },
  containerSearch: {
    height: 50,
    paddingHorizontal: 20,
    marginTop: 33,
    flexDirection: "row",
    width: Dimensions.get("window").width,
    flexDirection: "row",
    justifyContent: "space-between",
    alignSelf: "center",
  },
  inputSearch: {
    flex: 1,
    fontSize: 14,
    backgroundColor: "#002544",
    height: 40,
    borderRadius: 8,
    paddingTop: 5,
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
    width: 50,
    height: 50,
    marginTop: -33,
    marginLeft: 12,
    marginBottom: -42,
  },
});

export default Connections;
