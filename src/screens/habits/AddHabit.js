
import React, { useState, useEffect, useRef } from 'react';
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
} from 'react-native';
import { useDispatch } from 'react-redux';
import { Button, Input } from 'react-native-elements';
import Default from '../../../assets/styles/Default';
import Colors from '../../../assets/styles/Colors';
import Fetching from '../../components/Fetching';
import Header from '../../components/Header';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { addCustomHabit } from '../../store/ducks/habit';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import RBSheet from 'react-native-raw-bottom-sheet';
import DateTimePicker from '@react-native-community/datetimepicker';
import moment from 'moment';
import { getFrequencyTypes } from '../../utils/Utils';
import { LinearGradient } from 'expo-linear-gradient';
import ActionSheet from 'react-native-actionsheet';
import * as ImagePicker from 'expo-image-picker';
import { Picker } from '@react-native-picker/picker';

const AddHabit = (props) => {
  const [sending, setSending] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [name, setName] = useState('');
  const [habitDescription, setHabitDescription] = useState('');
  const [frequencyType, setFrequencyType] = useState('EVERYDAY');
  const [frequencyTypeIOS, setFrequencyTypeIOS] = useState('EVERYDAY');
  const [frequencyDays, setFrequencyDays] = useState([
    false, false, false, false, false, false, false,
  ]);
  const [isRemind, setIsRemind] = useState(false);
  const [time, setTime] = useState(new Date());
  const [timeIOS, setTimeIOS] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [habitPhoto, setHabitPhoto] = useState(null);

  const dispatch = useDispatch();

  const RBSTime = useRef();
  const RBSFrequency = useRef();
  const RBSFillFrequencyDays = useRef();
  const ASPhotoOptions = useRef();

  useEffect(() => {
    if (props.route?.params?.habit) {
      setName(props.route.params.habit.hab_name);
      setHabitDescription(props.route.params.habit.hab_description);
    }
  }, [props.route]);

  const addHabit = async () => {
    if (name.trim() === '') {
      Alert.alert('Ops!', 'You need to input the habit name before continuing.');
      return;
    } else if (habitDescription === '') {
      Alert.alert('Ops!', 'You need to input the habit description before continuing.');
      return;
    } else if (frequencyType === '') {
      Alert.alert('Ops!', 'You need to input the habit frequency before continuing.');
      return;
    }

    if (frequencyType === 'CUSTOM') {
      const hasDaySelected = frequencyDays.some((day) => day);

      if (!hasDaySelected) {
        RBSFillFrequencyDays.current.open();
        return;
      }
    }

    setSending(true);

    let notificationTime = time;

    if (moment(time).isBefore(moment())) {
      notificationTime = new Date(moment(time).add(1, 'day'));
    }

    const habitData = {
      habit_title: name,
      habit_description: habitDescription,
      frequency: JSON.stringify({
        type: frequencyType,
        days: frequencyDays,
      }),
      reminder_time: isRemind ? moment(notificationTime).format('HH:mm:ss') : null,
      habit_image: habitPhoto,
    };

    dispatch(addCustomHabit(habitData))
      .then((res) => {
        if (res.meta.requestStatus === 'fulfilled') {
          props.navigation.push('HabitSuccess');
        } else {
          Alert.alert('Ops!', 'Something went wrong with our servers. Please contact us.');
        }
        setSending(false);
      });
  };

  const onToggleFrequencyDay = (day) => {
    const days = [...frequencyDays];
    days[day] = !days[day];
    setFrequencyDays(days);
  };

  const changeTime = () => {
    if (Platform.OS === 'ios') {
      RBSTime.current.open();
    } else {
      setShowPicker(true);
    }
  };

  const onChangeDatePicker = (event, selectedDate) => {
    setShowPicker(false);

    if (Platform.OS === 'ios') {
      setTimeIOS(selectedDate);
    } else {
      if (event.type !== 'dismissed') {
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
      const { status } = await ImagePicker.requestCameraPermissionsAsync();

      if (status === 'granted') {
        pickCamera();
      } else {
        Alert.alert('Ops!', 'You need to allow access to the camera first.');
      }
    } else if (index === 1) {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status === 'granted') {
        pickGallery();
      } else {
        Alert.alert('Ops!', 'You need to allow access to the library first.');
      }
    }
  };

  const pickCamera = async () => {
    const result = await ImagePicker.launchCameraAsync();
    if (!result.cancelled) {
      setHabitPhoto(result);
    }
  };

  const pickGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync();
    if (!result.cancelled) {
      setHabitPhoto(result);
    }
  };

  if (fetching) {
    return <Fetching isFetching />;
  }

  return (
    <View style={Default.container}>
      <Header navigation={props.navigation} backButton title="Create Habit" />

      <KeyboardAwareScrollView
        extraHeight={120}
        contentContainerStyle={Default.container}>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <Fetching isFetching={fetching}>
            <LinearGradient
              colors={['rgba(114, 198, 239, 0.3)', 'rgba(0, 78, 143, 0.138)']}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={styles.containerHeaderImage}>
              {habitPhoto ? (
                <TouchableOpacity
                  onPress={() => ASPhotoOptions.current.show()}
                  style={styles.habitImage}>
                  <Image
                    source={{ uri: habitPhoto.uri }}
                    style={styles.habitImage}
                    resizeMode="cover"
                  />
                  <View
                    style={{
                      flexDirection: 'column',
                      alignSelf: 'center',
                      alignItems: 'center',
                      marginTop: 56,
                    }}>
                    <Image
                      source={require('../../../assets/icons/add-photo.png')}
                      style={styles.addPhoto}
                    />
                    <Text style={styles.textAddPhoto}>Edit Photo</Text>
                  </View>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  onPress={() => ASPhotoOptions.current.show()}
                  style={styles.containerPhoto}>
                  <View
                    style={{
                      flexDirection: 'column',
                      alignSelf: 'center',
                      alignItems: 'center',
                      marginTop: 56,
                    }}>
                    <Image
                      source={require('../../../assets/icons/add-photo.png')}
                      style={styles.addPhoto}
                    />
                    <Text style={styles.textAddPhoto}>Add Photo</Text>
                  </View>
                </TouchableOpacity>
              )}
            </LinearGradient>

            <ActionSheet
              ref={ASPhotoOptions}
              options={['Camera', 'Library', 'Cancel']}
              cancelButtonIndex={2}
              destructiveButtonIndex={2}
              buttonUnderlayColor={Colors.grey1}
              onPress={handleActionSheet}
              styles={{
                buttonBox: Default.actionSheetButtonBox,
                body: Default.actionSheetBody,
                cancelButtonBox: Default.actionSheetCancelButtonBox,
              }}
            />

            <View style={styles.container}>
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
                inputContainerStyle={Default.loginInputContainer}
                labelStyle={Default.loginInputLabel}
              />

              <Text style={styles.labelStyle}>Habit Description</Text>

              <TextInput
                value={habitDescription}
                numberOfLines={3}
                multiline
                onChangeText={setHabitDescription}
                keyboardAppearance="dark"
                style={styles.textInputStyle}
                placeholder="Short Habit Description"
                placeholderTextColor={'#455c8a'}
              />

              <Text style={styles.title}>Frequency</Text>

              {Platform.OS === 'ios' ? (
                <TouchableOpacity
                  style={styles.containerSelectIOS}
                  onPress={() => RBSFrequency.current.open()}>
                  <Text
                    style={[
                      styles.textSelectIOS,
                      {
                        color: frequencyTypeIOS ? Colors.primary4 : '#455c8a',
                      },
                    ]}>
                    {frequencyTypeIOS
                      ? frequencyTypeIOS
                      : 'Select habit frequency'}
                  </Text>

                  <Icon size={16} color={'#455c8a'} name="chevron-down" />
                </TouchableOpacity>
              ) : (
                <View style={styles.viewPicker}>
                  <Picker
                    selectedValue={frequencyType}
                    style={[styles.pickerStyle, styles.pickerStyleAndroid]}
                    onValueChange={(itemValue) => setFrequencyType(itemValue)}>
                    {getFrequencyTypes().map((obj, i) => (
                      <Picker.Item key={i} label={obj} value={obj} />
                    ))}
                  </Picker>
                </View>
              )}

              <RBSheet
                ref={RBSFrequency}
                height={300}
                openDuration={250}
                customStyles={{ container: styles.containerBottomSheet }}
                closeOnPressBack={false}
                closeOnPressMask={false}>
                <View style={styles.containerHeaderBottomSheet}>
                  <TouchableOpacity
                    onPress={() => closeModalIOS('frequency', false)}>
                    <Text style={styles.textHeaderBottomSheet}>Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => closeModalIOS('frequency', true)}>
                    <Text style={styles.textHeaderBottomSheet}>Confirm</Text>
                  </TouchableOpacity>
                </View>

                <Picker
                  selectedValue={frequencyTypeIOS}
                  style={[styles.pickerStyle, styles.pickerStyleIOS]}
                  itemStyle={{ color: Colors.text }}
                  onValueChange={(itemValue) => setFrequencyTypeIOS(itemValue)}>
                  {getFrequencyTypes().map((obj, i) => (
                    <Picker.Item key={i} label={obj} value={obj} />
                  ))}
                </Picker>
              </RBSheet>

              {frequencyType === 'CUSTOM' && (
                <View style={{ marginBottom: 32 }}>
                  <Text style={styles.title}>Select Days</Text>

                  <View
                    style={{
                      width: Dimensions.get('window').width - 44,
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                    }}>
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
                      <TouchableOpacity
                        key={index}
                        onPress={() => onToggleFrequencyDay(index)}>
                        <View
                          style={[
                            styles.frequencyDay,
                            frequencyDays[index]
                              ? styles.frequencyDaySelected
                              : null,
                          ]}>
                          <Text style={styles.textFrequencyDay}>{day}</Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}

              <RBSheet
                ref={RBSFillFrequencyDays}
                height={350}
                openDuration={250}
                customStyles={{
                  container: styles.containerBottomSheetFillDays,
                }}>
                <View style={styles.containerTextBottomSheet}>
                  <Image
                    style={styles.warningIconStyle}
                    source={require('../../../assets/icons/warning.png')}
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
                        {isRemind ? moment(time).format('HH:mm') : ''}
                      </Text>
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => changeTime()}>
                    <Text style={styles.textReminder}>Set Reminder</Text>
                  </TouchableOpacity>

                  {showPicker && (
                    <DateTimePicker
                      value={time}
                      mode="time"
                      is24Hour={true}
                      display="default"
                      onChange={onChangeDatePicker}
                      style={styles.datePickerStyle}
                    />
                  )}

                  <RBSheet
                    ref={RBSTime}
                    height={300}
                    openDuration={250}
                    customStyles={{
                      container: styles.containerBottomSheetDatePicker,
                    }}
                    closeOnPressBack={false}
                    closeOnPressMask={false}>
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
                  onPress={addHabit}
                  title="ADD CUSTOM HABIT"
                  disabledStyle={Default.loginNextButton}
                  disabled={sending}
                  loading={sending}
                />
              </View>
            </View>
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
    paddingLeft: 22,
  },
  containerBackButton: {
    flexDirection: 'row',
  },
  textBackButton: {
    fontSize: 16,
    color: Colors.primary4,
    marginLeft: 6,
    fontStyle: 'normal',
  },
  textCreate: {
    color: '#FCFCFC',
    fontSize: 24,
    marginTop: 24,
    marginBottom: 32,
  },
  containerButton: {
    flex: 1,
    justifyContent: 'flex-end',
    marginTop: 60,
  },
  containerHeaderImage: {
    height: 189,
    width: Dimensions.get('window').width,
    zIndex: 0,
    elevation: 0,
    marginTop: 16,
  },
  habitImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  addPhoto: {
    width: 50,
    height: 50,
    marginBottom: 8,
  },
  textAddPhoto: {
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 19,
    color: '#FCFCFC',
  },
  pickerStyle: {
    width: Dimensions.get('window').width - 44,
    backgroundColor: Colors.primary,
    borderRadius: 2,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#455c8a',
    marginHorizontal: 10,
    paddingHorizontal: 16,
    paddingVertical: 15,
    marginBottom: 32,
    fontSize: 16,
    color: Colors.text,
  },
  containerBottomSheetFillDays: {
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 22,
  },
  containerTextBottomSheet: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  warningIconStyle: {
    width: 80,
    height: 80,
  },
  textDelete: {
    marginTop: 26,
    fontSize: 14,
    color: Colors.text,
    textAlign: 'center',
    paddingHorizontal: 22,
  },
  buttonContainer: {
    marginBottom: 32,
  },
  pickerStyleAndroid: {
    marginHorizontal: 0,
    paddingVertical: 15,
    marginBottom: 0,
    color: Colors.primary4,
  },
  pickerStyleIOS: {
    backgroundColor: '#1c1c1e',
    borderWidth: 0,
    color: Colors.text,
    height: 200,
    paddingVertical: 0,
    marginVertical: 0,
  },
  labelStyle: {
    color: '#FCFCFC',
    fontSize: 16,
    marginBottom: 12,
  },
  textInputStyle: {
    borderColor: '#455c8a',
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 2,
    paddingVertical: 15,
    paddingHorizontal: 12,
    paddingTop: 15,
    fontSize: 16,
    color: Colors.primary4,
    width: Dimensions.get('window').width - 44,
    textAlignVertical: 'top',
    marginBottom: 32,
  },
  containerSelectIOS: {
    paddingVertical: 15,
    paddingHorizontal: 16,
    borderColor: '#455c8a',
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 2,
    marginBottom: 32,
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: Dimensions.get('window').width - 44,
  },
  textSelectIOS: {
    fontSize: 16,
    color: '#455c8a',
  },
  containerBottomSheet: {
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1c1c1e',
  },
  containerHeaderBottomSheet: {
    backgroundColor: '#282828',
    paddingHorizontal: 16,
    paddingVertical: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: Dimensions.get('window').width,
  },
  textHeaderBottomSheet: {
    fontSize: 16,
    color: '#d7892b',
  },
  viewPicker: {
    marginBottom: 32,
    borderRadius: 2,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#455c8a',
    alignItems: 'center',
    width: Dimensions.get('window').width - 40,
  },
  title: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '400',
    marginBottom: 12,
  },
  textContent: {
    fontSize: 16,
    color: Colors.primary4,
    fontWeight: '400',
    marginBottom: 32,
  },
  // Days
  frequencyDay: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
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
    fontWeight: '400',
  },
  // Reminder
  containerReminders: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
  },
  containerTime: {
    borderRadius: 25,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.text,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 6,
    minHeight: 28,
    width: 53,
  },
  textTime: {
    color: Colors.text,
    fontSize: 11,
    fontWeight: 'bold',
  },
  textReminder: {
    marginLeft: 15,
    fontSize: 11,
    fontWeight: 'bold',
    color: Colors.text,
    marginRight: 12,
  },
  datePickerStyle: {
    marginBottom: 20,
  },
  containerBottomSheetDatePicker: {
    justifyContent: 'space-between',
    // alignItems: "center",
    backgroundColor: '#1c1c1e',
  },
});

