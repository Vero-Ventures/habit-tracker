import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Dimensions,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Default from '../../../assets/styles/Default';
import Colors from '../../../assets/styles/Colors';
import Header from '../../components/Header';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { Button } from 'react-native-elements';
import { supabase } from '../../config/supabaseClient';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import RBSheet from 'react-native-raw-bottom-sheet';
import moment from 'moment';
import store from '../../store/storeConfig';
import { systemWeights } from 'react-native-typography';
import HabitPlan from './HabitPlan';

const { GoogleGenerativeAI } = require('@google/generative-ai');
const apikey = process.env.EXPO_PUBLIC_REACT_APP_GEMINI_KEY;
const genAI = new GoogleGenerativeAI(apikey);

const ViewHabit = () => {
  const session = store.getState().user.session;
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [loadingDisable, setLoadingDisable] = useState(false);
  const [habitPhoto, setHabitPhoto] = useState(null);
  const [generatedSchedule, setGeneratedSchedule] = useState(null);
  const [jsonPlan, setJsonPlan] = useState("");
  const RBSDelete = useRef();
  const navigation = useNavigation();
  const route = useRoute();
  const { habit } = route.params;

  // useEffect(() => {
  //   const fetchHabit = async () => {
  //     const { data: habitData, error } = await supabase
  //       .from('Habit')
  //       .select('*')
  //       .eq('habit_id', habit.habit_id)
  //       .single();

  //     console.log('UserID: ',  session.user.id);
      
  //     if (error) {
  //       Alert.alert('Error fetching habit', error.message);
  //       return;
  //     }

  //     console.log('Habit Data:', habitData);
  //     setHabitPhoto(habitData?.habit_photo);
  //   };

  //   fetchHabit();
  // }, [habit.habit_id]);

  const onDeleteHabit = () => {
    RBSDelete.current.open();
  };

  const onToggleHabit = async () => {
    setLoadingDisable(true);

    const updatedData = {
      ...habit,
      enabled: !habit.enabled,
    };

    const { /*data, */ error } = await supabase
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
      const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
  
      const chat = model.startChat({
        history: [
          {
            role: 'user',
            parts: [
              {
                text: 'Hello, I would like you to generate a habit plan in JSON format for me to follow that will help me reach my goals for my habit of ' + habit.habit_title,
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
      console.log('Cleaned habit schedule:', validJsonString);
      
      try {
        setGeneratedSchedule(validJsonString);
      } catch (parseError) {
        console.error('Error parsing habit plan:', parseError);
        Alert.alert('Error', 'Failed to parse habit schedule. Please try again.');
      }
    } catch (error) {
      console.error('Error generating habit schedule:', error);
      Alert.alert('Error', 'Failed to generate habit schedule. Please try again.');
    }
  };

  return (
    <View style={Default.container}>
      <KeyboardAwareScrollView
        extraHeight={120}
        contentContainerStyle={Default.container}>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <Header
            title="Habit Details"
            navigation={navigation}
            backButton
            customRightIcon={
              <Icon
                onPress={() =>
                  navigation.navigate('EditHabit', {
                    habit_id: habit.habit_id,
                  })
                }
                size={20}
                color={Colors.text}
                name="edit"
              />
            }
          />

          {habitPhoto ? (
            <View style={styles.photoContainer}>
              <Image
                source={{ uri: habitPhoto }}
                style={styles.habitPhoto}
                resizeMode="cover"
              />
            </View>
          ) : null}

          <View style={styles.container}>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>Habit Title</Text>
              <Text style={styles.textContent}>
                {habit?.habit_title || 'N/A'}
              </Text>

              <Text style={styles.title}>Habit Description</Text>
              <Text style={styles.textContent}>
                {habit?.habit_description || 'N/A'}
              </Text>

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

            <View style={styles.containerButton}>
              <Button
                onPress={generateHabitSchedule}
                title="Generate Habit Schedule"
              />
            </View>

            {generatedSchedule && (
              <View style={styles.scheduleDetails}>
                <Text style={styles.title} >Generated Habit Schedule</Text>
                <HabitPlan habitPlan={generatedSchedule} />
              </View>
            )}


            <View
              style={{
                marginTop: 32,
                flexDirection: 'column',
                alignItems: 'center',
              }}>
              {loadingDisable ? (
                <ActivityIndicator
                  style={{ paddingVertical: 16 }}
                  size="small"
                  color={Colors.text}
                />
              ) : (
                <TouchableOpacity onPress={onToggleHabit}>
                  <Text
                    style={{
                      paddingVertical: 16,
                      fontSize: 16,
                      fontWeight: '700',
                      color: Colors.text,
                    }}>
                    {habit?.enabled ? 'DISABLE HABIT' : 'ENABLE HABIT'}
                  </Text>
                </TouchableOpacity>
              )}

              <Button
                disabled={loadingDelete}
                loading={loadingDelete}
                buttonStyle={Default.loginNextButton}
                titleStyle={Default.loginButtonBoldTitle}
                onPress={onDeleteHabit}
                title="DELETE HABIT"
                disabledStyle={Default.loginNextButton}
              />
            </View>
          </View>

          <RBSheet
            ref={RBSDelete}
            height={350}
            openDuration={250}
            customStyles={{ container: styles.containerBottomSheet }}>
            <View style={styles.containerTextBottomSheet}>
              <Image
                style={styles.warningIconStyle}
                source={require('../../../assets/icons/wrong.png')}
              />
              <Text style={styles.textDelete}>
                Are you sure to delete this habit?
              </Text>
            </View>

            <View style={styles.buttonContainer}>
              <Button
                disabled={loadingDelete}
                loading={loadingDelete}
                buttonStyle={Default.loginNextButton}
                titleStyle={Default.loginButtonBoldTitle}
                onPress={deleteHabit}
                title="DELETE"
                disabledStyle={Default.loginNextButton}
              />

              <TouchableOpacity
                disabled={loadingDelete}
                style={{ marginTop: 16 }}
                onPress={() => RBSDelete.current.close()}>
                <View style={{ alignItems: 'center' }}>
                  <Text style={[systemWeights.bold, styles.createAccountText]}>
                    Cancel
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </RBSheet>
        </ScrollView>
      </KeyboardAwareScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 32,
    paddingHorizontal: 22,
  },
  photoContainer: {
    width: '100%',
    height: Dimensions.get('window').width,
    backgroundColor: '#000',
  },
  habitPhoto: {
    width: '100%',
    height: '100%',
  },
  containerBackButton: {
    flexDirection: 'row',
  },
  textBackButton: {
    fontSize: 16,
    color: Colors.primary4,
    marginLeft: 6,
    fontStyle: 'normal',
  },
  textCreate: {
    color: '#FCFCFC',
    fontSize: 24,
    marginTop: 8,
    marginBottom: 32,
  },
  containerButton: {
    flex: 1,
    justifyContent: 'flex-end',
    marginTop: 60,
  },
  pickerStyle: {
    width: Dimensions.get('window').width - 44,
    backgroundColor: Colors.primary,
    borderRadius: 2,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#455c8a',
    marginHorizontal: 10,
    paddingHorizontal: 16,
    paddingVertical: 15,
    marginBottom: 32,
    fontSize: 16,
    color: Colors.text,
  },
  containerBottomSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingVertical: 32,
    paddingHorizontal: 22,
  },
  containerTextBottomSheet: {
    alignItems: 'center',
  },
  warningIconStyle: {
    width: 80,
    height: 80,
    marginBottom: 16,
  },
  textDelete: {
    color: '#000000',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 24,
  },
  buttonContainer: {
    alignItems: 'center',
    marginTop: 16,
  },
  createAccountText: {
    fontSize: 14,
    color: '#4A4A4A',
  },
  title: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '400',
    marginBottom: 12,
  },
  textContent: {
    fontSize: 16,
    color: Colors.primary4,
    fontWeight: '400',
    marginBottom: 32,
  },
  scheduleDetails: {
    marginTop: 16,
  },
});

export default ViewHabit;
