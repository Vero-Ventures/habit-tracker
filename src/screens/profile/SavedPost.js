import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  RefreshControl,
  Dimensions,
  ActivityIndicator,
  Image,
  Text,
  TouchableOpacity,
  Alert,
  Share,
} from 'react-native';
import Default from '../../../assets/styles/Default';
import Colors from '../../../assets/styles/Colors';
import Fetching from '../../components/Fetching';
import Header from '../../components/Header';
import PostCommunity from '../../components/community/PostCommunity';
import PostHabits from '../../components/community/PostHabits';
import { useSelector } from 'react-redux';
import { LinearGradient } from 'expo-linear-gradient';
import { getSavedPosts } from '../../store/ducks/user';
import { BlurView } from 'expo-blur';
import CardPost from '../../components/CardPost';

const SavedPost = props => {
  const [fetching, setFetching] = useState(false);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [load_more, setLoadMore] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [list_posts, setListPosts] = useState([]);
  const [blurActive, setBlurActive] = useState(false);
  const [length_post, setLengthPost] = useState(0);
  const user = useSelector(({ user }) => user);

  useEffect(() => {
    fetchAll(true, false);
  }, []);

  const fetchAll = (isFetching, isRefreshing) => {
    isFetching ? setFetching(true) : isRefreshing ? setRefreshing(true) : null;

    getSavedPosts({ page: 0 })
      .catch(err => {
        Alert.alert(
          'Ops!',
          'Something went wrong with our servers. Please contact us.'
        );
      })
      .then(res => {
        if (res?.status === 200) {
          if (res.data.errors) {
            Alert.alert('Ops!', res.data.errors[0]);
          } else {
            setListPosts(res.data.data);
            setLengthPost(res.data.data.length);
            setPage(0);
          }

          if (res.data?.current_page === res.data?.last_page) {
            setLoadMore(false);
            setPage(0);
          } else {
            setLoadMore(true);
          }
        }
      })
      .finally(() => {
        setFetching(false);
        setRefreshing(false);
      });
  };

  const loadMore = () => {
    let post_aux = [];
    let number_page = page + 1;

    setPage(number_page);
    setLoading(true);

    let request = {
      page: number_page,
    };

    getSavedPosts(request)
      .catch(err => {
        Alert.alert(
          'Ops!',
          'Something went wrong with our servers. Please contact us.'
        );
      })
      .then(res => {
        if (res?.status === 200) {
          if (res.data.errors) {
            Alert.alert('Ops!', res.data.errors[0]);
          } else {
            post_aux = [...list_posts];
            post_aux = post_aux.concat(res.data?.data);

            setListPosts(post_aux);
            setLengthPost(res.data.data.length);

            if (res.data?.current_page === res.data?.last_page) {
              setLoadMore(false);
              setPage(0);
            }
          }

          setLoading(false);
        }
      });
  };

  const shareMyProfile = async () => {
    const urlAndroid =
      'https://play.google.com/store/apps/details?id=com.alex.live.timeless';
    const urlApple =
      'https://apps.apple.com/br/app/live-timeless/id1556115926?l=en';
    const message =
      'Check my profile on Live Timeless App.\nAndroid Link: ' +
      urlAndroid +
      '\nApple Link: ' +
      urlApple;

    try {
      const result = await Share.share({
        title: 'Join to my community in Live Timeless App',
        message,
        url: urlApple,
      });
      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          // shared with activity type of result.activityType
        } else {
        }
      } else if (result.action === Share.dismissedAction) {
        // dismissed
      }
    } catch (error) {
      alert(error.message);
    }
  };

  const isCloseToBottom = ({
    layoutMeasurement,
    contentOffset,
    contentSize,
  }) => {
    const paddingToBottom = 16;
    return (
      layoutMeasurement.height + contentOffset.y >=
      contentSize.height - paddingToBottom
    );
  };

  const onLikePostSuccess = postIndex => {
    const listPostsClone = [...list_posts];

    listPostsClone[postIndex].likeFromUser =
      !listPostsClone[postIndex].likeFromUser;

    if (listPostsClone[postIndex].likeFromUser) {
      listPostsClone[postIndex].count_likes++;
    } else {
      listPostsClone[postIndex].count_likes--;
    }

    setListPosts(listPostsClone);
  };

  const onSavePostSuccess = postIndex => {
    const listPostsClone = [...list_posts];

    listPostsClone[postIndex].saveFromUser =
      !listPostsClone[postIndex].saveFromUser;

    setListPosts(listPostsClone);
  };

  const onDeletePostSuccess = postIndex => {
    const listPostsClone = [...list_posts].filter(
      (_item, postIndexFromItem) => postIndexFromItem !== postIndex
    );

    setListPosts(listPostsClone);
    setBlurActive(false);
  };

  return (
    <View style={[Default.container, { marginTop: -28 }]}>
      <ScrollView
        scrollEnabled
        onScroll={({ nativeEvent }) => {
          if (
            list_posts.length > 0 &&
            load_more &&
            isCloseToBottom(nativeEvent)
          ) {
            loadMore();
          }
        }}
        refreshControl={
          <RefreshControl
            colors={['#000']}
            tintColor="#fff"
            onRefresh={() => fetchAll(false, true)}
            refreshing={refreshing}
          />
        }>
        <Header navigation={props.navigation} showBackgroundImage backButton />
        <Fetching isFetching={fetching}>
          <View style={styles.container}>
            <View style={styles.containerHeader}>
              <View style={styles.containerPhoto}>
                {user.image ? (
                  <View
                    styles={{
                      flex: 1,
                      flexDirection: 'row',
                      alignItems: 'center',
                    }}>
                    <Image
                      source={require('../../../assets/icons/ellipse.png')}
                      style={styles.borderPhoto}
                    />
                    <Image
                      source={{ uri: user.image.url }}
                      style={styles.userPhoto}
                    />
                  </View>
                ) : (
                  <View
                    styles={{
                      flex: 1,
                      flexDirection: 'row',
                      alignItems: 'center',
                    }}>
                    <Image
                      source={require('../../../assets/icons/ellipse.png')}
                      style={styles.borderPhoto}
                    />
                    <Image
                      source={require('../../../assets/images/no-profile.png')}
                      style={styles.userPhoto}
                    />
                  </View>
                )}
              </View>
              <Text style={styles.textName}>{`Hi, ${user.name}!`}</Text>
            </View>

            <View style={styles.containerActionsHeader}>
              <TouchableOpacity
                style={styles.editProfile}
                onPress={shareMyProfile}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Image
                    source={require('../../../assets/icons/share-profile.png')}
                    style={styles.iconsHeader}
                  />
                  <Text style={styles.editProfileText}>Share My Profile</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.editProfile}
                onPress={() => props.navigation.push('UpdateProfile')}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Image
                    source={require('../../../assets/icons/edit.png')}
                    style={styles.iconsHeader}
                  />
                  <Text style={styles.editProfileText}>Edit Profile</Text>
                </View>
              </TouchableOpacity>
            </View>

            <View style={styles.containerSection}>
              <LinearGradient
                colors={['rgba(156, 198, 255, 0.042)', 'rgba(0, 37, 68, 0.15)']}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={styles.containerSaved}>
                <Image
                  source={require('../../../assets/icons/bookmark-bordered.png')}
                  style={{ width: 24, height: 24, marginRight: 13 }}
                />
                <Text style={styles.textInfo}>Saved Items</Text>
              </LinearGradient>
            </View>

            <View style={styles.containerBody}>
              {list_posts.length > 0 ? (
                list_posts.map((timelinePost, index) => {
                  return (
                    <View
                      key={`timeline-post-${timelinePost.id}-${
                        timelinePost.community ? 'community' : 'post'
                      }-${index}`}
                      style={{ marginTop: index === 0 ? 0 : 16 }}>
                      <CardPost
                        navigation={props.navigation}
                        postId={timelinePost.id}
                        postUser={{
                          id: timelinePost.user?.id ?? null,
                          name: timelinePost.user?.name ?? null,
                          imageUrl: timelinePost.user?.image?.url ?? null,
                        }}
                        postFile={timelinePost.file}
                        length_post={length_post}
                        createdAt={timelinePost.created_at}
                        postText={timelinePost.postText}
                        postType={timelinePost.postType}
                        community={
                          timelinePost.community
                            ? {
                                id: timelinePost.community?.id,
                                name: timelinePost.community?.com_name,
                                imageUrl: timelinePost.community?.image?.url,
                                community_member:
                                  timelinePost.community?.community_member,
                              }
                            : null
                        }
                        actions={{
                          likeFromUser: timelinePost.likeFromUser,
                          count_likes: timelinePost.count_likes,
                          onLikePostSuccess: postId => onLikePostSuccess(index),

                          count_comments: timelinePost.count_comments,

                          saveFromUser: timelinePost.saveFromUser,
                          onSavePostSuccess: postId => onSavePostSuccess(index),

                          onDeletePostSuccess: postId =>
                            onDeletePostSuccess(index),
                        }}
                        setBlurActive={setBlurActive}
                      />
                    </View>
                  );
                })
              ) : (
                <View style={styles.containerNoPost}>
                  <Text style={[styles.textInfo, { alignSelf: 'center' }]}>
                    No posts saved.
                  </Text>
                </View>
              )}

              {loading ? (
                <View
                  style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignSelf: 'center',
                    paddingBottom: 16,
                  }}>
                  <ActivityIndicator size="small" color="#fff" />
                </View>
              ) : null}
            </View>
          </View>
        </Fetching>
      </ScrollView>

      {blurActive ? (
        <>
          <BlurView style={styles.containerBlur} tint="dark" intensity={20} />
          <View style={styles.containerShadow}></View>
        </>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 10,
    //marginTop: -38,
    width: Dimensions.get('window').width,
    zIndex: 1,
    elevation: 1,
  },
  containerBody: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  containerNoPost: {
    flex: 1,
    marginTop: 16,
    alignSelf: 'center',
    width: Dimensions.get('window').width - 32,
  },
  containerHeader: {
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
    position: 'absolute',
  },
  borderPhoto: {
    alignSelf: 'center',
    width: 80,
    height: 80,
    borderRadius: 32,
    position: 'relative',
  },
  containerFavorite: {
    marginTop: 16,
    width: '100%',
    height: 191,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  imageFavorite: {
    flex: 1,
    justifyContent: 'flex-end',
    borderRadius: 4,
  },
  favoriteImage: {
    width: '100%',
    height: '100%',
  },
  iconsHeader: {
    marginRight: 4,
    alignSelf: 'center',
    width: 16,
    height: 16,
  },
  iconMedal: {
    marginRight: 8,
    alignSelf: 'center',
    width: 32,
    height: 32,
  },
  iconRay: {
    marginRight: 8,
    alignSelf: 'center',
    width: 24,
    height: 24,
  },
  textName: {
    fontSize: 24,
    color: Colors.text,
    marginTop: 14,
  },
  containerList: {
    height: 268,
    marginBottom: 8,
    paddingVertical: 16,
    zIndex: 1,
    elevation: 1,
    marginHorizontal: -16,
  },
  textSeeAll: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignSelf: 'flex-end',
    marginRight: 16,
  },
  containerSeeAll: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignSelf: 'flex-end',
    marginLeft: 16,
    zIndex: 4,
    elevation: 4,
    position: 'absolute',
  },
  containerShadow: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    zIndex: 1,
    elevation: 1,
    position: 'absolute',
    marginTop: -58,
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  },
  containerActionsHeader: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 34,
    marginHorizontal: 16,
  },
  containerTitle: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#264261',
    paddingBottom: 8,
    marginBottom: 19,
  },
  textTitle: {
    fontSize: 16,
    color: Colors.text,
    fontWeight: 'bold',
  },
  containerSection: {
    borderRadius: 8,
  },
  textEmpty: {
    fontSize: 12,
    lineHeight: 16,
    height: 16,
    fontWeight: 'bold',
    color: Colors.text,
    marginLeft: 16,
  },
  containerBlur: {
    zIndex: 1,
    elevation: 1,
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    marginTop: -3,
  },
  containerBottomSheet: {
    alignItems: 'center',
    backgroundColor: Colors.primary,
  },
  containerTextBottomSheet: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonContainer: {
    marginBottom: 30,
    alignItems: 'center',
  },
  createAccountText: {
    fontSize: 14,
    color: 'white',
  },
  textExit: {
    marginTop: 26,
    fontSize: 14,
    color: Colors.text,
  },
  containerAchievement: {
    backgroundColor: Colors.primary2,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderRadius: 4,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  containerAchievementName: {
    flexDirection: 'row',
  },
  achievementHabitNme: {
    color: Colors.text,
    paddingVertical: 20,
    marginLeft: 15,
    fontSize: 12,
  },
  containerAchievementCategory: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  achievementCategory: {
    marginLeft: 8,
    fontSize: 12,
    color: Colors.text,
  },
  warningIconStyle: {
    width: 80,
    height: 80,
  },
  containerScore: {
    borderRadius: 8,
    padding: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  containerConnection: {
    borderRadius: 8,
    padding: 28,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  containerSaved: {
    borderRadius: 8,
    padding: 28,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  containerProfile: {
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  containerCard: {
    borderRadius: 4,
    flexDirection: 'column',
    alignItems: 'flex-start',
    padding: 16,
    backgroundColor: 'rgba(14, 49, 80, 1)',
    width: Dimensions.get('window').width - 32,
  },
  containerBiggest: {
    flexGrow: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignSelf: 'center',
    alignItems: 'flex-start',
    padding: 16,
    backgroundColor: 'rgba(13, 40, 65, 1)',
    width: Dimensions.get('window').width,
    marginBottom: 8,
  },
  containerCardBiggest: {
    display: 'flex',
    height: '100%',
    flexDirection: 'column',
    width: (Dimensions.get('window').width - 48) / 2,
    backgroundColor: 'rgba(156, 198, 255, 0.042)',
    borderRadius: 4,
    padding: 16,
    alignItems: 'flex-start',
    backgroundColor: 'rgba(14, 49, 80, 1)',
  },
  containerGroup: {
    flexDirection: 'row',
    marginBottom: 24,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  containerInfo: {
    width: Dimensions.get('window').width,
    marginBottom: 8,
    alignSelf: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'rgba(13, 40, 65, 1)',
  },
  textConnections: {
    color: Colors.text,
    fontWeight: '600',
    letterSpacing: -0.02,
    fontSize: 10,
    lineHeight: 10,
    marginTop: 3,
  },
  textTotalConnections: {
    color: Colors.text,
    fontSize: 13,
    lineHeight: 10,
    fontWeight: '600',
    textAlign: 'center',
    paddingTop: 3,
    marginRight: 4,
    marginTop: 4,
  },
  textRanking: {
    color: Colors.text,
    fontWeight: '400',
    letterSpacing: -0.02,
    fontSize: 20,
    lineHeight: 27,
  },
  textPositionRanking: {
    color: Colors.primary4,
    fontWeight: '700',
    letterSpacing: -0.02,
    fontSize: 20,
    lineHeight: 27,
    alignContent: 'center',
  },
  textInfo: {
    color: Colors.text,
    fontWeight: '700',
    fontSize: 16,
    lineHeight: 16,
  },
  textBiggest: {
    color: Colors.text,
    fontWeight: '700',
    fontSize: 16,
    lineHeight: 22.4,
  },
  textNameFavorite: {
    color: Colors.primary8,
    fontWeight: '700',
    fontSize: 14,
    lineHeight: 16,
  },
  textTouchable: {
    color: Colors.primary8,
    fontWeight: '700',
    fontSize: 14,
    lineHeight: 21,
  },
  textReviewScore: {
    color: Colors.primary4,
    fontSize: 14,
    lineHeight: 19,
    textDecorationLine: 'underline',
    marginTop: 6,
  },
  userScore: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    lineHeight: 16,
  },
  ratingUserScore: {
    fontSize: 16,
    lineHeight: 19,
    color: Colors.text,
  },
  btnGetScore: {
    backgroundColor: Colors.primary3,
    borderRadius: 4,
    paddingHorizontal: 35,
    paddingVertical: 12,
  },
  titleBtnGetScore: {
    color: Colors.text,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: 'bold',
  },
  containerButton: {
    marginTop: 12,
    marginBottom: 22,
    alignItems: 'center',
  },
  buttonProducts: {
    height: 56,
    borderRadius: 30,
    backgroundColor: 'transparent',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#9CC6FF',
    width: Dimensions.get('window').width - 44,
    marginHorizontal: 24,
  },
  titleProducts: {
    fontSize: 16,
    lineHeight: 21,
    color: Colors.primary4,
    alignContent: 'center',
  },
  containerEmpty: {
    alignSelf: 'flex-start',
    marginRight: 16,
    marginTop: 16,
  },
  logoutText: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '700',
    color: 'white',
  },
  editProfile: {
    alignSelf: 'flex-end',
  },
  editProfileText: {
    fontSize: 14,
    lineHeight: 19,
    color: Colors.primary8,
  },
  centeredView: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalView: {
    borderRadius: 4,
    marginHorizontal: 32,
    alignItems: 'flex-start',
    shadowColor: '#000',
    paddingBottom: 50,
    paddingTop: 16,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    width: Dimensions.get('window').width - 44,
    shadowOpacity: 0.25,
    shadowRadius: 4,
    backgroundColor: '#082139',
  },
  containerTextModal: {
    alignContent: 'center',
  },
  textInputStyle: {
    color: Colors.primary4,
    borderColor: '#455c8a',
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 2,
    fontSize: 16,
    paddingHorizontal: 12,
    paddingTop: 13,
    height: 96,
    backgroundColor: Colors.primary,
    textAlignVertical: 'top',
    marginBottom: 26,
    marginTop: 12,
  },
  textDescriptionStyle: {
    color: Colors.text,
    textAlignVertical: 'top',
  },
  nextButton: {
    height: 64,
    borderRadius: 4,
    backgroundColor: '#982538',
    width: Dimensions.get('window').width - 48,
  },
  modalButton: {
    height: 56,
    borderRadius: 4,
    backgroundColor: '#982538',
  },
  modalInput: {
    borderColor: '#455c8a',
    color: Colors.primary4,
    fontSize: 16,
    width: Dimensions.get('window').width - 80,
  },
  containerHeaderModal: {
    flexDirection: 'row',
    alignSelf: 'flex-end',
    marginBottom: 12,
  },
  imageModalHeader: {
    width: 24,
    resizeMode: 'contain',
    height: 24,
  },
  containerSectionModal: {
    alignSelf: 'center',
    width: Dimensions.get('window').width - 80,
    zIndex: 5,
    elevation: 5,
  },
  textLabelModal: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 16,
    color: Colors.text,
  },
  textDescriptionInfo: {
    fontSize: 18,
    fontWeight: '400',
    lineHeight: 27,
    color: Colors.text,
    marginTop: 16,
  },
});
export default SavedPost;