export default AddHabit;














// import React, { useState, useEffect, useRef } from 'react';
// import {
//   View,
//   ScrollView,
//   StyleSheet,
//   Dimensions,
//   Text,
//   TouchableOpacity,
//   TextInput,
//   Alert,
//   Platform,
//   Image,
// } from 'react-native';
// import Default from '../../../assets/styles/Default';
// import Colors from '../../../assets/styles/Colors';
// import Fetching from '../../components/Fetching';
// import Header from '../../components/Header';
// import Icon from 'react-native-vector-icons/FontAwesome5';
// import { Button, Input } from 'react-native-elements';
// import { Picker } from '@react-native-picker/picker';
// import { getAllCategory } from '../../store/ducks/habit';
// import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
// import RBSheet from 'react-native-raw-bottom-sheet';
// import { storeCustom } from '../../store/ducks/habit';
// import DateTimePicker from '@react-native-community/datetimepicker';
// import moment from 'moment';
// import { getFrequencyTypes, takeCamera, takeGaleria } from '../../utils/Utils';
// import { LinearGradient } from 'expo-linear-gradient';
// import ActionSheet from 'react-native-actionsheet';
// import * as ImagePicker from 'expo-image-picker';
// import * as mime from 'react-native-mime-types';
// import { manipulateAsync } from 'expo-image-manipulator';

