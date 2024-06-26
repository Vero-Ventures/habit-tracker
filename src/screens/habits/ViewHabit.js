import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Dimensions,
  FlatList,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
  TextInput,
  Modal,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Default from '../../../assets/styles/Default';
import Colors from '../../../assets/styles/Colors';
import Header from '../../components/Header';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { Button } from 'react-native-elements';
import { supabase } from '../../config/supabaseClient';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { KeyboardAwareFlatList } from 'react-native-keyboard-aware-scroll-view';
import RBSheet from 'react-native-raw-bottom-sheet';
import moment from 'moment';
import store from '../../store/storeConfig';
import StepIndicator from 'react-native-step-indicator';
import * as ImagePicker from 'expo-image-picker';
import { v4 as uuidv4 } from 'uuid';
import { decode } from 'base64-arraybuffer';
import ActionSheet from 'react-native-actionsheet';
import { updateHabitDataInSchedules } from './Habits';
import DateTimePickerModal from "react-native-modal-datetime-picker";

const { GoogleGenerativeAI } = require('@google/generative-ai');
const apikey = process.env.EXPO_PUBLIC_REACT_APP_GEMINI_KEY;
const genAI = new GoogleGenerativeAI(apikey);
const { width } = Dimensions.get('window');
const imageSize = width / 3;

