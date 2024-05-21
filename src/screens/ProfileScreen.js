import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  StyleSheet,
  View,
  Alert,
  ScrollView,
  Text,
  Image,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { Button, Input } from 'react-native-elements';
import { supabase } from '../config/supabaseClient';

import * as ImagePicker from 'expo-image-picker';
import store from '../store/storeConfig';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import Default from '../../assets/styles/Default';
import Colors from '../../assets/styles/Colors';

export default function Account() {
  const session = store.getState().user.session;
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [profileImage, setProfileImage] = useState(null);

  useEffect(() => {
    if (session) getProfile();
  }, [session]);

  async function getProfile() {
    try {
      setLoading(true);
      if (!session?.user) throw new Error('No user on the session!');

      const { data, error, status } = await supabase
        .from('User')
        .select(`username, bio, profile_image`)
        .eq('user_id', session?.user.id)
        .single();
      if (error && status !== 406) {
        throw error;
      }

      if (data) {
        setUsername(data.username);
        setBio(data.bio);
        setProfileImage(data.profile_image);
      }
    } catch (error) {
      Alert.alert('Error fetching profile', error.message);
    } finally {
      setLoading(false);
    }
  }

  const handleImagePicker = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.cancelled) {
      setProfileImage(result.assets[0]);
      uploadProfileImage(result.assets[0]);
    }
  };

  const base64ToArrayBuffer = (base64) => {
    const binaryString = window.atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  };

  const uploadProfileImage = async (image) => {
    try {
      setLoading(true);
      const fileName = `${Date.now()}_${String(image.uri).replace('null', '').split('/').pop()}`;
      console.log('Uploading file:', fileName);

      const response = await fetch(image.uri);
      const blob = await response.blob();

      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64data = reader.result.split(',')[1];
        const arrayBuffer = base64ToArrayBuffer(base64data);

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('profiles')
          .upload(fileName, arrayBuffer, {
            cacheControl: '3600',
            upsert: false,
            contentType: 'image/jpeg',
          });

        if (uploadError) {
          console.error('Upload error:', uploadError);
          Alert.alert('Error', uploadError.message);
          setLoading(false);
          return;
        }

        const { data } = supabase.storage.from('profiles').getPublicUrl(fileName);
        const publicUrl = data.publicUrl;
        setProfileImage(publicUrl);

        Alert.alert('Success', 'Profile image updated successfully!');
      };
      reader.readAsDataURL(blob);
    } catch (error) {
      console.error('Upload error:', error);
      Alert.alert('Error', 'Failed to upload image');
    } finally {
      setLoading(false);
    }
  };

  async function updateProfile() {
    try {
      setLoading(true);
      if (!session?.user) throw new Error('No user on the session!');

      const updates = {
        user_id: session?.user.id,
        username: username,
        bio: bio,
        profile_image: profileImage,
      };

      const { error } = await supabase
        .from('User')
        .upsert(updates, { returning: 'minimal' });

      if (error) {
        throw error;
      }

      Alert.alert('Success', 'Profile updated successfully!');
    } catch (error) {
      Alert.alert('Update Error', error.message);
    } finally {
      setLoading(false);
    }
  }

  async function deleteUserAndData() {
    try {
      if (!session?.user) throw new Error('No user on the session!');

      const { error } = await supabase.rpc('delete_user_data', {
        user_id: session.user.id,
      });

      if (error) {
        console.error('Error deleting user:', error);
        return;
      }

      console.log('User and associated data deleted successfully');
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Error deleting user:', error);
      Alert.alert('Error', error.message);
    }
  }

  async function downloadUserData() {
    try {
      if (!session?.user) throw new Error('No user on the session!');

      const { data, error } = await supabase.rpc('get_user_data', {
        p_user_id: session.user.id,
      });

      if (error) {
        console.error('Error fetching data:', error);
        Alert.alert('Error', 'Error fetching data: ' + error.message);
        return;
      }

      const jsonData = JSON.stringify(data, null, 2);
      const fileUri = FileSystem.documentDirectory + 'user_data.json';

      await FileSystem.writeAsStringAsync(fileUri, jsonData, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      Alert.alert('Success', 'User data saved as user_data.json');
      Sharing.shareAsync(fileUri);
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', 'Unexpected error: ' + error.message);
    }
  }

  return (
    <View style={Default.container}>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <View style={styles.containerHeader}>
          <TouchableOpacity style={styles.containerPhoto} onPress={handleImagePicker}>
            {profileImage ? (
              <Image source={{ uri: profileImage }} style={styles.userPhoto} />
            ) : (
              <Image
                source={require('../../assets/images/no-profile.png')}
                style={styles.userPhoto}
              />
            )}
          </TouchableOpacity>
          <Text style={styles.textName} numberOfLines={1}>
            {`Hi, ${username || 'User'}`}
          </Text>
        </View>

        <View style={styles.containerActionsHeader}>
          <TouchableOpacity
            style={styles.editProfile}
            onPress={() => console.log('Share profile pressed')}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Image
                source={require('../../assets/icons/share-profile.png')}
                style={styles.iconsHeader}
              />
              <Text style={styles.editProfileText}>Share My Profile</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.editProfile}
            onPress={() => console.log('Edit profile pressed')}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Image
                source={require('../../assets/icons/edit.png')}
                style={styles.iconsHeader}
              />
              <Text style={styles.editProfileText}>Edit Profile</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.inputWrapper}>
          <Input
            label="Username"
            value={username || ''}
            onChangeText={setUsername}
            placeholder="Enter username"
            containerStyle={styles.inputContainer}
            inputStyle={styles.input}
            labelStyle={styles.inputLabel}
          />
        </View>
        <View style={styles.inputWrapper}>
          <Input
            label="Bio"
            value={bio || ''}
            onChangeText={setBio}
            placeholder="Enter bio"
            containerStyle={styles.inputContainer}
            inputStyle={styles.input}
            labelStyle={styles.inputLabel}
          />
        </View>
        <View style={[styles.verticallySpaced, styles.mt20]}>
          <Button
            title={loading ? 'Loading ...' : 'Update'}
            onPress={updateProfile}
            disabled={loading}
            buttonStyle={styles.updateButton}
            titleStyle={Default.loginButtonBoldTitle}
          />
        </View>
        <View style={styles.verticallySpaced}>
          <Button
            title="Sign Out"
            onPress={() => supabase.auth.signOut()}
            buttonStyle={styles.signOutButton}
            titleStyle={Default.loginButtonBoldTitle}
          />
        </View>
        <View style={styles.verticallySpaced}>
          <Button
            title="Delete Account"
            onPress={() => deleteUserAndData()}
            buttonStyle={styles.deleteButton}
            titleStyle={Default.loginButtonBoldTitle}
          />
        </View>
        <View style={styles.verticallySpaced}>
          <Button
            title="Download User Data"
            onPress={() => downloadUserData()}
            buttonStyle={styles.downloadButton}
            titleStyle={Default.loginButtonBoldTitle}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollViewContent: {
    paddingHorizontal: 15,
    paddingTop: 28,
    width: Dimensions.get('window').width - 2,
    zIndex: 1,
    elevation: 1,
  },
  containerHeader: {
    flexDirection: 'column',
    alignSelf: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  containerPhoto: {
    flexDirection: 'row',
  },
  userPhoto: {
    alignSelf: 'center',
    width: 70,
    height: 70,
    borderRadius: 32,
    marginTop: 5,
    position: 'relative',
  },
  textName: {
    fontSize: 24,
    color: Colors.text,
    marginTop: 14,
    alignSelf: 'center',
  },
  containerActionsHeader: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 34,
  },
  iconsHeader: {
    marginRight: 4,
    alignSelf: 'center',
    width: 16,
    height: 16,
  },
  editProfile: {
    alignSelf: 'flex-end',
  },
  editProfileText: {
    fontSize: 14,
    lineHeight: 19,
    color: Colors.primary8,
    fontWeight: '700',
  },
  inputWrapper: {
    marginTop: 15,
    marginBottom: 10,
  },
  inputContainer: {
    marginBottom: 10,
  },
  input: {
    color: Colors.primary4,
    borderColor: '#455c8a',
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 2,
    fontSize: 16,
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 8,
    height: 40,
    backgroundColor: Colors.primary,
    textAlignVertical: 'top',
  },
  inputLabel: {
    color: Colors.text,
    fontWeight: 'normal',
    marginBottom: 8,
  },
  verticallySpaced: {
    marginTop: 4,
    marginBottom: 4,
  },
  mt20: {
    marginTop: 20,
  },
  updateButton: {
    backgroundColor: Colors.primary8,
    borderRadius: 20,
  },
  signOutButton: {
    backgroundColor: Colors.primary8,
    borderRadius: 20,
  },
  deleteButton: {
    backgroundColor: Colors.error,
    borderRadius: 20,
  },
  downloadButton: {
    backgroundColor: Colors.success,
    borderRadius: 20,
  },
  userDataContainer: {
    marginTop: 20,
  },
  userDataText: {
    fontSize: 16,
    color: Colors.text,
  },
});

Account.propTypes = {
  navigation: PropTypes.object,
};
