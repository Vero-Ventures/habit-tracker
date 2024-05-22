import React from 'react';
import { StyleSheet, View, Button } from 'react-native';
import { supabase } from '../config/supabaseClient';
import store from '../store/storeConfig';
import Colors from '../../assets/styles/Colors';

export default function SettingsScreen({setIsLoggedIn}) {
  const session = store.getState().user.session;

  async function deleteUserAndData() {
    try {
      if (!session?.user) throw new Error('No user on the session!');

      const { error } = await supabase.rpc('delete_user_data', {
        user_id: session.user.id,
      });

      if (error) {
        console.error('Error deleting user:', error);
        return;
      }

      console.log('User and associated data deleted successfully');
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Error deleting user:', error);
      Alert.alert('Error', error.message);
    }
  }

  async function downloadUserData() {
    try {
      if (!session?.user) throw new Error('No user on the session!');

      const { data, error } = await supabase.rpc('get_user_data', {
        p_user_id: session.user.id,
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
      <Button
        title="Sign Out"
        onPress={() => {
          supabase.auth.signOut();
          setIsLoggedIn(false);}}
        color={Colors.primary8}
      />

      <Button
        title="Download User Data"
        onPress={downloadUserData}
        color={Colors.success}
      />

        <Button
        title="Delete Account"
        onPress={deleteUserAndData}
        color={Colors.error}
      />
      
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: Colors.background,
  },
});