const ViewHabit = () => {
  const session = store.getState().user.session;
  const [isLoading, setIsLoading] = useState(false);
  const [habitPhoto, setHabitPhoto] = useState(null);
  const [generatedSchedule, setGeneratedSchedule] = useState(null);
  const [currentPosition, setCurrentPosition] = useState(0);
  const [habitImages, setHabitImages] = useState([]);
  const [newPhoto, setNewPhoto] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const RBSDelete = useRef();
  const ASPhotoOptions = useRef();
  const navigation = useNavigation();
  const route = useRoute();
  const { habit } = route.params;
  const [editable, setEditable] = useState(false);
  const [newTitle, setNewTitle] = useState(habit.habit_title);
  const [newEndDate, setNewEndDate] = useState(new Date());
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [newDescription, setNewDescription] = useState(habit.habit_description);
  const [loadingDisable, setLoadingDisable] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [editedHabit, setEditedHabit] = useState(habit);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [activeDays, setActiveDays] = useState(habit.schedule_active_days);
  const [textPosts, setTextPosts] = useState([]);


  useEffect(() => {
    const updatedEndDate = new Date(habit.schedule_end_date);
    if (habit?.schedule_end_date) {
      setNewEndDate(updatedEndDate);
    }
  }, [editedHabit]);

  const unpackActiveDays = (packedNumber) => {
    const days = new Array(7).fill(false);
    for (let i = 0; i < 7; i++) {
      days[i] = (packedNumber & (1 << i)) !== 0;
    }
    return days;
  };

  const packActiveDays = (days) => {
    return days.reduce((packedNumber, isActive, index) => {
      return packedNumber | (isActive ? (1 << index) : 0);
    }, 0);
  };


  const toggleDay = (index) => {
    setActiveDays((prevActiveDays) => {
      return prevActiveDays ^ (1 << index);
    });
  };

  const isDayActive = (index) => {
    return (activeDays & (1 << index)) !== 0;
  };

  const updateHabit = (key, value) => {
    setEditedHabit((prevHabit) => ({
      ...prevHabit,
      [key]: value,
    }));
  };

  useEffect(() => {
    const fetchHabit = async () => {
      // console.log("Fetching habit");
      const { data: habitData, error: habitError } = await supabase
        .from('Habit')
        .select('*')
        .eq('habit_id', habit.habit_id)
        .single();

      if (habitError) {
        Alert.alert('Error fetching habit', habitError.message);
        return;
      }

      // console.log("This is the habit data: " + JSON.stringify(habitData));
      // console.log("This is the route: " + JSON.stringify(route));

      // console.log("Setting habit photo");
      setHabitPhoto(habitData?.habit_photo);
      // console.log("Done setting habit photo");
      if (habitData?.habit_plan) {
        // TODO: verify that generated plan is valid JSON

        // console.log("Setting generated schedule");
        setGeneratedSchedule(JSON.parse(habitData.habit_plan));
        // console.log("Done setting generated schedule")
      }

      console.log("Fetching habit images");
      const { data: imagesData, error: imagesError } = await supabase
        .from('HabitImages')
        .select('*')
        .eq('habit_id', habit.habit_id);

      if (imagesError) {
        Alert.alert('Error fetching images', imagesError.message);
        return;
      }

      // console.log("This is the images data: " + JSON.stringify(imagesData));



      const { data: schedulesData, error: schedulesError } = await supabase
        .from('Schedule')
        .select('schedule_id')
        .eq('habit_id', habit.habit_id);

      if (schedulesError) {
        throw schedulesError;
      }

      const scheduleIds = schedulesData.map(schedule => schedule.schedule_id);

      const { data: postsData, error: postsError } = await supabase
        .from('Post')
        .select('post_id, post_description')
        .in('schedule_id', scheduleIds);

      if (postsError) {
        throw postsError;
      }

      const postIds = postsData.map(post => post.post_id);

      const { data: postImagesData, error: postImagesError } = await supabase
        .from('Image')
        .select('image_photo, post_id')
        .in('post_id', postIds);

      if (postImagesError) {
        throw postImagesError;
      }








      const combinedImages = [
        ...(habitData?.habit_photo ? [{ image_photo: habitData.habit_photo, id: 'habitPhoto' }] : []),
        ...imagesData,
        ...postImagesData.map(image => ({
          ...image,
          post_description: postsData.find(post => post.post_id === image.post_id)?.post_description
        }))
      ].filter(image => image.image_photo !== null);

      const textOnlyPosts = postsData.filter(post => !postImagesData.some(image => image.post_id === post.post_id));


      // console.log("Setting habit images with: " + JSON.stringify(combinedImages));
      setHabitImages(combinedImages);
      setTextPosts(textOnlyPosts);

      // console.log("Done setting habit images");
    };

    fetchHabit();
  }, [habit.habit_id]);

  const updateHabitPlan = async (habitPlan) => {
    try {
      const { data, error } = await supabase
        .from('Habit')
        .update({ habit_plan: habitPlan })
        .eq('habit_id', habit.habit_id)
        .single();

      return data;
    } catch (error) {
      console.error('Error updating habit plan in Supabase:', error);
      throw error;
    }
  };

  const onDeleteHabit = () => {
    RBSDelete.current.open();
  };

  const deletePhoto = async (image) => {
    try {
      console.log("Image object:", image);
  
      if (!image || !image.image_photo) {
        throw new Error("Image or image photo is undefined.");
      }
  
      // determine the source table and ID
      let sourceTable = null;
      let sourceId = null;
      let sourceField = null;
  
      if (image.habit_image_id) {
        sourceTable = 'HabitImages';
        sourceId = image.habit_image_id;
        sourceField = 'habit_image_id';
      } else if (image.post_id) {
        sourceTable = 'Post';
        sourceId = image.post_id; // using post_id for deletion from Post table
        sourceField = 'post_id';
      } else if (image.id === 'habitPhoto') {
        sourceTable = 'Habit';
        sourceId = habit.habit_id;
        sourceField = 'habit_id';
      }
  
      if (!sourceTable || !sourceId) {
        throw new Error("Image source or ID is undefined.");
      }
  
      // if the image belongs to a post, delete the corresponding entry from the Post and Image tables
      if (sourceTable === 'Post') {
        const { error: deletePostError } = await supabase
          .from('Post')
          .delete()
          .eq('post_id', sourceId);
  
        if (deletePostError) {
          throw deletePostError;
        }
  
        const { error: deleteImageError } = await supabase
          .from('Image')
          .delete()
          .eq('post_id', sourceId);
  
        if (deleteImageError) {
          throw deleteImageError;
        }
      } else if (sourceTable === 'HabitImages') {
        // if the image belongs to the HabitImages table, delete the entry
        const { error: deleteError } = await supabase
          .from(sourceTable)
          .delete()
          .eq(sourceField, sourceId);
  
        if (deleteError) {
          throw deleteError;
        }
      } else if (sourceTable === 'Habit') {
        // for the Habit table just update the habit_photo to null
        const { error: updateError } = await supabase
          .from('Habit')
          .update({ habit_photo: null })
          .eq('habit_id', sourceId);
  
        if (updateError) {
          throw updateError;
        }
      }
  
      // remove the image from storage
      const imageName = image.image_photo.split('/').pop();
      const { error: bucketError } = await supabase.storage
        .from('habit')
        .remove([imageName]);
  
      if (bucketError) {
        throw bucketError;
      }
  
      // update the state to remove the deleted image
      setHabitImages(habitImages.filter(img => img.image_photo !== image.image_photo));
      Alert.alert('Success', 'Photo has been successfully deleted');
      closeModal();
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };
  



  const confirmDeleteHabit = () => {
    Alert.alert(
      "Delete Habit",
      "Are you sure you want to delete this habit?",
      [
        {
          text: "Cancel",
          onPress: () => setDeleteModalVisible(false),
          style: "cancel"
        },
        {
          text: "Delete",
          onPress: () => deleteHabit(),
          style: "destructive"
        }
      ],
      { cancelable: false }
    );
  };



  const onToggleHabit = async () => {
    setLoadingDisable(true);

    const updatedData = {
      ...habit,
      enabled: !habit.enabled,
    };

    const { error } = await supabase
      .from('Habit')
      .update(updatedData)
      .eq('habit_id', habit.habit_id)
      .select();

    if (error) {
      Alert.alert('Error updating habit', error.message);
      setLoadingDisable(false);
      return;
    }

    habit.enabled = !habit.enabled;
    setLoadingDisable(false);
  };

  const deleteHabit = async () => {
    setLoadingDelete(true);

    const { error } = await supabase
      .from('Habit')
      .delete()
      .eq('habit_id', habit.habit_id);

    if (error) {
      Alert.alert('Error deleting habit', error.message);
      setLoadingDelete(false);
      return;
    }

    RBSDelete.current.close();
    navigation.pop();
  };

  const generateHabitSchedule = async () => {
    const MAX_RETRIES = 10;
    let attempt = 0;
    let success = false;

    try {
      setIsLoading(true);
      const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

      const chat = model.startChat({
        history: [
          {
            role: 'user',
            parts: [
              {
                text: `Hello, I would like you to generate a habit plan in strictly correct JSON format for me to follow that will help me reach my goals for my habit called ${habit.habit_title} with this description: \"${habit.habit_description}\". The JSON should contain exactly 3 stages.`,
              },
            ],
          },
          {
            role: 'model',
            parts: [
              {
                text: 'Great to meet you. I would love to design a plan for you to follow. Can you give an example of the JSON format you would like it in?',
              },
            ],
          },
        ],
        generationConfig: {
          maxOutputTokens: 6000,
        },
      });
      
      const prompt = `{"stages": [
        {
            "name": "<stage 1 name>",
            "duration_weeks": "<stage 1 duration in weeks>",
            "goals": "<stage 1 goal to reach before proceeding to next stage>",
            "steps": [
                {
                    "description": "<step 1 description>"
                },
                {
                    "description": "<step 2 description>"
                },
                {
                    "description": "<step 3 description>"
                }
            ]
        },
        {
            "name": "<stage 2 name>",
            "duration_weeks": "<stage 2 duration in weeks>",
            "goals": "<stage 2 goal to reach before proceeding to next stage>",
            "steps": [
                {
                    "description": "<step 1 description>"
                },
                {
                    "description": "<step 2 description>"
                },
                {
                    "description": "<step 3 description>"
                }
            ]
        },
        {
            "name": "<stage 3 name>",
            "duration_weeks": "<stage 3 duration in weeks>",
            "goals": "<stage 3 goal to reach before proceeding to next stage>",
            "steps": [
                {
                    "description": "<step 1 description>"
                },
                {
                    "description": "<step 2 description>"
                },
                {
                    "description": "<step 3 description>"
                }
            ]
        }
    ]
  }`;

      while (attempt < MAX_RETRIES && !success) {
        try {
          const result = await chat.sendMessage(`Generate the plan with with this format: ${prompt}`);
          const response = await result.response;
          const text = await response.text();

          const cleanedText = text
            .replace(/^```(?:json)?\n/, '')
            .replace(/\n```$/, '')
            .replace(/\n/g, '');
          const jsonStartIndex = cleanedText.indexOf('{');
          const jsonEndIndex = cleanedText.lastIndexOf('}');
          const validJsonString = cleanedText.substring(jsonStartIndex, jsonEndIndex + 1);

          const parsedSchedule = JSON.parse(validJsonString);
          setGeneratedSchedule(parsedSchedule);
          await updateHabitPlan(validJsonString);
          success = true;
        } catch (parseError) {
          attempt++;
          console.error(`Error parsing JSON on attempt ${attempt}:`, parseError);
          if (attempt >= MAX_RETRIES) {
            throw new Error('Maximum retries reached. Unable to generate a valid habit schedule.');
          }
        }
      }
    } catch (error) {
      console.error('Error generating habit schedule:', error);
      Alert.alert('Error', 'Failed to generate habit schedule. Please try again.');
    } finally {
      setIsLoading(false);
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
      setNewPhoto(result.assets[0]);
    }
  };

  const pickGallery = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images });
    if (!result.cancelled) {
      setNewPhoto(result.assets[0]);
    }
  };

  const cancelImageSelection = () => {
    setNewPhoto(null);
    setNewDescription('');
  };

  const blobToBase64 = (blob) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = () => {
        const base64data = reader.result.split(',')[1];
        resolve(base64data);
      };
      reader.onerror = () => {
        reject(new Error('Failed to convert blob to base64'));
      };
    });
  };

  const addImage = async () => {
    if (!newPhoto || !newDescription) {
      Alert.alert('Error', 'Please select a photo and add a description');
      return;
    }

    const fileName = `${Date.now()}_${newPhoto.uri.split('/').pop()}`;
    console.log('Uploading file:', fileName);

    try {
      const response = await fetch(newPhoto.uri);
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
            contentType: 'image/jpeg',
          });

        if (uploadError) {
          console.error('Upload error:', uploadError);
          Alert.alert('Error', uploadError.message);
          return;
        }

        const publicUrlResponse = supabase.storage.from('habit').getPublicUrl(fileName);
        const imagePhotoUrl = publicUrlResponse.data.publicUrl;

        const { data: insertData, error: insertError } = await supabase
          .from('HabitImages')
          .insert([{ habit_id: habit.habit_id, image_photo: imagePhotoUrl, description: newDescription }]);

        if (insertError) {
          console.error('Insert error:', insertError);
          Alert.alert('Error', insertError.message);
          return;
        }

        setHabitImages([...habitImages, { habit_id: habit.habit_id, image_photo: imagePhotoUrl, description: newDescription }]);
        setNewPhoto(null);
        setNewDescription('');
      };
      reader.readAsDataURL(blob);
    } catch (fetchError) {
      console.error('Fetch error:', fetchError);
      Alert.alert('Error', 'Failed to create Blob from the image URI');
    }
  };


  const deleteTextPost = async (post_id) => {
    try {
      const { error } = await supabase
        .from('Post')
        .delete()
        .eq('post_id', post_id);
  
      if (error) {
        throw error;
      }
  
      // remove deleted post from the state
      setTextPosts(textPosts.filter(post => post.post_id !== post_id));
      Alert.alert('Success', 'Post has been successfully deleted');
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };
  

  const customStyles = {
    stepIndicatorSize: 25,
    currentStepIndicatorSize: 30,
    separatorStrokeWidth: 2,
    currentStepStrokeWidth: 3,
    stepStrokeCurrentColor: Colors.primary,
    stepStrokeWidth: 3,
    stepStrokeFinishedColor: Colors.primary,
    stepStrokeUnFinishedColor: '#aaaaaa',
    separatorFinishedColor: Colors.primary,
    separatorUnFinishedColor: '#aaaaaa',
    stepIndicatorFinishedColor: Colors.primary,
    stepIndicatorUnFinishedColor: '#ffffff',
    stepIndicatorCurrentColor: '#ffffff',
    stepIndicatorLabelFontSize: 0,
    currentStepIndicatorLabelFontSize: 0,
    labelColor: '#999999',
    labelSize: 13,
    currentStepLabelColor: Colors.primary,
  };

  const renderStepContent = (step) => (
    <View key={step.name} style={styles.stepContent}>
      <Text style={styles.stepTitle}>{step.name}</Text>
      <Text style={styles.stepText}>Duration: {step.duration_weeks} weeks</Text>
      <Text style={styles.stepText}>Goals: {step.goals}</Text>
      {step.steps.map((item, index) => (
        <Text key={index} style={styles.stepText}>
          Step {index + 1}: {item.description}
        </Text>
      ))}
    </View>
  );

  const openModal = (image) => {
    console.log("Opening modal with image:", image);
    setSelectedImage(image);
    setModalVisible(true);
  };
  

  const closeModal = () => {
    setModalVisible(false);
    setSelectedImage(null);
  };
  const renderImageItem = ({ item }) => {
    return (
      <TouchableOpacity key={item.id} onPress={() => openModal(item)}>
        <Image source={{ uri: item.image_photo }} style={styles.gridImage} />
      </TouchableOpacity>
    );
  };




  const toggleEdit = () => {
    setEditable(!editable);
  };

  const getActiveDay = (index) => {
    return (habit.schedule_active_days & (1 << index)) !== 0;
  };

  const saveChanges = async () => {
    try {
      const packedActiveDays = calculatePackedActiveDays();
      const { data: habitData, error: habitError } = await supabase
        .from('Habit')
        .update({
          habit_title: newTitle,
          habit_description: newDescription,
        })
        .eq('habit_id', habit.habit_id);

      const formattedEndDate = newEndDate.toISOString();

      const { data: scheduleData, error: scheduleError } = await supabase
        .from('Schedule')
        .update({
          schedule_end_date: formattedEndDate,
          schedule_active_days: packedActiveDays,
        })
        .eq('habit_id', habit.habit_id);

      if (scheduleError) {
        throw scheduleError;
      }
      const updatedHabitData = {
        ...habit,
        habit_title: newTitle,
        habit_description: newDescription,
        schedule_end_date: formattedEndDate,
        packed_active_days: packedActiveDays,
      };
      setEditedHabit(updatedHabitData);

      Alert.alert('Habit updated successfully');
      setEditable(false);
    } catch (error) {
      Alert.alert('Error updating habit', error.message);
    }
  };

  const cancelEdit = () => {
    setNewTitle(habit.habit_title);
    setNewDescription(habit.habit_description);
    setNewEndDate(habit.schedule_end_date);
    setActiveDays(habit.schedule_active_days);
    setEditable(false);
  }

  const calculatePackedActiveDays = () => {
    let packedActiveDays = 0;
    ['S', 'M', 'T', 'W', 'T', 'F', 'S'].forEach((day, index) => {
      if (isDayActive(index)) {
        packedActiveDays |= (1 << index);
      }
    });

    return packedActiveDays;
  };

  return (
    <View style={Default.container}>
      <KeyboardAwareFlatList
        extraHeight={120}
        data={[{ key: 'header' }, { key: 'content' }]}
        renderItem={({ item }) => {
          if (item.key === 'header') {
            return (
              <Header
                title="Habit Details"
                navigation={navigation}
                backButton
                customRightIcon={
                  editable ? (
                    <View style={styles.saveCancelButtonsContainer}>
                      <TouchableOpacity onPress={cancelEdit} style={styles.saveCancelButtons}>
                        <Text style={styles.saveCancelButtonsText}>Cancel</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={saveChanges} style={styles.saveCancelButtons}>
                        <Text style={styles.saveCancelButtonsText}>Save</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <Icon
                      onPress={toggleEdit}
                      size={20}
                      color={Colors.text}
                      name="edit"
                    />
                  )
                }
              />
            );
          } else if (item.key === 'content') {
            return (
              <>
                <View style={styles.gridContainer}>
                  <FlatList
                    data={habitImages}
                    renderItem={renderImageItem}
                    keyExtractor={(item) => item.description}
                    numColumns={3}
                    contentContainerStyle={styles.scrollContainer}
                  />
<FlatList
  data={textPosts}
  renderItem={({ item }) => (
    <View key={item.post_id} style={styles.textPostContainer}>
  <Text style={styles.textPost}>{item.post_description}</Text>
      <TouchableOpacity onPress={() => deleteTextPost(item.post_id)} style={styles.deleteButton}>
        <Text style={styles.deleteButtonTitle}>Delete Post</Text>
      </TouchableOpacity>
    </View>
  )}
  keyExtractor={(item) => item.post_id}
/>



                </View>
                <Modal
                  animationType="slide"
                  transparent={true}
                  visible={modalVisible}
                  onRequestClose={closeModal}
                >
                  <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                      {selectedImage && (
                        <>
                          <Image source={{ uri: selectedImage.image_photo }} style={styles.fullImage} />
                          <Text style={styles.imageDescription}>{selectedImage.description}</Text>
                          {selectedImage.post_description && (
                            <Text style={styles.imageDescription}>{selectedImage.post_description}</Text>
                          )}
                          <Button title="Delete Photo" onPress={() => deletePhoto(selectedImage)} />
                          <Button title="Close" onPress={closeModal} style={styles.closeButton} />
                        </>
                      )}
                    </View>
                  </View>
                </Modal>



                <View style={styles.container}>
                  <View style={styles.card}>
                    <Text style={styles.title}>Habit Title</Text>
                    {editable ? (
                      <TextInput
                        style={styles.textInput}
                        value={newTitle}
                        onChangeText={setNewTitle}
                      />
                    ) : (
                      <Text style={styles.textContent}>
                        {editedHabit?.habit_title || 'N/A'}
                      </Text>
                    )}

                    <Text style={styles.title}>Habit Description</Text>
                    {editable ? (
                      <TextInput
                        style={styles.textInput}
                        value={newDescription}
                        onChangeText={setNewDescription}
                      />
                    ) : (
                      <Text style={styles.textContent}>
                        {editedHabit?.habit_description || 'N/A'}
                      </Text>
                    )}

                    <Text style={styles.title}>Start Date</Text>
                    <Text style={styles.textContent}>
                      {habit?.created_at
                        ? moment(habit.created_at).format('MMMM Do YYYY')
                        : 'N/A'}
                    </Text>

                    <View>
                      <Text style={styles.title}>End Date</Text>
                      {editable ? (
                        <TouchableOpacity onPress={() => setShowEndDatePicker(true)}>
                          <Text style={styles.textContent}>
                            {moment(newEndDate).format('MMMM Do YYYY')}
                          </Text>
                        </TouchableOpacity>
                      ) : (
                        <Text style={styles.textContent}>
                          {editedHabit?.schedule_end_date
                            ? moment(new Date(editedHabit?.schedule_end_date)).format('MMMM Do YYYY')
                            : 'N/A'}
                        </Text>
                      )}
                      {showEndDatePicker && (
                        <View style={styles.dateTimePickerContainer}>
                          <DateTimePickerModal
                            themeVariant='light'
                            isVisible={showEndDatePicker}
                            mode="date"
                            date={newEndDate}
                            onConfirm={date => {
                              setShowEndDatePicker(false);
                              setNewEndDate(date);
                            }}
                            onCancel={() => setShowEndDatePicker(false)}
                          />
                        </View>
                      )}
                    </View>

                    {editable ? (
                      <View style={{ marginBottom: 32 }}>
                        <Text style={styles.title}>Active Days</Text>
                        <View style={{ width: Dimensions.get('window').width - 44, flexDirection: 'row', justifyContent: 'space-between' }}>
                          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
                            <TouchableOpacity
                              key={index}
                              onPress={() => toggleDay(index)}
                              style={[styles.frequencyDay, isDayActive(index) ? styles.frequencyDaySelected : null]}
                            >
                              <Text style={styles.textFrequencyDay}>{day}</Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      </View>
                    ) : (
                      <View style={{ marginBottom: 32 }}>
                        <Text style={styles.title}>Active Days</Text>
                        <View style={{ width: Dimensions.get('window').width - 44, flexDirection: 'row', justifyContent: 'space-between' }}>
                          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
                            <View key={index} style={[styles.frequencyDay, isDayActive(index) ? styles.frequencyDaySelected : null]}>
                              <Text style={styles.textFrequencyDay}>{day}</Text>
                            </View>
                          ))}
                        </View>
                      </View>
                    )}

                    <Text style={styles.title}>State</Text>
                    <Text style={styles.textContent}>
                      {habit?.schedule_state || 'N/A'}
                    </Text>

                    <Text style={styles.title}>Created At</Text>
                    <Text style={styles.textContent}>
                      {habit?.created_at
                        ? moment(habit.created_at).format('MMMM Do YYYY, h:mm:ss a')
                        : 'N/A'}
                    </Text>
                  </View>

                  <TouchableOpacity onPress={() => ASPhotoOptions.current.show()} style={styles.pickImageButton}>
                    <Text style={styles.pickImageButtonText}>Pick an image</Text>
                  </TouchableOpacity>

                  <ActionSheet
                    ref={ASPhotoOptions}
                    options={['Camera', 'Library', 'Cancel']}
                    cancelButtonIndex={2}
                    destructiveButtonIndex={2}
                    onPress={index => handleActionSheet(index)}
                  />

                  {newPhoto && (
                    <View style={styles.newImageContainer}>
                      <Image source={{ uri: newPhoto.uri }} style={styles.newImage} />
                      <TextInput
                        style={styles.newDescriptionInput}
                        placeholder="Add a description"
                        value={newDescription}
                        onChangeText={setNewDescription}
                      />
                      <Button title="Add Image" onPress={addImage} />
                      <Button title="Cancel" onPress={cancelImageSelection} />
                    </View>
                  )}

                  <View style={styles.containerButton}>
                    <Button
                      onPress={generateHabitSchedule}
                      title="Generate Habit Schedule"
                      buttonStyle={styles.generateButton}
                    />
                  </View>

                  <View style={styles.scheduleDetails}>
                    {isLoading ? (
                      <ActivityIndicator size="small" color={Colors.ActivityIndicator} />
                    ) : generatedSchedule ? (
                      <>
                        <Text style={{ ...styles.title, paddingTop: 20, paddingBottom: 20, }}>Your Habit Plan by Your AI Coach:</Text>
                        <StepIndicator
                          customStyles={customStyles}
                          currentPosition={currentPosition}
                          stepCount={generatedSchedule.stages.length}
                          labels={generatedSchedule.stages.map((stage) => stage.name)}
                        />
                        <ScrollView
                          horizontal
                          showsHorizontalScrollIndicator={false}
                          style={styles.stepContentContainer}
                          onScroll={(e) => {
                            const contentOffsetX = e.nativeEvent.contentOffset.x;
                            const screenWidth = Dimensions.get('window').width;
                            const currentStep = Math.round(contentOffsetX / screenWidth);
                            setCurrentPosition(currentStep);
                          }}
                          scrollEventThrottle={16}
                        >
                          {generatedSchedule.stages.map((stage, index) =>
                            renderStepContent(stage)
                          )}
                        </ScrollView>
                      </>
                    ) : (
                      <Text style={{ ...styles.textContent, paddingTop: 20 }}>No generated plan yet!</Text>
                    )}
                  </View>

                  <View style={styles.buttonContainer}>
                    <Button
                      disabled={loadingDelete}
                      loading={loadingDelete}
                      buttonStyle={styles.deleteButton}
                      titleStyle={styles.deleteButtonTitle}
                      onPress={() => setDeleteModalVisible(true)}
                      title="DELETE HABIT"
                    />

                    <Modal
                      visible={deleteModalVisible}
                      transparent={true}
                      animationType="slide"
                      onRequestClose={() => setDeleteModalVisible(false)}
                    >
                      <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                          <Text style={styles.modalText}>Are you sure you want to delete this habit?</Text>
                          <View style={styles.modalButtonContainer}>
                            <TouchableOpacity
                              style={styles.modalCancelButton}
                              onPress={() => setDeleteModalVisible(false)}
                            >
                              <Text style={styles.modalButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                              style={styles.modalDeleteButton}
                              onPress={confirmDeleteHabit}
                            >
                              <Text style={styles.modalButtonText}>Delete</Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      </View>
                    </Modal>


                  </View>
                </View>
              </>
            );
          }
        }}
        keyExtractor={(item) => item.key}
      />

      <RBSheet
        ref={RBSDelete}
        height={Dimensions.get('window').height * 0.12}
        openDuration={250}
        customStyles={{
          container: {
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: 45,
            padding: 20,
            width: Dimensions.get('window').width - 40,
            marginHorizontal: 20,
          },
        }}
      >
        <View style={styles.absolute}>
          <View style={styles.overlay} />
          <View style={styles.sheetContainer}>
            <Text style={styles.sheetTitle}>
              Are you sure you want to delete this habit?
            </Text>

            <View style={styles.sheetButtonContainer}>
              <Button
                title="Cancel"
                onPress={() => RBSDelete.current.close()}
                buttonStyle={styles.sheetCancelButton}
              />
              <Button
                title="Delete"
                onPress={deleteHabit}
                buttonStyle={styles.sheetDeleteButton}
              />
            </View>
          </View>
        </View>
      </RBSheet>
    </View>
  );
};

