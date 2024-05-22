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
import { systemWeights } from 'react-native-typography';

const ViewHabit = () => {
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [loadingDisable, setLoadingDisable] = useState(false);
  const [loadingShare, setLoadingShare] = useState(false);
  const [habitPhoto, setHabitPhoto] = useState(null);

  const RBSDelete = useRef();
  const navigation = useNavigation();
  const route = useRoute();
  const { habit } = route.params;

  useEffect(() => {
    const fetchHabit = async () => {
      const { data: habitData, error } = await supabase
        .from('Habit')
        .select('*')
        .eq('habit_id', habit.habit_id)
        .single();
      
      if (error) {
        Alert.alert('Error fetching habit', error.message);
        return;
      }

      console.log('Habit Data:', habitData);
      setHabitPhoto(habitData?.habit_photo);
    };

    fetchHabit();
  }, [habit.habit_id]);

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

  const shareHabitToInstagram = async () => {
    if (!habitPhoto) {
      Alert.alert('No habit photo to share');
      return;
    }

    setLoadingShare(true);

    try {
      // create Media Container
      const mediaContainerResponse = await fetch(`https://graph.facebook.com/v20.0/${YOUR_IG_USER_ID}/media`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${YOUR_ACCESS_TOKEN}`,
        },
        body: JSON.stringify({
          image_url: habitPhoto,
          caption: `Check out my habit: ${habit.habit_title} #MyHabit`,
        }),
      });
      
      const mediaContainerData = await mediaContainerResponse.json();

      if (!mediaContainerData.id) {
        throw new Error('Failed to create media container');
      }

      // publish Media
      const publishResponse = await fetch(`https://graph.facebook.com/v20.0/${YOUR_IG_USER_ID}/media_publish`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${YOUR_ACCESS_TOKEN}`,
        },
        body: JSON.stringify({
          creation_id: mediaContainerData.id,
        }),
      });

      const publishData = await publishResponse.json();

      if (publishData.id) {
        Alert.alert('Success', 'Habit shared to Instagram!');
      } else {
        throw new Error('Failed to publish media');
      }

    } catch (error) {
      Alert.alert('Error sharing habit to Instagram', error.message);
    } finally {
      setLoadingShare(false);
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

              <Button
                disabled={loadingShare}
                loading={loadingShare}
                buttonStyle={Default.loginNextButton}
                titleStyle={Default.loginButtonBoldTitle}
                onPress={shareHabitToInstagram}
                title="SHARE TO INSTAGRAM"
                disabledStyle={Default.loginNextButton}
              />
            </View>
          </View>
        </ScrollView>

        <RBSheet
          ref={RBSDelete}
          height={200}
          openDuration={250}
          customStyles={{
            container: {
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: Colors.background,
            },
          }}>
          <View style={{ flex: 1, justifyContent: 'space-evenly' }}>
            <Text
              style={{
                textAlign: 'center',
                fontSize: 18,
                fontWeight: 'bold',
                color: Colors.text,
              }}>
              Are you sure you want to delete this habit?
            </Text>

            <View style={{ flexDirection: 'row', justifyContent: 'space-evenly' }}>
              <Button
                title="Cancel"
                onPress={() => RBSDelete.current.close()}
                buttonStyle={{ backgroundColor: Colors.secondary }}
              />
              <Button
                title="Delete"
                onPress={deleteHabit}
                buttonStyle={{ backgroundColor: Colors.primary }}
              />
            </View>
          </View>
        </RBSheet>
      </KeyboardAwareScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
  },
  textContent: {
    fontSize: 14,
    color: Colors.text,
    marginBottom: 16,
  },
  photoContainer: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').width,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  habitPhoto: {
    width: '100%',
    height: '100%',
  },
});

export default ViewHabit;
