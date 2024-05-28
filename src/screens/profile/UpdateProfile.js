import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  ScrollView,
  Dimensions,
  StyleSheet,
  Image,
  Text,
  Alert,
  TouchableOpacity,
  Platform,
} from 'react-native';
import Default from '../../../assets/styles/Default';
import Colors from '../../../assets/styles/Colors';
import Header from '../../components/Header';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
// import { useDispatch, useSelector } from "react-redux";
import { Button, Input, Avatar } from 'react-native-elements';
import { systemWeights } from 'react-native-typography';
import ActionSheet from 'react-native-actionsheet';
import * as ImagePicker from 'expo-image-picker';
import * as mime from 'react-native-mime-types';
// import { deleteAccount, logout, update } from "../../store/ducks/user";
import Icon from 'react-native-vector-icons/FontAwesome5';
import { LinearGradient } from 'expo-linear-gradient';
import Fetching from '../../components/Fetching';
import { takeCamera, takeGaleria } from '../../utils/Utils';

const UpdateProfile = props => {
  const [userPhoto, setUserPhoto] = useState(null);
  const [userName, setUserName] = useState('');
  const [gender, setGender] = useState(null);
  const [userEmail, setUserEmail] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const [userPasswordConfirmation, setUserPasswordConfirmation] = useState('');
  const [loading, setLoading] = useState(false);

  // const user = useSelector(({ user }) => user);
  // const { isFetching } = useSelector(({ fetching }) => fetching);

  // const dispatch = useDispatch();

  const ASPhotoOptions = useRef();

  // useEffect(() => {
  //   setUserPhoto(user.image);
  //   setUserName(user.name);
  //   setUserEmail(user.email);
  //   setGender(user.usr_gender);
  // }, []);

  // Mock values
  useEffect(() => {
    setUserPhoto(null);
    setUserName('Default Name');
    setUserEmail('email@example.com');
    setGender(null);
  }, []);

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
        pickGaleria();
      } else {
        Alert.alert('Ops', 'You need to allow access to the library first.');
      }
    }
  };

  const pickCamera = async () => {
    let result = await takeCamera();

    if (result === 'failed') {
      Alert.alert('Ops', 'An error occurred when trying to open the camera.');
      return;
    }

    if (result?.uri) {
      setAnexos(result);
    }
  };

  const pickGaleria = async () => {
    let result = await takeGaleria();

    if (result === 'failed') {
      Alert.alert('Ops', 'An error occurred when trying to open the library.');
      return;
    }

    if (result?.uri) {
      setAnexos(result);
    }
  };

  const setAnexos = foto => {
    let auxFoto = { ...foto };
    auxFoto.url = foto.uri;

    setUserPhoto(auxFoto);
  };

  const saveUserData = () => {
    if (userPassword.trim() !== '' || userPasswordConfirmation.trim() !== '') {
      if (userPassword !== userPasswordConfirmation) {
        Alert.alert('Ops', 'The passwords do not match.');
        return;
      }
    }

    if (!gender) {
      Alert.alert('Ops', 'Please select a gender.');
      return;
    }

    let userData = {
      name: userName,
      email: userEmail,
      gender: gender,
    };

    if (userPassword.trim() !== '') userData.password = userPassword.trim();
    if (userPhoto !== null) userData.profile_picture = userPhoto;

    // dispatch(update(userData, props.navigation));
  };

  const deleteProfile = () => {
    Alert.alert(
      'DELETE ACCOUNT',
      'Are you sure? This action cannot be undone.',
      [
        {
          text: 'No',
          onPress: () => {},
          style: 'cancel',
        },
        {
          text: 'Yes',
          onPress: () => {
            doDeleteProfile();
          },
        },
      ],
      { cancelable: false }
    );
  };

  const doDeleteProfile = () => {
    setLoading(true);

    // deleteAccount()
    //   .catch((err) => {
    //     Alert.alert("Ops!", err?.response?.data?.errors?.[0] ?? "An error occurred.");
    //   })
    //   .then((res) => {
    //     if (res?.status === 200) {
    //       setLoading(false);
    //       dispatch(logout());
    //       props.navigation.navigate("Auth");
    //     }
    //   });
  };

  return (
    <View style={Default.container}>
      <KeyboardAwareScrollView contentContainerStyle={Default.container}>
        <ScrollView>
          <Header
            backButton
            navigation={props.navigation}
            showBackgroundImage
          />
          <Fetching isFetching={loading}>
            <View style={styles.container}>
              <Text style={styles.textProfile}>Profile</Text>
              <View style={styles.containerAvatar}>
                {userPhoto ? (
                  <Avatar
                    size={88}
                    rounded
                    source={{ uri: userPhoto.url }}
                    onPress={() => ASPhotoOptions.current.show()}>
                    <Avatar.Accessory
                      icon={{ name: 'pencil-alt' }}
                      size={25}
                      onPress={() => ASPhotoOptions.current.show()}
                    />
                  </Avatar>
                ) : (
                  <Avatar
                    size={88}
                    rounded
                    source={require('../../../assets/images/no-profile.png')}
                    onPress={() => ASPhotoOptions.current.show()}>
                    <Avatar.Accessory
                      icon={{ name: 'pencil-alt' }}
                      size={25}
                      onPress={() => ASPhotoOptions.current.show()}
                    />
                  </Avatar>
                )}
              </View>

              <ActionSheet
                ref={ASPhotoOptions}
                options={['Camera', 'Library', 'Cancel']}
                cancelButtonIndex={2}
                destructiveButtonIndex={2}
                buttonUnderlayColor="#DDDDDD"
                onPress={index => handleActionSheet(index)}
              />

              <Input
                label="Name"
                placeholder="Insert your name"
                value={userName}
                onChangeText={setUserName}
                containerStyle={Default.containerStyle}
                autoCapitalize="words"
                autoCorrect={false}
                returnKeyType="next"
                placeholderTextColor="#9CC6FF"
                keyboardAppearance="dark"
                inputStyle={Default.loginInput}
                inputContainerStyle={Default.loginInputContainer}
                labelStyle={Default.loginInputLabel}
              />

              <Input
                label="Email"
                placeholder="Insert your email"
                value={userEmail}
                onChangeText={setUserEmail}
                containerStyle={Default.containerStyle}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                returnKeyType="next"
                placeholderTextColor="#9CC6FF"
                keyboardAppearance="dark"
                inputStyle={Default.loginInput}
                inputContainerStyle={Default.loginInputContainer}
                labelStyle={Default.loginInputLabel}
              />

              <Input
                label="Password"
                placeholder="Password"
                value={userPassword}
                onChangeText={setUserPassword}
                autoCapitalize="none"
                autoCorrect={false}
                secureTextEntry={true}
                returnKeyType="next"
                placeholderTextColor="#9CC6FF"
                containerStyle={Default.containerStyle}
                inputStyle={Default.loginInput}
                inputContainerStyle={Default.loginInputContainer}
                labelStyle={Default.loginInputLabel}
              />

              <Input
                label="Password Confirmation"
                placeholder="Password"
                value={userPasswordConfirmation}
                onChangeText={setUserPasswordConfirmation}
                autoCapitalize="none"
                autoCorrect={false}
                secureTextEntry={true}
                returnKeyType="next"
                placeholderTextColor="#9CC6FF"
                containerStyle={Default.containerStyle}
                inputStyle={Default.loginInput}
                inputContainerStyle={Default.loginInputContainer}
                labelStyle={Default.loginInputLabel}
              />

              <View style={styles.containerTitleGender}>
                <Text style={Default.loginInputLabel}>Gender</Text>
              </View>
              <TouchableOpacity
                style={styles.containerGroup}
                onPress={() => setGender('man')}>
                <LinearGradient
                  colors={[
                    'rgba(156, 198, 255, 0.042)',
                    'rgba(0, 37, 68, 0.15)',
                  ]}
                  start={{ x: 0, y: 0.5 }}
                  end={{ x: 1, y: 0.5 }}
                  style={styles.containerGradient}>
                  <View style={styles.containerItem}>
                    <Text style={styles.textInfo}>Man</Text>
                    {gender === 'man' ? (
                      <Image
                        source={require('../../../assets/icons/circle-selected.png')}
                        style={styles.circleIcon}
                      />
                    ) : (
                      <Image
                        source={require('../../../assets/icons/circle.png')}
                        style={styles.circleIcon}
                      />
                    )}
                  </View>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.containerGroup}
                onPress={() => setGender('woman')}>
                <LinearGradient
                  colors={[
                    'rgba(156, 198, 255, 0.042)',
                    'rgba(0, 37, 68, 0.15)',
                  ]}
                  start={{ x: 0, y: 0.5 }}
                  end={{ x: 1, y: 0.5 }}
                  style={styles.containerGradient}>
                  <View style={styles.containerItem}>
                    <Text style={styles.textInfo}>Woman</Text>
                    {gender === 'woman' ? (
                      <Image
                        source={require('../../../assets/icons/circle-selected.png')}
                        style={styles.circleIcon}
                      />
                    ) : (
                      <Image
                        source={require('../../../assets/icons/circle.png')}
                        style={styles.circleIcon}
                      />
                    )}
                  </View>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.containerGroup}
                onPress={() => setGender('non-binary')}>
                <LinearGradient
                  colors={[
                    'rgba(156, 198, 255, 0.042)',
                    'rgba(0, 37, 68, 0.15)',
                  ]}
                  start={{ x: 0, y: 0.5 }}
                  end={{ x: 1, y: 0.5 }}
                  style={styles.containerGradient}>
                  <View style={styles.containerItem}>
                    <Text style={styles.textInfo}>Non-binary</Text>
                    {gender === 'non-binary' ? (
                      <Image
                        source={require('../../../assets/icons/circle-selected.png')}
                        style={styles.circleIcon}
                      />
                    ) : (
                      <Image
                        source={require('../../../assets/icons/circle.png')}
                        style={styles.circleIcon}
                      />
                    )}
                  </View>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.containerGroup}
                onPress={() => setGender('not-say')}>
                <LinearGradient
                  colors={[
                    'rgba(156, 198, 255, 0.042)',
                    'rgba(0, 37, 68, 0.15)',
                  ]}
                  start={{ x: 0, y: 0.5 }}
                  end={{ x: 1, y: 0.5 }}
                  style={styles.containerGradient}>
                  <View style={styles.containerItem}>
                    <Text style={styles.textInfo}>Prefer not to say</Text>
                    {gender === 'not-say' ? (
                      <Image
                        source={require('../../../assets/icons/circle-selected.png')}
                        style={styles.circleIcon}
                      />
                    ) : (
                      <Image
                        source={require('../../../assets/icons/circle.png')}
                        style={styles.circleIcon}
                      />
                    )}
                  </View>
                </LinearGradient>
              </TouchableOpacity>

              <View>
                <Button
                  buttonStyle={Default.loginNextButton}
                  titleStyle={Default.loginButtonBoldTitle}
                  disabled={loading}
                  loading={loading}
                  disabledStyle={Default.loginNextButton}
                  onPress={saveUserData}
                  title="SAVE INFORMATION"
                />

                <Button
                  buttonStyle={styles.cancelButton}
                  titleStyle={Default.loginButtonBoldTitle}
                  disabled={loading}
                  loading={loading}
                  disabledStyle={styles.cancelButton}
                  onPress={() => props.navigation.pop()}
                  title="CANCEL"
                />

                <TouchableOpacity
                  style={{ marginVertical: 16 }}
                  onPress={deleteProfile}>
                  <View style={{ alignItems: 'center' }}>
                    <Text
                      style={[systemWeights.bold, styles.createAccountText]}>
                      Delete my account
                    </Text>
                  </View>
                </TouchableOpacity>
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
    paddingVertical: 22,
    paddingHorizontal: 22,
  },
  textTitle: {
    fontSize: 24,
    color: Colors.text,
    display: 'flex',
  },
  textInfo: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 16,
    fontWeight: '700',
  },
  containerTitleGender: {
    width: Dimensions.get('window').width - 48,
    borderBottomColor: '#264261',
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingBottom: 16,
    marginBottom: 16,
  },
  textProfile: {
    position: 'absolute',
    alignSelf: 'center',
    marginTop: -32,
    fontWeight: '400',
    fontSize: 20,
    lineHeight: 27,
    color: Colors.text,
  },
  containerGroup: {
    marginBottom: 16,
    width: Dimensions.get('window').width - 48,
  },
  containerGradient: {
    flex: 1,
    width: Dimensions.get('window').width - 48,
    borderRadius: 8,
    paddingVertical: 18,
    paddingHorizontal: 16,
  },
  containerItem: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  circleIcon: {
    width: 20,
    height: 20,
    marginRight: 8,
  },
  containerAvatar: {
    alignItems: 'center',
    marginVertical: 32,
  },
  userPhoto: {
    width: 88,
    height: 88,
    borderRadius: 44,
  },
  createAccountText: {
    fontSize: 14,
    color: 'white',
  },
  iconChevron: {
    marginLeft: 8,
    marginRight: 8,
  },
  cancelButton: {
    height: 64,
    borderRadius: 4,
    backgroundColor: '#004B7D',
    width: Dimensions.get('window').width - 32,
    marginVertical: 16,
  },
});

export default UpdateProfile;