// const AddHabit = props => {
//   const [sending, setSending] = useState(false);
//   const [fetching, setFetching] = useState(false);
//   const [name, setName] = useState('');
//   const [category, setCategory] = useState('');
//   const [category_ios, setCategoryIOS] = useState('');
//   const [habit_description, setHabitDecription] = useState('');
//   const [list_category, setListCategory] = useState([]);
//   const [frequency_type, setFrequencyType] = useState('EVERYDAY');
//   const [frequency_type_ios, setFrequencyTypeIos] = useState('EVERYDAY');
//   const [frequency_days, setFrequencyDays] = useState([
//     false,
//     false,
//     false,
//     false,
//     false,
//     false,
//     false,
//   ]);
//   const [isRemind, setIsRemind] = useState(false);
//   const [time, setTime] = useState(new Date());
//   const [timeIOS, setTimeIOS] = useState(new Date());
//   const [showPicker, setShowPicker] = useState(false);
//   const [habitPhoto, setHabitPhoto] = useState(null);

//   const RBSTime = useRef();
//   const RBSFrequency = useRef();
//   const RBSFillFrequencyDays = useRef();
//   const RBSCategory = useRef();
//   const ASPhotoOptions = useRef();

//   useEffect(() => {
//     fetchAll();

//     if (props.route?.params?.habit) {
//       setName(props.route.params.habit.hab_name);
//       setCategory(props.route.params.habit.hab_id_category);
//       setHabitDecription(props.route.params.habit.hab_description);
//       setCategory(props.route.params.habit.hab_id_category);
//       // setCategoryIOS(props.route.params.habit.hab_id_category);
//     }
//   }, []);

