import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, Alert, Modal, FlatList } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { TapGestureHandler } from 'react-native-gesture-handler';
import { useNavigation } from '@react-navigation/native';
import moment from 'moment';
import { useSelector } from 'react-redux';
import Colors from '../../assets/styles/Colors';
import PropTypes from 'prop-types';
import { supabase } from '../config/supabaseClient';

const CardPost = (props) => {
  const session = useSelector(({ user }) => user.session);
  const user = session?.user;
  const [showModalCardOptions, setShowModalCardOptions] = useState(false);
  const [isDeletingPost, setIsDeletingPost] = useState(false);
  const [successDeleting, setSuccessDeleting] = useState(false);
  const isPostFromUserLoggedIn = props.postUser.id === user.id;
  const navigation = useNavigation();
  const [likeFromUser, setLikeFromUser] = useState(props.likeFromUser);
  const [countLikes, setCountLikes] = useState(props.countLikes);
  const [showLikesModal, setShowLikesModal] = useState(false);
  const [likedUsers, setLikedUsers] = useState([]);

  useEffect(() => {
    if (!showModalCardOptions && successDeleting) {
      Alert.alert('Success!', 'Your post was deleted!');
      props.actions.onDeletePostSuccess(props.postId);
    }
  }, [showModalCardOptions, successDeleting]);

  const viewUser = () => {
    navigation.navigate('UserProfile', { userId: props.postUser.id });
  };

  const renderCardTop = () => (
    <View style={styles.cardPostHeaderContainer}>
      <TouchableOpacity onPress={viewUser}>
        {props.postUser?.imageUrl ? (
          <Image source={{ uri: props.postUser.imageUrl }} style={styles.cardPostIconPhoto} />
        ) : (
          <Image source={require('../../assets/images/no-profile.png')} style={styles.cardPostIconPhoto} />
        )}
      </TouchableOpacity>
      <View style={styles.cardPostHeaderTextContainer}>
        <Text style={styles.textUserName}>
          {props.postUser?.name ?? 'Unknown User'}
        </Text>
        <Text style={styles.textSubtitle}>
          {props.createdAt ? moment(props.createdAt).local().startOf('second').fromNow() : 'Unknown posted time'}
        </Text>
      </View>
      {isPostFromUserLoggedIn && (
        <TouchableOpacity onPress={toggleModalOptions}>
          {/* <Image source={require('../../assets/icons/ellipse-vertical.png')} style={styles.cardPostVerticalEllipsis} /> */}
        </TouchableOpacity>
      )}
    </View>
  );

  const fetchLikedUsers = async () => {
    try {
      // Get user_ids who liked the post
      const { data: likeData, error: likeError } = await supabase
        .from('Like')
        .select('user_id')
        .eq('post_id', props.postId);

      if (likeError) throw likeError;

      if (likeData.length === 0) {
        setLikedUsers([]);
        setShowLikesModal(true);
        return;
      }

      const userIds = likeData.map(like => like.user_id);

      // Get user details from User table
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

  const renderCardContent = () => (
    <View>
      {props.post.habit_photo && (
        <Image source={{ uri: props.post.habit_photo }} style={styles.habitImage} resizeMode="cover" />
      )}
      <View style={styles.cardPostDescriptionContainer}>
        <TouchableOpacity onPress={fetchLikedUsers}>
          <Text style={styles.textSubtitle}>{countLikes} likes</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.cardPostDescriptionContainer}>
        <Text style={styles.textUserName}>{props.postUser?.name ?? 'Unknown User'} </Text>
        <Text style={styles.postText}>{props.postDescription}</Text>
      </View>
    </View>
  );

  const renderCardActions = () => (
    <View style={styles.containerActions}>
      <TouchableOpacity style={styles.buttonActions} onPress={onPressLike}>
        <Image
          source={
            likeFromUser
              ? require('../../assets/icons/heart-full.png')
              : require('../../assets/icons/heart.png')
          }
          style={styles.icon}
        />
        <Text style={styles.textPostActions}>{countLikes > 0 ? countLikes : null}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.buttonActions} onPress={onPressComment}>
        <Image source={require('../../assets/icons/message-dots.png')} style={styles.icon} />
        <Text style={styles.textPostActions}>{props.actions.countComments > 0 ? props.actions.countComments : null}</Text>
      </TouchableOpacity>
    </View>
  );

  const onPressLike = async () => {
    try {
      if (!user || !user.id) {
        throw new Error('User is not defined or does not have an id');
      }

      const { data: likeData, error: likeError } = await supabase
        .from('Like')
        .select('*')
        .eq('post_id', props.postId)
        .eq('user_id', user.id);

      if (likeError) throw likeError;

      if (likeData.length > 0) {
        const { error: deleteError } = await supabase
          .from('Like')
          .delete()
          .eq('post_id', props.postId)
          .eq('user_id', user.id);

        if (deleteError) throw deleteError;
      } else {
        const { error: insertError } = await supabase
          .from('Like')
          .insert([{ post_id: props.postId, user_id: user.id }]);

        if (insertError) throw insertError;
      }

      const { data: likeCountData, error: likeCountError } = await supabase
        .from('Like')
        .select('*', { count: 'exact' })
        .eq('post_id', props.postId);

      if (likeCountError) throw likeCountError;

      const updatedLikeCount = likeCountData.length;

      setCountLikes(updatedLikeCount);
      setLikeFromUser(likeData.length === 0);
      props.actions.onLikePostSuccess(props.postId);
    } catch (error) {
      Alert.alert('Error', 'Something went wrong with liking the post');
    }
  };

  const onPressComment = () => {
    var userData = { id: props.postUser.id, name: props.postUser.name, imageUrl: props.postUser.imageUrl };
    var postData = { description: props.postDescription, id: props.postId };
    props.navigation.navigate('Comments', {
      navigation: props.navigation,
      postId: props.postId,
      userData,
      postData
    });
  };

  const toggleModalOptions = () => {
    if (isPostFromUserLoggedIn) {
      props.setBlurActive(!showModalCardOptions);
      setShowModalCardOptions(!showModalCardOptions);
      return;
    }
    onPressPost();
  };

  const onPressPost = () => {
    props.navigation.navigate('PostDetails', { postId: props.postId });
  };

  return (
    <TapGestureHandler numberOfTaps={2} onActivated={onPressLike}>
      <View style={styles.cardShadow}>
        {renderCardTop()}
        {renderCardContent()}
        <View style={styles.containerActions}>
          <TouchableOpacity style={styles.buttonActions} onPress={onPressLike}>
            <Image
              source={
                likeFromUser
                  ? require('../../assets/icons/heart-full.png')
                  : require('../../assets/icons/heart.png')
              }
              style={styles.icon}
            />
            <Text style={styles.textPostActions}>{countLikes > 0 ? countLikes : null}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.buttonActions} onPress={onPressComment}>
            <Image source={require('../../assets/icons/message-dots.png')} style={styles.icon} />
            <Text style={styles.textPostActions}>{props.actions.countComments > 0 ? props.actions.countComments : null}</Text>
          </TouchableOpacity>
        </View>

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
      </View>
    </TapGestureHandler>
  );
};

