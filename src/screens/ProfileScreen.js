import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  StyleSheet,
  View,
  Alert,
  Text,
  Image,
  Dimensions,
  TouchableOpacity,
  Modal,
  FlatList,
  RefreshControl,
} from 'react-native';
import { Button } from 'react-native-elements';
import { supabase } from '../config/supabaseClient';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import store from '../store/storeConfig';
import Default from '../../assets/styles/Default';
import Colors from '../../assets/styles/Colors';
import moment from 'moment';

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
  const [habitPosts, setHabitPosts] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showLikesModal, setShowLikesModal] = useState(false);
  const [likedUsers, setLikedUsers] = useState([]);
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [comments, setComments] = useState([]);

  useEffect(() => {
    if (session) {
      fetchAllData();
    }
  }, [session]);

  const getProfile = async () => {
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
  };

  const getHabitPosts = async () => {
    const userId = session?.user.id;
    try {
      setLoading(true);

      const { data: scheduleData, error: scheduleError } = await supabase
        .from('Schedule')
        .select('habit_id, schedule_id')
        .eq('user_id', userId);

      if (scheduleError) throw scheduleError;

      const habitIds = scheduleData.map(schedule => schedule.habit_id);
      const scheduleIds = scheduleData.map(schedule => schedule.schedule_id);

      if (habitIds.length === 0 || scheduleIds.length === 0) {
        setLoading(false);
        return;
      }

      const { data: habitData, error: habitError } = await supabase
        .from('Habit')
        .select('habit_id, habit_title')
        .in('habit_id', habitIds);

      if (habitError) throw habitError;

      const { data: postsData, error: postsError } = await supabase
        .from('Post')
        .select('post_id, post_description, schedule_id, created_at')
        .in('schedule_id', scheduleIds);

      if (postsError) throw postsError;

      const postIds = postsData.map(post => post.post_id);

      const { data: postImagesData, error: postImagesError } = await supabase
        .from('Image')
        .select('image_photo, post_id')
        .in('post_id', postIds);

      if (postImagesError) throw postImagesError;

      const { data: likeData, error: likeError } = await supabase
        .from('Like')
        .select('post_id')
        .in('post_id', postIds);

      if (likeError) throw likeError;

      const { data: commentsData, error: commentsError } = await supabase
        .from('Comments')
        .select('post_id')
        .in('post_id', postIds);

      if (commentsError) throw commentsError;

      const likeCountMap = likeData.reduce((acc, like) => {
        acc[like.post_id] = (acc[like.post_id] || 0) + 1;
        return acc;
      }, {});

      const commentCountMap = commentsData.reduce((acc, comment) => {
        acc[comment.post_id] = (acc[comment.post_id] || 0) + 1;
        return acc;
      }, {});

      const combinedPosts = habitData.map(habit => {
        const habitPosts = postsData.filter(post =>
          scheduleData.find(schedule => schedule.schedule_id === post.schedule_id)?.habit_id === habit.habit_id
        );
        const habitPostImages = postImagesData.filter(image =>
          habitPosts.some(post => post.post_id === image.post_id)
        );

        const combined = [
          ...habitPostImages.map(image => ({
            ...image,
            post_description: habitPosts.find(post => post.post_id === image.post_id)?.post_description,
            created_at: habitPosts.find(post => post.post_id === image.post_id)?.created_at,
            like_count: likeCountMap[image.post_id] || 0,
            comment_count: commentCountMap[image.post_id] || 0,
          }))
        ].filter(image => image.image_photo !== null);

        const postTexts = habitPosts
          .filter(post => !postImagesData.some(image => image.post_id === post.post_id && image.image_photo))
          .map(post => ({
            post_description: post.post_description,
            post_id: post.post_id,
            created_at: post.created_at,
            like_count: likeCountMap[post.post_id] || 0,
            comment_count: commentCountMap[post.post_id] || 0,
          }));

        return {
          habit_title: habit.habit_title,
          images: combined,
          postTexts: postTexts
        };
      });

      setHabitPosts(combinedPosts);
    } catch (error) {
      Alert.alert('Error fetching habit posts', error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchLikedUsers = async (postId) => {
    try {
      const { data: likeData, error: likeError } = await supabase
        .from('Like')
        .select('user_id')
        .eq('post_id', postId);

      if (likeError) throw likeError;

      if (likeData.length === 0) {
        setLikedUsers([]);
        setShowLikesModal(true);
        return;
      }

      const userIds = likeData.map(like => like.user_id);

      const { data: usersData, error: usersError } = await supabase
        .from('User')
        .select('user_id, username, profile_image')
        .in('user_id', userIds);

      if (usersError) throw usersError;

      setLikedUsers(usersData);
      setShowLikesModal(true);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch users who liked the post');
    }
  };

  const fetchComments = async (postId) => {
    try {
      const { data: commentsData, error: commentsError } = await supabase
        .from('Comments')
        .select('content, user_id')
        .eq('post_id', postId);

      if (commentsError) throw commentsError;

      const userIds = commentsData.map(comment => comment.user_id);

      const { data: usersData, error: usersError } = await supabase
        .from('User')
        .select('user_id, username, profile_image')
        .in('user_id', userIds);

      if (usersError) throw usersError;

      const commentsWithUserDetails = commentsData.map(comment => ({
        ...comment,
        user: usersData.find(user => user.user_id === comment.user_id),
      }));

      setComments(commentsWithUserDetails);
      setShowCommentsModal(true);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch comments');
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

  const onRefresh = () => {
    setRefreshing(true);
    fetchAllData();
  };

  const fetchAllData = async () => {
    try {
      await getProfile();
      await getPostsCount();
      await getFollowingCount();
      await getFollowerCount();
      await getHabitPosts();
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setRefreshing(false);
    }
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

  const renderHabitPosts = ({ item }) => (
    <View key={item.habit_title} style={styles.habitSection}>
      <Text style={styles.habitTitle}>{item.habit_title}</Text>
      <FlatList
        data={item.images}
        keyExtractor={(image, index) => index.toString()}
        numColumns={1}
        renderItem={({ item: image }) => (
          <View style={styles.cardContainer}>
            <TouchableOpacity onPress={() => openModal(image)}>
              <Image source={{ uri: image.image_photo }} style={styles.habitImage} />
            </TouchableOpacity>
            <View style={styles.cardContent}>
              <Text style={styles.postText}>{image.post_description}</Text>
              <Text style={styles.textSubtitle}>{moment(image.created_at).local().startOf('second').fromNow()}</Text>
              <View style={styles.containerActions}>
                <TouchableOpacity onPress={() => fetchLikedUsers(image.post_id)}>
                  <Text style={styles.textPostActions}>{image.like_count > 0 ? `${image.like_count} likes` : null}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.buttonActions} onPress={() => fetchComments(image.post_id)}>
                  <Image source={require('../../assets/icons/message-dots.png')} style={styles.icon} />
                  <Text style={styles.textPostActions}>{image.comment_count > 0 ? image.comment_count : null}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      />
      {item.postTexts.length > 0 && (
        <View style={styles.textContainer}>
          {item.postTexts.map((post) => (
            <View key={post.post_id} style={styles.textPostContainer}>
              <Text style={styles.postText}>{post.post_description}</Text>
              <Text style={styles.textSubtitle}>{moment(post.created_at).local().startOf('second').fromNow()}</Text>
              <TouchableOpacity onPress={() => fetchLikedUsers(post.post_id)}>
                <Text style={styles.textSubtitle}>{post.like_count > 0 ? `${post.like_count} likes` : null}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.buttonActions} onPress={() => fetchComments(post.post_id)}>
                <Image source={require('../../assets/icons/message-dots.png')} style={styles.icon} />
                <Text style={styles.textPostActions}>{post.comment_count > 0 ? post.comment_count : null}</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}
      <View style={styles.separator} />
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

            {/* <View style={styles.inputWrapper}>
              <Text style={styles.textContent}>{username}</Text>
            </View> */}
            <View style={styles.inputWrapper}>
              <Text style={styles.title}>Bio</Text>
              <Text style={styles.textContent}>{bio}</Text>
            </View>
            <View style={styles.separator} />

          </>
        }
        data={habitPosts}
        renderItem={renderHabitPosts}
        keyExtractor={(item, index) => index.toString()}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.primary]}
          />
        }
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
                <Text style={styles.imageDescriptionInsideModal}>{selectedImage.post_description}</Text>
                <Button title="Close" onPress={closeModal} />
              </>
            )}
          </View>
        </View>
      </Modal>

      <Modal
        visible={showLikesModal}
        transparent={true}
        onRequestClose={() => setShowLikesModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Liked by</Text>
            <FlatList
              data={likedUsers}
              keyExtractor={(item) => item.user_id.toString()}
              renderItem={({ item }) => (
                <View style={styles.userContainer}>
                  <Image
                    source={item.profile_image ? { uri: item.profile_image } : require('../../assets/images/no-profile.png')}
                    style={styles.userImage}
                  />
                  <Text style={styles.userName}>{item.username}</Text>
                </View>
              )}
            />
            <TouchableOpacity onPress={() => setShowLikesModal(false)} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showCommentsModal}
        transparent={true}
        onRequestClose={() => setShowCommentsModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Comments</Text>
            <FlatList
              data={comments}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => (
                <View style={styles.commentContainer}>
                  <Image
                    source={item.user.profile_image ? { uri: item.user.profile_image } : require('../../assets/images/no-profile.png')}
                    style={styles.userImage}
                  />
                  <View>
                    <Text style={styles.userName}>{item.user.username}</Text>
                    <Text style={styles.commentText}>{item.content}</Text>
                  </View>
                </View>
              )}
            />
            <TouchableOpacity onPress={() => setShowCommentsModal(false)} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
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
    marginBottom: 10,
  marginTop: 30, 
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
    alignItems: 'center',
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
    textAlign: 'center', 
  },
  textContent: {
    fontSize: 14,
    color: Colors.white,
    marginBottom: 16,
    textAlign: 'center',
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
  cardContainer: {

    borderRadius: 10,
    backgroundColor: Colors.cardBackground,
    marginBottom: 20,
    overflow: 'hidden',
    padding: 10,

  },
  cardContent: {
    padding: 10,
  },
  separator: {
    height: 1,
    backgroundColor: Colors.lightGray,
    marginVertical: 20,  
    borderBottomWidth: 1,
    borderBottomColor:  'rgba(105, 105, 120, 0.9)',
  },
  gridImage: {
    width: imageSize - 10,
    height: imageSize - 10,
    margin: 5,
  },
  textContainer: {
    padding: 10,
  },
  textPostContainer: {
    borderWidth: 1,
    borderColor: Colors.lightGray,
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  textUserName: {
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 5,
  },
  postText: {
    color: Colors.text,
    marginBottom: 10,
    marginLeft: 10, 
    marginTop: 10,
  },
  textSubtitle: {
    color: '#FFFFFF',
    marginLeft: 10,
  },
  containerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  buttonActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  textPostActions: {
    marginRight: 10,
    marginRight: 10,
    color: Colors.text,
  },
  icon: {
    width: 29,
    height: 29,
    margin: 10,
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
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  fullImage: {
    width: '100%',
    height: Dimensions.get('window').width,
    borderRadius: 10,
    marginBottom: 16,
  },
  imageDescriptionInsideModal: {
    color: 'black',
    marginBottom: 16,
    textAlign: 'center',
    fontSize: 18,
  },
  userContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  userImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  userName: {
    fontSize: 16,
    color: 'white',
  },
  closeButton: {
    marginTop: 20,
    padding: 12,
    backgroundColor: Colors.primary,
    borderRadius: 5,
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  commentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    width: '100%',
    marginTop: 10,
  },
  commentText: {
    fontSize: 16,
    color: 'black',
    flexWrap: 'wrap',
    flex: 1,
    maxWidth: 200,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    maxWidth: '100%',
  },
  habitImage: {
    width: '100%',
    height: 300,
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  userContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  userImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  userName: {
    fontSize: 16,
  },
  closeButton: {
    marginTop: 20,
    padding: 12,
    backgroundColor: Colors.primary,
    borderRadius: 5,
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});


Account.propTypes = {
  navigation: PropTypes.object,
  setIsLoggedIn: PropTypes.func,
};