//   const fetchAll = async () => {
//     setFetching(true);

//     await getAllCategory()
//       .catch(err => {
//         Alert.alert(
//           'Ops!',
//           'Something went wrong with our servers. Please contact us.'
//         );
//       })
//       .then(res => {
//         if (res?.status === 200) {
//           setListCategory(res.data);

//           if (props.route?.params?.habit) {
//             res.data.map((obj, i) => {
//               if (obj.id === props.route.params.habit.hab_id_category) {
//                 setCategoryIOS(obj);
//               }
//             });
//           }
//         }
//       });

//     setFetching(false);
//   };

//   const addHabit = async () => {
//     if (name.trim() === '') {
//       Alert.alert(
//         'Ops!',
//         'You need to input the habit name before continuing.'
//       );
//       return;
//     } else if (category === '') {
//       Alert.alert(
//         'Ops!',
//         'You need to select the habit category before continuing.'
//       );
//       return;
//     } else if (habit_description === '') {
//       Alert.alert(
//         'Ops!',
//         'You need to input the habit description before continuing.'
//       );
//       return;
//     } else if (frequency_type === '') {
//       Alert.alert(
//         'Ops!',
//         'You need to input the habit frequency before continuing.'
//       );
//       return;
//     }

//     if (frequency_type === 'CUSTOM') {
//       let hasDaySelected = false;

//       frequency_days.map((obj, i) => {
//         if (obj) {
//           hasDaySelected = true;
//         }
//       });

//       if (!hasDaySelected) {
//         RBSFillFrequencyDays.current.open();
//         return;
//       }
//     }

//     setSending(true);

//     let notification_time = time;

//     if (moment(time).isBefore(moment())) {
//       notification_time = new Date(moment(time).add(1, 'day'));
//     }

//     // let push_identifier = isRemind ?
//     // 	await Notifications.scheduleNotificationAsync({
//     // 		content: {
//     // 			title: name,
//     // 		},
//     // 		trigger: {
//     // 			date: notification_time,
//     // 			repeats: true,
//     // 		}
//     // 	})
//     // 	: null;

//     let coh_frequency = { type: frequency_type };

//     frequency_type === 'CUSTOM' ? (coh_frequency.days = frequency_days) : null;

//     const data_frequency = JSON.stringify(coh_frequency);

//     let habitForm = new FormData();

//     habitForm.append('ush_frequency', data_frequency);
//     habitForm.append('hab_name', name);
//     habitForm.append('hab_id_category', category);
//     habitForm.append('hab_description', habit_description);

//     isRemind
//       ? habitForm.append(
//           'ush_reminder_time',
//           moment(notification_time).format('HH:mm:ss')
//         )
//       : null;

//     habitPhoto ? habitForm.append('habit_image', habitPhoto) : null;

//     storeCustom(habitForm)
//       .catch(err => {
//         Alert.alert(
//           'Ops!',
//           'Something went wrong with our servers. Please contact us.'
//         );
//       })
//       .then(res => {
//         if (res?.status === 200) {
//           if (res.data.errors) {
//             Alert.alert('Ops', res.data.errors[0]);
//           } else {
//             props.navigation.push('HabitSuccess');
//           }
//         }

//         setSending(false);
//       });
//   };

//   const closeModalIOS = (modal, change) => {
//     if (modal === 'category') {
//       if (change) {
//         setCategory(category_ios.id);
//       } else {
//         list_category.map((obj, i) => {
//           if (obj.id === category) {
//             setCategoryIOS(obj);
//           }
//         });
//       }

//       RBSCategory.current.close();
//     }

//     if (modal === 'frequency') {
//       if (change) {
//         setFrequencyType(frequency_type_ios);
//       } else {
//         setFrequencyTypeIos(frequency_type);
//       }

//       RBSFrequency.current.close();
//     }
//   };

//   const onToggleFrequencyDay = day => {
//     let days = [...frequency_days];

//     days[day] = !days[day];

//     setFrequencyDays(days);
//   };

//   const changeTime = () => {
//     if (Platform.OS === 'ios') {
//       RBSTime.current.open();
//     } else {
//       setShowPicker(true);
//     }
//   };

//   const onChangeDatePicker = (event, selectedDate) => {
//     setShowPicker(false);

//     if (Platform.OS === 'ios') {
//       setTimeIOS(selectedDate);
//     } else {
//       if (event.type !== 'dismissed') {
//         setIsRemind(true);
//         setTime(selectedDate);
//       }
//     }
//   };

