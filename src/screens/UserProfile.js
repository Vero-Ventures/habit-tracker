import React, { useState, useEffect } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  Dimensions,
  Text,
  TouchableOpacity,
  Alert,
  Image,
  Modal,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Default from '../../assets/styles/Default';
import Colors from '../../assets/styles/Colors';
import Header from '../components/Header';
import { supabase } from '../config/supabaseClient';
import { Button } from 'react-native-elements';

const { width } = Dimensions.get('window');
const imageSize = width / 3;

const UserProfile = () => {
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [habitImages, setHabitImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [postsCount, setPostsCount] = useState(0);

  const navigation = useNavigation();
  const route = useRoute();
  const { userId } = route.params;

  useEffect(() => {
    getProfile();
    getHabitImages();
    getFollowStats();
    getPostsCount();
  }, [userId]);

  const getProfile = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('User')
        .select('username, bio, profile_image')
        .eq('user_id', userId)
        .single();
      if (error) throw error;
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
  };

  const getHabitImages = async () => {
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

  const getFollowStats = async () => {
    try {
      const { count: followerCount, error: followerError } = await supabase
        .from('Following')
        .select('*', { count: 'exact' })
        .eq('following', userId);

      const { count: followingCount, error: followingError } = await supabase
        .from('Following')
        .select('*', { count: 'exact' })
        .eq('follower', userId);

      if (followerError || followingError) {
        throw new Error(followerError?.message || followingError?.message);
      }

      setFollowerCount(followerCount);
      setFollowingCount(followingCount);
    } catch (error) {
      Alert.alert('Error fetching follow stats', error.message);
    }
  };

  const getPostsCount = async () => {
    try {
      const { count: postsCount, error: postsError } = await supabase
        .from('Post')
        .select('*', { count: 'exact' })
        .eq('user_id', userId);

      if (postsError) {
        throw postsError;
      }

      setPostsCount(postsCount);
    } catch (error) {
      Alert.alert('Error fetching posts count', error.message);
    }
  };

  const goToFollowersScreen = () => {
    navigation.navigate('FollowersScreen', { userId });
  };

  const goToFollowScreen = () => {
    navigation.navigate('FollowScreen', { userId });
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
            <Header title="User Profile" navigation={navigation} backButton />
            <View style={styles.profileHeader}>
              <TouchableOpacity style={styles.profileImageContainer}>
                {profileImage ? (
                  <Image source={{ uri: profileImage }} style={styles.profileImage} />
                ) : (
                  <Image source={require('../../assets/images/no-profile.png')} style={styles.profileImage} />
                )}
              </TouchableOpacity>
              <Text style={styles.username}>{username}</Text>
              <Text style={styles.bio}>{bio}</Text>
            </View>
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
};

const styles = StyleSheet.create({
  profileHeader: {
    alignItems: 'center',
    marginVertical: 20,
  },
  profileImageContainer: {
    marginBottom: 10,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  username: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
  },
  bio: {
    fontSize: 16,
    color: Colors.text,
    textAlign: 'center',
    marginHorizontal: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 20,
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

export default UserProfile;
