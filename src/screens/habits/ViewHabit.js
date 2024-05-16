import React, { useState, useEffect, useRef } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  Dimensions,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
} from "react-native";
import Default from "../../../assets/styles/Default";
import Colors from "../../../assets/styles/Colors";
import Fetching from "../../components/Fetching";
import Header from "../../components/Header";
import Icon from "react-native-vector-icons/FontAwesome5";
import { Button } from "react-native-elements";
import { getUserHabit } from "../../store/ducks/habit";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import RBSheet from "react-native-raw-bottom-sheet";
import moment from "moment";
import { deleteUserHabit, toggleUserHabit } from "../../store/ducks/habit";
import { systemWeights } from "react-native-typography";
import { LinearGradient } from "expo-linear-gradient";

const ViewHabit = (props) => {
  const [fetching, setFetching] = useState(false);
  const [loading_delete, setLoadingDelete] = useState(false);
  const [loading_disable, setLoadingDisable] = useState(false);
  const [user_habit, setUserHabit] = useState(null);
  const [habitPhoto, setHabitPhoto] = useState(null);

  const RBSDelete = useRef();

  useEffect(() => {
    fetchAllData();
  }, []);

  useEffect(() => {
    const unsubscribe = props.navigation.addListener("focus", () => {
      fetchAllData();
    });

    return unsubscribe;
  }, [props.navigation, fetchAllData]);

  const fetchAllData = async () => {
    setFetching(true);

    await getUserHabit(props.route.params.user_habit_id)
      .catch((err) => {
        Alert.alert(
          "Ops!",
          "Something went wrong with our servers. Please contact us.",
        );
      })
      .then((res) => {
        if (res?.status === 200) {
          res.data.ush_frequency = JSON.parse(res.data.ush_frequency);

          setUserHabit(res.data);
          setHabitPhoto(res.data?.habit?.image);
        }

        setFetching(false);
      });
  };

  const onDeleteHabit = () => {
    RBSDelete.current.open();
  };

  const onToggleHabit = async () => {
    setLoadingDisable(true);

    let data = {
      ush_enabled: !user_habit.ush_enabled,
    };

    toggleUserHabit(props.route.params.user_habit_id, data)
      .catch((err) => {
        Alert.alert(
          "Ops!",
          "Something went wrong with our servers. Please contact us.",
        );
      })
      .then((res) => {
        if (res?.status === 200) {
          if (res.data.errors) {
            Alert.alert("Ops", res.data.errors[0]);
          } else {
            let aux = { ...user_habit };

            aux.ush_enabled = !aux.ush_enabled;

            setUserHabit(aux);
          }
        }

        setLoadingDisable(false);
      });
  };

  const deleteHabit = () => {
    setLoadingDelete(true);

    deleteUserHabit(props.route.params.user_habit_id)
      .catch((err) => {
        Alert.alert(
          "Ops!",
          "Something went wrong with our servers. Please contact us.",
        );
      })
      .then((res) => {
        if (res?.status === 200) {
          if (res.data.errors) {
            Alert.alert("Ops", res.data.errors[0]);
          } else {
            setLoadingDelete(false);

            RBSDelete.current.close();

            props.navigation.pop();
          }
        }
      });
  };

  return (
    <View style={Default.container}>
      <KeyboardAwareScrollView
        extraHeight={120}
        contentContainerStyle={Default.container}
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <Header
            title="Habit Details"
            navigation={props.navigation}
            backButton
            customRightIcon={
              <Icon
                onPress={() =>
                  props.navigation.navigate("EditHabit", {
                    user_habit_id: props.route.params.user_habit_id,
                  })
                }
                size={20}
                color={Colors.text}
                name="edit"
              />
            }
          />

          {habitPhoto ? (
            <LinearGradient
              colors={["rgba(114, 198, 239, 0.3)", "rgba(0, 78, 143, 0.138)"]}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={styles.containerHeaderImage}
            >
              <View style={styles.habitImage}>
                <Image
                  source={{ uri: habitPhoto.url }}
                  style={styles.habitImage}
                  resizeMode="cover"
                />
              </View>
            </LinearGradient>
          ) : null}

          <Fetching isFetching={fetching}>
            <View style={styles.container}>
              <View style={{ flex: 1 }}>
                <Text style={styles.title}>Name</Text>
                <Text style={styles.textContent}>
                  {user_habit?.habit?.hab_name}
                </Text>

                <Text style={styles.title}>Category</Text>
                <Text style={styles.textContent}>
                  {user_habit?.habit?.category?.hac_name}
                </Text>

                <Text style={styles.title}>Description</Text>
                <Text style={styles.textContent}>
                  {user_habit?.habit?.hab_description}
                </Text>

                <Text style={styles.title}>Frequency</Text>
                <Text style={styles.textContent}>
                  {user_habit?.ush_frequency.type}
                </Text>

                {user_habit?.ush_frequency.type === "CUSTOM" ? (
                  <View style={{ marginBottom: 32 }}>
                    <Text style={styles.labelStyle}>Days</Text>

                    <View
                      style={{
                        width: Dimensions.get("window").width - 44,
                        flexDirection: "row",
                        justifyContent: "space-between",
                      }}
                    >
                      <View
                        style={[
                          styles.frequencyDay,
                          user_habit?.ush_frequency.days[1]
                            ? styles.frequencyDaySelected
                            : null,
                        ]}
                      >
                        <Text style={styles.textFrequencyDay}>M</Text>
                      </View>

                      <View
                        style={[
                          styles.frequencyDay,
                          user_habit?.ush_frequency.days[2]
                            ? styles.frequencyDaySelected
                            : null,
                        ]}
                      >
                        <Text style={styles.textFrequencyDay}>T</Text>
                      </View>

                      <View
                        style={[
                          styles.frequencyDay,
                          user_habit?.ush_frequency.days[3]
                            ? styles.frequencyDaySelected
                            : null,
                        ]}
                      >
                        <Text style={styles.textFrequencyDay}>W</Text>
                      </View>

                      <View
                        style={[
                          styles.frequencyDay,
                          user_habit?.ush_frequency.days[4]
                            ? styles.frequencyDaySelected
                            : null,
                        ]}
                      >
                        <Text style={styles.textFrequencyDay}>T</Text>
                      </View>

                      <View
                        style={[
                          styles.frequencyDay,
                          user_habit?.ush_frequency.days[5]
                            ? styles.frequencyDaySelected
                            : null,
                        ]}
                      >
                        <Text style={styles.textFrequencyDay}>F</Text>
                      </View>

                      <View
                        style={[
                          styles.frequencyDay,
                          user_habit?.ush_frequency.days[6]
                            ? styles.frequencyDaySelected
                            : null,
                        ]}
                      >
                        <Text style={styles.textFrequencyDay}>S</Text>
                      </View>

                      <View
                        style={[
                          styles.frequencyDay,
                          user_habit?.ush_frequency.days[0]
                            ? styles.frequencyDaySelected
                            : null,
                        ]}
                      >
                        <Text style={styles.textFrequencyDay}>S</Text>
                      </View>
                    </View>
                  </View>
                ) : null}

                <Text style={styles.title}>Reminders</Text>
                <Text style={styles.textContent}>
                  {user_habit?.ush_reminder_time
                    ? moment(user_habit?.ush_reminder_time, "HH:mm:ss").format(
                        "HH:mm",
                      )
                    : "No reminder set"}
                </Text>
              </View>

              <View
                style={{
                  marginTop: 32,
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                {loading_disable ? (
                  <ActivityIndicator
                    style={{ paddingVertical: 16 }}
                    size="small"
                    color={Colors.text}
                  />
                ) : (
                  <TouchableOpacity onPress={() => onToggleHabit()}>
                    <Text
                      style={{
                        paddingVertical: 16,
                        fontSize: 16,
                        fontWeight: "700",
                        color: Colors.text,
                      }}
                    >
                      {user_habit?.ush_enabled
                        ? "DISABLE HABIT"
                        : "ENABLE HABIT"}
                    </Text>
                  </TouchableOpacity>
                )}

                <Button
                  disabled={loading_delete}
                  loading={loading_delete}
                  buttonStyle={Default.loginNextButton}
                  titleStyle={Default.loginButtonBoldTitle}
                  onPress={() => onDeleteHabit()}
                  title="DELETE HABIT"
                  disabledStyle={Default.loginNextButton}
                />
              </View>
            </View>

            <RBSheet
              ref={RBSDelete}
              height={350}
              openDuration={250}
              customStyles={{ container: styles.containerBottomSheet }}
            >
              <View style={styles.containerTextBottomSheet}>
                <Image
                  style={styles.warningIconStyle}
                  source={require("../../../assets/icons/wrong.png")}
                />
                <Text style={styles.textDelete}>
                  Are you sure to delete this habit?
                </Text>
              </View>

              <View style={styles.buttonContainer}>
                <Button
                  disabled={loading_delete}
                  loading={loading_delete}
                  buttonStyle={Default.loginNextButton}
                  titleStyle={Default.loginButtonBoldTitle}
                  onPress={deleteHabit}
                  title="DELETE"
                  disabledStyle={Default.loginNextButton}
                />

                <TouchableOpacity
                  disabled={loading_delete}
                  style={{ marginTop: 16 }}
                  onPress={() => RBSDelete.current.close()}
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
          </Fetching>
        </ScrollView>
      </KeyboardAwareScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 32,
    paddingHorizontal: 22,
  },
  containerBackButton: {
    flexDirection: "row",
  },
  textBackButton: {
    fontSize: 16,
    color: Colors.primary4,
    marginLeft: 6,
    fontStyle: "normal",
  },
  textCreate: {
    color: "#FCFCFC",
    fontSize: 24,
    marginTop: 8,
    marginBottom: 32,
  },
  containerButton: {
    flex: 1,
    justifyContent: "flex-end",
    marginTop: 60,
  },
  pickerStyle: {
    width: Dimensions.get("window").width - 44,
    backgroundColor: Colors.primary,
    borderRadius: 2,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#455c8a",
    marginHorizontal: 10,
    paddingHorizontal: 16,
    paddingVertical: 15,
    marginBottom: 32,
    fontSize: 16,
    color: Colors.text,
  },
  containerHeaderImage: {
    height: 189,
    width: Dimensions.get("window").width,
    zIndex: 0,
    elevation: 0,
    marginTop: 16,
  },
  habitImage: {
    width: "100%",
    height: "100%",
    position: "absolute",
  },
  addPhoto: {
    width: 50,
    height: 50,
    marginBottom: 8,
  },
  textAddPhoto: {
    fontWeight: "400",
    fontSize: 16,
    lineHeight: 19,
    color: "#FCFCFC",
  },
  pickerStyleAndroid: {
    marginHorizontal: 0,
    paddingVertical: 15,
    marginBottom: 0,
    color: Colors.primary4,
  },
  pickerStyleIOS: {
    backgroundColor: "#1c1c1e",
    borderWidth: 0,
    color: Colors.text,
    height: 200,
    paddingVertical: 0,
    marginVertical: 0,
  },
  labelStyle: {
    color: "#FCFCFC",
    fontSize: 16,
    marginBottom: 12,
    fontWeight: "400",
  },
  textInputStyle: {
    borderColor: "#455c8a",
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 2,
    paddingVertical: 15,
    paddingHorizontal: 12,
    paddingTop: 15,
    fontSize: 16,
    color: Colors.primary4,
    width: Dimensions.get("window").width - 44,
    textAlignVertical: "top",
    marginBottom: 32,
  },
  containerSelectIOS: {
    paddingVertical: 15,
    paddingHorizontal: 16,
    borderColor: "#455c8a",
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 2,
    marginBottom: 32,
    flexDirection: "row",
    justifyContent: "space-between",
    width: Dimensions.get("window").width - 44,
  },
  textSelectIOS: {
    fontSize: 16,
    color: "#455c8a",
  },
  containerHeaderBottomSheet: {
    backgroundColor: "#282828",
    paddingHorizontal: 16,
    paddingVertical: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    width: Dimensions.get("window").width,
  },
  textHeaderBottomSheet: {
    fontSize: 16,
    color: "#d7892b",
  },
  viewPicker: {
    marginBottom: 32,
    borderRadius: 2,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#455c8a",
    alignItems: "center",
    width: Dimensions.get("window").width - 40,
  },
  loginInputContainer: {
    borderColor: "#455c8a",
    borderWidth: StyleSheet.hairlineWidth,
    width: Dimensions.get("window").width - 44,
    padding: 0,
    marginLeft: 0,
    borderRadius: 2,
    paddingHorizontal: 16,
    height: 48,
  },
  loginInputLabel: {
    color: "#FCFCFC",
    fontSize: 16,
    paddingLeft: 0,
    fontWeight: "400",
    marginBottom: 12,
  },
  textTitle: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 32,
  },
  containerReminders: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 24,
  },
  textTime: {
    color: Colors.text,
    fontSize: 11,
    fontWeight: "bold",
  },
  textReminder: {
    marginLeft: 15,
    fontSize: 11,
    fontWeight: "bold",
    color: Colors.text,
    marginRight: 12,
  },
  datePickerStyle: {
    marginBottom: 20,
  },
  containerTime: {
    borderRadius: 25,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.text,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 6,
    alignItems: "center",
    height: 28,
    width: 53,
  },
  title: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: "400",
    marginBottom: 12,
  },
  textContent: {
    fontSize: 16,
    color: Colors.primary4,
    fontWeight: "400",
    marginBottom: 32,
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
  frequencyDay: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.text,
  },
  frequencyDaySelected: {
    borderColor: Colors.primary4,
    backgroundColor: Colors.primary4,
  },
  textFrequencyDay: {
    fontSize: 12,
    color: Colors.text,
    fontWeight: "400",
  },
});

export default ViewHabit;
