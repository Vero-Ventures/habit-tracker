import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, FlatList, TouchableOpacity, Image, ActivityIndicator, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { supabase } from '../config/supabaseClient';
import store from '../store/storeConfig';
import Colors from '../../assets/styles/Colors';
import Header from '../components/Header';

export default function FollowersScreen() {
  const route = useRoute();
  const { userId } = route.params;
  const session = store.getState().user.session;
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [followersList, setFollowersList] = useState([]);
  const [followingList, setFollowingList] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    if (userId) {
      fetchFollowers();
      fetchFollowing();
    }
  }, [userId]);

  const fetchFollowers = async () => {
    try {
      const { data, error } = await supabase
        .from('Following')
        .select('follower(username, user_id, profile_image)')
        .eq('following', userId); // Use userId prop instead of session user ID

      if (error) {
        throw error;
      }

      setFollowersList(data.map(item => item.follower));
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchFollowing = async () => {
    try {
      const { data, error } = await supabase
        .from('Following')
        .select('following')
        .eq('follower', userId); // Use userId prop instead of session user ID

      if (error) {
        throw error;
      }

      setFollowingList(data.map(item => item.following));
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const handleSearch = async () => {
    try {
      if (searchQuery.trim() === '') {
        setSearchResults([]);
        return;
      }

      const { data, error } = await supabase
        .from('User')
        .select('user_id, username, profile_image')
        .ilike('username', `%${searchQuery}%`);

      if (error) {
        throw error;
      }

      const updatedResults = data.map(user => ({
        ...user,
        isFollower: followersList.some(follower => follower.user_id === user.user_id),
        isFollowingBack: followingList.includes(user.user_id),
      }));

      setSearchResults(updatedResults);
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const followUser = async (userId) => {
    try {
      if (!session?.user) throw new Error('No user on the session!');

      const { error } = await supabase
        .from('Following')
        .insert({ follower: session.user.id, following: userId });

      if (error) {
        throw error;
      }

      Alert.alert('Success', 'You are now following this user');
      fetchFollowers();
      fetchFollowing();
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const unfollowUser = async (userId) => {
    try {
      if (!session?.user) throw new Error('No user on the session!');

      const { error } = await supabase
        .from('Following')
        .delete()
        .eq('follower', session.user.id)
        .eq('following', userId);

      if (error) {
        throw error;
      }

      Alert.alert('Success', 'You have unfollowed this user');
      fetchFollowers();
      fetchFollowing();
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const renderSearchResultItem = ({ item }) => (
    <View style={styles.resultItem}>
      <Image source={{ uri: item.profile_image }} style={styles.profileImage} />
      <Text style={styles.username}>{item.username}</Text>
      {item.isFollowingBack ? (
        <TouchableOpacity onPress={() => unfollowUser(item.user_id)}>
          <Text style={styles.unfollowButton}>Unfollow</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity onPress={() => followUser(item.user_id)}>
          <Text style={styles.followButton}>Follow</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderFollowerItem = ({ item }) => (
    <TouchableOpacity
      style={styles.resultItem}
      onPress={() => navigation.navigate('UserProfile', { userId: item.user_id })}
    >
      <Image source={{ uri: item.profile_image }} style={styles.profileImage} />
      <Text style={styles.username}>{item.username}</Text>
      {followingList.includes(item.user_id) ? (
        <TouchableOpacity onPress={() => unfollowUser(item.user_id)}>
          <Text style={styles.unfollowButton}>Unfollow</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity onPress={() => followUser(item.user_id)}>
          <Text style={styles.followButton}>Follow</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Header
        title="Followers"
        navigation={navigation}
        backButton
      />
      <TextInput
        style={styles.searchBar}
        placeholder="Search by username"
        value={searchQuery}
        onChangeText={(text) => {
          setSearchQuery(text);
          handleSearch();
        }}
        onSubmitEditing={handleSearch}
      />
      {loading ? (
        <ActivityIndicator size="large" color={Colors.primary8} />
      ) : (
        searchQuery.trim() === '' ? (
          <FlatList
            data={followersList}
            keyExtractor={(item) => String(item.user_id)}
            renderItem={renderFollowerItem}
            style={styles.followersList}
          />
        ) : (
          <>
            <Text style={styles.sectionTitle}>Search Results</Text>
            <FlatList
              data={searchResults}
              keyExtractor={(item) => String(item.user_id)}
              renderItem={renderSearchResultItem}
            />
          </>
        )
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: Colors.background,
  },
  searchBar: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 10,
    backgroundColor: 'white',
    borderRadius: 45,
  },
  followersList: {
    marginBottom: 20,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'gray',
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  username: {
    fontSize: 16,
    color: Colors.text,
    flex: 1,
  },
  followButton: {
    color: Colors.primary8,
    fontWeight: 'bold',
  },
  unfollowButton: {
    color: 'white',
    fontWeight: 'bold',
  },
  alreadyFollowing: {
    color: 'gray',
    fontStyle: 'italic',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    color: Colors.primary8,
  },
});