//   const doSetTimeIOS = changeTime => {
//     RBSTime.current.close();

//     if (changeTime) {
//       setIsRemind(true);
//       setTime(timeIOS);
//     } else {
//       setTimeIOS(time);
//     }
//   };

//   const doSetCategoryIOS = (value, index) => {
//     list_category.map((obj, i) => {
//       if (obj.id === value) {
//         setCategoryIOS(obj);
//       }
//     });
//   };

//   const handleActionSheet = async index => {
//     if (index === 0) {
//       let { status } = await ImagePicker.requestCameraPermissionsAsync();

//       if (status === 'granted') {
//         pickCamera();
//       } else {
//         Alert.alert('Ops', 'You need to allow access to the camera first.');
//       }
//     } else if (index === 1) {
//       let { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

//       if (status === 'granted') {
//         pickGaleria();
//       } else {
//         Alert.alert('Ops', 'You need to allow access to the camera first.');
//       }
//     }
//   };

//   const pickCamera = async () => {
//     let result = await takeCamera();

//     if (result === 'failed') {
//       Alert.alert('Ops', 'An error ocurred when trying to open the camera.');
//       return;
//     }

//     if (result?.uri) {
//       setAnexos(result);
//     }
//   };

//   const pickGaleria = async () => {
//     let result = await takeGaleria();

//     if (result === 'failed') {
//       Alert.alert('Ops', 'An error ocurred when trying to open the library.');
//       return;
//     }

//     if (result?.uri) {
//       setAnexos(result);
//     }
//   };

//   const setAnexos = foto => {
//     let auxFoto = { ...foto };
//     auxFoto.url = foto.uri;

//     setHabitPhoto(auxFoto);
//   };

//   return (
//     <View style={Default.container}>
//       <Header navigation={props.navigation} backButton title="Create Habit" />

//       <KeyboardAwareScrollView
//         extraHeight={120}
//         contentContainerStyle={Default.container}>
//         <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
//           <Fetching isFetching={fetching}>
//             <LinearGradient
//               colors={['rgba(114, 198, 239, 0.3)', 'rgba(0, 78, 143, 0.138)']}
//               start={{ x: 0, y: 0.5 }}
//               end={{ x: 1, y: 0.5 }}
//               style={styles.containerHeaderImage}>
//               {habitPhoto ? (
//                 <>
//                   <TouchableOpacity
//                     onPress={() => ASPhotoOptions.current.show()}
//                     style={styles.habitImage}>
//                     <Image
//                       source={{ uri: habitPhoto.url }}
//                       style={styles.habitImage}
//                       resizeMode="cover"
//                     />
//                     <View
//                       style={{
//                         flexDirection: 'column',
//                         alignSelf: 'center',
//                         alignItems: 'center',
//                         marginTop: 56,
//                       }}>
//                       <Image
//                         source={require('../../../assets/icons/add-photo.png')}
//                         style={styles.addPhoto}
//                       />
//                       <Text style={styles.textAddPhoto}>Edit Photo</Text>
//                     </View>
//                   </TouchableOpacity>
//                 </>
//               ) : (
//                 <>
//                   <TouchableOpacity
//                     onPress={() => ASPhotoOptions.current.show()}
//                     style={styles.containerPhoto}>
//                     <View
//                       style={{
//                         flexDirection: 'column',
//                         alignSelf: 'center',
//                         alignItems: 'center',
//                         marginTop: 56,
//                       }}>
//                       <Image
//                         source={require('../../../assets/icons/add-photo.png')}
//                         style={styles.addPhoto}
//                       />
//                       <Text style={styles.textAddPhoto}>Add Photo</Text>
//                     </View>
//                   </TouchableOpacity>
//                 </>
//               )}
//             </LinearGradient>

//             <ActionSheet
//               ref={ASPhotoOptions}
//               options={['Camera', 'Library', 'Cancel']}
//               cancelButtonIndex={2}
//               destructiveButtonIndex={2}
//               buttonUnderlayColor={Colors.grey1}
//               onPress={index => handleActionSheet(index)}
//               styles={{
//                 buttonBox: Default.actionSheetButtonBox,
//                 body: Default.actionSheetBody,
//                 cancelButtonBox: Default.actionSheetCancelButtonBox,
//               }}
//             />

//             <View style={styles.container}>
//               <Input
//                 label="Name"
//                 placeholder="Habit Name"
//                 value={name}
//                 onChangeText={setName}
//                 keyboardAppearance="dark"
//                 autoFocus={false}
//                 autoCorrect={false}
//                 returnKeyType="next"
//                 placeholderTextColor="#455c8a"
//                 containerStyle={Default.containerInput}
//                 inputStyle={Default.loginInput}
//                 inputContainerStyle={Default.loginInputContainer}
//                 labelStyle={Default.loginInputLabel}
//               />

//               <Text style={styles.labelStyle}>Category</Text>

//               {Platform.OS === 'ios' ? (
//                 <TouchableOpacity
//                   style={styles.containerSelectIOS}
//                   onPress={() => RBSCategory.current.open()}>
//                   <Text
//                     style={[
//                       styles.textSelectIOS,
//                       { color: category_ios ? Colors.primary4 : '#455c8a' },
//                     ]}>
//                     {category_ios
//                       ? category_ios.hac_name
//                       : 'Select habits category'}
//                   </Text>

