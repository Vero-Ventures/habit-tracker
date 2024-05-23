import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import 'react-native-get-random-values';
import {
  View,
  ScrollView,
  StyleSheet,
  Dimensions,
  Text,
  TouchableOpacity,
  TextInput,
  Alert,
  Image,
  Platform,
} from 'react-native';
import { v4 as uuidv4 } from 'uuid';
import { decode } from 'base64-arraybuffer';
import Default from '../../../assets/styles/Default';
import Colors from '../../../assets/styles/Colors';
import Header from '../../components/Header';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { Button, Input } from 'react-native-elements';
import { Picker } from '@react-native-picker/picker';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import RBSheet from 'react-native-raw-bottom-sheet';
import { getFrequencyTypes } from '../../utils/Utils';
import { LinearGradient } from 'expo-linear-gradient';
import ActionSheet from 'react-native-actionsheet';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../../config/supabaseClient';

const AddHabit = props => {
  const [sending, setSending] = useState(false);
  const [name, setName] = useState('');
  const [habit_description, setHabitDecription] = useState('');
  const [frequency_type, setFrequencyType] = useState('EVERYDAY');
  const [frequency_type_ios, setFrequencyTypeIos] = useState('EVERYDAY');
  const [habitPhoto, setHabitPhoto] = useState(null);

  const RBSFrequency = useRef();
  const RBSFillFrequencyDays = useRef();
  const ASPhotoOptions = useRef();

  useEffect(() => {
    if (props.route?.params?.habit) {
      setName(props.route.params.habit.hab_name);
      setHabitDecription(props.route.params.habit.hab_description);
    }
  }, []);

  const closeModalIOS = (modal, change) => {
    if (modal === 'frequency') {
      if (change) {
        setFrequencyType(frequency_type_ios);
      } else {
        setFrequencyTypeIos(frequency_type);
      }
      RBSFrequency.current.close();
    }
  };

  const blobToBase64 = (blob) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = () => {
        const base64data = reader.result.split(',')[1];
        resolve(base64data);
      };
      reader.onerror = () => {
        reject(new Error('Failed to convert blob to base64'));
      };
    });
  };

  const addHabit = async () => {
    const { data: user, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      Alert.alert('Error', 'User not authenticated');
      setSending(false);
      return;
    }

    const userId = user.user.id;
    console.log('User ID:', userId);

    if (name.trim() === '' || habit_description === '' || frequency_type === '') {
      Alert.alert('Oops!', 'All fields are required.');
      return;
    }

    setSending(true);

    let habitPhotoUrl = null;
    if (habitPhoto && habitPhoto.uri) {
      const fileName = `${Date.now()}_${habitPhoto.uri.split('/').pop()}`;
      console.log('Uploading file:', fileName);

      try {
        const response = await fetch(habitPhoto.uri);
        const blob = await response.blob();

        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64data = reader.result.split(',')[1];
          const arrayBuffer = decode(base64data);

          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('habit')
            .upload(fileName, arrayBuffer, {
              cacheControl: '3600',
              upsert: false,
              contentType: 'image/jpeg',
            });

          if (uploadError) {
            console.error('Upload error:', uploadError);
            Alert.alert('Error', uploadError.message);
            setSending(false);
            return;
          }
          console.log('Upload data:', uploadData);

          const publicUrlResponse = supabase.storage.from('habit').getPublicUrl(fileName);
          console.log('getPublicUrl:', publicUrlResponse);
          habitPhotoUrl = publicUrlResponse.data.publicUrl;
          console.log('publicUrl:', habitPhotoUrl);

          if (!habitPhotoUrl) {
            Alert.alert('Error', 'Failed to generate public URL for the image');
            setSending(false);
            return;
          }

          const habitId = uuidv4(); 

          // insert
          const { data: insertData, error: insertError } = await supabase
            .from('Habit')
            .insert([{ habit_id: habitId, habit_title: name, habit_description, habit_photo: habitPhotoUrl }])
            .select();

          if (insertError) {
            console.error('Insert error:', insertError);
            Alert.alert('Error', insertError.message);
            setSending(false);
            return;
          }
          console.log('Inserted Habit:', insertData);

          if (!insertData || insertData.length === 0) {
            Alert.alert('Error', 'Failed to insert habit');
            setSending(false);
            return;
          }

          const { data: scheduleData, error: scheduleError } = await supabase
            .from('Schedule')
            .insert([{
              habit_id: habitId,
              user_id: userId,
              created_at: new Date().toISOString(),
              schedule_state: 'Open',
              schedule_active_days: 0,
              schedule_quantity: '10',
            }])
            .select();

          if (scheduleError) {
            console.error('Schedule insert error:', scheduleError);
            Alert.alert('Error', scheduleError.message);
          } else {
            console.log('Schedule Data:', scheduleData);
            props.navigation.navigate('Habits');
          }

          setSending(false);
        };
        reader.readAsDataURL(blob);
      } catch (fetchError) {
        console.error('Fetch error:', fetchError);
        Alert.alert('Error', 'Failed to create Blob from the image URI');
        setSending(false);
        return;
      }
    } else {
      const habitId = uuidv4(); // generate unique identifier for the new habit

      // insert
      const { data: insertData, error: insertError } = await supabase
        .from('Habit')
        .insert([{ habit_id: habitId, habit_title: name, habit_description, habit_photo: habitPhotoUrl }])
        .select();

      if (insertError) {
        console.error('Insert error:', insertError);
        Alert.alert('Error', insertError.message);
        setSending(false);
        return;
      }
      console.log('Inserted Habit:', insertData);

      if (!insertData || insertData.length === 0) {
        Alert.alert('Error', 'Failed to insert habit');
        setSending(false);
        return;
      }

      const { data: scheduleData, error: scheduleError } = await supabase
        .from('Schedule')
        .insert([{
          habit_id: habitId,
          user_id: userId,
          created_at: new Date().toISOString(),
          schedule_state: 'Open',
          schedule_active_days: 0,
          schedule_quantity: '10',
        }])
        .select();

      if (scheduleError) {
        console.error('Schedule insert error:', scheduleError);
        Alert.alert('Error', scheduleError.message);
      } else {
        console.log('Schedule Data:', scheduleData);
        props.navigation.navigate('Habits');
      }

      setSending(false);
    }
  };

  const handleActionSheet = async index => {
    if (index === 0) {
      let { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status === 'granted') {
        pickCamera();
      } else {
        Alert.alert('Ops', 'You need to allow access to the camera first.');
      }
    } else if (index === 1) {
      let { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status === 'granted') {
        pickGallery();
      } else {
        Alert.alert('Ops', 'You need to allow access to the library first.');
      }
    }
  };

  const pickCamera = async () => {
    let result = await ImagePicker.launchCameraAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images });
    if (!result.cancelled) {
      console.log('Camera result:', result);
      setHabitPhoto(result.assets[0]);
    }
  };

  const pickGallery = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images });
    if (!result.cancelled) {
      console.log('Gallery result:', result);
      setHabitPhoto(result.assets[0]);
    }
  };
  
  return (
    <View style={Default.container}>
      <Header navigation={props.navigation} backButton title="Create Habit" />

      <KeyboardAwareScrollView extraHeight={120} contentContainerStyle={Default.container}>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <LinearGradient
            colors={['rgba(114, 198, 239, 0.3)', 'rgba(0, 78, 143, 0.138)']}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={styles.containerHeaderImage}>
            {habitPhoto ? (
              <TouchableOpacity onPress={() => ASPhotoOptions.current.show()} style={styles.habitImage}>
                <Image source={{ uri: habitPhoto.uri }} style={styles.habitImage} resizeMode="cover" />
                <View style={{ flexDirection: 'column', alignSelf: 'center', alignItems: 'center', marginTop: 56 }}>
                  <Image source={require('../../../assets/icons/add-photo.png')} style={styles.addPhoto} />
                  <Text style={styles.textAddPhoto}>Edit Photo</Text>
                </View>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity onPress={() => ASPhotoOptions.current.show()} style={styles.containerPhoto}>
                <View style={{ flexDirection: 'column', alignSelf: 'center', alignItems: 'center', marginTop: 56 }}>
                  <Image source={require('../../../assets/icons/add-photo.png')} style={styles.addPhoto} />
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
            onPress={index => handleActionSheet(index)}
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
              value={habit_description}
              numberOfLines={3}
              multiline
              onChangeText={setHabitDecription}
              keyboardAppearance="dark"
              style={styles.textInputStyle}
              placeholder="Short Habit Description"
              placeholderTextColor={'#455c8a'}
            />

            <Text style={styles.title}>Frequency</Text>
            {Platform.OS === 'ios' ? (
              <TouchableOpacity style={styles.containerSelectIOS} onPress={() => RBSFrequency.current.open()}>
                <Text style={[styles.textSelectIOS, { color: frequency_type_ios ? Colors.primary4 : '#455c8a' }]}>
                  {frequency_type_ios ? frequency_type_ios : 'Select habit frequency'}
                </Text>
                <Icon size={16} color={'#455c8a'} name="chevron-down" />
              </TouchableOpacity>
            ) : (
              <View style={styles.viewPicker}>
                <Picker
                  selectedValue={frequency_type}
                  style={[styles.pickerStyle, styles.pickerStyleAndroid]}
                  onValueChange={itemValue => setFrequencyType(itemValue)}>
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
              closeOnPressMask={false}>
              <View style={styles.containerHeaderBottomSheet}>
                <TouchableOpacity onPress={() => closeModalIOS('frequency', false)}>
                  <Text style={styles.textHeaderBottomSheet}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => closeModalIOS('frequency', true)}>
                  <Text style={styles.textHeaderBottomSheet}>Confirm</Text>
                </TouchableOpacity>
              </View>
              <Picker
                selectedValue={frequency_type_ios}
                style={[styles.pickerStyle, styles.pickerStyleIOS]}
                itemStyle={{ color: Colors.text }}
                onValueChange={itemValue => setFrequencyTypeIos(itemValue)}>
                {getFrequencyTypes().map((obj, i) => {
                  return <Picker.Item key={i} label={obj} value={obj} />;
                })}
              </Picker>
            </RBSheet>

            {frequency_type === 'CUSTOM' && (
              <View style={{ marginBottom: 32 }}>
                <Text style={styles.title}>Select Days</Text>
                <View style={{ width: Dimensions.get('window').width - 44, flexDirection: 'row', justifyContent: 'space-between' }}>
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
                    <TouchableOpacity key={index} onPress={() => onToggleActiveDay(index)}>
                      <View style={[styles.frequencyDay, getActiveDay(index) ? styles.frequencyDaySelected : null]}>
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
              customStyles={{ container: styles.containerBottomSheetFillDays }}>
              <View style={styles.containerTextBottomSheet}>
                <Image style={styles.warningIconStyle} source={require('../../../assets/icons/warning.png')} />
                <Text style={styles.textDelete}>You must complete the frequency of the new habit to continue</Text>
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
});

AddHabit.propTypes = {
  navigation: PropTypes.object,
  route: PropTypes.object,
};

export default AddHabit;