CardPost.propTypes = {
  postId: PropTypes.string.isRequired,
  post: PropTypes.object.isRequired,
  postUser: PropTypes.object.isRequired,
  createdAt: PropTypes.string.isRequired,
  postDescription: PropTypes.string.isRequired,
  postType: PropTypes.string.isRequired,
  actions: PropTypes.object.isRequired,
  navigation: PropTypes.object.isRequired,
  likeFromUser: PropTypes.bool.isRequired,
  countLikes: PropTypes.number.isRequired,
  user: PropTypes.object.isRequired,
};

const styles = StyleSheet.create({
  cardPostHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  cardPostIconPhoto: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  cardPostHeaderTextContainer: {
    flex: 1,
    flexDirection: 'column',
    marginLeft: 10,
  },
  textUserName: {
    fontWeight: 'bold',
    color: Colors.text,
  },
  textSubtitle: {
    color: '#FFFFFF',
  },
  cardPostVerticalEllipsis: {
    width: 24,
    height: 24,
  },
  habitImage: {
    width: '100%',
    height: 400,
  },
  cardPostDescriptionContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 10,
  },
  postText: {
    color: Colors.text,
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
    marginLeft: 5,
    color: Colors.text,
  },
  icon: {
    width: 29,
    height: 29,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
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

export default CardPost;