//                   <Icon size={16} color={'#455c8a'} name="chevron-down" />
//                 </TouchableOpacity>
//               ) : (
//                 <View style={styles.viewPicker}>
//                   <Picker
//                     selectedValue={category}
//                     style={[styles.pickerStyle, styles.pickerStyleAndroid]}
//                     onValueChange={(itemValue, itemIndex) =>
//                       setCategory(itemValue)
//                     }>
//                     {list_category.map((obj, i) => {
//                       return (
//                         <Picker.Item
//                           key={i}
//                           label={obj.hac_name}
//                           value={obj.id}
//                         />
//                       );
//                     })}
//                   </Picker>
//                 </View>
//               )}

//               <RBSheet
//                 ref={RBSCategory}
//                 height={300}
//                 openDuration={250}
//                 customStyles={{ container: styles.containerBottomSheet }}
//                 closeOnPressBack={false}
//                 closeOnPressMask={false}>
//                 <View style={styles.containerHeaderBottomSheet}>
//                   <TouchableOpacity
//                     onPress={() => closeModalIOS('category', false)}>
//                     <Text style={styles.textHeaderBottomSheet}>Cancel</Text>
//                   </TouchableOpacity>

//                   <TouchableOpacity
//                     onPress={() => closeModalIOS('category', true)}>
//                     <Text style={styles.textHeaderBottomSheet}>Confirm</Text>
//                   </TouchableOpacity>
//                 </View>

//                 <Picker
//                   selectedValue={category_ios.id}
//                   style={[styles.pickerStyle, styles.pickerStyleIOS]}
//                   itemStyle={{ color: Colors.text }}
//                   onValueChange={(itemValue, itemIndex) =>
//                     doSetCategoryIOS(itemValue)
//                   }>
//                   {list_category.map((obj, i) => {
//                     return (
//                       <Picker.Item
//                         key={i}
//                         label={obj.hac_name}
//                         value={obj.id}
//                       />
//                     );
//                   })}
//                 </Picker>
//               </RBSheet>

//               <Text style={styles.labelStyle}>Habit Description</Text>

//               <TextInput
//                 value={habit_description}
//                 numberOfLines={3}
//                 multiline
//                 onChangeText={setHabitDecription}
//                 keyboardAppearance="dark"
//                 style={styles.textInputStyle}
//                 placeholder="Short Habit Description"
//                 placeholderTextColor={'#455c8a'}
//               />

//               <Text style={styles.title}>Frequency</Text>

//               {Platform.OS === 'ios' ? (
//                 <TouchableOpacity
//                   style={styles.containerSelectIOS}
//                   onPress={() => RBSFrequency.current.open()}>
//                   <Text
//                     style={[
//                       styles.textSelectIOS,
//                       {
//                         color: frequency_type_ios ? Colors.primary4 : '#455c8a',
//                       },
//                     ]}>
//                     {frequency_type_ios
//                       ? frequency_type_ios
//                       : 'Select habit frequency'}
//                   </Text>

//                   <Icon size={16} color={'#455c8a'} name="chevron-down" />
//                 </TouchableOpacity>
//               ) : (
//                 <View style={styles.viewPicker}>
//                   <Picker
//                     selectedValue={frequency_type}
//                     style={[styles.pickerStyle, styles.pickerStyleAndroid]}
//                     onValueChange={(itemValue, itemIndex) =>
//                       setFrequencyType(itemValue)
//                     }>
//                     {getFrequencyTypes().map((obj, i) => {
//                       return <Picker.Item key={i} label={obj} value={obj} />;
//                     })}
//                   </Picker>
//                 </View>
//               )}

//               <RBSheet
//                 ref={RBSFrequency}
//                 height={300}
//                 openDuration={250}
//                 customStyles={{ container: styles.containerBottomSheet }}
//                 closeOnPressBack={false}
//                 closeOnPressMask={false}>
//                 <View style={styles.containerHeaderBottomSheet}>
//                   <TouchableOpacity
//                     onPress={() => closeModalIOS('frequency', false)}>
//                     <Text style={styles.textHeaderBottomSheet}>Cancel</Text>
//                   </TouchableOpacity>

//                   <TouchableOpacity
//                     onPress={() => closeModalIOS('frequency', true)}>
//                     <Text style={styles.textHeaderBottomSheet}>Confirm</Text>
//                   </TouchableOpacity>
//                 </View>

//                 <Picker
//                   selectedValue={frequency_type_ios}
//                   style={[styles.pickerStyle, styles.pickerStyleIOS]}
//                   itemStyle={{ color: Colors.text }}
//                   onValueChange={(itemValue, itemIndex) =>
//                     setFrequencyTypeIos(itemValue)
//                   }>
//                   {getFrequencyTypes().map((obj, i) => {
//                     return <Picker.Item key={i} label={obj} value={obj} />;
//                   })}
//                 </Picker>
//               </RBSheet>

//               {frequency_type === 'CUSTOM' ? (
//                 <View style={{ marginBottom: 32 }}>
//                   <Text style={styles.title}>Select Days</Text>

//                   <View
//                     style={{
//                       width: Dimensions.get('window').width - 44,
//                       flexDirection: 'row',
//                       justifyContent: 'space-between',
//                     }}>
//                     <TouchableOpacity onPress={() => onToggleFrequencyDay(1)}>
//                       <View
//                         style={[
//                           styles.frequencyDay,
//                           frequency_days[1]
//                             ? styles.frequencyDaySelected
//                             : null,
//                         ]}>
//                         <Text style={styles.textFrequencyDay}>M</Text>
//                       </View>
//                     </TouchableOpacity>

//                     <TouchableOpacity onPress={() => onToggleFrequencyDay(2)}>
//                       <View
//                         style={[
//                           styles.frequencyDay,
//                           frequency_days[2]
//                             ? styles.frequencyDaySelected
//                             : null,
//                         ]}>
//                         <Text style={styles.textFrequencyDay}>T</Text>
//                       </View>
//                     </TouchableOpacity>

