import React, { useState, useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  Text,
  RefreshControl,
  ScrollView,
  Image,
  SafeAreaView,
  TouchableOpacity,
  Modal,
  Pressable,
  Alert,
  TextInput,
  Keyboard,
  Platform,
} from "react-native";
import { TextInput as TextInputPaper } from "react-native-paper";
import Default from "../../../assets/styles/Default";
import Colors from "../../../assets/styles/Colors";
import Fetching from "../../components/Fetching";
import Icon from "react-native-vector-icons/FontAwesome5";
// import { useSelector } from "react-redux";
import { LinearGradient } from "expo-linear-gradient";
import * as ImagePicker from "expo-image-picker";
import * as mime from "react-native-mime-types";
import { Button, Input } from "react-native-elements";
// import { listConnection } from "../../store/ducks/connection";
import { store as storeCommunity } from "../../store/ducks/community";
import RBSheet from "react-native-raw-bottom-sheet";
import Header from "../../components/Header";
import ActionSheet from "react-native-actionsheet";
import { BlurView } from "expo-blur";
import { Modalize } from "react-native-modalize";
import { systemWeights } from "react-native-typography";
import { takeCamera, takeGaleria } from "../../utils/Utils";

const CreateCommunity = (props) => {
  const [fetching, setFetching] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [communityPhoto, setCommunityPhoto] = useState(null);

  const [modal, setModal] = useState(false);
  const [modalSuccess, setModalSuccess] = useState(false);
  const [modal_type, setModalType] = useState("");

  const [title, setTitle] = useState("");
  const [ruleDescription, setRuleDescription] = useState("");
  const [rules, setRules] = useState([]);

  const [tagTitle, setTagTitle] = useState("");
  const [tags, setTags] = useState([]);

  const [community, setCommunity] = useState({});
  const [privacy, setPrivacy] = useState(0);

  const [viewSearch, setViewSearch] = useState(false);
  const [list_connections, setListConnections] = useState([]);
  const [list_invites, setListInvites] = useState([]);
  const [list_aux_connections, setListAuxConnections] = useState([]);
  const [search, setSearch] = useState("");
  const [focusSearch, setFocusSearch] = useState(false);

  const [index, setIndex] = useState(null);
  const [permission, setPermission] = useState(null);
  const [flag_admin, setFlagAdmin] = useState(false);
  const [user_selected, setUserSelected] = useState({});
  const [list_admins_moderators, setListAdminsModerators] = useState([]);
  const modalizeRef = useRef(null);

  const [remove, setRemove] = useState(null);
  const [index_remove, setIndexRemove] = useState(null);

//   const user = useSelector(({ user }) => user);
  const ASPhotoOptions = useRef();

  const RBSDelete = useRef();
  const RBSExit = useRef();

//   useEffect(() => {
//     fetchConnections(false, true, false);
//   }, []);

//   useEffect(() => {
//     let init_admin = [...list_admins_moderators];
//     user.permission = 0;
//     let check = false;

//     let found = init_admin.find((element) => element === user);

//     // !found ? init_admin.push(user) : null;
//     setListAdminsModerators(init_admin);
//   }, [step === 3]);

  const fetchConnections = async (isRefresh, is_fetching, force) => {
    if (search === "" || force) {
      isRefresh ? setRefreshing(true) : is_fetching ? setFetching(true) : null;

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
              setListAuxConnections(res.data);
            }
          }
        });

      setRefreshing(false);
      setFetching(false);
    }
  };

  const createCommunity = () => {
    setLoading(true);
    let communityForm = new FormData();

    communityForm.append("com_name", name);
    communityForm.append("com_description", description);
    communityForm.append("com_private", privacy);
    communityForm.append("com_members", JSON.stringify(list_invites));
    communityForm.append(
      "com_admins_moderators",
      JSON.stringify(list_admins_moderators),
    );
    communityForm.append("com_rules", JSON.stringify(rules));
    communityForm.append("com_tags", JSON.stringify(tags));
    communityForm.append("com_image", communityPhoto);

    storeCommunity(communityForm)
      .catch((err) => {
        Alert.alert(
          "Ops!",
          "Something went wrong with our servers. Please contact us.",
        );
      })
      .then((res) => {
        if (res?.status === 200) {
          if (res?.data?.errors) {
            Alert.alert("Ops!", res.data.errors[0]);
          } else {
            setCommunity(res.data);
            setLoading(false);
            setModalSuccess(true);
          }
        }
      });
  };

  const next = () => {
    if (name === "") {
      Alert.alert("Oops!", "You need insert name.");
      return;
    }

    if (description === "") {
      Alert.alert("Oops!", "You need to insert a description.");
      return;
    }

    if (communityPhoto === null) {
      Alert.alert("Oops!", "You need add a photo before continue.");
      return;
    }

    setModalSuccess(!modalSuccess);
  };

  const addRule = () => {
    if (title === "" || ruleDescription === "") {
      Alert.alert("Oops!", "You need fill in all fields.");
      return;
    }

    let rule = {};
    let aux_rules = [];

    rule.title = title;
    rule.description = ruleDescription;

    aux_rules = rules;
    aux_rules.push(rule);
    setRules(aux_rules);

    setModal(!modal);
    setTitle("");
    setRuleDescription("");
  };

  const handleActionSheet = async (index) => {
    if (index === 0) {
      let { status } = await ImagePicker.requestCameraPermissionsAsync();

      if (status == "granted") {
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

  const setAnexos = (foto) => {
    let auxFoto = { ...foto };
    auxFoto.url = foto.uri;

    setCommunityPhoto(auxFoto);
  };

  const addTag = () => {
    if (title === "") {
      Alert.alert("Oops!", "You need fill in all fields.");
      return;
    }

    let tag = {};
    let aux_tags = [];

    tag.title = title;

    aux_tags = tags;
    aux_tags.push(tag);
    setTags(aux_tags);

    setModal(!modal);
    setTitle("");
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

  const handleConnect = (obj, index) => {
    setFetching(true);

    let aux_invites = [...list_invites];
    let aux_connections = [...list_connections];

    let position_list = aux_invites.indexOf(obj.connection);

    if (position_list !== -1) {
      aux_invites.splice(position_list, 1);

      aux_connections.map((item, i) => {
        if (item.id === obj.id) {
          item.invited = false;
        }
      });
    } else {
      aux_invites.push(obj.connection);

      aux_connections.map((item, i) => {
        if (item.id === obj.id) {
          item.invited = true;
        }
      });
    }

    setListInvites(aux_invites);
    setListConnections(aux_connections);

    setFetching(false);
  };

  const searchUsers = async (filter) => {
    setFetching(true);

    const user_filtered = list_aux_connections.filter((value) =>
      value.connection.name.toLowerCase().includes(filter.toLowerCase()),
    );
    setListConnections(user_filtered);

    setFetching(false);
  };

  const onChangeSearchText = (filter) => {
    setSearch(filter);
    searchUsers(filter);
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
    list_invites.splice(index, 1);
    setListAdminsModerators(aux_list_admins);

    setPermission(null);
    setUserSelected({});
    setIndex(null);
    setFlagAdmin(false);

    modalizeRef.current?.close();
  };

  const onRemove = (section, i) => {
    section === "rule" ? setRemove(0) : setRemove(1);
    setIndexRemove(i);

    RBSExit.current.open();
  };

  const doRemove = () => {
    if (remove) {
      let aux = [...tags];

      aux.splice(index_remove, 1);
      setTags(aux);
    } else {
      let aux = [...rules];

      aux.splice(index_remove, 1);
      setRules(aux);
    }

    RBSExit.current.close();
  };

  const removeConnection = () => {
    if (list_admins_moderators.includes(user_selected)) {
      list_admins_moderators.splice(index, 1);
    } else {
      list_invites.splice(index, 1);
    }

    setPermission(null);
    setUserSelected({});
    setIndex(null);
    setFlagAdmin(false);

    modalizeRef.current?.close();
  };

  return step === 1 ? (
    <View style={Default.container}>
      <ScrollView scrollEnabled>
        <Header showBackgroundImage />

        <Fetching isFetching={fetching}>
          <View style={styles.container}>
            {modal || modalSuccess ? (
              <BlurView
                style={styles.containerBlur}
                tint="dark"
                intensity={20}
              />
            ) : null}

            <SafeAreaView style={{ flex: 1 }}>
              <LinearGradient
                colors={["rgba(114, 198, 239, 0.3)", "rgba(0, 78, 143, 0.138)"]}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={styles.containerHeaderImage}
              >
                {communityPhoto ? (
                  <>
                    <TouchableOpacity
                      onPress={() => ASPhotoOptions.current.show()}
                      style={styles.communityImage}
                    >
                      <Image
                        source={{ uri: communityPhoto.url }}
                        style={styles.communityImage}
                        resizeMode="cover"
                      />
                      <View
                        style={{
                          flexDirection: "column",
                          alignSelf: "center",
                          alignItems: "center",
                          marginTop: 56,
                        }}
                      >
                        <Image
                          source={require("../../../assets/icons/add-photo.png")}
                          style={styles.communityPhoto}
                        />
                        <Text style={styles.textAddPhoto}>Edit Photo</Text>
                      </View>
                    </TouchableOpacity>
                  </>
                ) : (
                  <>
                    <TouchableOpacity
                      onPress={() => ASPhotoOptions.current.show()}
                      style={styles.containerPhoto}
                    >
                      <Image
                        source={require("../../../assets/icons/add-photo.png")}
                        style={styles.communityPhoto}
                      />
                      <Text style={styles.textAddPhoto}>Add Photo</Text>
                    </TouchableOpacity>
                  </>
                )}

                <TouchableOpacity
                  style={styles.backButton}
                  onPress={() => props.navigation.pop()}
                >
                  <Icon
                    type="font-awesome"
                    name="chevron-left"
                    size={18}
                    color="white"
                  />
                </TouchableOpacity>
              </LinearGradient>

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

              <View style={styles.containerTitle}>
                <Input
                  label="Name"
                  placeholder="Insert name"
                  value={name}
                  onChangeText={setName}
                  keyboardAppearance="dark"
                  autoFocus={false}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="email-address"
                  returnKeyType="next"
                  placeholderTextColor="#9CC6FF"
                  containerStyle={Default.containerStyle}
                  inputStyle={Default.loginInput}
                  inputContainerStyle={Default.loginInputContainer}
                  labelStyle={styles.textTitle}
                />
              </View>

              <View style={styles.containerBody}>
                <Text style={[styles.textTitle, { marginBottom: 16 }]}>
                  Description
                </Text>
                <LinearGradient
                  colors={[
                    "rgba(156, 198, 255, 0.042)",
                    "rgba(0, 37, 68, 0.15)",
                  ]}
                  start={{ x: 0, y: 0.5 }}
                  end={{ x: 1, y: 0.5 }}
                  style={styles.containerList}
                >
                  <View style={styles.infoCommunity}>
                    <TextInput
                      value={description}
                      multiline
                      onChangeText={setDescription}
                      keyboardAppearance="dark"
                      style={styles.textDescriptionStyle}
                      placeholder="Insert description..."
                      placeholderTextColor={"#9CC6FF"}
                    />
                  </View>
                </LinearGradient>

                <View style={styles.containerTitleOptions}>
                  <Text style={styles.textTitle}>Privacy</Text>
                </View>

                <TouchableOpacity onPress={() => setPrivacy(0)}>
                  <LinearGradient
                    colors={[
                      "rgba(156, 198, 255, 0.042)",
                      "rgba(0, 37, 68, 0.15)",
                    ]}
                    start={{ x: 0, y: 0.5 }}
                    end={{ x: 1, y: 0.5 }}
                    style={styles.containerOptionPrivacy}
                  >
                    <Text style={styles.textTitleSection}>Public</Text>
                    {privacy === 0 ? (
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
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => setPrivacy(1)}>
                  <LinearGradient
                    colors={[
                      "rgba(156, 198, 255, 0.042)",
                      "rgba(0, 37, 68, 0.15)",
                    ]}
                    start={{ x: 0, y: 0.5 }}
                    end={{ x: 1, y: 0.5 }}
                    style={styles.containerOptionPrivacy}
                  >
                    <Text style={styles.textTitleSection}>Private</Text>
                    {privacy === 1 ? (
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
                  </LinearGradient>
                </TouchableOpacity>

                <View style={styles.containerTitleOptions}>
                  <Text style={styles.textTitle}>Community Rules</Text>
                </View>

                <LinearGradient
                  colors={[
                    "rgba(156, 198, 255, 0.042)",
                    "rgba(0, 37, 68, 0.15)",
                  ]}
                  start={{ x: 0, y: 0.5 }}
                  end={{ x: 1, y: 0.5 }}
                  style={styles.containerOptionPrivacy}
                >
                  <Text style={styles.textTitleSection}>Add Rule</Text>
                  <Button
                    buttonStyle={styles.buttonRules}
                    titleStyle={styles.titleButtonRule}
                    onPress={() => {
                      setModal(!modal), setModalType("Rule");
                    }}
                    title={"New"}
                  />
                </LinearGradient>

                {rules.length > 0
                  ? rules.map((obj, i) => {
                    return (
                      <LinearGradient
                        key={i}
                        colors={[
                          "rgba(156, 198, 255, 0.042)",
                          "rgba(0, 37, 68, 0.15)",
                        ]}
                        start={{ x: 0, y: 0.5 }}
                        end={{ x: 1, y: 0.5 }}
                        style={styles.containerOptionPrivacy}
                      >
                        <Text style={styles.textTitleSection}>
                          {i + 1 + ". " + obj.title}
                        </Text>
                        <TouchableOpacity onPress={() => onRemove("rule", i)}>
                          <Image
                            source={require("../../../assets/icons/ellipse-vertical.png")}
                            style={styles.circleIcon}
                          />
                        </TouchableOpacity>
                      </LinearGradient>
                    );
                  })
                  : null}

                <View style={styles.containerTitleOptions}>
                  <Text style={styles.textTitle}>Community Tags</Text>
                </View>

                <LinearGradient
                  colors={[
                    "rgba(156, 198, 255, 0.042)",
                    "rgba(0, 37, 68, 0.15)",
                  ]}
                  start={{ x: 0, y: 0.5 }}
                  end={{ x: 1, y: 0.5 }}
                  style={styles.containerOptionPrivacy}
                >
                  <Text style={styles.textTitleSection}>Add Tag</Text>
                  <Button
                    buttonStyle={styles.buttonRules}
                    titleStyle={styles.titleButtonRule}
                    onPress={() => {
                      setModal(!modal), setModalType("Tag");
                    }}
                    title={"New"}
                  />
                </LinearGradient>

                {tags.length > 0
                  ? tags.map((obj, i) => {
                    return (
                      <LinearGradient
                        key={i}
                        colors={[
                          "rgba(156, 198, 255, 0.042)",
                          "rgba(0, 37, 68, 0.15)",
                        ]}
                        start={{ x: 0, y: 0.5 }}
                        end={{ x: 1, y: 0.5 }}
                        style={styles.containerOptionPrivacy}
                      >
                        <Text style={styles.textTitleSection}>
                          {obj.title}
                        </Text>
                        <TouchableOpacity onPress={() => onRemove("tag", i)}>
                          <Image
                            source={require("../../../assets/icons/ellipse-vertical.png")}
                            style={styles.circleIcon}
                          />
                        </TouchableOpacity>
                      </LinearGradient>
                    );
                  })
                  : null}

                <View style={[styles.containerButton, { marginTop: 41 }]}>
                  <Button
                    buttonStyle={styles.nextButton}
                    titleStyle={Default.loginButtonBoldTitle}
                    onPress={next}
                    title={"NEXT"}
                  />
                </View>
              </View>

              {modal || modalSuccess ? (
                <Pressable
                  onPress={() => setModal(!modal)}
                  style={styles.containerShadow}
                ></Pressable>
              ) : null}

              <RBSheet
                ref={RBSExit}
                height={350}
                openDuration={250}
                customStyles={{ container: styles.containerBottomSheet }}
                closeOnPressBack={false}
                closeOnPressMask={false}
              >
                <View style={styles.containerTextBottomSheet}>
                  <Image
                    style={styles.warningIconStyle}
                    source={require("../../../assets/icons/warning.png")}
                  />
                  <Text style={styles.textExit}>
                    Are you sure to remove this {remove ? "Tag ?" : "Rule ?"}
                  </Text>
                </View>

                <View style={styles.buttonContainer}>
                  <Button
                    buttonStyle={Default.loginNextButton}
                    titleStyle={Default.loginButtonBoldTitle}
                    onPress={doRemove}
                    title="REMOVE"
                  />

                  <TouchableOpacity
                    style={{ marginTop: 16 }}
                    onPress={() => RBSExit.current.close()}
                  >
                    <View style={{ alignItems: "center" }}>
                      <Text
                        style={[systemWeights.bold, styles.createAccountText]}
                      >
                        Cancel
                      </Text>
                    </View>
                  </TouchableOpacity>
                </View>
              </RBSheet>

              <Modal
                animationType="slide"
                transparent={true}
                visible={modal}
                onRequestClose={() => {
                  setModal(!modal), setTitle(""), setRuleDescription("");
                }}
              >
                <View style={styles.centeredView}>
                  <View style={styles.modalView}>
                    <TouchableOpacity
                      style={[styles.containerHeaderModal, { marginRight: 20 }]}
                      onPress={() => {
                        setModal(!modal), setTitle(""), setRuleDescription("");
                      }}
                    >
                      <Image
                        style={styles.imageModalHeader}
                        source={require("../../../assets/icons/close.png")}
                      />
                    </TouchableOpacity>

                    <View style={styles.containerSectionModal}>
                      <Input
                        label={modal_type === "Rule" ? "Rule Title" : "Tag Name"}
                        placeholder="Title"
                        value={title}
                        onChangeText={setTitle}
                        keyboardAppearance="dark"
                        autoFocus={false}
                        autoCapitalize="none"
                        autoCorrect={false}
                        keyboardType="email-address"
                        returnKeyType="next"
                        placeholderTextColor="#9CC6FF"
                        containerStyle={[Default.containerStyle]}
                        inputStyle={styles.modalInput}
                        inputContainerStyle={styles.modalInput}
                        labelStyle={styles.textLabelModal}
                      />
                    </View>

                    {modal_type === "Rule" ? (
                      <View style={styles.containerSectionModal}>
                        <Text style={styles.textLabelModal}>
                          Rule Description
                        </Text>
                        <TextInput
                          value={ruleDescription}
                          numberOfLines={4}
                          multiline
                          onChangeText={setRuleDescription}
                          keyboardAppearance="dark"
                          style={styles.textInputStyle}
                          placeholder="Description"
                          placeholderTextColor={"#9CC6FF"}
                        />
                      </View>
                    ) : null}

                    <View style={styles.containerSectionModal}>
                      <Button
                        buttonStyle={[styles.modalButton]}
                        titleStyle={Default.loginButtonBoldTitle}
                        onPress={modal_type === "Rule" ? addRule : addTag}
                        title={
                          modal_type === "Rule" ? "CREATE RULE" : "CREATE TAG"
                        }
                      />
                    </View>
                  </View>
                </View>
              </Modal>
              <Modal
                animationType="slide"
                transparent={true}
                visible={modalSuccess}
                onRequestClose={() => setModalSuccess(!modalSuccess)}
              >
                <View style={styles.centeredView}>
                  <View style={styles.modalView}>
                    <View style={styles.containerSectionSuccessModal}>
                      <TouchableOpacity
                        style={styles.containerHeaderModal}
                        onPress={() => setModalSuccess(!modalSuccess)}
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
                        <Text style={styles.typeCommunityText}>
                          {privacy === 0
                            ? "Public community"
                            : "Private community"}
                        </Text>
                      </LinearGradient>

                      <View style={styles.containerTextModal}>
                        <Text style={styles.textSuccessModal}>
                          Your community has
                        </Text>
                        <Text style={styles.textSuccessModal}>
                          been successfully created
                        </Text>
                      </View>

                      <TouchableOpacity
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          alignSelf: "center",
                          marginTop: 32,
                        }}
                        onPress={() => {
                          setModalSuccess(!modalSuccess), setStep(2);
                        }}
                      >
                        <Text style={styles.inviteText}>
                          Invite Your Friends
                        </Text>
                        <Image
                          style={[styles.imageModalHeader, { marginLeft: 13 }]}
                          source={require("../../../assets/icons/arrow-right.png")}
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </Modal>
            </SafeAreaView>
          </View>
        </Fetching>
      </ScrollView>
    </View>
  ) : step === 2 ? (
    <View style={[Default.container]}>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        refreshControl={
          <RefreshControl
            colors={["#fff"]}
            tintColor="#fff"
            onRefresh={() => fetchConnections(true, false, false)}
            refreshing={refreshing}
          />
        }
      >
        <Header navigation={props.navigation} showBackgroundImage />
        {
          !focusSearch ? (
            <View style={styles.containerActionsStep2}>
              <TouchableOpacity
                style={styles.backButtonStyleStep2}
                onPress={() => props.navigation.pop()}
              >
                <Icon
                  type="font-awesome"
                  name="chevron-left"
                  size={16}
                  color={"#FFFFFF"}
                />
              </TouchableOpacity>

              <View style={styles.titleInviteStep2}>
                <Text
                  style={styles.textUserHeaderNameStep2}
                  type="font-awesome"
                  name="chevron-left"
                  size={14}
                  color={Colors.text}
                >
                  Invite your Connections
                </Text>
              </View>
            </View>
          ) : null
          // <BlurView
          // 	style={styles.containerBlurStep2}
          // 	tint="dark"
          // 	intensity={60}
          // />
        }
        <View style={[styles.containerSearchStep2]}>
          <TextInputPaper
            keyboardAppearance="dark"
            onSubmitEditing={Keyboard.dismiss}
            returnKeyType="done"
            outlineColor="transparent"
            placeholder="Search"
            selectionColor="#9CC6FF"
            underlineColor="white"
            mode="outlined"
            style={styles.inputSearchStep2}
            onPressIn={() => setFocusSearch(true)}
            onBlur={() => setFocusSearch(search === "" ? false : true)}
            left={<TextInputPaper.Icon color={"white"} name="magnify" />}
            theme={inputSearchTheme}
            onChangeText={(e) => onChangeSearchText(e)}
            blurOnSubmit={false}
          />
        </View>

        <Fetching isFetching={fetching}>
          {list_connections.length > 0 ? (
            <View style={[styles.containerStep2]}>
              <View style={styles.innerContainerStep2}>
                <View style={styles.containerConnectionStep2}>
                  <Text style={styles.textConnectionStep2}>
                    {focusSearch ? "Search result" : "Connections"}
                  </Text>
                </View>
                {list_connections.map((obj, i) => {
                  return (
                    <View key={i} style={[styles.containerGroupStep2]}>
                      <LinearGradient
                        colors={[
                          "rgba(156, 198, 255, 0.042)",
                          "rgba(0, 37, 68, 0.15)",
                        ]}
                        start={{ x: 0, y: 0.5 }}
                        end={{ x: 1, y: 0.5 }}
                        style={[styles.containerPostStep2]}
                      >
                        <View style={styles.containerItemConnectionStep2}>
                          {obj.connection?.image ? (
                            <Image
                              source={{ uri: obj.connection?.image.url }}
                              style={styles.userPhotoStep2}
                            />
                          ) : (
                            <Image
                              source={require("../../../assets/images/no-profile.png")}
                              style={styles.userPhotoStep2}
                            />
                          )}
                          <Text style={styles.textUserNameStep2}>
                            {obj.connection.name}
                          </Text>
                          {obj.invited ? (
                            <Button
                              buttonStyle={[
                                styles.connectionButtonStep2,
                                { backgroundColor: Colors.primary3 },
                              ]}
                              titleStyle={styles.textButtonConnectStep2}
                              onPress={() => handleConnect(obj, i)}
                              title={"Undo"}
                            />
                          ) : (
                            <Button
                              buttonStyle={styles.connectionButtonStep2}
                              titleStyle={styles.textButtonConnectStep2}
                              onPress={() => handleConnect(obj, i)}
                              title={"Invite"}
                            />
                          )}
                        </View>
                      </LinearGradient>
                    </View>
                  );
                })}
              </View>
            </View>
          ) : (
            <View style={styles.containerNotConnectionsStep2}>
              <Text style={styles.textNoPeopleToConnectStep2}>
                No contacts in live timeless.
              </Text>
            </View>
          )}
          <View style={styles.containerButtonStep2}>
            <Button
              buttonStyle={Default.loginNextButton}
              titleStyle={Default.loginButtonBoldTitle}
              onPress={() => setStep(3)}
              title={"Next"}
            />
          </View>
        </Fetching>
      </ScrollView>
    </View>
  ) : step === 3 ? (
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
          <View style={styles.containerActionsStep3}>
            <TouchableOpacity
              style={styles.backButtonStyleStep3}
              onPress={() => setStep(2)}
            >
              <Icon
                type="font-awesome"
                name="chevron-left"
                size={16}
                color={"#FFFFFF"}
              />
            </TouchableOpacity>

            <View style={styles.titleInviteStep3}>
              <Text
                style={styles.textUserHeaderNameStep3}
                type="font-awesome"
                name="chevron-left"
                size={14}
                color={Colors.text}
              >
                Community Permissions
              </Text>
            </View>
          </View>

          {modalSuccess ? (
            <>
              <BlurView
                style={styles.containerBlurStep3}
                tint="dark"
                intensity={60}
              />
              <View
                onPress={() => setModal(!modal)}
                style={styles.containerShadowStep3}
              ></View>
            </>
          ) : null}

          {list_admins_moderators.length > 0 ? (
            <View style={styles.containerStep3}>
              <View style={styles.innerContainerStep3}>
                <View style={styles.containerConnectionStep3}>
                  <Text style={styles.textConnectionStep3}>
                    Admins and Moderatos
                  </Text>
                </View>
                {list_admins_moderators.map((obj, i) => {
                  return (
                    <View key={i} style={styles.containerGroupStep3}>
                      <LinearGradient
                        colors={[
                          "rgba(156, 198, 255, 0.042)",
                          "rgba(0, 37, 68, 0.15)",
                        ]}
                        start={{ x: 0, y: 0.5 }}
                        end={{ x: 1, y: 0.5 }}
                        style={styles.containerUserStep3}
                      >
                        <View style={styles.containerItemConnectionStep3}>
                          {obj.image ? (
                            <Image
                              source={{ uri: obj.image?.url }}
                              style={styles.userPhotoStep3}
                            />
                          ) : (
                            <Image
                              source={require("../../../assets/images/no-profile.png")}
                              style={styles.userPhotoStep3}
                            />
                          )}
                          <View
                            style={{
                              flex: 1,
                              flexDirection: "column",
                              justifyContent: "flex-start",
                            }}
                          >
                            <Text style={styles.textUserNameStep3}>
                              {obj.name}
                            </Text>
                            <Text style={styles.textSubtitleStep3}>
                              {obj.permission === 0 ? "Admin" : "Moderator"}
                            </Text>
                          </View>
                          <TouchableOpacity
                            onPress={() => onChangePermission(obj, i, true)}
                          >
                            <Image
                              source={require("../../../assets/icons/ellipse-vertical.png")}
                              style={styles.circleIconStep3}
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

          {list_invites.length > 0 ? (
            <View style={styles.containerStep3}>
              <View style={styles.innerContainerStep3}>
                <View style={styles.containerConnectionStep3}>
                  <Text style={styles.textConnectionStep3}>Connections</Text>
                </View>
                {list_invites.map((obj, i) => {
                  return (
                    <View key={i} style={styles.containerGroupStep3}>
                      <LinearGradient
                        colors={[
                          "rgba(156, 198, 255, 0.042)",
                          "rgba(0, 37, 68, 0.15)",
                        ]}
                        start={{ x: 0, y: 0.5 }}
                        end={{ x: 1, y: 0.5 }}
                        style={[styles.containerUserStep3]}
                      >
                        <View style={styles.containerItemConnectionStep3}>
                          {obj.image ? (
                            <Image
                              source={{ uri: obj.image?.url }}
                              style={styles.userPhotoStep3}
                            />
                          ) : (
                            <Image
                              source={require("../../../assets/images/no-profile.png")}
                              style={styles.userPhotoStep3}
                            />
                          )}
                          <Text style={styles.textUserNameStep3}>
                            {obj.name}
                          </Text>
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
          <View style={[styles.containerButtonStep3, { marginTop: 17 }]}>
            <Button
              buttonStyle={Default.loginNextButton}
              titleStyle={Default.loginButtonBoldTitle}
              onPress={createCommunity}
              title={"CREATE COMMUNITY"}
              loading={loading}
            />
          </View>
        </Fetching>
      </ScrollView>

      <Modalize
        ref={modalizeRef}
        snapPoint={570}
        modalStyle={styles.modalizeStep3}
        handlePosition={"inside"}
        modalHeight={420}
        handleStyle={{ backgroundColor: "white", marginTop: 10 }}
      >
        <LinearGradient
          colors={["rgba(156, 198, 255, 0.084)", "rgba(0, 37, 68, 0.3)"]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={styles.containerModalStep3}
        >
          <View style={styles.containerTitleModalStep3}>
            {user_selected.image ? (
              <Image
                source={{ uri: user_selected.image?.url }}
                style={styles.userPhotoModalStep3}
              />
            ) : (
              <Image
                source={require("../../../assets/images/no-profile.png")}
                style={styles.userPhotoModalStep3}
              />
            )}
            <Text style={styles.textNameStep3}>{user_selected.name}</Text>
          </View>

          <View style={styles.containerReportStep3}>
            <TouchableOpacity
              onPress={() => handleChangePermission(0)}
              style={styles.containerOptionPrivacyStep3}
            >
              <Text style={styles.textTitleSectionStep3}>ADD AS ADMIN</Text>
              {permission === 0 ? (
                <Image
                  source={require("../../../assets/icons/circle-selected.png")}
                  style={styles.circleIconStep3}
                />
              ) : (
                <Image
                  source={require("../../../assets/icons/circle.png")}
                  style={styles.circleIconStep3}
                />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleChangePermission(1)}
              style={styles.containerOptionPrivacyStep3}
            >
              <Text style={styles.textTitleSectionStep3}>ADD AS MODERATOR</Text>
              {permission === 1 ? (
                <Image
                  source={require("../../../assets/icons/circle-selected.png")}
                  style={styles.circleIconStep3}
                />
              ) : (
                <Image
                  source={require("../../../assets/icons/circle.png")}
                  style={styles.circleIconStep3}
                />
              )}
            </TouchableOpacity>

            <View style={styles.containerButtonStep3}>
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
        visible={modalSuccess}
        onRequestClose={() => {
          setModalSuccess(!modalSuccess),
            props.navigation.push("FeedCommunity", {
              community: { id: community.id },
            });
        }}
      >
        <View style={styles.centeredViewStep3}>
          <View style={styles.modalViewStep3}>
            <View style={styles.containerSectionSuccessModalStep3}>
              <TouchableOpacity
                style={styles.containerHeaderModalStep3}
                onPress={() => {
                  setModalSuccess(!modalSuccess),
                    props.navigation.push("FeedCommunity", {
                      community: { id: community.id },
                    });
                }}
              >
                <Image
                  style={styles.imageModalHeaderStep3}
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
                style={styles.typeCommunityStep3}
              >
                <Image
                  source={require("../../../assets/icons/icon-privacy.png")}
                  style={styles.headerIconStep3}
                />
                <Text style={styles.typeCommunityTextStep3}>
                  {privacy === 0 ? "Public community" : "Private community"}
                </Text>
              </LinearGradient>

              <View style={styles.containerTextModalStep3}>
                <Text style={styles.textSuccessModalStep3}>
                  Your community has been successfully created
                </Text>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  ) : null;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: Dimensions.get("window").width,
    zIndex: 1,
    elevation: 1,
    marginTop: -58,
  },
  containerBody: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "flex-start",
    paddingHorizontal: 24,
    zIndex: 4,
    elevation: 4,
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
  containerHeaderImage: {
    height: 189,
    flex: 1,
    justifyContent: "flex-end",
    width: Dimensions.get("window").width,
    zIndex: 0,
    elevation: 0,
  },
  containerPhoto: {
    flex: 1,
    flexDirection: "column",
    alignSelf: "center",
    justifyContent: "flex-start",
    alignItems: "center",
    zIndex: 3,
    elevation: 3,
    marginTop: 56,
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
  communityPhoto: {
    width: 50,
    height: 50,
  },
  circleIcon: {
    width: 26,
    height: 26,
  },
  containerTitle: {
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  containerTitleOptions: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#264261",
    width: Dimensions.get("window").width - 48,
    paddingBottom: 16,
    marginBottom: 16,
  },
  containerHeaderModal: {
    flexDirection: "row",
    alignSelf: "flex-end",
    marginBottom: 12,
  },
  containerList: {
    marginBottom: 24,
    paddingHorizontal: 12,
    paddingTop: 12,
    backgroundColor: "rgba(0, 37, 68, 0.15)",
    width: Dimensions.get("window").width - 48,
    borderRadius: 8,
  },
  containerOptionPrivacy: {
    marginBottom: 8,
    paddingLeft: 16,
    paddingRight: 22,
    paddingVertical: 24,
    backgroundColor: "rgba(0, 37, 68, 0.15)",
    width: Dimensions.get("window").width - 48,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  containerButton: {
    justifyContent: "flex-end",
    alignItems: "center",
    marginBottom: 16,
  },
  containerSectionModal: {
    alignSelf: "center",
    width: Dimensions.get("window").width - 80,
    zIndex: 5,
    elevation: 5,
  },
  containerSectionSuccessModal: {
    alignSelf: "center",
    width: Dimensions.get("window").width - 76,
  },
  centeredView: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    //paddingHorizontal: 16,
    //paddingVertical: 32,
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
  buttonContainer: {
    marginBottom: 30,
    alignItems: "center",
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
  createAccountText: {
    fontSize: 14,
    color: "white",
  },
  warningIconStyle: {
    width: 80,
    height: 80,
  },
  textExit: {
    marginTop: 26,
    fontSize: 14,
    color: Colors.text,
  },
  containerTextModal: {
    alignContent: "center",
  },
  textInputStyle: {
    color: Colors.primary4,
    borderColor: "#455c8a",
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 2,
    fontSize: 16,
    paddingHorizontal: 12,
    paddingTop: 13,
    height: 96,
    backgroundColor: Colors.primary,
    textAlignVertical: "top",
    marginBottom: 26,
    marginTop: 12,
  },
  textDescriptionStyle: {
    color: Colors.text,
    textAlignVertical: "top",
  },
  nextButton: {
    height: 64,
    borderRadius: 4,
    backgroundColor: "#982538",
    width: Dimensions.get("window").width - 48,
  },
  modalButton: {
    height: 56,
    borderRadius: 4,
    backgroundColor: "#982538",
  },
  modalInput: {
    borderColor: "#455c8a",
    color: Colors.primary4,
    fontSize: 16,
    width: Dimensions.get("window").width - 80,
  },
  buttonRules: {
    height: 32,
    borderRadius: 4,
    backgroundColor: "rgba(0, 75, 125, 1)",
    width: 96,
    alignItems: "flex-start",
    paddingVertical: 7,
  },
  headerIcon: {
    width: 18,
    height: 18,
    marginRight: 3,
  },
  titleButtonRule: {
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 18,
  },
  inviteText: {
    fontSize: 16,
    fontWeight: "700",
    lineHeight: 24,
    color: Colors.primary8,
  },
  backButton: {
    marginLeft: 25,
    marginTop: 69,
    width: 60,
    flexDirection: "row",
    justifyContent: "flex-start",
    top: 0,
    zIndex: 3,
    elevation: 3,
    position: "absolute",
  },
  addPhoto: {
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
  imageModalHeader: {
    width: 24,
    resizeMode: "contain",
    height: 24,
  },
  typeCommunity: {
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "center",
    borderRadius: 4,
    padding: 9,
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
  textLabelModal: {
    fontSize: 16,
    fontWeight: "400",
    lineHeight: 16,
    color: Colors.text,
  },
  textSuccessModal: {
    textAlign: "center",
    fontSize: 24,
    fontWeight: "700",
    lineHeight: 33,
    color: Colors.text,
  },
  containerHeader: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 18,
    marginTop: 16,
  },
  infoCommunity: {
    height: 96,
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
    lineHeight: 21,
    color: "#FFFFFF",
  },
  textTitle: {
    fontWeight: "700",
    fontSize: 20,
    lineHeight: 30,
    color: "#FCFCFC",
  },
  textAddPhoto: {
    fontWeight: "400",
    fontSize: 16,
    lineHeight: 19,
    color: "#FCFCFC",
    marginTop: 8,
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
  containerStep2: {
    flexDirection: "column",
    flex: 1,
    alignItems: "center",
    width: Dimensions.get("window").width,
    paddingHorizontal: 16,
    zIndex: 0,
    elevation: 0,
  },
  innerContainerStep2: {
    flexDirection: "column",
    flex: 1,
    alignItems: "center",
  },
  containerActionsStep2: {
    flexDirection: "row",
    width: Dimensions.get("window").width - 48,
  },
  containerBlurStep2: {
    flex: 1,
    zIndex: 1,
    elevation: 1,
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  },
  containerButtonStep2: {
    flex: 1,
    justifyContent: "flex-end",
    marginBottom: 32,
    marginTop: 41,
    alignItems: "center",
  },
  containerGroupStep2: {
    flexDirection: "row",
    marginBottom: 8,
    justifyContent: "space-between",
    alignItems: "center",
  },
  containerPostStep2: {
    flex: 1,
    width: Dimensions.get("window").width - 48,
    backgroundColor: "rgba(156, 198, 255, 0.042)",
    borderRadius: 8,
    paddingHorizontal: 16,
  },
  containerConnectionStep2: {
    width: Dimensions.get("window").width - 32,
    borderBottomColor: "#264261",
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingBottom: 16,
    marginBottom: 16,
  },
  containerNotConnectionsStep2: {
    marginTop: 16,
    alignSelf: "center",
  },
  textConnectionStep2: {
    fontSize: 16,
    lineHeight: 16,
    width: 128,
    height: 16,
    fontWeight: "bold",
    color: Colors.text,
    width: Dimensions.get("window").width - 44,
  },
  titleInviteStep2: {
    flex: 1,
    flexDirection: "column",
    alignSelf: "flex-start",
    alignItems: "center",
  },
  textNoPeopleToConnectStep2: {
    fontSize: 16,
    lineHeight: 16,
    fontWeight: "400",
    color: Colors.text,
  },
  containerItemConnectionStep2: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
  },
  textUserNameStep2: {
    flex: 1,
    fontSize: 16,
    lineHeight: 16,
    fontWeight: "700",
    color: Colors.text,
  },
  userPhotoStep2: {
    width: 32,
    height: 32,
    borderRadius: 32,
    marginRight: 8,
  },
  containerSearchStep2: {
    flexDirection: "row",
    width: Dimensions.get("window").width - 32,
    alignSelf: "center",
    marginBottom: 16,
  },
  inputSearchStep2: {
    flex: 1,
    fontSize: 16,
    lineHeight: 16,
    backgroundColor: "#002544",
    borderRadius: 8,
  },
  backButtonStyleStep2: {
    width: 50,
    height: 50,
    marginTop: 5,
    marginLeft: 24,
    marginBottom: -22,
    alignSelf: "flex-start",
  },
  textUserHeaderNameStep2: {
    color: Colors.text,
    fontWeight: "400",
    fontSize: 20,
    lineHeight: 27,
  },
  connectionButtonStep2: {
    borderRadius: 8,
    backgroundColor: "#004B7D",
    width: 96,
    paddingVertical: 7,
    paddingHorizontal: 16,
  },
  textButtonConnectStep2: {
    color: "#FCFCFC",
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 18,
  },

  containerStep3: {
    flexDirection: "column",
    flex: 1,
    alignItems: "center",
    width: Dimensions.get("window").width,
    paddingHorizontal: 16,
    zIndex: 1,
    elevation: 1,
  },
  innerContainerStep3: {
    flexDirection: "column",
    flex: 1,
    alignItems: "center",
    marginBottom: 24,
  },
  containerActionsStep3: {
    flexDirection: "row",
    width: Dimensions.get("window").width - 48,
    marginTop: 0,
    marginBottom: 16,
  },
  containerBlurStep3: {
    zIndex: 1,
    elevation: 1,
    position: "absolute",
    left: 0,
    bottom: 0,
    right: 0,
    marginTop: -3,
  },
  containerButtonStep3: {
    flex: 1,
    justifyContent: "flex-end",
    marginBottom: 32,
    alignItems: "center",
  },
  containerShadowStep3: {
    backgroundColor: "rgba(0,0,0,0.6)",
    zIndex: 5,
    elevation: 5,
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  },
  containerOptionPrivacyStep3: {
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
  containerTitleModalStep3: {
    flex: 1,
    alignSelf: "center",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 40,
    width: Dimensions.get("window").width - 48,
    paddingBottom: 16,
  },
  textNameStep3: {
    fontSize: 24,
    color: Colors.text,
    fontWeight: "400",
    alignSelf: "center",
    lineHeight: 32,
    marginTop: 8,
  },
  centeredViewStep3: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
  modalViewStep3: {
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
  containerTextModalStep3: {
    alignContent: "center",
  },
  containerSectionSuccessModalStep3: {
    alignSelf: "center",
    width: Dimensions.get("window").width - 76,
  },
  containerHeaderModalStep3: {
    flexDirection: "column",
    justifyContent: "center",
    alignSelf: "flex-end",
    marginLeft: 24,
  },
  containerModalStep3: {
    flex: 1,
    flexDirection: "column",
  },
  containerReportStep3: {
    flexDirection: "column",
    marginHorizontal: 24,
  },
  containerGroupStep3: {
    flexDirection: "row",
    marginBottom: 8,
    justifyContent: "space-between",
    alignItems: "center",
  },
  containerUserStep3: {
    flex: 1,
    width: Dimensions.get("window").width - 48,
    backgroundColor: "rgba(156, 198, 255, 0.042)",
    borderRadius: 8,
    paddingHorizontal: 16,
  },
  containerConnectionStep3: {
    width: Dimensions.get("window").width - 32,
    borderBottomColor: "#264261",
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingBottom: 16,
    marginBottom: 16,
  },
  modalizeStep3: {
    backgroundColor: "rgba(0, 37, 68, 0.8)",
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  containerNotConnectionsStep3: {
    marginTop: 16,
    alignSelf: "center",
  },
  textSuccessModalStep3: {
    textAlign: "center",
    fontSize: 24,
    fontWeight: "700",
    lineHeight: 33,
    color: Colors.text,
  },
  typeCommunityStep3: {
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "center",
    borderRadius: 4,
    padding: 9,
  },
  headerIconStep3: {
    width: 18,
    height: 18,
    marginRight: 3,
  },
  textSubtitleStep3: {
    fontSize: 10,
    lineHeight: 16,
    width: 93,
    height: 16,
    color: Colors.text,
  },
  imageModalHeaderStep3: {
    width: 24,
    resizeMode: "contain",
    height: 24,
  },
  typeCommunityTextStep3: {
    fontWeight: "600",
    fontSize: 13,
    lineHeight: 16,
    color: "#FCFCFC",
  },
  textConnectionStep3: {
    fontSize: 16,
    lineHeight: 16,
    width: 128,
    height: 16,
    fontWeight: "bold",
    color: Colors.text,
    width: Dimensions.get("window").width - 44,
  },
  circleIconStep3: {
    width: 26,
    height: 26,
  },
  textTitleSectionStep3: {
    fontWeight: "700",
    fontSize: 16,
    lineHeight: 16,
    color: Colors.text,
  },
  titleInviteStep3: {
    flex: 1,
    flexDirection: "column",
    alignSelf: "flex-start",
    alignItems: "center",
  },
  textNoPeopleToConnectStep3: {
    fontSize: 16,
    lineHeight: 16,
    fontWeight: "400",
    color: Colors.text,
  },
  containerItemConnectionStep3: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
  },
  textUserNameStep3: {
    flex: 1,
    fontSize: 16,
    lineHeight: 16,
    fontWeight: "700",
    color: Colors.text,
  },
  userPhotoStep3: {
    width: 32,
    height: 32,
    borderRadius: 32,
    marginRight: 8,
  },
  userPhotoModalStep3: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  inputSearchStep3: {
    flex: 1,
    fontSize: 16,
    lineHeight: 16,
    backgroundColor: "#002544",
    borderRadius: 8,
  },
  backButtonStyleStep3: {
    width: 50,
    height: 50,
    marginTop: 5,
    marginLeft: 24,
    marginBottom: -22,
    alignSelf: "flex-start",
  },
  textUserHeaderNameStep3: {
    color: Colors.text,
    fontWeight: "400",
    fontSize: 20,
    lineHeight: 27,
  },
});

export default CreateCommunity;
