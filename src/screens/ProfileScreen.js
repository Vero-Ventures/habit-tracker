import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, View, Alert, ScrollView, Text } from 'react-native';
import { Button, Input } from 'react-native-elements';
import { supabase } from '../config/supabaseClient';
import store from '../store/storeConfig';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

export default function Account() {
  const session = store.getState().user.session;
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [profileImage, setProfileImage] = useState('');
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    if (session) getProfile();
  }, [session]);

  async function getProfile() {
    try {
      setLoading(true);
      // if (!session?.user) throw new Error('No user on the session!');
      if (!session?.user) throw new Error('No user on the session!');

      const { data, error, status } = await supabase
        .from('User')
        .select(`username, bio, profile_image`)
        .eq('user_id', session?.user.id)
        .single();
      if (error && status !== 406) {
        throw error;
      }

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
  }

  async function updateProfile() {
    try {
      setLoading(true);
      const updates = {
        user_id: session?.user.id,
        username: username,
        bio: bio,
        profile_image: profileImage,
      };

      const { error } = await supabase
        .from('User')
        .upsert(updates, { returning: 'minimal' });

      if (error) {
        throw error;
      }

      Alert.alert('Success', 'Profile updated successfully!');
    } catch (error) {
      Alert.alert('Update Error', error.message);
    } finally {
      setLoading(false);
    }
  }

  async function deleteUserAndData(userId) {
    supabase.auth.signOut();
    const { data, error } = await supabase.rpc('delete_user_data', {
      user_id: userId,
    });

    if (error) {
      console.error('Error deleting user:', error);
      return;
    }

    console.log('User and associated data deleted successfully:', data);
  }

  async function fetchUserData(userId) {
    try {
      const { data, error } = await supabase.rpc('get_user_data', {
        p_user_id: userId,
      });

      if (error) {
        console.error('Error fetching data:', error);
        Alert.alert('Error', 'Error fetching data: ' + error.message);
        return;
      }

      setUserData(JSON.stringify(data, null, 2));
      Alert.alert('User Data', JSON.stringify(data, null, 2));
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', 'Unexpected error: ' + error.message);
    }
  }

  // Inside your component
async function downloadUserData(userId) {
  try {
    const { data, error } = await supabase.rpc('get_user_data', {
      p_user_id: userId,
    });

    if (error) {
      console.error('Error fetching data:', error);
      Alert.alert('Error', 'Error fetching data: ' + error.message);
      return;
    }

    const jsonData = JSON.stringify(data, null, 2);
    const fileUri = FileSystem.documentDirectory + 'user_data.json';

    await FileSystem.writeAsStringAsync(fileUri, jsonData, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    Alert.alert('Success', 'User data saved as user_data.json');
    Sharing.shareAsync(fileUri);
  } catch (error) {
    console.error('Error:', error);
    Alert.alert('Error', 'Unexpected error: ' + error.message);
  }
}

  return (
    <View style={styles.container}>
      <ScrollView>
        <View style={[styles.verticallySpaced, styles.mt20]}>
          <Input
            label="Profile Image URL"
            value={profileImage || ''}
            onChangeText={setProfileImage}
            placeholder="Enter profile image URL"
          />
        </View>
        <View style={styles.verticallySpaced}>
          <Input
            label="Username"
            value={username || ''}
            onChangeText={setUsername}
            placeholder="Enter username"
          />
        </View>
        <View style={styles.verticallySpaced}>
          <Input
            label="Bio"
            value={bio || ''}
            onChangeText={setBio}
            placeholder="Enter bio"
          />
        </View>
        <View style={[styles.verticallySpaced, styles.mt20]}>
          <Button
            title={loading ? 'Loading ...' : 'Update'}
            onPress={updateProfile}
            disabled={loading}
          />
        </View>
        <View style={styles.verticallySpaced}>
          <Button title="Sign Out" onPress={() => supabase.auth.signOut()} />
        </View>
        <View style={styles.verticallySpaced}>
          <Button
            title="Delete Account"
            onPress={() => deleteUserAndData(session.user.id)}
          />
        </View>
        <View style={styles.verticallySpaced}>
          <Button
            title="Fetch User Data"
            onPress={() => downloadUserData(session.user.id)}
          />
        </View>
        {userData && (
          <View style={styles.userDataContainer}>
            <Text style={styles.userDataText}>{userData}</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 40,
    padding: 12,
  },
  userDataContainer: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
  },
  userDataText: {
    fontFamily: 'monospace',
  },
  verticallySpaced: {
    paddingTop: 4,
    paddingBottom: 4,
    alignSelf: 'stretch',
  },
  mt20: {
    marginTop: 20,
  },
});

Account.propTypes = {
  route: PropTypes.object,
};
