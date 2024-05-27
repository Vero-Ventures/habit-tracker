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
  Modal,
} from 'react-native';
import { Button, Input } from 'react-native-elements';
import { supabase } from '../config/supabaseClient';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import store from '../store/storeConfig';
import Default from '../../assets/styles/Default';
import Colors from '../../assets/styles/Colors';
import { FlatList } from 'react-native-gesture-handler';

const { width } = Dimensions.get('window');
const imageSize = width / 3;

export default function Account() {
  const session = store.getState().user.session;
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [postsCount, setPostsCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [followerCount, setFollowerCount] = useState(0);
  const [habitImages, setHabitImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    if (session) {
      getProfile();
      getPostsCount();
      getFollowingCount();
      getFollowerCount();
      getHabitImages();
    }
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

  const getHabitImages = async () => {
    const userId = session?.user.id;
    try {
      setLoading(true);

      const { data: scheduleData, error: scheduleError } = await supabase
        .from('Schedule')
        .select('habit_id')
        .eq('user_id', userId);

      if (scheduleError) throw scheduleError;

      const habitIds = scheduleData.map(schedule => schedule.habit_id);

      const { data: habitData, error: habitError } = await supabase
        .from('Habit')
        .select('habit_id, habit_title')
        .in('habit_id', habitIds);

      if (habitError) throw habitError;

      const { data: imagesData, error: imagesError } = await supabase
        .from('HabitImages')
        .select('*')
        .in('habit_id', habitIds);

      if (imagesError) throw imagesError;

      const imagesByHabit = habitData.reduce((acc, habit) => {
        acc[habit.habit_title] = imagesData.filter(image => image.habit_id === habit.habit_id);
        return acc;
      }, {});

      setHabitImages(imagesByHabit);
    } catch (error) {
      Alert.alert('Error fetching habit images', error.message);
    } finally {
      setLoading(false);
    }
  };

  async function getPostsCount() {
    try {
      setLoading(true);
      if (!session?.user) throw new Error('No user on the session!');

      const { error, status, count } = await supabase
        .from('Post')
        .select('*', { count: 'exact' })
        .eq('user_id', session?.user.id);

      if (error && status !== 406) {
        throw error;
      }

      if (count !== undefined) {
        setPostsCount(count);
      }
    } catch (error) {
      Alert.alert('Error fetching posts count', error.message);
    } finally {
      setLoading(false);
    }
  }

  async function getFollowingCount() {
    try {
      setLoading(true);
      if (!session?.user) throw new Error('No user on the session!');

      const { count, error, status } = await supabase
        .from('Following')
        .select('*', { count: 'exact' })
        .eq('follower', session?.user.id);

      if (error && status !== 406) {
        throw error;
      }

      if (count !== undefined) {
        setFollowingCount(count);
      }
    } catch (error) {
      Alert.alert('Error fetching following count', error.message);
    } finally {
      setLoading(false);
    }
  }

  async function getFollowerCount() {
    try {
      setLoading(true);
      if (!session?.user) throw new Error('No user on the session!');

      const { count, error, status } = await supabase
        .from('Following')
        .select('*', { count: 'exact' })
        .eq('following', session?.user.id);

      if (error && status !== 406) {
        throw error;
      }

      if (count !== undefined) {
        setFollowerCount(count);
      }
    } catch (error) {
      Alert.alert('Error fetching follower count', error.message);
    } finally {
      setLoading(false);
    }
  }

  const goToFollowersScreen = () => {
    navigation.navigate('FollowersScreen', { userId: session.user.id });
  };

  const goToFollowScreen = () => {
    navigation.navigate('FollowScreen', { userId: session.user.id });
  };

  const goToSettingsScreen = () => {
    navigation.navigate('SettingsScreen');
  };

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
    for (let i = 0; len > i; i++) {
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

        const { error: uploadError } = await supabase.storage
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

        const updates = {
          user_id: session?.user.id,
          username: username,
          bio: bio,
          profile_image: publicUrl,
        };

        const { error: updateError } = await supabase
          .from('User')
          .upsert(updates, { returning: 'minimal' });

        if (updateError) {
          console.error('Update error:', updateError);
          Alert.alert('Error', updateError.message);
          setLoading(false);
          return;
        }

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

  const openModal = (image) => {
    setSelectedImage(image);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedImage(null);
  };

  const renderHabitImages = ({ item }) => (
    <View key={item.habit_title} style={styles.habitSection}>
      <Text style={styles.habitTitle}>{item.habit_title}</Text>
      <FlatList
        data={item.images}
        keyExtractor={(image, index) => index.toString()}
        numColumns={3}
        renderItem={({ item: image }) => (
          <TouchableOpacity onPress={() => openModal(image)}>
            <Image source={{ uri: image.image_photo }} style={styles.gridImage} />
          </TouchableOpacity>
        )}
      />
    </View>
  );

  return (
    <View style={Default.container}>
      <FlatList
        ListHeaderComponent={
          <>
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
              <View style={styles.statsContainer}>
                <TouchableOpacity style={styles.stat} onPress={goToFollowersScreen}>
                  <Text style={styles.statCount}>{followerCount}</Text>
                  <Text style={styles.statLabel}>followers</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.stat} onPress={goToFollowScreen}>
                  <Text style={styles.statCount}>{followingCount}</Text>
                  <Text style={styles.statLabel}>following</Text>
                </TouchableOpacity>
                <View style={styles.stat}>
                  <Text style={styles.statCount}>{postsCount}</Text>
                  <Text style={styles.statLabel}>posts</Text>
                </View>
              </View>
            </View>

            <TouchableOpacity style={styles.settingsIcon} onPress={goToSettingsScreen}>
              <Image source={require('../../assets/icons/cog.png')} style={styles.iconsHeader} />
            </TouchableOpacity>

            <View style={styles.containerActionsHeader}>
              <TouchableOpacity
                style={styles.editProfile}
                onPress={() => navigation.navigate('EditProfile')}>
                <View style={styles.editProfileButton}>
                  <Image
                    source={require('../../assets/icons/edit.png')}
                    style={styles.iconsHeader}
                  />
                  <Text style={styles.editProfileText}>Edit Profile</Text>
                </View>
              </TouchableOpacity>
            </View>

            <View style={styles.buttonWrapper}>
              <Button 
                title="Find Users"
                onPress={goToFollowScreen}
                buttonStyle={styles.findUserButton}
                titleStyle={styles.findUserButtonText}
              />
            </View>

            <View style={styles.inputWrapper}>
              <Text style={styles.title}>Username</Text>
              <Text style={styles.textContent}>{username}</Text>
            </View>
            <View style={styles.inputWrapper}>
              <Text style={styles.title}>Bio</Text>
              <Text style={styles.textContent}>{bio}</Text>
            </View>
          </>
        }
        data={Object.keys(habitImages).map(habitTitle => ({
          habit_title: habitTitle,
          images: habitImages[habitTitle],
        }))}
        renderItem={renderHabitImages}
        keyExtractor={(item, index) => index.toString()}
      />

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {selectedImage && (
              <>
                <Image source={{ uri: selectedImage.image_photo }} style={styles.fullImage} />
                <Text style={styles.imageDescription}>{selectedImage.description}</Text>
                <Button title="Close" onPress={closeModal} />
              </>
            )}
          </View>
        </View>
      </Modal>
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
    alignItems: 'center',
    marginBottom: 32,
  },
  containerPhoto: {
    marginBottom: 15,
  },
  userPhoto: {
    width: 90,
    height: 90,
    borderRadius: 45,
  },
  textName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 20,
  },
  stat: {
    alignItems: 'center',
  },
  statCount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
  },
  statLabel: {
    fontSize: 14,
    color: Colors.text,
  },
  settingsIcon: {
    position: 'absolute',
    top: 40,
    right: 20,
  },
  containerActionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 20,
  },
  editProfileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    backgroundColor: '#333333',
    borderRadius: 5,
    width: 150,
  },
  iconsHeader: {
    width: 25,
    height: 25,
    marginRight: 2,
  },
  editProfileText: {
    color: 'white',
    fontWeight: '600',
  },
  buttonWrapper: {
    alignItems: 'center',
    marginBottom: 20,
  },
  findUserButton: {
    backgroundColor: '#333333',
    borderRadius: 45,
    width: 150,
    paddingVertical: 10,
  },
  findUserButtonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
  },
  inputWrapper: {
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
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.white,
    marginBottom: 8,
  },
  textContent: {
    fontSize: 14,
    color: Colors.white,
    marginBottom: 16,
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
  habitSection: {
    marginBottom: 20,
  },
  habitTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 10,
    marginLeft: 10,
  },
  gridImage: {
    width: imageSize - 10,
    height: imageSize - 10,
    margin: 5,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  modalContent: {
    width: '90%',
    backgroundColor: Colors.cardBackground,
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
  },
  fullImage: {
    width: '100%',
    height: Dimensions.get('window').width,
    borderRadius: 10,
    marginBottom: 16,
  },
  imageDescription: {
    color: Colors.white,
    marginBottom: 16,
  },
});

Account.propTypes = {
  navigation: PropTypes.object,
  setIsLoggedIn: PropTypes.func,
};
