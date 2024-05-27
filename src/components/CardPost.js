import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { TapGestureHandler } from 'react-native-gesture-handler';
import { useNavigation } from '@react-navigation/native';
import moment from 'moment';
import { useSelector } from 'react-redux';
import Colors from '../../assets/styles/Colors';
import PropTypes from 'prop-types';
import { supabase } from '../config/supabaseClient';


const CardPost = (props) => {
  // const user = useSelector(({ user }) => user);
  const session = useSelector(({ user }) => user.session);
  const user = session?.user; // this accesses the nested user object
  const [showModalCardOptions, setShowModalCardOptions] = useState(false);
  const [isDeletingPost, setIsDeletingPost] = useState(false);
  const [successDeleting, setSuccessDeleting] = useState(false);
  const isPostFromUserLoggedIn = props.postUser.id === user.id;
  const navigation = useNavigation();
  const [likeFromUser, setLikeFromUser] = useState(props.likeFromUser);
  const [countLikes, setCountLikes] = useState(props.countLikes);



  useEffect(() => {
    if (!showModalCardOptions && successDeleting) {
      Alert.alert('Success!', 'Your post was deleted!');
      props.actions.onDeletePostSuccess(props.postId);
    }
  }, [showModalCardOptions, successDeleting]);
  console.log('User:', user);



  const viewUser = () => {
    navigation.navigate('UserProfile', { userId: props.postUser.id })
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
  
  

  const renderCardContent = () => (
    <View>
      {props.post.habit_photo && (
        <Image source={{ uri: props.post.habit_photo }} style={styles.habitImage} resizeMode="cover" />
      )}
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
            props.actions?.likeFromUser
              ? require('../../assets/icons/heart-full.png')
              : require('../../assets/icons/heart.png')
          }
          style={styles.icon}
        />
        <Text style={styles.textPostActions}>{props.actions.countLikes > 0 ? props.actions.countLikes : null}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.buttonActions} onPress={onPressComment}>
        <Image source={require('../../assets/icons/message-dots.png')} style={styles.icon} />
        <Text style={styles.textPostActions}>{props.actions.countComments > 0 ? props.actions.countComments : null}</Text>
      </TouchableOpacity>
    </View>
  );



  

  const onPressLike = async () => {
    try {
      console.log('User ID:', user?.id);
      if (!user || !user.id) {
        console.error('User is not defined or does not have an id');
        throw new Error('User is not defined or does not have an id');
      }
  
      // check to see if the user already liked the post
      const { data: likeData, error: likeError } = await supabase
        .from('Like')
        .select('*')
        .eq('post_id', props.postId)
        .eq('user_id', user.id);
  
      if (likeError) {
        console.error('Error checking like:', likeError);
        throw likeError;
      }
  
      if (likeData.length > 0) {
        // when user unlikes the post
        console.log('Unliking the post');
        const { error: deleteError } = await supabase
          .from('Like')
          .delete()
          .eq('post_id', props.postId)
          .eq('user_id', user.id);
  
        if (deleteError) {
          console.error('Error deleting like:', deleteError);
          throw deleteError;
        }
      } else {
        // when user likes the post
        console.log('Liking the post');
        const { error: insertError } = await supabase
          .from('Like')
          .insert([{ post_id: props.postId, user_id: user.id }]);
  
        if (insertError) {
          console.error('Error inserting like:', insertError);
          throw insertError;
        }
      }
  
      // grab updated count of likes
      const { data: likeCountData, error: likeCountError } = await supabase
        .from('Like')
        .select('*', { count: 'exact' })
        .eq('post_id', props.postId);
  
      if (likeCountError) {
        console.error('Error getting like count:', likeCountError);
        throw likeCountError;
      }
  
      const updatedLikeCount = likeCountData.length;
      console.log('Updated like count:', updatedLikeCount);
  
      // update state with the new like count
      setCountLikes(updatedLikeCount);
      setLikeFromUser(likeData.length === 0);
      props.actions.onLikePostSuccess(props.postId);
    } catch (error) {
      console.error('Something went wrong with liking the post:', error);
      Alert.alert('Error', 'Something went wrong with liking the post');
    }
  };
  
  
  
  
  
  







  const onPressComment = () => {
    console.log('props.postId:', props.postId);
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

  // return (
  //   <TouchableOpacity
  //     // onLongPress={toggleModalOptions}
  //     // onPress={onPressPost}
  //     style={styles.cardShadow}
  //   >
  //     {renderCardTop()}
  //     {renderCardContent()}
  //     <View style={styles.containerActions}>
  //       <TouchableOpacity style={styles.buttonActions} onPress={onPressLike}>
  //         <Image
  //           source={
  //             likeFromUser
  //               ? require('../../assets/icons/heart-full.png')
  //               : require('../../assets/icons/heart.png')
  //           }
  //           style={styles.icon}
  //         />
  //         <Text style={styles.textPostActions}>{countLikes > 0 ? countLikes : null}</Text>
  //       </TouchableOpacity>
  //       <TouchableOpacity style={styles.buttonActions} onPress={onPressComment}>
  //         <Image source={require('../../assets/icons/message-dots.png')} style={styles.icon} />
  //         <Text style={styles.textPostActions}>{props.actions.countComments > 0 ? props.actions.countComments : null}</Text>
  //       </TouchableOpacity>
  //     </View>
  //   </TouchableOpacity>
  // );

  return (
    <TapGestureHandler
      numberOfTaps={2}
      onActivated={onPressLike}
    >
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
      </View>
    </TapGestureHandler>
  );
  
  
};

CardPost.propTypes = {
  postId: PropTypes.string.isRequired,
  post: PropTypes.object.isRequired,
  postUser: PropTypes.object.isRequired,
  createdAt: PropTypes.string.isRequired,
  // postTitle: PropTypes.string.isRequired,
  postDescription: PropTypes.string.isRequired,
  postType: PropTypes.string.isRequired,
  actions: PropTypes.object.isRequired,
  navigation: PropTypes.object.isRequired,
  likeFromUser: PropTypes.bool.isRequired,
  countLikes: PropTypes.number.isRequired,
  user: PropTypes.object.isRequired,
  countLikes: PropTypes.number.isRequired,

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
});



export default CardPost;
