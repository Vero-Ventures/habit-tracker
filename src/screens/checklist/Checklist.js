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
import moment from 'moment';
import Icon from 'react-native-vector-icons/FontAwesome5';
import Swipeable from 'react-native-gesture-handler/Swipeable';

const Checklist = () => {
  const session = store.getState().user.session;
  const navigation = useNavigation();
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [crossedOff, setCrossedOff] = useState({});
  const [currentDay, setCurrentDay] = useState(moment().format('YYYY-MM-DD'));

  useFocusEffect(
    useCallback(() => {
      fetchSchedules();
    }, [currentDay])
  );


  // helper function determine the active day
const getDayIndex = (day) => {
  switch (day) {
    case 'Sunday': return 0;
    case 'Monday': return 1;
    case 'Tuesday': return 2;
    case 'Wednesday': return 3;
    case 'Thursday': return 4;
    case 'Friday': return 5;
    case 'Saturday': return 6;
    default: return -1;
  }
};

const fetchSchedules = async () => {
  try {
    setLoading(true);
    if (!session?.user) throw new Error('No user on the session!');

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
        const dayIndex = getDayIndex(moment(currentDay).format('dddd'));
        const combinedData = scheduleData.map(schedule => {
          const habit = habitData.find(h => h.habit_id === schedule.habit_id);
          return {
            ...schedule,
            habit_title: habit?.habit_title,
            habit_description: habit?.habit_description,
            habit_photo: habit?.habit_photo,
            is_active_today: (schedule.schedule_active_days & (1 << dayIndex)) !== 0,
          };
        }).filter(schedule => schedule.is_active_today);
        
        setSchedules(combinedData);
        console.log('Combined data:', combinedData);
      }
    }
  } catch (error) {
    console.error('Error fetching schedules or habits:', error);
    Alert.alert('Error fetching schedules or habits', error.message);
  } finally {
    setLoading(false);
  }
};





  const addHabit = () => {
    navigation.navigate('AddHabit');
  };

  const changeDay = (type) => {
    let newDay = moment(currentDay);

    if (type === 'sub') {
      newDay = newDay.subtract(1, 'day');
    }

    if (type === 'add') {
      newDay = newDay.add(1, 'day');
    }

    setCurrentDay(newDay.format('YYYY-MM-DD'));
  };

  const crossOffHabit = (habitId) => {
    setCrossedOff(prev => ({
      ...prev,
      [currentDay]: {
        ...prev[currentDay],
        [habitId]: !prev[currentDay]?.[habitId]
      }
    }));
  };

  const handleCrossOff = (habitId) => {
    Alert.alert(
      "Cross off Habit",
      "Would you like to cross this off your list today?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Yes",
          onPress: () => crossOffHabit(habitId)
        }
      ]
    );
  };

  const renderSchedule = ({ item }) => (
    <Swipeable
      renderLeftActions={() => leftContent}
      renderRightActions={() => rightContent}
      onSwipeableLeftOpen={() => handleCrossOff(item.habit_id)}
      onSwipeableRightOpen={() => handleCrossOff(item.habit_id)}
      rightThreshold={Dimensions.get('window').width / 3}
      leftThreshold={Dimensions.get('window').width / 3}
    >
      <TouchableOpacity
        onPress={() => handleCrossOff(item.habit_id)}
        style={styles.scheduleItem}
      >
        <Text style={[styles.habitTitle, crossedOff[currentDay]?.[item.habit_id] && styles.crossedOff]}>
          {item.habit_title || 'N/A'}
        </Text>
        <Text
          style={[
            styles.habitStatus,
            { color: item.schedule_state === 'Open' ? Colors.green : Colors.red },
          ]}
        >
          {item.schedule_state === 'Open' ? 'ACTIVE' : 'INACTIVE'}
        </Text>
      </TouchableOpacity>
    </Swipeable>
  );

  const rightContent = (
    <View style={styles.containerCheckItemRight}>
      <Icon size={26} color={Colors.white} name="check" />
    </View>
  );

  const leftContent = (
    <View style={styles.containerCheckItemLeft}>
      <Icon size={26} color={Colors.text} name="redo" />
    </View>
  );

  const headerComponent = (
    <>
      {/* <Header title="Daily Checklist"/> */}
      <View style={styles.headerContainer}>
        {/* <Text style={styles.text1}>What can we improve in</Text> */}
        <Text style={styles.text2}>Daily Checklist</Text>
      </View>
      <View style={styles.separatorSubheader}>
        <View style={styles.subheaderContainer}>
          <TouchableOpacity onPress={() => changeDay('sub')}>
            <Icon
              style={styles.icon}
              size={20}
              color={Colors.text}
              name="chevron-left"
            />
          </TouchableOpacity>
          <Text style={styles.textDate}>
            {moment().isSame(currentDay, 'day') ? 'Today' : moment(currentDay).format('DD MMMM')}
          </Text>
          <TouchableOpacity onPress={() => changeDay('add')}>
            <Icon
              style={styles.icon}
              size={20}
              color={Colors.text}
              name="chevron-right"
            />
          </TouchableOpacity>
        </View>
      </View>
    </>
  );

  return (
    <View style={styles.container}>
      <Fetching isFetching={loading}>
        <FlatList
          data={schedules}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderSchedule}
          ListHeaderComponent={headerComponent}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.buttonContainer}>
              <Button
                buttonStyle={Default.loginNextButton}
                titleStyle={Default.loginButtonBoldTitle}
                onPress={addHabit}
                title="ADD YOUR FIRST HABIT"
              />
            </View>
          }
        />
      </Fetching>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: 20,
  },
  headerContainer: {
    alignItems: 'center',
    marginVertical: 10,
  },
  text1: {
    fontSize: 24,
    color: Colors.text,
    fontWeight: '400',
  },
  text2: {
    fontSize: 32,
    color: Colors.text,
    fontWeight: '700',
  },
  separatorSubheader: {
    borderBottomColor: 'rgba(156,198,255,0.2)',
    borderBottomWidth: StyleSheet.hairlineWidth,
    marginVertical: 10,
  },
  subheaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 20,
  },
  textDate: {
    color: Colors.text,
    fontSize: 20,
    fontWeight: '400',
    paddingVertical: 10,
  },
  list: {
    paddingVertical: 10,
  },
  scheduleItem: {
    paddingVertical: 22,
    paddingHorizontal: 22,
    backgroundColor: Colors.primary6,
    marginVertical: 10,
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
  crossedOff: {
    textDecorationLine: 'line-through',
    color: Colors.white,
  },
  buttonContainer: {
    marginTop: 50,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  containerCheckItemRight: {
    backgroundColor: Colors.primary4,
    paddingHorizontal: 22,
    flex: 1,
    justifyContent: 'center',
  },
  containerCheckItemLeft: {
    backgroundColor: Colors.secondary3,
    paddingHorizontal: 22,
    flex: 1,
    justifyContent: 'center',
  },
  icon: {
    paddingHorizontal: 10,
  },
});

export default Checklist;
