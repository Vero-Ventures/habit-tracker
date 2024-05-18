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
      if (isInitialFetch) {
        setLoading(true);
        setPage(0);
      } else {
        setLoading(true);
      }

      // fetch posts for the currently logged-in user
      const { data: postData, error: postError } = await supabase
        .from('Post')
        .select('*')
        .eq('user_id', session?.user.id)
        .order('created_at', { ascending: false })
        .range(page * 10, (page + 1) * 10 - 1);

      if (postError) {
        throw postError;
      }

      console.log('Fetched post data:', postData);

      if (postData.length === 0) {
        setLoadMore(false);
        return;
      }

      const scheduleIds = postData.map(post => post.schedule_id);
      const { data: scheduleData, error: scheduleError } = await supabase
        .from('Schedule')
        .select('*')
        .in('schedule_id', scheduleIds);

      if (scheduleError) {
        throw scheduleError;
      }

      console.log('Fetched schedule data:', scheduleData);

      const habitIds = scheduleData.map(schedule => schedule.habit_id);
      const { data: habitData, error: habitError } = await supabase
        .from('Habit')
        .select('*')
        .in('habit_id', habitIds);

      if (habitError) {
        throw habitError;
      }

      console.log('Fetched habit data:', habitData);

      const combinedData = postData.map(post => {
        const schedule = scheduleData.find(
          s => s.schedule_id === post.schedule_id
        );
        const habit = habitData.find(h => h.habit_id === schedule.habit_id);

        return {
          ...post,
          schedule,
          habit,
        };
      });

      console.log('Combined data:', combinedData);

      if (isInitialFetch) {
        setTimelinePosts(combinedData);
      } else {
        setTimelinePosts(prevPosts => [...prevPosts, ...combinedData]);
      }

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

  const renderPost = ({ item }) => (
    <CardPost
      post={item}
      postUser={{
        id: session?.user.id,
        name: session?.user.email,
        imageUrl: session?.user.user_metadata?.avatar_url,
      }}
      createdAt={item.created_at}
      postText={item.habit.habit_title}
      postType="new_habit"
      actions={{
        likeFromUser: false,
        countLikes: 0,
        onLikePostSuccess: () => {},
        countComments: 0,
        saveFromUser: false,
        onSavePostSuccess: () => {},
        onDeletePostSuccess: () => {},
      }}
      navigation={navigation}
    />
  );

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
      <Header title="Timeline" />
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
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
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
