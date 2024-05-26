import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import moment from 'moment';
import { useSelector } from 'react-redux';
import Colors from '../../assets/styles/Colors';
import { likePost } from '../store/ducks/post';
import PropTypes from 'prop-types';

const CardPost = (props) => {
  const [showModalCardOptions, setShowModalCardOptions] = useState(false);
  const [isDeletingPost, setIsDeletingPost] = useState(false);
  const [successDeleting, setSuccessDeleting] = useState(false);
  const user = useSelector(({ user }) => user);
  const isPostFromUserLoggedIn = props.postUser.id === user.id;
  const navigation = useNavigation();

  useEffect(() => {
    if (!showModalCardOptions && successDeleting) {
      Alert.alert('Success!', 'Your post was deleted!');
      props.actions.onDeletePostSuccess(props.postId);
    }
  }, [showModalCardOptions, successDeleting]);

  const viewUser = () => {
    navigation.navigate('UserProfile', { userId: props.postUser.id })
  };

  // const renderCardTop = () => (
  //   <LinearGradient
  //     colors={['rgba(156, 198, 255, 0.042)', 'rgba(0, 37, 68, 0.15)']}
  //     start={{ x: 0, y: 0.5 }}
  //     end={{ x: 1, y: 0.5 }}
  //     style={styles.cardPostLinearGradientContainer}
  //   >
  //     <TouchableOpacity onPress={viewUser}>
  //       <View style={styles.cardPostHeaderContainer}>
  //         {props.postUser?.imageUrl ? (
  //           <Image
  //             source={{ uri: props.postUser.imageUrl }}
  //             style={styles.cardPostIconPhoto}
  //           />
  //         ) : (
  //           <Image
  //             source={require('../../assets/images/no-profile.png')}
  //             style={styles.cardPostIconPhoto}
  //           />
  //         )}
  //         <View
  //           style={{
  //             flexDirection: 'column',
  //             justifyContent: 'flex-start',
  //             flexWrap: 'nowrap',
  //             flex: 1,
  //             marginRight: isPostFromUserLoggedIn ? 8 : 32,
  //           }}
  //         >
  //           <Text style={styles.textUserName}>
  //             {props.postUser?.name ?? 'Unknown User'}
  //           </Text>
  //           <Text style={styles.textSubtitle}>
  //             {props.createdAt ? moment(props.createdAt).local().startOf('second').fromNow() : 'Unknown posted time'}
  //           </Text>
  //         </View>
  //         {isPostFromUserLoggedIn ? (
  //           <TouchableOpacity onPress={toggleModalOptions}>
  //             <Image
  //               source={require('../../assets/icons/ellipse-vertical.png')}
  //               style={styles.cardPostVerticalEllipsis}
  //             />
  //           </TouchableOpacity>
  //         ) : null}
  //       </View>
  //     </TouchableOpacity>
  //   </LinearGradient>
  // );




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
          <Image source={require('../../assets/icons/ellipse-vertical.png')} style={styles.cardPostVerticalEllipsis} />
        </TouchableOpacity>
      )}
    </View>
  );
  
  

  // const renderCardContent = () => (
  //   <LinearGradient
  //     colors={['rgba(156, 198, 255, 0.042)', 'rgba(0, 37, 68, 0.15)']}
  //     start={{ x: 0, y: 0.5 }}
  //     end={{ x: 1, y: 0.5 }}
  //     style={[styles.cardPostLinearGradientContainer, { paddingHorizontal: 16, paddingVertical: 12 }]}
  //   >
  //     <Text style={styles.postText}>{props.postTitle}</Text>
  //     <Text style={styles.postText}>{props.postDescription}</Text>
  //     {props.post.habit_photo && (
  //       <Image source={{ uri: props.post.habit_photo }} style={styles.habitImage} resizeMode="cover" />
  //     )}
  //   </LinearGradient>
  // );



  // const renderCardContent = () => (
  //   <LinearGradient
  //     colors={['rgba(156, 198, 255, 0.042)', 'rgba(0, 37, 68, 0.15)']}
  //     start={{ x: 0, y: 0.5 }}
  //     end={{ x: 1, y: 0.5 }}
  //     style={[styles.cardPostLinearGradientContainer, { paddingHorizontal: 16, paddingVertical: 12 }]}
  //   >
  //     <Text style={styles.postText}>{props.postTitle}</Text>
  //     <Text style={styles.postText}>{props.postDescription}</Text>
  //     {props.post.habit_photo && (
  //       <Image source={{ uri: props.post.habit_photo }} style={styles.habitImage} resizeMode="cover" />
  //     )}
  //   </LinearGradient>
  // );
  


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
  

  // const renderCardContent = () => (
  //   <LinearGradient
  //     colors={['rgba(156, 198, 255, 0.042)', 'rgba(0, 37, 68, 0.15)']}
  //     start={{ x: 0, y: 0.5 }}
  //     end={{ x: 1, y: 0.5 }}
  //     style={[styles.cardPostLinearGradientContainer, { paddingHorizontal: 16, paddingVertical: 12 }]}
  //   >
  //     <Text style={styles.postText}>{props.postTitle}</Text>
  //     <Text style={styles.postText}>{props.postDescription}</Text>
  //     {props.post.habit_photo && (
  //       <Image source={{ uri: props.post.habit_photo }} style={styles.habitImage} resizeMode="cover" />
  //     )}
  //   </LinearGradient>
  // );
  



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

  

  // const renderCardActions = () => (
  //   <LinearGradient
  //     colors={['rgba(156, 198, 255, 0.042)', 'rgba(0, 37, 68, 0.15)']}
  //     start={{ x: 0, y: 0.5 }}
  //     end={{ x: 1, y: 0.5 }}
  //     style={[styles.cardPostLinearGradientContainer, { borderTopColor: `${Colors.white}14`, borderTopWidth: 1 }]}
  //   >
  //     <View style={styles.containerActions}>
  //       <TouchableOpacity style={styles.buttonActions} onPress={onPressLike}>
  //         <Image
  //           resizeMode='cover'
  //           source={
  //             props.actions?.likeFromUser
  //               ? require('../../assets/icons/heart-full.png')
  //               : require('../../assets/icons/heart.png')
  //           }
  //           style={styles.imageMedal}
  //         />
  //         <Text style={styles.textPostActions}>
  //           {props.actions.countLikes > 0 ? props.actions.countLikes : null}
  //         </Text>
  //       </TouchableOpacity>
  //       <TouchableOpacity style={styles.buttonActions} onPress={onPressComment}>
  //         <Image
  //           source={require('../../assets/icons/message-dots.png')}
  //           style={styles.imageMedal}
  //         />
  //         <Text style={styles.textPostActions}>
  //           {props.actions.countComments > 0 ? props.actions.countComments : null}
  //         </Text>
  //       </TouchableOpacity>
  //     </View>
  //   </LinearGradient>
  // );

  const onPressLike = async () => {
    try {
      await likePost(props.postId);
      props.actions.onLikePostSuccess(props.postId);
    } catch (error) {
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

  return (
    <TouchableOpacity
      onLongPress={toggleModalOptions}
      onPress={onPressPost}
      style={styles.cardShadow}
    >
      {renderCardTop()}
      {renderCardContent()}
      {renderCardActions()}
    </TouchableOpacity>
  );
};

CardPost.propTypes = {
  postId: PropTypes.number.isRequired,
  post: PropTypes.object.isRequired,
  postUser: PropTypes.object.isRequired,
  createdAt: PropTypes.string.isRequired,
  postTitle: PropTypes.string.isRequired,
  postDescription: PropTypes.string.isRequired,
  postType: PropTypes.string.isRequired,
  actions: PropTypes.object.isRequired,
  navigation: PropTypes.object.isRequired,
};

// const styles = StyleSheet.create({
//   cardShadow: {
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.25,
//     shadowRadius: 6,
//     elevation: 7,
//   },
//   cardPostLinearGradientContainer: {
//     flex: 1,
//     backgroundColor: 'rgba(156, 198, 255, 0.042)',
//   },
//   cardPostHeaderContainer: {
//     display: 'flex',
//     flexDirection: 'row',
//     padding: 16,
//   },
//   cardPostIconPhoto: {
//     width: 38,
//     height: 38,
//     borderRadius: 32,
//     marginRight: 8,
//   },
//   textUserName: {
//     flex: 1,
//     fontSize: 16,
//     fontWeight: '700',
//     lineHeight: 16,
//     color: Colors.text,
//   },
//   textSubtitle: {
//     fontSize: 14,
//     lineHeight: 19,
//     fontWeight: '400',
//     color: Colors.text,
//   },
//   cardPostVerticalEllipsis: {
//     height: 24,
//     width: 24,
//   },
//   postText: {
//     justifyContent: 'flex-start',
//     fontSize: 16,
//     fontWeight: '700',
//     lineHeight: 16,
//     color: Colors.text,
//     width: '100%',
//     flexShrink: 1,
//     paddingRight: 8,
//   },
//   containerActions: {
//     flex: 1,
//     backgroundColor: 'rgba(156, 198, 255, 0.042)',
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     paddingVertical: 16,
//     paddingHorizontal: 32,
//   },
//   buttonActions: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingRight: 100,
//     justifyContent: 'space-between',
//   },
//   textPostActions: {
//     justifyContent: 'flex-start',
//     fontSize: 14,
//     fontWeight: '400',
//     lineHeight: 19,
//     color: Colors.text,
//     paddingLeft: 8,
//   },
//   imageMedal: {
//     width: 24,
//     height: 24,
//   },
//   habitImage: {
//     width: '100%',
//     height: 200,
//     marginTop: 10,
//   },
// });


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
    width: 24,
    height: 24,
  },
});



export default CardPost;
