import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Text,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../../config/supabaseClient';
import Colors from '../../../assets/styles/Colors';
import Header from '../../components/Header';
import CardPost from '../../components/CardPost';
import store from '../../store/storeConfig';
import { Button } from 'react-native-paper';

const Timeline = () => {
  const navigation = useNavigation();
  const session = store.getState().user.session;
  const [timelinePosts, setTimelinePosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(0);
  const [loadMore, setLoadMore] = useState(true);

  useEffect(() => {
    fetchPosts(true);
  }, []);

  const fetchPosts = async (isInitialFetch = false) => {
    try {
      setLoading(true);
  
      const { data: followingData, error: followingError } = await supabase
        .from('Following')
        .select('following')
        .eq('follower', session?.user.id);
  
      if (followingError) throw followingError;
  
      const followedUserIds = followingData.map(following => following.following);
      const userIds = [...followedUserIds, session?.user.id]; // includes the user's own ID so u can now see ur own posts
  
      const { data: postData, error: postError } = await supabase
        .from('Post')
        .select('*')
        .in('user_id', userIds) // queried the posts by followed users and the user themselves
        .order('created_at', { ascending: false });
  
      if (postError) throw postError;
  
      if (postData.length === 0) {
        setLoadMore(false);
        return;
      }
  
      const userIdsInPosts = postData.map(post => post.user_id);
      const { data: userData, error: userError } = await supabase
        .from('User')
        .select('user_id, username, profile_image')
        .in('user_id', userIdsInPosts);
  
      if (userError) throw userError;
  
      const postIds = postData.map(post => post.post_id);
      const { data: likeData, error: likeError } = await supabase
        .from('Like')
        .select('post_id, user_id')
        .in('post_id', postIds);
  
      if (likeError) throw likeError;
  
      const { data: imagePostData, error: imagePostError } = await supabase
        .from('Image')
        .select('*')
        .in('post_id', postIds);
  
      if (imagePostError) throw imagePostError;
  
      const likesMap = postIds.reduce((acc, postId) => {
        acc[postId] = likeData.filter(like => like.post_id === postId);
        return acc;
      }, {});
  
      const combinedData = postData.map(post => {
        const user = userData.find(u => u.user_id === post.user_id);
        const likes = likesMap[post.post_id] || [];
        const image = imagePostData.find(i => i.post_id === post.post_id);
  
        return {
          ...post,
          username: user ? user.username : 'Unknown User',
          profile_image: user ? user.profile_image : null,
          likeFromUser: likes.some(like => like.user_id === session.user.id),
          countLikes: likes.length,
          habit_photo: image ? image.image_photo : null,
        };
      });
  
      setTimelinePosts(combinedData);
      setPage(prevPage => prevPage + 1);
      setLoadMore(combinedData.length === 10);
    } catch (error) {
      Alert.alert('Error fetching posts', error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  
  const onRefresh = () => {
    setRefreshing(true);
    fetchPosts(true);
  };

  const renderPost = ({ item }) => {
    return (
      <CardPost
        postId={item.post_id}
        post={item}
        postUser={{
          id: item.user_id,
          name: item.username,
          imageUrl: item.profile_image,
        }}
        createdAt={item.created_at}
        // postTitle={item.post_title}
        postDescription={item.post_description}
        postType="new_habit"
        actions={{
          likeFromUser: false,
          countLikes: 0,
          onLikePostSuccess: () => {},
          countComments: 0,
          onDeletePostSuccess: () => {},
        }}
        navigation={navigation}
      />
    );
  };
  
  const renderFooter = () => {
    if (!loading) return null;
    return <ActivityIndicator size="large" color={Colors.primary} />;
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>No posts to show</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Header title="Timeline" />
      </View>
      <Button
        mode="contained"
        onPress={() => navigation.navigate('AddPost')}
        style={styles.addPostButton}
      >
        Add Post
      </Button>
      <FlatList
        data={timelinePosts}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderPost}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.primary]}
          />
        }
        ListFooterComponent={renderFooter}
        onEndReached={() => {
          if (loadMore && !loading) {
            fetchPosts();
          }
        }}
        onEndReachedThreshold={0.5}
      />
    </View>
  );
}  

const styles = StyleSheet.create({
  addPostButton: {
    alignSelf: 'center',
    width: 150,
    backgroundColor: 'rgba(105, 105, 120, 0.4)',
    paddingVertical: 5,
    borderRadius: 45,
    marginBottom: 30,
    marginTop: 10,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  headerContainer: {
    marginBottom: 20,
  },
  list: {
    padding: 10,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: Colors.text,
  },
});


export default Timeline;
