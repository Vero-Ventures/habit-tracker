import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, FlatList, TouchableOpacity, Image, Alert } from 'react-native';
import { supabase } from '../config/supabaseClient';
import store from '../store/storeConfig';
import Colors from '../../assets/styles/Colors';

export default function FollowScreen() {
  const session = store.getState().user.session;
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [followingList, setFollowingList] = useState([]);

  useEffect(() => {
    if (session) {
      fetchFollowingList();
    }
  }, [session]);

  const fetchFollowingList = async () => {
    try {
      const { data, error } = await supabase
        .from('Following')
        .select('following(username, user_id, profile_image)')
        .eq('follower', session?.user.id);

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

      // combined search results with follow status
      const updatedResults = data.map(user => ({
        ...user,
        isFollowing: followingList.some(following => following.user_id === user.user_id),
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
      fetchFollowingList(); 
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const renderSearchResultItem = ({ item }) => {
    return (
      <View style={styles.resultItem}>
        <Image source={{ uri: item.profile_image }} style={styles.profileImage} />
        <Text style={styles.username}>{item.username}</Text>
        {item.isFollowing ? (
          <Text style={styles.alreadyFollowing}>You already follow this user</Text>
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
      <Text style={styles.sectionTitle}>Users You Are Following</Text>
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
      {searchQuery.trim() === '' ? (
        <>
          <FlatList
            data={followingList}
            keyExtractor={(item) => String(item.user_id)} 
            renderItem={({ item }) => (
              <View style={styles.resultItem}>
                <Image source={{ uri: item.profile_image }} style={styles.profileImage} />
                <Text style={styles.username}>{item.username}</Text>
              </View>
            )}
            style={styles.followingList}
          />
        </>
      ) : (
        <>
          <Text style={styles.sectionTitle}>Search Results</Text>
          <FlatList
            data={searchResults}
            keyExtractor={(item) => String(item.user_id)} 
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
    padding: 20,
    backgroundColor: Colors.background,
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
  followingList: {
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




// import React, { useState } from 'react';
// import { StyleSheet, View, Text, TextInput, FlatList, TouchableOpacity, Alert } from 'react-native';
// import { supabase } from '../config/supabaseClient';
// import store from '../store/storeConfig';
// import Colors from '../../assets/styles/Colors';

// export default function FollowScreen() {
//   const session = store.getState().user.session;
//   const [searchQuery, setSearchQuery] = useState('');
//   const [searchResults, setSearchResults] = useState([]);

//   const handleSearch = async () => {
//     console.log('handle search called');
//     try {
//       const { data, error } = await supabase
//         .from('User')
//         .select('user_id, username')
//         .ilike('username', `%${searchQuery}%`);

//       if (error) {
//         throw error;
//       }

//       setSearchResults(data);
//     } catch (error) {
//       Alert.alert('Error', error.message);
//     }
//   };

//   const followUser = async (userId) => {
//     console.log('user', userId);
//     try {
//       if (!session?.user) throw new Error('No user on the session!');

//       const { error } = await supabase
//         .from('Following')
//         .insert({ follower: session.user.id, following: userId });

//       if (error) {
//         throw error;
//       }

//       Alert.alert('Success', 'You are now following this user');
//     } catch (error) {
//       Alert.alert('Error', error.message);
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <TextInput
//         style={styles.searchBar}
//         placeholder="Search by username"
//         value={searchQuery}
//         onChangeText={setSearchQuery}
//         onSubmitEditing={handleSearch}
//       />
//       <FlatList
//         data={searchResults}
//         keyExtractor={(item) => String(item.user_id)} 
//         renderItem={({ item }) => (
//           <View style={styles.resultItem}>
//             <Text>{item.username}</Text>
//             <TouchableOpacity onPress={() => followUser(item.user_id)}>
//               <Text style={styles.followButton}>Follow</Text>
//             </TouchableOpacity>
//           </View>
//         )}
//       />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 20,
//     backgroundColor: Colors.background,
//   },
//   searchBar: {
//     height: 40,
//     borderColor: 'gray',
//     borderWidth: 1,
//     marginBottom: 20,
//     paddingHorizontal: 10,
//     borderRadius: 5,
//   },
//   resultItem: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     padding: 10,
//     borderBottomWidth: 1,
//     borderBottomColor: 'gray',
//   },
//   followButton: {
//     color: Colors.primary8,
//   },
// });
