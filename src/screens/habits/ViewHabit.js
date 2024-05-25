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
  const [newDescription, setNewDescription] = useState(habit.habit_description);
  const [loadingDisable, setLoadingDisable] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [ editedHabit, setEditedHabit ] = useState(habit);

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

      const combinedImages = [
        ...(habitData?.habit_photo ? [{ image_photo: habitData.habit_photo, id: 'habitPhoto' }] : []),
        ...imagesData
      ];
      // console.log("Setting habit images with: " + JSON.stringify(combinedImages));
      setHabitImages(combinedImages);
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

  const deletePhoto = async (imageId, imageUrl) => {
    try {
      const { error } = await supabase
        .from('HabitImages')
        .delete()
        .eq('habit_image_id', imageId);

      if (error) {
        Alert.alert('Error', 'Failed to delete photo from database');
        return;
      }

      const { error: storageError } = await supabase.storage
        .from('habit')
        .remove([imageUrl]);

      if (storageError) {
        Alert.alert('Error', 'Failed to delete photo from storage');
        return;
      }

      Alert.alert('Success', 'Photo successfully deleted');
      setHabitImages(habitImages.filter((image) => image.habit_image_id !== imageId));
      setModalVisible(false);
    } catch (error) {
      console.error('Error deleting photo:', error);
      Alert.alert('Error', 'An error occurred while deleting the photo');
    }
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
    try {
      setIsLoading(true);
      const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

      const chat = model.startChat({
        history: [
          {
            role: 'user',
            parts: [
              {
                text: 'Hello, I would like you to generate a habit plan in JSON format for me to follow that will help me reach my goals for my habit of ' + habit.habit_description + '.',
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

      const prompt = `{
        "${habit.habit_title}": [
          {
            "stages": [
              {
                "name": "<stage name>",
                "duration_weeks": <stage duration in weeks>,
                "goals": "<stage goal to reach before proceeding to next stage>",
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
          }
        ]
      }
      `;

      const result = await chat.sendMessage(prompt);
      const response = await result.response;
      const text = await response.text();

      const cleanedText = text.replace(/^```(?:json)?\n/, '').replace(/\n```$/, '').trim();
      const jsonStartIndex = cleanedText.indexOf('{');
      const jsonEndIndex = cleanedText.lastIndexOf('}');
      const validJsonString = cleanedText.substring(jsonStartIndex, jsonEndIndex + 1);

      const parsedSchedule = JSON.parse(validJsonString);
      setGeneratedSchedule(parsedSchedule);
      setIsLoading(false);
      await updateHabitPlan(validJsonString);
    } catch (error) {
      console.error('Error generating habit schedule:', error);
      Alert.alert('Error', 'Failed to generate habit schedule. Please try again.');
      setIsLoading(false);
    }
  };

  const handleActionSheet = async (index) => {
    if (index === 0) {
      let { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status === 'granted') {
        pickCamera();
      } else {
        Alert.alert('Ops', 'You need to allow access to the camera first.');
      }
    } else if (index === 1) {
      let { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status === 'granted') {
        pickGallery();
      } else {
        Alert.alert('Ops', 'You need to allow access to the library first.');
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

  const saveChanges = () => {
    try {
      supabase
        .from('Habit')
        .update({ habit_title: newTitle, habit_description: newDescription })
        .eq('habit_id', habit.habit_id)
        .then(({ data, error }) => {
          if (error) {
            throw error;
          }

          Alert.alert('Habit updated successfully');
          setEditable(false);

          const updatedHabitData = {
            ...habit,
            habit_title: newTitle,
            habit_description: newDescription,
          };
          setEditedHabit(updatedHabitData);
        })
        .catch((error) => {
          Alert.alert('Error updating habit', error.message);
        });
    } catch (error) {
      Alert.alert('Error updating habit', error.message);
    }
  };

  const cancelEdit = () => {
    setNewTitle(habit.habit_title);
    setNewDescription(habit.habit_description);
    setEditable(false);
  }

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
                          <Button title="Close" onPress={closeModal} />
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

                    <Text style={styles.title}>Quantity</Text>
                    <Text style={styles.textContent}>
                      {habit?.schedule_quantity || 'N/A'}
                    </Text>

                    <Text style={styles.title}>Start Date</Text>
                    <Text style={styles.textContent}>
                      {habit?.schedule_start_date
                        ? moment(habit.schedule_start_date).format('MMMM Do YYYY')
                        : 'N/A'}
                    </Text>

                    <Text style={styles.title}>End Date</Text>
                    <Text style={styles.textContent}>
                      {habit?.schedule_end_date
                        ? moment(habit.schedule_end_date).format('MMMM Do YYYY')
                        : 'N/A'}
                    </Text>

                    <Text style={styles.title}>Active Days</Text>
                    <Text style={styles.textContent}>
                      {habit?.schedule_active_days || 'N/A'}
                    </Text>

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
                    <Text style={{ ...styles.title, paddingTop: 20, paddingBottom: 20, }}>Your Habit Plan by Your AI Coach:</Text>
                    {isLoading ? (
                      <ActivityIndicator size="small" color={Colors.ActivityIndicator} />
                    ) : generatedSchedule ? (
                      <>
                        <StepIndicator
                          customStyles={customStyles}
                          currentPosition={currentPosition}
                          stepCount={generatedSchedule[habit.habit_title][0].stages.length}
                          labels={generatedSchedule[habit.habit_title][0].stages.map((stage) => stage.name)}
                        />
                        <FlatList
                          horizontal
                          data={generatedSchedule[habit.habit_title][0].stages}
                          renderItem={({ item }) => renderStepContent(item)}
                          keyExtractor={(item, index) => index.toString()}
                          contentContainerStyle={styles.stepContentContainer}
                          onScroll={(e) => {
                            const contentOffsetX = e.nativeEvent.contentOffset.x;
                            const screenWidth = Dimensions.get('window').width;
                            const currentStep = Math.round(contentOffsetX / screenWidth);
                            setCurrentPosition(currentStep);
                          }}
                          scrollEventThrottle={16}
                        />
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
                      onPress={onDeleteHabit}
                      title="DELETE HABIT"
                    />
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
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  modalContent: {
    width: '90%',
    backgroundColor: Colors.cardBackground,
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
  },
  fullImage: {
    width: '100%',
    height: Dimensions.get('window').width,
    borderRadius: 10,
    marginBottom: 16,
  },
  imageDescriptionInput: {
    width: '100%',
    padding: 10,
    borderRadius: 8,
    borderColor: '#FFF',
    borderWidth: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    color: '#FFF',
    fontSize: 16,
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
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
    fontWeight: 'bold',
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
    fontWeight: 'bold',
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
    fontWeight: 'bold',
  },
  deleteButton: {
    flex: 1,
    backgroundColor: '#d9534f',
    padding: 12,
    borderRadius: 45,
    alignItems: 'left',
    marginRight: 25,
  },
  deleteButtonTitle: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  sheetContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: 'bold',
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
});

export default ViewHabit;