//                     <TouchableOpacity onPress={() => onToggleFrequencyDay(3)}>
//                       <View
//                         style={[
//                           styles.frequencyDay,
//                           frequency_days[3]
//                             ? styles.frequencyDaySelected
//                             : null,
//                         ]}>
//                         <Text style={styles.textFrequencyDay}>W</Text>
//                       </View>
//                     </TouchableOpacity>

//                     <TouchableOpacity onPress={() => onToggleFrequencyDay(4)}>
//                       <View
//                         style={[
//                           styles.frequencyDay,
//                           frequency_days[4]
//                             ? styles.frequencyDaySelected
//                             : null,
//                         ]}>
//                         <Text style={styles.textFrequencyDay}>T</Text>
//                       </View>
//                     </TouchableOpacity>

//                     <TouchableOpacity onPress={() => onToggleFrequencyDay(5)}>
//                       <View
//                         style={[
//                           styles.frequencyDay,
//                           frequency_days[5]
//                             ? styles.frequencyDaySelected
//                             : null,
//                         ]}>
//                         <Text style={styles.textFrequencyDay}>F</Text>
//                       </View>
//                     </TouchableOpacity>

//                     <TouchableOpacity onPress={() => onToggleFrequencyDay(6)}>
//                       <View
//                         style={[
//                           styles.frequencyDay,
//                           frequency_days[6]
//                             ? styles.frequencyDaySelected
//                             : null,
//                         ]}>
//                         <Text style={styles.textFrequencyDay}>S</Text>
//                       </View>
//                     </TouchableOpacity>

//                     <TouchableOpacity onPress={() => onToggleFrequencyDay(0)}>
//                       <View
//                         style={[
//                           styles.frequencyDay,
//                           frequency_days[0]
//                             ? styles.frequencyDaySelected
//                             : null,
//                         ]}>
//                         <Text style={styles.textFrequencyDay}>S</Text>
//                       </View>
//                     </TouchableOpacity>
//                   </View>
//                 </View>
//               ) : null}

//               <RBSheet
//                 ref={RBSFillFrequencyDays}
//                 height={350}
//                 openDuration={250}
//                 customStyles={{
//                   container: styles.containerBottomSheetFillDays,
//                 }}>
//                 <View style={styles.containerTextBottomSheet}>
//                   <Image
//                     style={styles.warningIconStyle}
//                     source={require('../../../assets/icons/warning.png')}
//                   />
//                   <Text style={styles.textDelete}>
//                     You must complete the frequency of the new habit to continue
//                   </Text>
//                 </View>

//                 <View style={styles.buttonContainer}>
//                   <Button
//                     buttonStyle={Default.loginNextButton}
//                     titleStyle={Default.loginButtonBoldTitle}
//                     onPress={() => RBSFillFrequencyDays.current.close()}
//                     title="BACK TO COMPLETE HABIT"
//                   />
//                 </View>
//               </RBSheet>

//               <View style={{ marginBottom: 32 }}>
//                 <Text style={styles.title}>Reminders</Text>

//                 <View style={styles.containerReminders}>
//                   <TouchableOpacity onPress={() => changeTime()}>
//                     <View style={styles.containerTime}>
//                       <Text style={styles.textTime}>
//                         {isRemind ? moment(time).format('HH:mm') : ''}
//                       </Text>
//                     </View>
//                   </TouchableOpacity>

//                   <TouchableOpacity onPress={() => changeTime()}>
//                     <Text style={styles.textReminder}>Set Reminder</Text>
//                   </TouchableOpacity>

//                   {showPicker ? (
//                     <DateTimePicker
//                       value={time}
//                       mode="time"
//                       is24Hour={true}
//                       display="default"
//                       onChange={onChangeDatePicker}
//                       style={styles.datePickerStyle}
//                     />
//                   ) : null}

//                   <RBSheet
//                     ref={RBSTime}
//                     height={300}
//                     openDuration={250}
//                     customStyles={{
//                       container: styles.containerBottomSheetDatePicker,
//                     }}
//                     closeOnPressBack={false}
//                     closeOnPressMask={false}>
//                     <View style={styles.containerHeaderBottomSheet}>
//                       <TouchableOpacity onPress={() => doSetTimeIOS(false)}>
//                         <Text style={styles.textHeaderBottomSheet}>Cancel</Text>
//                       </TouchableOpacity>

//                       <TouchableOpacity onPress={() => doSetTimeIOS(true)}>
//                         <Text style={styles.textHeaderBottomSheet}>
//                           Confirm
//                         </Text>
//                       </TouchableOpacity>
//                     </View>

//                     <DateTimePicker
//                       value={timeIOS}
//                       mode="time"
//                       is24Hour={true}
//                       display="spinner"
//                       onChange={onChangeDatePicker}
//                       style={styles.datePickerStyle}
//                       textColor={Colors.text}
//                     />
//                   </RBSheet>
//                 </View>
//               </View>

