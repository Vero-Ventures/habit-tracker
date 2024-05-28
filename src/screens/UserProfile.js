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
import moment from 'moment';

const { width } = Dimensions.get('window');
const imageSize = width / 3;

const UserProfile = () => {
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [habitPosts, setHabitPosts] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [postsCount, setPostsCount] = useState(0);
  const [showLikesModal, setShowLikesModal] = useState(false);
  const [likedUsers, setLikedUsers] = useState([]);
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [comments, setComments] = useState([]);



  const navigation = useNavigation();
  const route = useRoute();
  const { userId } = route.params;

  useEffect(() => {
    getProfile();
    getHabitPosts();
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

  


  const getHabitPosts = async () => {
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
        Alert.alert('Error', 'No habits or schedules found for the user');
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

  const goToCommentsScreen = (postId) => {
    navigation.navigate('CommentsScreen', { postId });
  };

  const openModal = (image) => {
    setSelectedImage(image);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedImage(null);
  };


  const fetchLikeCount = async (postId) => {
    const { data: likeCountData, error: likeCountError } = await supabase
      .from('Like')
      .select('*', { count: 'exact' })
      .eq('post_id', postId);
  
    if (likeCountError) throw likeCountError;
  
    return likeCountData.length;
  };
  
  const fetchLikeStatus = async (postId, userId) => {
    const { data: likeData, error: likeError } = await supabase
      .from('Like')
      .select('*')
      .eq('post_id', postId)
      .eq('user_id', userId);
  
    if (likeError) throw likeError;
  
    return likeData.length > 0;
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
        data={habitPosts}
        renderItem={renderHabitPosts}
        keyExtractor={(item, index) => index.toString()}
      />
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
    borderBottomWidth: 1,
    borderBottomColor:  'rgba(105, 105, 120, 0.9)',
    paddingBottom: 10,
    marginBottom: 10,
  },
  stat: {
    alignItems: 'center',
    marginBottom: 10,
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
    // marginBottom: 40,
    // marginTop: 10,
  },
  cardContainer: {
    borderRadius: 10,
    backgroundColor: Colors.cardBackground,
    marginBottom: 20,
    overflow: 'hidden',
    padding: 10,
  },
  separator: {
    height: 1,
    backgroundColor: Colors.lightGray,
    marginVertical: 20,  
    borderBottomWidth: 1,
    borderBottomColor:  'rgba(105, 105, 120, 0.9)',
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
  imageDescription: {
    color: Colors.white,
    marginBottom: 16,
    textAlign: 'center',
    fontSize: 20,
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
    padding: 10,
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
    padding: 10,
    backgroundColor: Colors.primary,
    borderRadius: 5,
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});


export default UserProfile;
