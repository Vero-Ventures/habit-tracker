import React, { useState, useEffect, useRef } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  Dimensions,
  Text,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform,
  Image,
} from "react-native";
import Default from "../../../../assets/styles/Default";
import Colors from "../../../../assets/styles/Colors";
import Fetching from "../../../components/Fetching";
import Header from "../../../components/Header";
import Icon from "react-native-vector-icons/FontAwesome5";
import { Button, Input } from "react-native-elements";
import { Picker } from "@react-native-picker/picker";
import { getAllCategory } from "../../../store/ducks/habit";
import {
  getCommunityHabit,
  updateCustomCommunityHabit as updateHabitCustom,
  updateCommunityHabit,
} from "../../../store/ducks/community";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import RBSheet from "react-native-raw-bottom-sheet";
import DateTimePicker from "@react-native-community/datetimepicker";
import {
  getFrequencyTypes,
  takeCamera,
  takeGaleria,
} from "../../../utils/Utils";
import moment from "moment";
import { LinearGradient } from "expo-linear-gradient";
import ActionSheet from "react-native-actionsheet";
import * as ImagePicker from "expo-image-picker";
import * as mime from "react-native-mime-types";

const EditCommunityHabit = (props) => {
  const [sending, setSending] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [is_pre_established, setIsPreEstablished] = useState(true);
  const [community_habit, setCommunityHabit] = useState(null);
  const [name, setName] = useState("");
  const [image_changed, setImageChanged] = useState(false);
  const [list_category, setListCategory] = useState([]);
  const [category, setCategory] = useState("");
  const [category_ios, setCategoryIOS] = useState("");
  const [habit_description, setHabitDecription] = useState("");
  const [isRemind, setIsRemind] = useState(false);
  const [time, setTime] = useState(new Date());
  const [timeIOS, setTimeIOS] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
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
  const [habitPhoto, setHabitPhoto] = useState(null);

  const RBSTime = useRef();
  const RBSCategory = useRef();
  const RBSFrequency = useRef();
  const RBSFillFrequencyDays = useRef();
  const ASPhotoOptions = useRef();

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setFetching(true);

    getCommunityHabit(props.route.params.community_habit_id)
      .catch((err) => {
        Alert.alert(
          "Ops!",
          "Something went wrong with our servers. Please contact us.",
        );
      })
      .then((res) => {
        if (res?.status === 200) {
          res.data.coh_frequency = JSON.parse(res.data.coh_frequency);

          setIsPreEstablished(res.data.habit.hab_is_pre_established);
          setName(res.data.habit.hab_name);
          setHabitDecription(res.data.habit.hab_description);
          setCommunityHabit(res.data);
          setFrequencyType(res.data.coh_frequency.type);
          setFrequencyTypeIos(res.data.coh_frequency.type);
          setCategory(res.data.habit.category.id);
          setCategoryIOS(res.data.habit.category.id);
          setHabitPhoto(res.data.habit.image);

          if (res.data.coh_frequency.type === "CUSTOM") {
            setFrequencyDays(res.data.coh_frequency.days);
          }

          if (res.data.coh_reminder_time) {
            setIsRemind(true);
            setTime(new Date(moment(res.data.coh_reminder_time, "HH:mm:ss")));
            setTimeIOS(
              new Date(moment(res.data.coh_reminder_time, "HH:mm:ss")),
            );
          }

          setFetching(false);
        }
      });

    getAllCategory()
      .catch((err) => {
        Alert.alert(
          "Ops!",
          "Something went wrong with our servers. Please contact us.",
        );
      })
      .then((res) => {
        if (res?.status === 200) {
          setListCategory(res.data);
        }
      });
  };

  const updateHabit = () => {
    if (is_pre_established) {
      updateHabitPreEstablished();
    } else {
      updateCustomHabit();
    }
  };

  const updateHabitPreEstablished = async () => {
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

    let userHabit = {
      coh_frequency: { type: frequency_type },
    };

    isRemind
      ? (userHabit.coh_reminder_time =
        moment(notification_time).format("HH:mm:ss"))
      : null;
    frequency_type === "CUSTOM"
      ? (userHabit.coh_frequency.days = frequency_days)
      : null;

    updateCommunityHabit(props.route.params.community_habit_id, userHabit)
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
              edit: true,
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

  const updateCustomHabit = async () => {
    if (name.trim() === "") {
      Alert.alert(
        "Ops!",
        "You need to input the habit name before continuing.",
      );
      return;
    } else if (category === "") {
      Alert.alert(
        "Ops!",
        "You need to select the habit category before continuing.",
      );
      return;
    } else if (habit_description === "") {
      Alert.alert(
        "Ops!",
        "You need to input the habit description before continuing.",
      );
      return;
    } else if (frequency_type === "") {
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

    let coh_frequency = { type: frequency_type };

    frequency_type === "CUSTOM" ? (coh_frequency.days = frequency_days) : null;

    const data_frequency = JSON.stringify(coh_frequency);

    let communityHabitForm = new FormData();

    communityHabitForm.append("coh_frequency", data_frequency);
    communityHabitForm.append("hab_name", name);
    communityHabitForm.append("hab_id_category", category);
    communityHabitForm.append("hab_description", habit_description);
    communityHabitForm.append(
      "community_habit_id",
      props.route.params.community_habit_id,
    );

    isRemind
      ? communityHabitForm.append(
        "coh_reminder_time",
        moment(notification_time).format("HH:mm:ss"),
      )
      : null;

    habitPhoto && image_changed
      ? communityHabitForm.append("habit_image", habitPhoto)
      : null;

    updateHabitCustom(communityHabitForm)
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
              edit: true,
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

  const doSetCategoryIOS = (value, index) => {
    list_category.map((obj, i) => {
      if (obj.id === value) {
        setCategoryIOS(obj);
      }
    });
  };

  const closeModalIOS = (modal, change) => {
    if (modal === "category") {
      if (change) {
        setCategory(category_ios.id);
      } else {
        list_category.map((obj, i) => {
          if (obj.id === category) {
            setCategoryIOS(obj);
          }
        });
      }

      RBSCategory.current.close();
    }

    if (modal === "frequency") {
      if (change) {
        setFrequencyType(frequency_type_ios);
      } else {
        setFrequencyTypeIos(frequency_type);
      }

      RBSFrequency.current.close();
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

  const changeTime = () => {
    if (Platform.OS === "ios") {
      RBSTime.current.open();
    } else {
      setShowPicker(true);
    }
  };

  const onToggleFrequencyDay = (day) => {
    let days = [...frequency_days];

    days[day] = !days[day];

    setFrequencyDays(days);
  };

  const removeTime = () => {
    setTime(new Date());
    setTimeIOS(new Date());
    setIsRemind(false);
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

    setImageChanged(true);
    setHabitPhoto(auxFoto);
  };

  return (
    <View style={[Default.container, { marginTop: -32 }]}>
      <KeyboardAwareScrollView
        extraHeight={120}
        contentContainerStyle={Default.container}
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <Header title="Edit Habit" navigation={props.navigation} backButton />

          <Fetching isFetching={fetching}>
            {is_pre_established ? (
              <LinearGradient
                colors={["rgba(114, 198, 239, 0.3)", "rgba(0, 78, 143, 0.138)"]}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={styles.containerHeaderImage}
              >
                {habitPhoto ? (
                  <>
                    <View style={styles.communityImage}>
                      <Image
                        source={{ uri: habitPhoto.url }}
                        style={styles.communityImage}
                        resizeMode="cover"
                      />
                    </View>
                  </>
                ) : null}
              </LinearGradient>
            ) : (
              <LinearGradient
                colors={["rgba(114, 198, 239, 0.3)", "rgba(0, 78, 143, 0.138)"]}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={styles.containerHeaderImage}
              >
                {habitPhoto ? (
                  <>
                    <TouchableOpacity
                      onPress={() => ASPhotoOptions.current.show()}
                      style={styles.communityImage}
                    >
                      <Image
                        source={{ uri: habitPhoto.url }}
                        style={styles.communityImage}
                        resizeMode="cover"
                      />
                      <View
                        style={{
                          position: "absolute",
                          alignSelf: "center",
                          alignItems: "center",
                          marginTop: 56,
                        }}
                      >
                        <Image
                          source={require("../../../../assets/icons/add-photo.png")}
                          style={styles.addPhoto}
                        />
                        <Text style={styles.textAddPhoto}>Edit Photo</Text>
                      </View>
                    </TouchableOpacity>
                  </>
                ) : (
                  <>
                    <TouchableOpacity
                      onPress={() => ASPhotoOptions.current.show()}
                      style={styles.communityImage}
                    >
                      <View
                        style={{
                          position: "absolute",
                          alignSelf: "center",
                          alignItems: "center",
                          marginTop: 56,
                        }}
                      >
                        <Image
                          source={require("../../../../assets/icons/add-photo.png")}
                          style={styles.addPhoto}
                        />
                        <Text style={styles.textAddPhoto}>Add Photo</Text>
                      </View>
                    </TouchableOpacity>
                  </>
                )}
              </LinearGradient>
            )}

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
              {is_pre_established ? (
                <View>
                  <Text style={styles.title}>Name</Text>
                  <Text style={styles.textContent}>
                    {community_habit?.habit?.hab_name}
                  </Text>

                  <Text style={styles.title}>Category</Text>
                  <Text style={styles.textContent}>
                    {community_habit?.habit?.category?.hac_name}
                  </Text>

                  <Text style={styles.title}>Description</Text>
                  <Text style={styles.textContent}>
                    {community_habit?.habit?.hab_description}
                  </Text>
                </View>
              ) : (
                <View>
                  <Input
                    label="Name"
                    placeholder="Habit Name"
                    value={name}
                    onChangeText={setName}
                    keyboardAppearance="dark"
                    autoFocus={false}
                    autoCorrect={false}
                    returnKeyType="next"
                    placeholderTextColor="#455c8a"
                    containerStyle={Default.containerInput}
                    inputStyle={Default.loginInput}
                    inputContainerStyle={styles.loginInputContainer}
                    labelStyle={styles.loginInputLabel}
                  />

                  <Text style={styles.labelStyle}>Category</Text>

                  {Platform.OS === "ios" ? (
                    <TouchableOpacity
                      style={styles.containerSelectIOS}
                      onPress={() => RBSCategory.current.open()}
                    >
                      <Text
                        style={[
                          styles.textSelectIOS,
                          { color: category_ios ? Colors.primary4 : "#455c8a" },
                        ]}
                      >
                        {category_ios
                          ? category_ios.hac_name
                          : "Select habits category"}
                      </Text>

                      <Icon size={16} color={"#455c8a"} name="chevron-down" />
                    </TouchableOpacity>
                  ) : (
                    <View style={styles.viewPicker}>
                      <Picker
                        selectedValue={category}
                        style={[styles.pickerStyle, styles.pickerStyleAndroid]}
                        onValueChange={(itemValue, itemIndex) =>
                          setCategory(itemValue)
                        }
                      >
                        {list_category.map((obj, i) => {
                          return (
                            <Picker.Item
                              key={i}
                              label={obj.hac_name}
                              value={obj.id}
                            />
                          );
                        })}
                      </Picker>
                    </View>
                  )}

                  <RBSheet
                    ref={RBSCategory}
                    height={300}
                    openDuration={250}
                    customStyles={{ container: styles.containerBottomSheet }}
                    closeOnPressBack={false}
                    closeOnPressMask={false}
                  >
                    <View style={styles.containerHeaderBottomSheet}>
                      <TouchableOpacity
                        onPress={() => closeModalIOS("category", false)}
                      >
                        <Text style={styles.textHeaderBottomSheet}>Cancel</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => closeModalIOS("category", true)}
                      >
                        <Text style={styles.textHeaderBottomSheet}>
                          Confirm
                        </Text>
                      </TouchableOpacity>
                    </View>

                    <Picker
                      selectedValue={category_ios.id}
                      style={[styles.pickerStyle, styles.pickerStyleIOS]}
                      itemStyle={{ color: Colors.text }}
                      onValueChange={(itemValue, itemIndex) =>
                        doSetCategoryIOS(itemValue)
                      }
                    >
                      {list_category.map((obj, i) => {
                        return (
                          <Picker.Item
                            key={i}
                            label={obj.hac_name}
                            value={obj.id}
                          />
                        );
                      })}
                    </Picker>
                  </RBSheet>

                  <Text style={styles.labelStyle}>Description</Text>

                  <TextInput
                    value={habit_description}
                    numberOfLines={3}
                    multiline
                    onChangeText={setHabitDecription}
                    keyboardAppearance="dark"
                    style={styles.textInputStyle}
                    placeholder="Short Habit Description"
                    placeholderTextColor={"#455c8a"}
                  />
                </View>
              )}

              <Text style={styles.labelStyle}>Frequency</Text>

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
                  <Text style={styles.labelStyle}>Select Days</Text>

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

              <View>
                <Text style={styles.textTitle}>Reminders</Text>

                <View style={styles.containerReminders}>
                  <TouchableOpacity onPress={() => changeTime()}>
                    <View style={styles.containerTime}>
                      <Text style={styles.textTime}>
                        {isRemind ? moment(time).format("HH:mm") : ""}
                      </Text>
                    </View>
                  </TouchableOpacity>

                  {time && isRemind ? (
                    <TouchableOpacity onPress={() => removeTime()}>
                      <Text style={styles.textReminder}>Remove Reminder</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity onPress={() => changeTime()}>
                      <Text style={styles.textReminder}>Set Reminder</Text>
                    </TouchableOpacity>
                  )}

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

              <View style={styles.containerButton}>
                <Button
                  buttonStyle={[Default.loginNextButton]}
                  titleStyle={Default.loginButtonBoldTitle}
                  disabledStyle={Default.loginNextButton}
                  onPress={updateHabit}
                  title="SAVE CHANGES"
                  disabled={sending}
                  loading={sending}
                />
              </View>
            </View>

            <RBSheet
              ref={RBSFillFrequencyDays}
              height={350}
              openDuration={250}
              customStyles={{ container: styles.containerBottomSheetFillDays }}
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
  containerHeaderImage: {
    height: 189,
    width: Dimensions.get("window").width,
    zIndex: 0,
    elevation: 0,
    marginTop: 16,
  },
  communityImage: {
    width: "100%",
    height: "100%",
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
    fontWeight: "400",
    // marginTop: 32,
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
  containerBottomSheetDatePicker: {
    justifyContent: "space-between",
    // alignItems: "center",
    backgroundColor: "#1c1c1e",
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
});

export default EditCommunityHabit;