//               <View style={styles.containerButton}>
//                 <Button
//                   buttonStyle={[Default.loginNextButton]}
//                   titleStyle={Default.loginButtonBoldTitle}
//                   onPress={addHabit}
//                   title="ADD CUSTOM HABIT"
//                   disabledStyle={Default.loginNextButton}
//                   disabled={sending}
//                   loading={sending}
//                 />
//               </View>
//             </View>
//           </Fetching>
//         </ScrollView>
//       </KeyboardAwareScrollView>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     paddingVertical: 32,
//     paddingLeft: 22,
//   },
//   containerBackButton: {
//     flexDirection: 'row',
//   },
//   textBackButton: {
//     fontSize: 16,
//     color: Colors.primary4,
//     marginLeft: 6,
//     fontStyle: 'normal',
//   },
//   textCreate: {
//     color: '#FCFCFC',
//     fontSize: 24,
//     marginTop: 24,
//     marginBottom: 32,
//   },
//   containerButton: {
//     flex: 1,
//     justifyContent: 'flex-end',
//     marginTop: 60,
//   },
//   containerHeaderImage: {
//     height: 189,
//     width: Dimensions.get('window').width,
//     zIndex: 0,
//     elevation: 0,
//     marginTop: 16,
//   },
//   habitImage: {
//     width: '100%',
//     height: '100%',
//     position: 'absolute',
//   },
//   addPhoto: {
//     width: 50,
//     height: 50,
//     marginBottom: 8,
//   },
//   textAddPhoto: {
//     fontWeight: '400',
//     fontSize: 16,
//     lineHeight: 19,
//     color: '#FCFCFC',
//   },
//   pickerStyle: {
//     width: Dimensions.get('window').width - 44,
//     backgroundColor: Colors.primary,
//     borderRadius: 2,
//     borderWidth: StyleSheet.hairlineWidth,
//     borderColor: '#455c8a',
//     marginHorizontal: 10,
//     paddingHorizontal: 16,
//     paddingVertical: 15,
//     marginBottom: 32,
//     fontSize: 16,
//     color: Colors.text,
//   },
//   containerBottomSheetFillDays: {
//     alignItems: 'center',
//     backgroundColor: Colors.primary,
//     paddingHorizontal: 22,
//   },
//   containerTextBottomSheet: {
//     flex: 1,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   warningIconStyle: {
//     width: 80,
//     height: 80,
//   },
//   textDelete: {
//     marginTop: 26,
//     fontSize: 14,
//     color: Colors.text,
//     textAlign: 'center',
//     paddingHorizontal: 22,
//   },
//   buttonContainer: {
//     marginBottom: 32,
//   },
//   pickerStyleAndroid: {
//     marginHorizontal: 0,
//     paddingVertical: 15,
//     marginBottom: 0,
//     color: Colors.primary4,
//   },
//   pickerStyleIOS: {
//     backgroundColor: '#1c1c1e',
//     borderWidth: 0,
//     color: Colors.text,
//     height: 200,
//     paddingVertical: 0,
//     marginVertical: 0,
//   },
//   labelStyle: {
//     color: '#FCFCFC',
//     fontSize: 16,
//     marginBottom: 12,
//   },
//   textInputStyle: {
//     borderColor: '#455c8a',
//     borderWidth: StyleSheet.hairlineWidth,
//     borderRadius: 2,
//     paddingVertical: 15,
//     paddingHorizontal: 12,
//     paddingTop: 15,
//     fontSize: 16,
//     color: Colors.primary4,
//     width: Dimensions.get('window').width - 44,
//     textAlignVertical: 'top',
//     marginBottom: 32,
//   },
//   containerSelectIOS: {
//     paddingVertical: 15,
//     paddingHorizontal: 16,
//     borderColor: '#455c8a',
//     borderWidth: StyleSheet.hairlineWidth,
//     borderRadius: 2,
//     marginBottom: 32,
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     width: Dimensions.get('window').width - 44,
//   },
//   textSelectIOS: {
//     fontSize: 16,
//     color: '#455c8a',
//   },
//   containerBottomSheet: {
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     backgroundColor: '#1c1c1e',
//   },
//   containerHeaderBottomSheet: {
//     backgroundColor: '#282828',
//     paddingHorizontal: 16,
//     paddingVertical: 15,
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     width: Dimensions.get('window').width,
//   },
//   textHeaderBottomSheet: {
//     fontSize: 16,
//     color: '#d7892b',
//   },
//   viewPicker: {
//     marginBottom: 32,
//     borderRadius: 2,
//     borderWidth: StyleSheet.hairlineWidth,
//     borderColor: '#455c8a',
//     alignItems: 'center',
//     width: Dimensions.get('window').width - 40,
//   },
//   title: {
//     color: Colors.text,
//     fontSize: 16,
//     fontWeight: '400',
//     marginBottom: 12,
//   },
//   textContent: {
//     fontSize: 16,
//     color: Colors.primary4,
//     fontWeight: '400',
//     marginBottom: 32,
//   },
//   // Days
//   frequencyDay: {
//     width: 36,
//     height: 36,
//     borderRadius: 18,
//     alignItems: 'center',
//     justifyContent: 'center',
//     borderWidth: StyleSheet.hairlineWidth,
//     borderColor: Colors.text,
//   },
//   frequencyDaySelected: {
//     borderColor: Colors.primary4,
//     backgroundColor: Colors.primary4,
//   },
//   textFrequencyDay: {
//     fontSize: 12,
//     color: Colors.text,
//     fontWeight: '400',
//   },
//   // Reminder
//   containerReminders: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginTop: 24,
//   },
//   containerTime: {
//     borderRadius: 25,
//     borderWidth: StyleSheet.hairlineWidth,
//     borderColor: Colors.text,
//     justifyContent: 'center',
//     alignItems: 'center',
//     paddingVertical: 6,
//     minHeight: 28,
//     width: 53,
//   },
//   textTime: {
//     color: Colors.text,
//     fontSize: 11,
//     fontWeight: 'bold',
//   },
//   textReminder: {
//     marginLeft: 15,
//     fontSize: 11,
//     fontWeight: 'bold',
//     color: Colors.text,
//     marginRight: 12,
//   },
//   datePickerStyle: {
//     marginBottom: 20,
//   },
//   containerBottomSheetDatePicker: {
//     justifyContent: 'space-between',
//     // alignItems: "center",
//     backgroundColor: '#1c1c1e',
//   },
// });

// export default AddHabit;

