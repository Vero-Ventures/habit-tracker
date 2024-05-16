import React, { useState, useEffect } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  Dimensions,
  Text,
  Alert,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import Default from "../../../assets/styles/Default";
import Colors from "../../../assets/styles/Colors";
import Fetching from "../../components/Fetching";
import Icon from "react-native-vector-icons/FontAwesome5";
import { LinearGradient } from "expo-linear-gradient";
import { getPost, updatePost } from "../../store/ducks/post";
import { Platform } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { TextInput } from "react-native-paper";
import { Button } from "react-native-elements";
import { systemWeights } from "react-native-typography";

const EditPost = (props) => {
  const [fetching, setFetching] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [post, setPost] = useState({});

  useEffect(() => {
    fetchPost(true, false);
  }, [props]);

  const fetchPost = (is_fetching, is_refresh) => {
    is_refresh ? setRefreshing(true) : is_fetching ? setFetching(true) : null;

    getPost(props.route.params.post.id)
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
            setPost(res.data);
          }
        }
      })
      .finally(() => {
        setFetching(false);
        setRefreshing(false);
      });
  };

  const onSavePressed = () => {
    setSaving(true);

    const formData = new FormData();

    formData.append("copText", post.cop_text);

    updatePost(props.route.params.post.id, formData)
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
            Alert.alert("Success!", "Post changed!");
            props.navigation.pop();
          }
        }
      })
      .finally(() => {
        setSaving(false);
      });
  };

  const renderData = () => {
    return (
      <>
        <View style={styles.infoCommunity}>
          <LinearGradient
            colors={["rgba(156, 198, 255, 0.042)", "rgba(0, 37, 68, 0.15)"]}
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
                  paddingHorizontal: 16,
                }}
              >
                <TextInput
                  value={post.cop_text}
                  multiline
                  onChangeText={(text) => setPost({ ...post, cop_text: text })}
                  keyboardAppearance="dark"
                  theme={{
                    colors: {
                      placeholder: "white",
                      text: "white",
                      primary: "white",
                      underlineColor: "transparent",
                    },
                  }}
                  style={styles.inputPost}
                  placeholder="Write something..."
                  placeholderTextColor={"#9CC6FF"}
                />
              </View>
            </View>
          </LinearGradient>
        </View>
      </>
    );
  };

  return (
    <KeyboardAwareScrollView
      extraScrollHeight={150}
      style={{ backgroundColor: Colors.background }}
    >
      <View style={Default.container}>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          refreshControl={
            <RefreshControl
              colors={["#fff"]}
              tintColor="#fff"
              onRefresh={() => fetchPost(false, true)}
              refreshing={refreshing}
            />
          }
        >
          <Fetching isFetching={fetching || saving}>
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

              <Text
                style={styles.textUserHeaderName}
                type="font-awesome"
                size={14}
                color={Colors.text}
              >
                Edit post
              </Text>
            </View>
            {post ? (
              Platform.OS === "android" ? (
                <LinearGradient
                  colors={[
                    "rgba(156, 198, 255, 0.042)",
                    "rgba(0, 37, 68, 0.15)",
                  ]}
                  start={{ x: 0, y: 0.5 }}
                  end={{ x: 1, y: 0.5 }}
                  style={[styles.containerList]}
                >
                  {renderData()}
                </LinearGradient>
              ) : (
                <View style={[styles.containerList]}>{renderData()}</View>
              )
            ) : null}

            <View style={styles.buttonContainer}>
              <Button
                disabled={saving}
                buttonStyle={Default.loginNextButton}
                titleStyle={Default.loginButtonBoldTitle}
                onPress={onSavePressed}
                title="SAVE"
                disabledStyle={Default.loginNextButton}
              />

              <TouchableOpacity
                disabled={saving}
                style={{ marginTop: 16 }}
                onPress={() => props.navigation.pop()}
              >
                <View style={{ alignItems: "center" }}>
                  <Text style={[systemWeights.bold, { color: "#9CC6FF" }]}>
                    Back
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </Fetching>
        </ScrollView>
      </View>
    </KeyboardAwareScrollView>
  );
};

const styles = StyleSheet.create({
  containerActions: {
    flexDirection: "column",
    marginBottom: 16,
    marginTop: 32,
  },
  backButtonStyle: {
    marginLeft: 16,
    width: 40,
    alignSelf: "flex-start",
    marginBottom: -23,
  },
  closeAttachment: {
    position: "absolute",
    alignSelf: "flex-end",
    width: 24,
    height: 24,
    marginRight: 16,
    right: 0,
    marginTop: 16,
  },
  inputPost: {
    fontSize: 16,
    color: Colors.white,
    width: "100%",
    lineHeight: 16,
    backgroundColor: "transparent",
    alignSelf: "center",
  },
  containerSendPost: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    borderBottomColor: "#264261",
    borderBottomWidth: StyleSheet.hairlineWidth,
    width: Dimensions.get("window").width,
    marginBottom: 16,
    paddingVertical: 16,
  },
  containerGradientSendPost: {
    marginBottom: 8,
    zIndex: 1,
    elevation: 1,
    backgroundColor:
      Platform.OS === "ios" ? "rgba(0, 37, 68, 0.75)" : "transparent",
    width: Dimensions.get("window").width,
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
  textUserHeaderName: {
    color: Colors.text,
    fontWeight: "400",
    fontSize: 20,
    lineHeight: 27,
    alignSelf: "center",
  },
  file: {
    alignSelf: "center",
    width: Dimensions.get("window").width,
    height: 230,
  },
  containerList: {
    marginBottom: 8,
    paddingTop: 16,
    backgroundColor:
      Platform.OS === "ios" ? "rgba(0, 37, 68, 0.75)" : "transparent",
    width: Dimensions.get("window").width,
  },
  infoCommunity: {
    marginBottom: 21,
  },
  containerItemPost: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 14,
    marginHorizontal: 16,
  },
  textCounter: {
    fontWeight: "500",
    fontSize: 12,
    lineHeight: 18,
    color: "#FFFFFF",
    //marginLeft: 7,
  },
  removeAttachment: {
    width: "100%",
    height: "100%",
    alignItems: "flex-start",
    resizeMode: "contain",
  },
  userPhoto: {
    width: 32,
    height: 32,
    borderRadius: 32,
    marginRight: 12,
  },
  containerActionsPost: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignSelf: "center",
    width: Dimensions.get("window").width - 74,
    marginBottom: 19,
  },
  actionsIcons: {
    width: 24,
    height: 24,
    marginRight: 4,
    alignSelf: "center",
    left: 0,
  },
  buttonContainer: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
});

export default EditPost;
