import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { View, Text, TextInput, Button } from 'react-native';
import { supabase } from '../config/supabaseClient';

function ProfileScreen({ route }) {
  const { session, setHasProfile } = route.params;
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [profileImage, setProfileImage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkUserProfile();
  }, [session]);

  const checkUserProfile = async () => {
    const { data, error } = await supabase
      .from('User')
      .select('*')
      .eq('user_id', session.user.id)
      .single();

    if (data) {
      setUsername(data.username);
      setBio(data.bio);
      setProfileImage(data.profile_image);
    } else if (error) {
      // Prompt user to fill the profile details
    }
  };

  const updateUserProfile = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('User').insert([
      {
        user_id: session.user.id,
        username: username,
        bio: bio,
        profile_image: profileImage,
      },
    ]);
    setLoading(false);
    if (error) {
      alert('Error updating profile: ' + error.message);
    } else if (data) {
      setHasProfile(true);
      alert('Profile updated successfully!');
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text>Username:</Text>
      <TextInput value={username} onChangeText={setUsername} />
      <Text>Bio:</Text>
      <TextInput value={bio} onChangeText={setBio} />
      <Text>Profile Image URL:</Text>
      <TextInput value={profileImage} onChangeText={setProfileImage} />
      <Button
        onPress={updateUserProfile}
        title="Update Profile"
        disabled={loading}
      />
    </View>
  );
}

export default ProfileScreen;

ProfileScreen.propTypes = {
  route: PropTypes.object,
};
