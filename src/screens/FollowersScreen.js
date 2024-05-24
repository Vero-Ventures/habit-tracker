import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { supabase } from '../config/supabaseClient';
import store from '../store/storeConfig';
import Colors from '../../assets/styles/Colors';

export default function FollowersScreen() {
  const session = store.getState().user.session;
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [followersList, setFollowersList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session) {
      fetchFollowers();
    }
  }, [session]);

  const fetchFollowers = async () => {
    try {
      const { data, error } = await supabase
        .from('Following')
        .select('follower(username, user_id, profile_image)')
        .eq('following', session?.user.id);

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

      // Combine search results with follow status
      const updatedResults = data.map(user => ({
        ...user,
        isFollower: followersList.some(
          follower => follower.user_id === user.user_id
        ),
      }));

      setSearchResults(updatedResults);
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const followUser = async userId => {
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
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const renderSearchResultItem = ({ item }) => {
    return (
      <View style={styles.resultItem}>
        <Image
          source={{ uri: item.profile_image }}
          style={styles.profileImage}
        />
        <Text style={styles.username}>{item.username}</Text>
        {item.isFollower ? (
          <Text style={styles.alreadyFollowing}>This user follows you</Text>
        ) : (
          <TouchableOpacity onPress={() => followUser(item.user_id)}>
            <Text style={styles.followButton}>Follow</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Users Who Follow You</Text>
      <TextInput
        style={styles.searchBar}
        placeholder="Search by username"
        value={searchQuery}
        onChangeText={text => {
          setSearchQuery(text);
          handleSearch();
        }}
        onSubmitEditing={handleSearch}
      />
      {loading ? (
        <ActivityIndicator size="large" color={Colors.primary8} />
      ) : searchQuery.trim() === '' ? (
        <FlatList
          data={followersList}
          keyExtractor={item => String(item.user_id)}
          renderItem={({ item }) => (
            <View style={styles.resultItem}>
              <Image
                source={{ uri: item.profile_image }}
                style={styles.profileImage}
              />
              <Text style={styles.username}>{item.username}</Text>
            </View>
          )}
          style={styles.followersList}
        />
      ) : (
        <>
          <Text style={styles.sectionTitle}>Search Results</Text>
          <FlatList
            data={searchResults}
            keyExtractor={item => String(item.user_id)}
            renderItem={renderSearchResultItem}
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: 20,
  },
  searchBar: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 10,
    borderRadius: 5,
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
