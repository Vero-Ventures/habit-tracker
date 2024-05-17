import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  Text,
  ScrollView,
  Image,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import Fetching from '../../components/Fetching';
import Default from '../../../assets/styles/Default';
import Colors from '../../../assets/styles/Colors';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Input } from 'react-native-elements';
import * as ImagePicker from 'expo-image-picker';
import * as mime from 'react-native-mime-types';
import { updateFavoriteBook } from '../../store/ducks/user';
import Icon from 'react-native-vector-icons/FontAwesome5';
import ActionSheet from 'react-native-actionsheet';
import { LinearGradient } from 'expo-linear-gradient';
import { takeCamera, takeGaleria } from '../../utils/Utils';

const UpdateFavoriteBook = props => {
  const [fetching, setFetching] = useState(false);
  const [sending, setSending] = useState(false);
  const [image_changed, setImageChanged] = useState(false);
  const [name, setName] = useState('');
  const [book_photo, setBookPhoto] = useState(null);

  const ASPhotoOptions = useRef();

  const dispatch = useDispatch();
  const user = useSelector(({ user }) => user);
  const { isFetching } = useSelector(({ fetching }) => fetching);

  useEffect(() => {
    setFetching(true);
    user.image_book ? setBookPhoto(user.image_book) : null;
    user.usr_favorite_book ? setName(user.usr_favorite_book) : null;
    setFetching(false);
  }, []);

  useEffect(() => {
    user.image_book ? setBookPhoto(user.image_book) : null;
    user.usr_favorite_book ? setName(user.usr_favorite_book) : null;
    setSending(false);
  }, [user]);

  const createFavoriteBook = () => {
    if (name === '' || !book_photo) {
      Alert.alert('Ops!', 'Please fill in all fields.');
      return;
    }

    setSending(true);

    let request = {
      book_name: name,
      book_picture: book_photo,
      image_changed: image_changed,
    };

    dispatch(updateFavoriteBook(request, props.navigation));
    setSending(false);
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
        pickGaleria();
      } else {
        Alert.alert('Ops', 'You need to allow access to the camera first.');
      }
    }
  };

  const pickCamera = async () => {
    let result = await takeCamera();

    if (result === 'failed') {
      Alert.alert('Ops', 'An error ocurred when trying to open the camera.');
      return;
    }

    if (result?.uri) {
      setAnexos(result);
    }
  };

  const pickGaleria = async () => {
    let result = await takeGaleria();

    if (result === 'failed') {
      Alert.alert('Ops', 'An error ocurred when trying to open the library.');
      return;
    }

    if (result?.uri) {
      setAnexos(result);
    }
  };

  const setAnexos = foto => {
    let auxFoto = { ...foto };
    auxFoto.url = foto.uri;

    setImageChanged(true);
    setBookPhoto(auxFoto);
  };

  return (
    <View style={Default.container}>
      <ScrollView scrollEnabled>
        <Fetching isFetching={fetching}>
          <View style={styles.container}>
            <View style={styles.containerActions}>
              <TouchableOpacity
                style={styles.backButtonStyle}
                onPress={() => props.navigation.pop()}>
                <Icon
                  type="font-awesome"
                  name="chevron-left"
                  size={16}
                  color={'#FFFFFF'}
                />
              </TouchableOpacity>

              <Text
                style={styles.textHeaderTitle}
                type="font-awesome"
                name="chevron-left"
                size={14}
                color={Colors.text}>
                Favorite Book
              </Text>
            </View>

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

            <SafeAreaView style={{ flex: 1 }}>
              <LinearGradient
                colors={['rgba(114, 198, 239, 0.3)', 'rgba(0, 78, 143, 0.138)']}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={styles.containerHeaderImage}>
                {book_photo ? (
                  <>
                    <TouchableOpacity
                      onPress={() => ASPhotoOptions.current.show()}
                      style={styles.bookImage}>
                      <Image
                        source={{ uri: book_photo.url }}
                        style={styles.bookImage}
                        resizeMode="cover"
                      />
                    </TouchableOpacity>
                  </>
                ) : (
                  <>
                    <TouchableOpacity
                      onPress={() => ASPhotoOptions.current.show()}
                      style={styles.containerPhoto}>
                      <Image
                        source={require('../../../assets/icons/add-photo.png')}
                        style={styles.bookPhoto}
                      />
                      <Text style={styles.textAddPhoto}>Add Photo</Text>
                    </TouchableOpacity>
                  </>
                )}
              </LinearGradient>

              <View style={styles.containerTitle}>
                <Input
                  label="Name"
                  placeholder="Name of your favorite book"
                  value={name}
                  onChangeText={setName}
                  keyboardAppearance="dark"
                  autoFocus={false}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="email-address"
                  returnKeyType="next"
                  placeholderTextColor="#455c8a"
                  containerStyle={Default.containerStyle}
                  inputStyle={Default.loginInput}
                  inputContainerStyle={Default.loginInputContainer}
                  labelStyle={styles.textTitle}
                />
              </View>

              <View style={[styles.containerButton, { marginTop: 26 }]}>
                <Button
                  buttonStyle={styles.nextButton}
                  titleStyle={Default.loginButtonBoldTitle}
                  onPress={createFavoriteBook}
                  title={'CREATE'}
                  disable={isFetching}
                  loading={isFetching}
                />
              </View>
            </SafeAreaView>
          </View>
        </Fetching>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: Dimensions.get('window').width,
  },
  containerActions: {
    marginTop: 32,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  textHeaderTitle: {
    color: Colors.text,
    fontWeight: '400',
    fontSize: 24,
    lineHeight: 32,
    alignSelf: 'flex-start',
  },
  nextButton: {
    height: 64,
    borderRadius: 4,
    backgroundColor: '#982538',
    width: Dimensions.get('window').width - 48,
  },
  containerTitle: {
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  containerButton: {
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 16,
  },
  textAddPhoto: {
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 19,
    color: '#FCFCFC',
  },
  bookImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  containerPhoto: {
    flex: 1,
    flexDirection: 'column',
    alignSelf: 'center',
    justifyContent: 'flex-start',
    alignItems: 'center',
    zIndex: 3,
    elevation: 3,
    marginTop: 56,
  },
  textTitle: {
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 16,
    color: '#FCFCFC',
  },
  bookPhoto: {
    width: 50,
    height: 50,
    marginBottom: 8,
  },
  containerHeaderImage: {
    height: 189,
    flex: 1,
    justifyContent: 'flex-end',
    width: Dimensions.get('window').width,
    zIndex: 0,
    elevation: 0,
  },
  containerList: {
    height: 268,
    marginBottom: 8,
    paddingVertical: 16,
    zIndex: 1,
    elevation: 1,
  },
  containerViewSection: {
    flex: 1,
    zIndex: 1,
    elevation: 1,
  },
  backButtonStyle: {
    marginLeft: 24,
    marginRight: 16,
    alignSelf: 'center',
  },
  containerHabits: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
    marginTop: -8,
  },
});

export default UpdateFavoriteBook;
