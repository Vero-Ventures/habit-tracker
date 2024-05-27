import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Text,
  Alert,
  FlatList,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import Default from '../../../assets/styles/Default';
import Colors from '../../../assets/styles/Colors';
import Fetching from '../../components/Fetching';
import Header from '../../components/Header';
import { Button } from 'react-native-elements';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import store from '../../store/storeConfig';
import { supabase } from '../../config/supabaseClient';

const Habits = () => {
  const session = store.getState().user.session;
  const navigation = useNavigation();
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      fetchSchedules();
    }, [])
  );

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      // if (!session?.user) throw new Error('No user on the session!');

      const { data: scheduleData, error: scheduleError } = await supabase
        .from('Schedule')
        .select('*')
        .eq('user_id', session?.user.id);

      console.log('Fetched schedule data:', scheduleData);

      if (scheduleError) {
        throw scheduleError;
      }

      if (scheduleData) {
        const habitIds = scheduleData.map(schedule => schedule.habit_id);
        const { data: habitData, error: habitError } = await supabase
          .from('Habit')
          .select('*')
          .in('habit_id', habitIds);

        console.log('Fetched habit data:', habitData);

        if (habitError) {
          throw habitError;
        }

        if (habitData) {
          const combinedData = scheduleData.map(schedule => {
            const habit = habitData.find(h => h.habit_id === schedule.habit_id);
            return {
              ...schedule,
              habit_title: habit?.habit_title,
              habit_description: habit?.habit_description,
              habit_id: schedule.habit_id,
            };
          });
          setSchedules(combinedData);
          console.log('Combined data:', combinedData);
        }
      }
    } catch (error) {
      console.error('Error fetching schedules or habits:', error);
    } finally {
      setLoading(false);
    }
  };

  const addHabit = () => {
    navigation.navigate('AddHabit');
  };

  const renderSchedule = ({ item }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('ViewHabit', { habit: item })}
      style={styles.scheduleItem}>
      <Text style={styles.habitTitle}>{item.habit_title || 'N/A'}</Text>
      <Text
        style={[
          styles.habitStatus,
          { color: item.schedule_state === 'Open' ? Colors.green : Colors.red },
        ]}>
        {item.schedule_state === 'Open' ? 'ACTIVE' : 'INACTIVE'}
      </Text>
    </TouchableOpacity>
  );
  
  return (
    <View style={styles.container}>
      <Header title="My Habits" />
      {loading ? (
        <Fetching />
      ) : (
        <FlatList
          data={schedules}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderSchedule}
          contentContainerStyle={styles.list}
        />
      )}
      <Button
        buttonStyle={[
          Default.loginNextButton,
          { width: Dimensions.get('window').width - 48 },
        ]}
        titleStyle={Default.loginButtonBoldTitle}
        onPress={addHabit}
        title="ADD HABIT"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: 20,
  },
  list: {
    padding: 10,
  },
  scheduleItem: {
    padding: 15,
    marginVertical: 10,
    backgroundColor: Colors.white,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.27,
    shadowRadius: 4.65,
    elevation: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  habitTitle: {
    fontSize: 18,
    color: Colors.primary5,
  },
  habitStatus: {
    fontSize: 14,
  },
});

export default Habits;