const styles = StyleSheet.create({
  saveCancelButtonsContainer: {
    paddingLeft: 30,
    flexDirection: 'row',
  },
  saveCancelButtons: {
    padding: 10,
    backgroundColor: '#5c6bc0',
    borderRadius: 5,
    marginHorizontal: 10,
  },
  saveCancelButtonsText: {
    color: '#fff',
  },
  container: {
    width: Dimensions.get("window").width,
    backgroundColor: Colors.primary,
    flex: 1,
    padding: 16,
  },
  gridContainer: {
    marginTop: 20,
    marginBottom: 16,
    flex: 3,
  },
  gridImage: {
    width: imageSize - 10,
    height: imageSize - 10,
    margin: 5,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.95)',
  },
  modalContent: {
    width: '90%',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  fullImage: {
    width: '100%',
    height: Dimensions.get('window').width,
    marginBottom: 5,
    resizeMode: 'contain',

  },
  imageDescription: {
    marginTop: 10,
    textAlign: 'center',
    color: Colors.text,
    fontSize: 16,
    marginBottom: 40,
  },
  imageCaption: {
    textAlign: 'center',
    marginTop: 5,
    color: Colors.text,
    fontSize: 12,
  },


  // imageDescription: {
  //   color: Colors.white,
  //   marginBottom: 16,
  // },
  title: {
    fontSize: 16,
    fontWeight: '400',
    color: Colors.white,
    marginBottom: 8,
  },
  textContent: {
    fontSize: 14,
    color: Colors.white,
    marginBottom: 16,
  },
  textInput: {
    fontSize: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 5,
    color: Colors.black,
    backgroundColor: Colors.white,
  },
  photoContainer: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').width,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 20,
  },
  habitPhoto: {
    width: '100%',
    height: '100%',
    borderRadius: 45,
  },
  pickImageButton: {
    backgroundColor: '#5c6bc0',
    padding: 12,
    borderRadius: 30,
    alignItems: 'center',
    marginVertical: 16,
  },
  pickImageButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '400',
    letterSpacing: 1,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    overflow: 'hidden',
  },
  newImageContainer: {
    alignItems: 'center',
  },
  newImage: {
    width: '100%',
    height: 200,
  },
  newDescriptionInput: {
    borderColor: Colors.border,
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    marginVertical: 10,
    width: '100%',
    color: Colors.text,
    backgroundColor: Colors.background,
  },
  containerButton: {
    marginBottom: 16,
    width: '100%',
    justifyContent: 'center',
    alignContent: 'center',
    alignItems: 'center',
  },
  generateButton: {
    backgroundColor: 'green',
    borderRadius: 45,
    paddingHorizontal: 32,
    paddingVertical: 12,
  },
  scheduleDetails: {
    backgroundColor: Colors.scheduleBackground,
    borderRadius: 45,
    padding: 0,
    marginBottom: 35,
    marginTop: 25,
  },
  stepContentContainer: {
    marginTop: 20,
    width: Dimensions.get('window').width - 50,
  },
  stepContent: {
    width: Dimensions.get('window').width - 50,
    padding: 16,
    backgroundColor: 'rgba(220, 260, 255, 0.26)',
    borderRadius: 10,
    marginHorizontal: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    width: Dimensions.get('window').width - 90,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: '400',
    color: Colors.white,
    marginBottom: 8,
  },
  stepText: {
    fontSize: 16,
    padding: 10,
    color: Colors.white,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  toggleButton: {
    flex: 1,
    backgroundColor: Colors.primary,
    padding: 12,
    borderRadius: 30,
    marginRight: 8,
    alignItems: 'center',
  },
  toggleButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '400',
  },
  deleteButton: {
    flex: 20,
    backgroundColor: '#d9534f',
    padding: 12,
    borderRadius: 45,
    marginLeft: 125,
  },
  deleteButtonTitle: {
    color: Colors.white,
    fontSize: 12,

  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: Colors.cardBackground,
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  modalText: {
    fontSize: 18,
    color: Colors.text,
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalCancelButton: {
    flex: 1,
    backgroundColor: Colors.secondary,
    padding: 12,
    borderRadius: 5,
    marginRight: 10,
    alignItems: 'center',
  },
  modalDeleteButton: {
    flex: 1,
    backgroundColor: '#d9534f',
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
  },
  modalButtonText: {
    color: Colors.white,
    fontSize: 16,
  },
  sheetContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '400',
    color: Colors.white,
    marginBottom: 16,
  },
  sheetButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 16,
  },
  sheetCancelButton: {
    flex: 1,
    backgroundColor: Colors.secondary,
    padding: 12,
    borderRadius: 30,
    marginRight: 8,
    alignItems: 'center',
  },
  sheetDeleteButton: {
    flex: 1,
    backgroundColor: '#d9534f',
    padding: 12,
    borderRadius: 30,
    alignItems: 'center',
  },
  absolute: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 45,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 40,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  frequencyDay: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.text,
  },
  frequencyDaySelected: {
    backgroundColor: Colors.primary4,
    borderColor: Colors.primary4,
  },
  textFrequencyDay: {
    fontSize: 12,
    color: Colors.text,
    fontWeight: '400',
  },
  textPostContainer: {
    marginTop: 5,
    marginBottom: 5,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.6)',    
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    backgroundColor: Colors.cardBackground,
  },
  textPost: {
    fontSize: 16,
    color: Colors.text,
    marginLeft: 10,
    lineHeight: 28,
  },
  deleteButton: {
    backgroundColor: '#d9534f',
    padding: 4, 
    borderRadius: 5,
    marginBottom: 5,
    alignSelf: 'flex-end', 
  },
  deleteButtonTitle: {
    color: Colors.white,
    fontSize: 14,
  },
  closeButton: {
    marginTop: 10, 
  },
});

export default ViewHabit;
