import React, { useState, useEffect } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  Dimensions,
  Text,
  ActivityIndicator,
  Image,
  Alert,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import Default from "../../../assets/styles/Default";
import Colors from "../../../assets/styles/Colors";
import Fetching from "../../components/Fetching";
import { Button } from "react-native-elements";
import Icon from "react-native-vector-icons/FontAwesome5";
import {
  getSettings,
  updateAutomaticPublish as updateSettings,
} from "../../store/ducks/community";
import { useSelector } from "react-redux";
import { LinearGradient } from "expo-linear-gradient";

const SettingsCommunity = (props) => {
  const user = useSelector(({ user }) => user);

  const [fetching, setFetching] = useState(false);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [community_id, setCommunityId] = useState(null);
  const [publish_automatic, setPublishAutomatic] = useState(false);

  useEffect(() => {
    fetchSettings(false, true);
  }, [props]);

  const fetchSettings = async (isRefresh, is_fetching) => {
    isRefresh ? setRefreshing(true) : is_fetching ? setFetching(true) : null;

    setCommunityId(props.route.params.community.id);

    getSettings(props.route.params.community.id)
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
            setPublishAutomatic(res.data.cme_automatic_posting);
          }
        }
      })
      .finally(() => {
        setRefreshing(false);
        setFetching(false);
      });
  };

  const onChangeSettings = () => {
    setLoading(true);

    updateSettings(community_id, { cme_automatic_posting: publish_automatic })
      .catch((err) => {
        Alert.alert(
          "Ops!",
          "Something went wrong with our servers. Please contact us.",
        );
        setLoading(false);
      })
      .then((res) => {
        if (res?.status === 200) {
          if (res.data.errors) {
            Alert.alert("Ops!", res.data.errors[0]);
          } else {
            setPublishAutomatic(res.data.cme_automatic_posting);
            Alert.alert("Success", "Your settings was successfully updated!");
          }
        }
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <View style={Default.container}>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        refreshControl={
          <RefreshControl
            colors={["#fff"]}
            tintColor="#fff"
            onRefresh={() => fetchSettings(true, false)}
            refreshing={refreshing}
          />
        }
      >
        <Fetching isFetching={fetching}>
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
              name="chevron-left"
              size={14}
              color={Colors.text}
            >
              Settings
            </Text>
          </View>

          <View style={styles.container}>
            <View style={styles.containerSettings}>
              <Text style={styles.text}>Posting</Text>
            </View>
            <TouchableOpacity
              style={styles.containerGroup}
              onPress={() => setPublishAutomatic(1)}
            >
              <LinearGradient
                colors={["rgba(156, 198, 255, 0.042)", "rgba(0, 37, 68, 0.15)"]}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={styles.containerGradient}
              >
                <View style={styles.containerItem}>
                  {publish_automatic ? (
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
                  <Text style={styles.textInfo}>
                    I want to automatically publish my actions on the community
                    timeline.
                  </Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.containerGroup}
              onPress={() => setPublishAutomatic(0)}
            >
              <LinearGradient
                colors={["rgba(156, 198, 255, 0.042)", "rgba(0, 37, 68, 0.15)"]}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={styles.containerGradient}
              >
                <View style={styles.containerItem}>
                  {!publish_automatic ? (
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
                  <Text style={styles.textInfo}>
                    I don't want to automatically publish my actions on the
                    community timeline.
                  </Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </View>
          <View style={styles.containerButton}>
            <Button
              buttonStyle={Default.loginNextButton}
              titleStyle={Default.loginButtonBoldTitle}
              loading={loading}
              onPress={onChangeSettings}
              title="SAVE"
            />
          </View>
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
  },
  containerActions: {
    flexDirection: "column",
    marginBottom: 16,
    marginTop: 32,
    height: 26,
  },
  textInfo: {
    flex: 1,
    fontSize: 14,
    color: Colors.text,
    fontWeight: "400",
    lineHeight: 21,
  },
  containerButton: {
    marginTop: 60,
    marginBottom: 22,
    alignSelf: "center",
  },
  containerGroup: {
    marginBottom: 8,
    width: Dimensions.get("window").width - 48,
  },
  containerGradient: {
    flex: 1,
    width: Dimensions.get("window").width - 48,
    borderRadius: 8,
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  containerSettings: {
    width: Dimensions.get("window").width - 48,
    borderBottomColor: "#264261",
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingBottom: 16,
    marginBottom: 16,
  },
  text: {
    fontSize: 16,
    lineHeight: 16,
    width: 128,
    height: 16,
    fontWeight: "bold",
    color: Colors.text,
  },
  circleIcon: {
    width: 32,
    height: 32,
    marginRight: 8,
  },
  containerItem: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
  },
  backButtonStyle: {
    marginLeft: 24,
    alignSelf: "flex-start",
    marginBottom: -23,
  },
  textUserHeaderName: {
    color: Colors.text,
    fontWeight: "400",
    fontSize: 20,
    lineHeight: 27,
    alignSelf: "center",
  },
});

export default SettingsCommunity;
