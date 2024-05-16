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
  Keyboard,
  Modal,
} from "react-native";
import Default from "../../../assets/styles/Default";
import Colors from "../../../assets/styles/Colors";
import Fetching from "../../components/Fetching";
import Header from "../../components/Header";
import Icon from "react-native-vector-icons/FontAwesome5";
import { Button } from "react-native-elements";
import { useSelector } from "react-redux";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { Modalize } from "react-native-modalize";

const PermissionsCommunity = (props) => {
  const user = useSelector(({ user }) => user);

  const [fetching, setFetching] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [index, setIndex] = useState(null);
  const [permission, setPermission] = useState(null);
  const [flag_admin, setFlagAdmin] = useState(false);
  const [modalSucess, setModalSucess] = useState(false);
  const [user_selected, setUserSelected] = useState({});
  const [list_connections, setListConnections] = useState([]);
  const [list_admins_moderators, setListAdminsModerators] = useState([]);
  const modalizeRef = useRef(null);

  useEffect(() => {
    let init_admin = [];
    user.permission = 0;
    init_admin.push(user);
    setListAdminsModerators(init_admin);
    fetchConnections(false, true, false);
  }, [props]);

  useEffect(() => {
    const unsubscribe = props.navigation.addListener("focus", () => {
      fetchConnections(false, false, false);
    });

    return unsubscribe;
  }, [props.navigation, fetchConnections]);

  const fetchConnections = async (isRefresh, is_fetching, force) => {
    if (force) {
      isRefresh ? setRefreshing(true) : is_fetching ? setFetching(true) : null;

      setListConnections(props.route.params.invites);

      setRefreshing(false);
      setFetching(false);
    }
  };

  const onChangePermission = (obj, index, admin = false) => {
    setUserSelected(obj);
    setIndex(index);
    setFlagAdmin(admin);
    modalizeRef.current?.open();
  };

  const handleChangePermission = (value) => {
    setPermission(value);

    if (flag_admin) {
      list_admins_moderators.splice(index, 1);
    }

    user_selected.permission = value;

    let aux_list_admins = list_admins_moderators;
    aux_list_admins.push(user_selected);
    list_connections.splice(index, 1);
    setListAdminsModerators(aux_list_admins);

    setPermission(null);
    setUserSelected({});
    setIndex(null);
    setFlagAdmin(false);

    modalizeRef.current?.close();
  };

  const removeConnection = () => {
    if (list_admins_moderators.includes(user_selected)) {
      list_admins_moderators.splice(index, 1);
    } else {
      list_connections.splice(index, 1);
    }

    setPermission(null);
    setUserSelected({});
    setIndex(null);
    setFlagAdmin(false);

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

  const next = () => {
    setModalSucess(!modalSucess);
  };

  return (
    <View style={Default.container}>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        refreshControl={
          <RefreshControl
            colors={["#fff"]}
            tintColor="#fff"
            onRefresh={() => fetchContacts(true, false, false)}
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

          {modalSucess ? (
            <>
              <BlurView
                style={styles.containerBlur}
                tint="dark"
                intensity={100}
              />
              <View
                onPress={() => setModal(!modal)}
                style={styles.containerShadow}
              ></View>
            </>
          ) : null}

          {list_admins_moderators.length > 0 ? (
            <View style={styles.container}>
              <View style={styles.innerContainer}>
                <View style={styles.containerConnection}>
                  <Text style={styles.textConnection}>
                    Admins and Moderatos
                  </Text>
                </View>
                {list_admins_moderators.map((obj, i) => {
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
                        <View style={styles.containerItemConnection}>
                          {obj.image ? (
                            <Image
                              source={{ uri: obj.image?.url }}
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
                            <Text style={styles.textUserName}>{obj.name}</Text>
                            <Text style={styles.textSubtitle}>
                              {obj.permission === 0 ? "Admin" : "Moderator"}
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
                        </View>
                      </LinearGradient>
                    </View>
                  );
                })}
              </View>
            </View>
          ) : (
            <View style={styles.containerNotConnections}>
              <Text style={styles.textNoPeopleToConnect}>
                No contacts in live timeless.
              </Text>
            </View>
          )}

          {list_connections.length > 0 ? (
            <View style={styles.container}>
              <View style={styles.innerContainer}>
                <View style={styles.containerConnection}>
                  <Text style={styles.textConnection}>Connections</Text>
                </View>
                {list_connections.map((obj, i) => {
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
                        <View style={styles.containerItemConnection}>
                          {obj.image ? (
                            <Image
                              source={{ uri: obj.image?.url }}
                              style={styles.userPhoto}
                            />
                          ) : (
                            <Image
                              source={require("../../../assets/images/no-profile.png")}
                              style={styles.userPhoto}
                            />
                          )}
                          <Text style={styles.textUserName}>{obj.name}</Text>
                          <TouchableOpacity
                            onPress={() => onChangePermission(obj, i)}
                          >
                            <Image
                              source={require("../../../assets/icons/ellipse-vertical.png")}
                              style={styles.circleIcon}
                            />
                          </TouchableOpacity>
                        </View>
                      </LinearGradient>
                    </View>
                  );
                })}
              </View>
            </View>
          ) : null}
          <View style={[styles.containerButton, { marginTop: 17 }]}>
            <Button
              buttonStyle={Default.loginNextButton}
              titleStyle={Default.loginButtonBoldTitle}
              onPress={next}
              title={"CREATE COMMUNITY"}
            />
          </View>
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
            {user_selected.image ? (
              <Image
                source={{ uri: user_selected.image?.url }}
                style={styles.userPhotoModal}
              />
            ) : (
              <Image
                source={require("../../../assets/images/no-profile.png")}
                style={styles.userPhotoModal}
              />
            )}
            <Text style={styles.textName}>{user_selected.name}</Text>
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
                onPress={removeConnection}
                title={`REMOVE ${user_selected.name?.toUpperCase()}`}
              />
            </View>
          </View>
        </LinearGradient>
      </Modalize>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalSucess}
        onRequestClose={() => setModalSucess(!modalSucess)}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <View style={styles.containerSectionSucessModal}>
              <TouchableOpacity
                style={styles.containerHeaderModal}
                onPress={() => setModalSucess(!modalSucess)}
              >
                <Image
                  style={styles.imageModalHeader}
                  source={require("../../../assets/icons/close.png")}
                />
              </TouchableOpacity>

              <LinearGradient
                colors={[
                  "rgba(1, 50, 91, 0.5)",
                  "rgba(48, 46, 80, 0.5)",
                  "rgba(237, 28, 36, 0.2)",
                ]}
                start={{ x: 0, y: 0.8 }}
                end={{ x: 0.8, y: 1 }}
                style={styles.typeCommunity}
              >
                <Image
                  source={require("../../../assets/icons/icon-privacy.png")}
                  style={styles.headerIcon}
                />
                <Text style={styles.typeCommunityText}>Private community</Text>
              </LinearGradient>

              <View style={styles.containerTextModal}>
                <Text style={styles.textSucessModal}>
                  Your community has been successfully created
                </Text>
              </View>
            </View>
          </View>
        </View>
      </Modal>
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
    flexDirection: "column",
    alignSelf: "flex-start",
    alignItems: "center",
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

export default PermissionsCommunity;
