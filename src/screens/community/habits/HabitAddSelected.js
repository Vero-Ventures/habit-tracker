import React, { useState, useEffect, useRef } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  Alert,
  Platform,
  Image,
  Dimensions,
} from "react-native";
import Default from "../../../../assets/styles/Default";
import Colors from "../../../../assets/styles/Colors";
import Fetching from "../../../components/Fetching";
import Header from "../../../components/Header";
import Icon from "react-native-vector-icons/FontAwesome5";
import { Button } from "react-native-elements";
import { get } from "../../../store/ducks/habit";
import RBSheet from "react-native-raw-bottom-sheet";
import DateTimePicker from "@react-native-community/datetimepicker";
import moment from "moment";
import {
  getFrequencyTypes,
  takeCamera,
  takeGaleria,
} from "../../../utils/Utils";
import { storeUserHabit } from "../../../store/ducks/habit";
import { Picker } from "@react-native-picker/picker";
import * as ImagePicker from "expo-image-picker";
import * as mime from "react-native-mime-types";
import { LinearGradient } from "expo-linear-gradient";
import ActionSheet from "react-native-actionsheet";

const HabitAddSelected = (props) => {
  const [sending, setSending] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [habit, setHabit] = useState(null);
  const [frequency_type, setFrequencyType] = useState("EVERYDAY");
  const [frequency_type_ios, setFrequencyTypeIos] = useState("EVERYDAY");
  const [frequency_days, setFrequencyDays] = useState([
    false,
    false,
    false,
    false,
    false,
    false,
    false,
  ]);
  const [isRemind, setIsRemind] = useState(false);
  const [time, setTime] = useState(new Date());
  const [timeIOS, setTimeIOS] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [habitPhoto, setHabitPhoto] = useState(null);

  const RBSTime = useRef();
  const RBSFrequency = useRef();
  const RBSFillFrequencyDays = useRef();
  const ASPhotoOptions = useRef();

  useEffect(() => {
    setFetching(true);

    get(props.route.params.hab_id)
      .catch((err) => {
        Alert.alert(
          "Ops!",
          "Something went wrong with our servers. Please contact us.",
        );
      })
      .then((res) => {
        if (res?.status === 200) {
          if (res.data.errors) {
          } else {
            setHabit(res.data);
            setHabitPhoto(res.data?.image);
          }
        }

        setFetching(false);
      });
  }, []);

  const addHabit = async () => {
    if (frequency_type === "") {
      Alert.alert(
        "Ops!",
        "You need to input the habit frequency before continuing.",
      );
      return;
    }

    if (frequency_type === "CUSTOM") {
      let hasDaySelected = false;

      frequency_days.map((obj, i) => {
        if (obj) {
          hasDaySelected = true;
        }
      });

      if (!hasDaySelected) {
        RBSFillFrequencyDays.current.open();
        return;
      }
    }

    setSending(true);

    let notification_time = time;

    if (moment(time).isBefore(moment())) {
      notification_time = new Date(moment(time).add(1, "day"));
    }

    // let push_identifier = isRemind ?
    // 	await Notifications.scheduleNotificationAsync({
    // 		content: {
    // 			title: habit.hab_name,
    // 		},
    // 		trigger: {
    // 			date: notification_time,
    // 			repeats: true,
    // 		}
    // 	})
    // 	: null;

    let userHabit = {
      ush_id_habit: props.route.params.hab_id,
      ush_frequency: { type: frequency_type },
      hab_is_pre_established: habit.hab_is_pre_established,
    };

    // push_identifier ? userHabit.push_identifier = push_identifier : null;
    isRemind
      ? (userHabit.ush_reminder_time =
        moment(notification_time).format("HH:mm:ss"))
      : null;
    frequency_type === "CUSTOM"
      ? (userHabit.ush_frequency.days = frequency_days)
      : null;

    storeUserHabit(userHabit)
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
            const habitCommunitySuccessNeededParams = {
              community: { id: props.route?.params?.community?.id },
            };

            props.navigation.push(
              "HabitCommunitySuccess",
              habitCommunitySuccessNeededParams,
            );
          }
        }

        setSending(false);
      });
  };

  const closeModalIOS = (modal, change) => {
    if (modal === "frequency") {
      if (change) {
        setFrequencyType(frequency_type_ios);
      } else {
        setFrequencyTypeIos(frequency_type);
      }

      RBSFrequency.current.close();
    }
  };

  const onToggleFrequencyDay = (day) => {
    let days = [...frequency_days];

    days[day] = !days[day];

    setFrequencyDays(days);
  };

  const changeTime = () => {
    if (Platform.OS === "ios") {
      RBSTime.current.open();
    } else {
      setShowPicker(true);
    }
  };

  const onChangeDatePicker = (event, selectedDate) => {
    setShowPicker(false);

    if (Platform.OS === "ios") {
      setTimeIOS(selectedDate);
    } else {
      if (event.type !== "dismissed") {
        setIsRemind(true);
        setTime(selectedDate);
      }
    }
  };

  const doSetTimeIOS = (changeTime) => {
    RBSTime.current.close();

    if (changeTime) {
      setIsRemind(true);
      setTime(timeIOS);
    } else {
      setTimeIOS(time);
    }
  };

  const handleActionSheet = async (index) => {
    if (index === 0) {
      let { status } = await ImagePicker.requestCameraPermissionsAsync();

      if (status === "granted") {
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

    setHabitPhoto(auxFoto);
    setChangeImage(true);
  };

  return (
    <View style={Default.container}>
      <ScrollView
        style={Default.container}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        <Fetching isFetching={fetching}>
          <Header
            title="Create Habit"
            navigation={props.navigation}
            backButton
          />

          <LinearGradient
            colors={["rgba(114, 198, 239, 0.3)", "rgba(0, 78, 143, 0.138)"]}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={styles.containerHeaderImage}
          >
            {habitPhoto ? (
              <>
                <View
                  onPress={() => ASPhotoOptions.current.show()}
                  style={styles.communityImage}
                >
                  <Image
                    source={{ uri: habitPhoto.url }}
                    style={styles.communityImage}
                    resizeMode="cover"
                  />
                </View>
              </>
            ) : null}
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

          <View style={styles.container}>
            <View style={styles.innerContainer}>
              <Text style={styles.title}>Name</Text>
              <Text style={styles.textContent}>{habit?.hab_name}</Text>

              <Text style={styles.title}>Category</Text>
              <Text style={styles.textContent}>
                {habit?.category?.hac_name}
              </Text>

              <Text style={styles.title}>Description</Text>
              <Text style={styles.textContent}>{habit?.hab_description}</Text>

              <Text style={styles.title}>Frequency</Text>

              {Platform.OS === "ios" ? (
                <TouchableOpacity
                  style={styles.containerSelectIOS}
                  onPress={() => RBSFrequency.current.open()}
                >
                  <Text
                    style={[
                      styles.textSelectIOS,
                      {
                        color: frequency_type_ios ? Colors.primary4 : "#455c8a",
                      },
                    ]}
                  >
                    {frequency_type_ios
                      ? frequency_type_ios
                      : "Select habit frequency"}
                  </Text>

                  <Icon size={16} color={"#455c8a"} name="chevron-down" />
                </TouchableOpacity>
              ) : (
                <View style={styles.viewPicker}>
                  <Picker
                    selectedValue={frequency_type}
                    style={[styles.pickerStyle, styles.pickerStyleAndroid]}
                    onValueChange={(itemValue, itemIndex) =>
                      setFrequencyType(itemValue)
                    }
                  >
                    {getFrequencyTypes().map((obj, i) => {
                      return <Picker.Item key={i} label={obj} value={obj} />;
                    })}
                  </Picker>
                </View>
              )}

              <RBSheet
                ref={RBSFrequency}
                height={300}
                openDuration={250}
                customStyles={{ container: styles.containerBottomSheet }}
                closeOnPressBack={false}
                closeOnPressMask={false}
              >
                <View style={styles.containerHeaderBottomSheet}>
                  <TouchableOpacity
                    onPress={() => closeModalIOS("frequency", false)}
                  >
                    <Text style={styles.textHeaderBottomSheet}>Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => closeModalIOS("frequency", true)}
                  >
                    <Text style={styles.textHeaderBottomSheet}>Confirm</Text>
                  </TouchableOpacity>
                </View>

                <Picker
                  selectedValue={frequency_type_ios}
                  style={[styles.pickerStyle, styles.pickerStyleIOS]}
                  itemStyle={{ color: Colors.text }}
                  onValueChange={(itemValue, itemIndex) =>
                    setFrequencyTypeIos(itemValue)
                  }
                >
                  {getFrequencyTypes().map((obj, i) => {
                    return <Picker.Item key={i} label={obj} value={obj} />;
                  })}
                </Picker>
              </RBSheet>

              {frequency_type === "CUSTOM" ? (
                <View style={{ marginBottom: 32 }}>
                  <Text style={styles.title}>Select Days</Text>

                  <View
                    style={{
                      width: Dimensions.get("window").width - 44,
                      flexDirection: "row",
                      justifyContent: "space-between",
                    }}
                  >
                    <TouchableOpacity onPress={() => onToggleFrequencyDay(1)}>
                      <View
                        style={[
                          styles.frequencyDay,
                          frequency_days[1]
                            ? styles.frequencyDaySelected
                            : null,
                        ]}
                      >
                        <Text style={styles.textFrequencyDay}>M</Text>
                      </View>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => onToggleFrequencyDay(2)}>
                      <View
                        style={[
                          styles.frequencyDay,
                          frequency_days[2]
                            ? styles.frequencyDaySelected
                            : null,
                        ]}
                      >
                        <Text style={styles.textFrequencyDay}>T</Text>
                      </View>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => onToggleFrequencyDay(3)}>
                      <View
                        style={[
                          styles.frequencyDay,
                          frequency_days[3]
                            ? styles.frequencyDaySelected
                            : null,
                        ]}
                      >
                        <Text style={styles.textFrequencyDay}>W</Text>
                      </View>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => onToggleFrequencyDay(4)}>
                      <View
                        style={[
                          styles.frequencyDay,
                          frequency_days[4]
                            ? styles.frequencyDaySelected
                            : null,
                        ]}
                      >
                        <Text style={styles.textFrequencyDay}>T</Text>
                      </View>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => onToggleFrequencyDay(5)}>
                      <View
                        style={[
                          styles.frequencyDay,
                          frequency_days[5]
                            ? styles.frequencyDaySelected
                            : null,
                        ]}
                      >
                        <Text style={styles.textFrequencyDay}>F</Text>
                      </View>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => onToggleFrequencyDay(6)}>
                      <View
                        style={[
                          styles.frequencyDay,
                          frequency_days[6]
                            ? styles.frequencyDaySelected
                            : null,
                        ]}
                      >
                        <Text style={styles.textFrequencyDay}>S</Text>
                      </View>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => onToggleFrequencyDay(0)}>
                      <View
                        style={[
                          styles.frequencyDay,
                          frequency_days[0]
                            ? styles.frequencyDaySelected
                            : null,
                        ]}
                      >
                        <Text style={styles.textFrequencyDay}>S</Text>
                      </View>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : null}

              <RBSheet
                ref={RBSFillFrequencyDays}
                height={350}
                openDuration={250}
                customStyles={{
                  container: styles.containerBottomSheetFillDays,
                }}
              >
                <View style={styles.containerTextBottomSheet}>
                  <Image
                    style={styles.warningIconStyle}
                    source={require("../../../../assets/icons/warning.png")}
                  />
                  <Text style={styles.textDelete}>
                    You must complete the frequency of the new habit to continue
                  </Text>
                </View>

                <View style={styles.buttonContainer}>
                  <Button
                    buttonStyle={Default.loginNextButton}
                    titleStyle={Default.loginButtonBoldTitle}
                    onPress={() => RBSFillFrequencyDays.current.close()}
                    title="BACK TO COMPLETE HABIT"
                  />
                </View>
              </RBSheet>

              <View style={{ marginBottom: 32 }}>
                <Text style={styles.title}>Reminders</Text>

                <View style={styles.containerReminders}>
                  <TouchableOpacity onPress={() => changeTime()}>
                    <View style={styles.containerTime}>
                      <Text style={styles.textTime}>
                        {isRemind ? moment(time).format("HH:mm") : ""}
                      </Text>
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => changeTime()}>
                    <Text style={styles.textReminder}>Set Reminder</Text>
                  </TouchableOpacity>

                  {showPicker ? (
                    <DateTimePicker
                      value={time}
                      mode="time"
                      is24Hour={true}
                      display="default"
                      onChange={onChangeDatePicker}
                      style={styles.datePickerStyle}
                    />
                  ) : null}

                  <RBSheet
                    ref={RBSTime}
                    height={300}
                    openDuration={250}
                    customStyles={{
                      container: styles.containerBottomSheetDatePicker,
                    }}
                    closeOnPressBack={false}
                    closeOnPressMask={false}
                  >
                    <View style={styles.containerHeaderBottomSheet}>
                      <TouchableOpacity onPress={() => doSetTimeIOS(false)}>
                        <Text style={styles.textHeaderBottomSheet}>Cancel</Text>
                      </TouchableOpacity>

                      <TouchableOpacity onPress={() => doSetTimeIOS(true)}>
                        <Text style={styles.textHeaderBottomSheet}>
                          Confirm
                        </Text>
                      </TouchableOpacity>
                    </View>

                    <DateTimePicker
                      value={timeIOS}
                      mode="time"
                      is24Hour={true}
                      display="spinner"
                      onChange={onChangeDatePicker}
                      style={styles.datePickerStyle}
                      textColor={Colors.text}
                    />
                  </RBSheet>
                </View>
              </View>
            </View>

            <Button
              buttonStyle={Default.loginNextButton}
              titleStyle={Default.loginButtonBoldTitle}
              onPress={addHabit}
              title="ADD TO MY HABITS"
              disabled={sending}
              loading={sending}
              disabledStyle={Default.loginNextButton}
            />
          </View>
        </Fetching>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 32,
    paddingHorizontal: 22,
    alignItems: "center",
  },
  innerContainer: {
    flex: 1,
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
  containerTitle: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.primary4,
    paddingVertical: 20,
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
  textTitle: {
    fontSize: 24,
    color: Colors.text,
    marginRight: 32,
  },
  containerDescription: {
    marginVertical: 32,
  },
  textDescription: {
    lineHeight: 21,
    fontSize: 14,
    color: Colors.text,
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
  // Frequency
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
  containerBottomSheetFillDays: {
    alignItems: "center",
    backgroundColor: Colors.primary,
    paddingHorizontal: 22,
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
    textAlign: "center",
    paddingHorizontal: 22,
  },
  buttonContainer: {
    marginBottom: 32,
  },
  textSelectIOS: {
    fontSize: 16,
    color: "#455c8a",
  },
  viewPicker: {
    marginBottom: 32,
    borderRadius: 2,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#455c8a",
    alignItems: "center",
    width: Dimensions.get("window").width - 40,
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
  containerBottomSheet: {
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#1c1c1e",
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
  // Days
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
  // Reminder
  containerReminders: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 24,
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
  containerBottomSheetDatePicker: {
    justifyContent: "space-between",
    // alignItems: "center",
    backgroundColor: "#1c1c1e",
  },
});

export default HabitAddSelected;
