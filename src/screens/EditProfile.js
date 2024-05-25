import React, { useState, useEffect } from 'react';
import { Alert, View, StyleSheet, Dimensions } from 'react-native';
import { Button, Input } from 'react-native-elements';
import { supabase } from '../config/supabaseClient';
import Header from '../components/Header';
import store from '../store/storeConfig';
import Default from '../../assets/styles/Default';
import Colors from '../../assets/styles/Colors';

export default function EditProfile({ navigation }) {
  const session = store.getState().user.session;
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [profileImage, setProfileImage] = useState(null);

  useEffect(() => {
    if (session) {
      getProfile();
    }
  }, [session]);

  async function getProfile() {
    try {
      setLoading(true);
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
      if (!session?.user) throw new Error('No user on the session!');

      const updates = {
        user_id: session?.user.id,
        username,
        bio,
        profile_image: profileImage
      };

      let { error } = await supabase.from('User').upsert(updates);
      if (error) throw error;
      Alert.alert('Profile updated successfully!');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error updating profile', error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={Default.container}>
        <Header
        title="Edit Profile"
        navigation={navigation}
        backButton
      />
      <View style={styles.inputWrapper}>
        <Input
          label="Username"
          value={username || ''}
          placeholder="Enter username"
          onChangeText={(text) => setUsername(text)}
          containerStyle={styles.inputContainer}
          inputStyle={styles.input}
          labelStyle={styles.inputLabel}
        />
      </View>
      <View style={styles.inputWrapper}>
        <Input
          label="Bio"
          value={bio || ''}
          placeholder="Enter bio"
          onChangeText={(text) => setBio(text)}
          containerStyle={styles.inputContainer}
          inputStyle={styles.input}
          labelStyle={styles.inputLabel}
        />
      </View>
      <Button
        title={loading ? 'Loading ...' : 'Update'}
        onPress={updateProfile}
        disabled={loading}
        buttonStyle={styles.updateButton}
        titleStyle={styles.updateButtonText}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  inputWrapper: {
    width: '100%',
    paddingHorizontal: 15,
    marginVertical: 10,
  },
  inputContainer: {
    marginVertical: 10,
  },
  input: {
    color: Colors.text,
  },
  inputLabel: {
    color: Colors.text,
  },
  updateButton: {
    backgroundColor: Colors.primary,
    borderRadius: 5,
    paddingVertical: 10,
    marginHorizontal: 15,
  },
  updateButtonText: {
    fontSize: 16,
  },
});
