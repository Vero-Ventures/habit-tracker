import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ScrollView,
  FlatList,
  Dimensions,
} from 'react-native';
import PropTypes from 'prop-types';
import { supabase } from '../../config/supabaseClient';
import Header from '../../components/Header';
import store from '../../store/storeConfig';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import Colors from '../../../assets/styles/Colors';
import { Input, Button } from 'react-native-elements';
import ActionSheet from 'react-native-actionsheet';
import { decode } from 'base64-arraybuffer';
import moment from 'moment';
import Icon from 'react-native-vector-icons/FontAwesome5';
import Fetching from '../../components/Fetching';

export default function AddPost({ navigation }) {
  const [postText, setPostText] = useState('');
  const [image, setImage] = useState(null);
  const [schedules, setSchedules] = useState([]);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const ASPhotoOptions = useRef();
  const session = store.getState().user.session;

  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        setLoading(true);
        if (session?.user) {
          const { data: scheduleData, error: scheduleError } = await supabase
            .from('Schedule')
            .select('*, habit_id(habit_title)')
            .eq('user_id', session.user.id);

          if (scheduleError) {
            throw scheduleError;
          }

          if (scheduleData) {
            setSchedules(scheduleData);
            if (scheduleData.length > 0) {
              setSelectedSchedule(scheduleData[0].schedule_id);
            }
          }
        }
      } catch (error) {
        console.log('error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSchedules();
  }, []);

  const addPost = async () => {
    try {
      const { data: postInsertData, error: postInsertError } = await supabase
        .from('Post')
        .insert([{ user_id: session.user.id, schedule_id: selectedSchedule, post_description: postText }])
        .select();
  
      if (postInsertError) {
        console.log('error in post:', postInsertError);
        return;
      }
  
      setPostText('');
  
      let imageUrl = null;
      if (image) {
        setUploading(true);
        const file = image;
        const fileExt = file.uri.split('/').pop();
        const fileName = `${Date.now()}_${fileExt}`;
        const filePath = `posts/${fileName}`;
  
        const response = await fetch(file.uri);
        const blob = await response.blob();
  
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64data = reader.result.split(',')[1];
          const arrayBuffer = decode(base64data);
  
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('habit')
            .upload(fileName, arrayBuffer, {
              cacheControl: '3600',
              upsert: false,
              contentType: 'image/jpeg'
            });
  
          if (uploadError) {
            throw uploadError;
          }
  
          const publicUrlResponse = supabase.storage.from('habit').getPublicUrl(fileName);
          const imageUrl = publicUrlResponse.data.publicUrl;
  
          const { data: postImageInsertData, error: postImageInsertError } = await supabase
          .from('Image')
          .insert([{ 
            post_id: postInsertData[0].post_id, 
            image_photo: imageUrl 
          }])
          .select();

        if (postImageInsertError) {
          console.log('error in post image:', postImageInsertError);
        }

        setImage(null);
        setUploading(false);
      };
      reader.readAsDataURL(blob);
    }
  
      Alert.alert('Success', 'Your post was successfully posted to the timeline!', [
        { text: 'OK', onPress: () => navigation.navigate('TimelineScreen') },
      ]);
    } catch (error) {
      console.log('error:', error);
    }
  };
  

  const handleActionSheet = async (index) => {
    if (index === 0) {
      let { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status === 'granted') {
        pickCamera();
      } else {
        Alert.alert('Oops', 'You need to allow access to the camera first.');
      }
    } else if (index === 1) {
      let { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status === 'granted') {
        pickGallery();
      } else {
        Alert.alert('Oops', 'You need to allow access to the library first.');
      }
    }
  };

  const pickCamera = async () => {
    let result = await ImagePicker.launchCameraAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images });
    if (!result.cancelled) {
      setImage(result.assets[0]);
    }
  };

  const pickGallery = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images });
    if (!result.cancelled) {
      setImage(result.assets[0]);
    }
  };

  const addHabit = () => {
    navigation.navigate('AddHabit');
  };

  const renderAddPost = () => {
    if (loading) {
      return <Fetching isFetching={loading} />;
    }

    if (schedules.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No habits found. Add your first habit to get started!</Text>
          <Button
            buttonStyle={styles.addHabitButton}
            titleStyle={styles.addHabitButtonText}
            onPress={addHabit}
            title="ADD YOUR FIRST HABIT"
          />
        </View>
      );
    }

    return (
      <ScrollView style={styles.addPostContainer}>
        <Input
          multiline
          style={styles.input}
          placeholder="Write what's on your mind!"
          value={postText}
          onChangeText={setPostText}
        />
        <View>
          <Text style={styles.label}>Select a Habit:</Text>
          <Picker
            selectedValue={selectedSchedule}
            onValueChange={(itemValue, itemIndex) => setSelectedSchedule(itemValue)}
            style={{ color: Colors.text }}
          >
            {schedules.map(schedule => (
              <Picker.Item key={schedule.schedule_id} label={schedule.habit_id.habit_title} value={schedule.schedule_id} color={Colors.text} />
            ))}
          </Picker>
        </View>
        {image && <Image source={{ uri: image.uri }} style={styles.image} />}

        <TouchableOpacity onPress={() => ASPhotoOptions.current.show()} style={styles.pickImageButton}>
          <Text style={styles.pickImageButtonText}>Pick an image</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.postButton} onPress={addPost}>
          <Text style={styles.postButtonText}>Post</Text>
        </TouchableOpacity>

        <ActionSheet
          ref={ASPhotoOptions}
          options={['Camera', 'Library', 'Cancel']}
          cancelButtonIndex={2}
          destructiveButtonIndex={2}
          onPress={index => handleActionSheet(index)}
        />
      </ScrollView>
    );
  };

  return (
    <View style={styles.container}>
      <Header navigation={navigation} backButton title="Add Post" />
      {renderAddPost()}
    </View>
  );
}

AddPost.proptypes = {
  navigation: PropTypes.object,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  addPostContainer: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  input: {
    height: 100,
    fontSize: 16,
    marginBottom: 10,
    backgroundColor: 'rgba(156, 198, 255, 0.025)',
    borderRadius: 8,
    color: Colors.text,
  },
  pickImageButton: {
    backgroundColor: '#5c6bc0',
    padding: 12,
    borderRadius: 30,
    alignItems: 'center',
    marginVertical: 4,
  },
  pickImageButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    overflow: 'hidden',
  },
  postButton: {
    backgroundColor: '#5c6bc0',
    padding: 12,
    borderRadius: 30,
    alignItems: 'center',
    marginVertical: 4,
  },
  postButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 200,
    marginBottom: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 10,
    color: Colors.text,
  },
  text: {
    color: Colors.text,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    color: Colors.text,
    marginBottom: 20,
    textAlign: 'center',
  },
  addHabitButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 30,
  },
  addHabitButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
});
