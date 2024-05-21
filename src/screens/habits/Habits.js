// import React, { useState, useEffect } from 'react';
// import { View, StyleSheet, Text, Alert, FlatList, TouchableOpacity } from 'react-native';
// import Default from '../../../assets/styles/Default';
// import Colors from '../../../assets/styles/Colors';
// import Fetching from '../../components/Fetching';
// import Header from '../../components/Header';
// import { Button } from 'react-native-elements';
// import { useNavigation } from '@react-navigation/native';
// import store from '../../store/storeConfig';
// import { supabase } from '../../config/supabaseClient';

// const Habits = () => {
//   const session = store.getState().user.session;
//   const navigation = useNavigation();
//   const [schedules, setSchedules] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     fetchSchedules();
//   }, []);

//   const fetchSchedules = async () => {
//     try {
//       setLoading(true);
//       if (!session?.user) throw new Error('No user on the session!');

//       const { data: scheduleData, error: scheduleError } = await supabase
//         .from('Schedule')
//         .select('*')
//         .eq('user_id', session?.user.id);

//       console.log('Fetched schedule data:', scheduleData);

//       if (scheduleError) {
//         throw scheduleError;
//       }

//       if (scheduleData) {
//         const habitIds = scheduleData.map(schedule => schedule.habit_id);
//         const { data: habitData, error: habitError } = await supabase
//           .from('Habit')
//           .select('*')
//           .in('habit_id', habitIds);

//         console.log('Fetched habit data:', habitData);

//         if (habitError) {
//           throw habitError;
//         }

//         if (habitData) {
//           const combinedData = scheduleData.map(schedule => {
//             const habit = habitData.find(h => h.habit_id === schedule.habit_id);
//             return {
//               ...schedule,
//               habit_title: habit?.habit_title,
//               habit_description: habit?.habit_description,
//             };
//           });
//           setSchedules(combinedData);
//           console.log('Combined data:', combinedData);
//         }
//       }
//     } catch (error) {
//       Alert.alert('Error fetching schedules or habits', error.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const addHabit = () => {
//     navigation.navigate('AddHabit');
//   };

//   const viewHabit = (habit) => {
//     navigation.navigate('ViewHabit', { habit });
//   };

//   const renderSchedule = ({ item }) => (
//     <TouchableOpacity onPress={() => viewHabit(item)} style={styles.scheduleItem}>
//       <Text>Habit Title: {item.habit_title || 'N/A'}</Text>
//       <Text>Habit Description: {item.habit_description || 'N/A'}</Text>
//       <Text>Quantity: {item.schedule_quantity}</Text>
//       <Text>Start Date: {item.schedule_start_date || 'N/A'}</Text>
//       <Text>End Date: {item.schedule_end_date || 'N/A'}</Text>
//       <Text>
//         Active Days:{' '}
//         {item.schedule_active_days !== null ? item.schedule_active_days : 'N/A'}
//       </Text>
//       <Text>State: {item.schedule_state || 'N/A'}</Text>
//     </TouchableOpacity>
//   );

//   return (
//     <View style={styles.container}>
//       <Header title="My Habits" />
//       {loading ? (
//         <Fetching />
//       ) : (
//         <FlatList
//           data={schedules}
//           keyExtractor={(item, index) => index.toString()}
//           renderItem={renderSchedule}
//           contentContainerStyle={styles.list}
//         />
//       )}
//       <Button title="Add Habit" onPress={addHabit} />
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: Colors.background,
//   },
//   list: {
//     padding: 10,
//   },
//   scheduleItem: {
//     padding: 10,
//     marginVertical: 5,
//     backgroundColor: 'white',
//     borderRadius: 5,
//     ...Default.shadow,
//   },
// });

// export default Habits;

import React, { useState, useEffect } from 'react';
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
import { useNavigation } from '@react-navigation/native';
import store from '../../store/storeConfig';
import { supabase } from '../../config/supabaseClient';

const Habits = () => {
  const session = store.getState().user.session;
  const navigation = useNavigation();
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSchedules();
  }, []);

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
      Alert.alert('Error fetching schedules or habits', error.message);
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

// const Habits = (props) => {
//   const navigation = useNavigation();
//   const [fetching, setFetching] = useState(false);
//   const [user_habits, setUserHabits] = useState([]);

//   useEffect(() => {
//     fetchUserHabits(true);

//     Notifications.cancelAllScheduledNotificationsAsync();

//     registerPush();
//   }, []);

//   useEffect(() => {
//     const unsubscribe = props.navigation.addListener("focus", () => {
//       fetchUserHabits(false);
//     });

//     return unsubscribe;
//   }, [props.navigation, fetchUserHabits]);

//   const fetchUserHabits = async (is_fetching) => {
//     is_fetching ? setFetching(true) : null;

//     getAllCategoryUserHabits()
//       .catch((err) => {
//         // Alert.alert(
//         //   "Ops!",
//         //   "Something went wrong with our servers. Please contact us.",
//         // );
//       })
//       .then((res) => {
//         if (res?.status === 200) {
//           if (res.data.errors) {
//             // Alert.alert("Ops!", res.data.errors[0]);
//           } else {
//             setUserHabits(res.data);
//           }
//         }

//         setFetching(false);
//       });
//   };

//   const addHabit = () => {
//     navigation.navigate('AddHabit');
//   };

//   registerPush = async () => {
//     const { status: existingStatus } =
//       await Notifications.getPermissionsAsync();

//     let finalStatus = existingStatus;

//     if (existingStatus !== "granted") {
//       const { status } = await Notifications.requestPermissionsAsync();
//       finalStatus = status;
//     }

//     if (finalStatus !== "granted") {
//       return;
//     }

//     let token = await Notifications.getExpoPushTokenAsync();

//     sendPush({ usr_push_token: token.data }).catch((err) => {
//       Alert.alert(
//         "Ops",
//         "Tivemos um problema ao registrar suas notificações. Entre em contato com o suporte.",
//       );
//     });
//   };

//   return (
//     <View style={Default.container}>
//       <Fetching isFetching={fetching}>
//         {user_habits.length > 0 ? (
//           <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
//             <Header title="Habits" navigation={props.navigation} showMenu />

//             <View style={styles.container}>
//               <View style={[styles.innerContainer, { paddingTop: 0, flex: 1 }]}>
//                 <View style={styles.containerTitle}>
//                   <Text style={styles.textTitle}>Habits</Text>
//                 </View>

//                 <View style={styles.containerMomentum}>
//                   <Text style={styles.textMomentum}>My Momentum</Text>
//                 </View>

//                 <UserHabit
//                   navigation={props.navigation}
//                   user_habits={user_habits}
//                   onRefresh={fetchUserHabits}
//                   deleteHabit
//                 />
//               </View>

//               <View style={styles.containerButton}>
//                 <Button
//                   buttonStyle={[
//                     Default.loginCreateAccountButton,
//                     { marginBottom: 16 },
//                   ]}
//                   titleStyle={Default.loginButtonBoldTitle}
//                   onPress={() => props.navigation.navigate("Titans")}
//                   title="SEE TITANS HABITS"
//                 />

//                 <Button
//                   buttonStyle={Default.loginNextButton}
//                   titleStyle={Default.loginButtonBoldTitle}
//                   onPress={addHabit}
//                   title="CREATE NEW HABIT"
//                 />
//               </View>
//             </View>
//           </ScrollView>
//         ) : (
//           <View style={styles.container}>
//             <View style={styles.innerContainer}>
//               <Text style={styles.text1}>What can we improve in</Text>
//               <Text style={styles.text2}>your life today?</Text>
//             </View>

//             <View style={styles.containerImage}>
//               <Image
//                 source={require("../../../assets/images/Click.png")}
//                 style={styles.imageDetail}
//               />
//             </View>

//             <View style={styles.containerButton}>
//               <Button
//                 buttonStyle={Default.loginNextButton}
//                 titleStyle={Default.loginButtonBoldTitle}
//                 onPress={addHabit}
//                 title="ADD YOUR FIRST HABIT"
//               />
//             </View>
//           </View>
//         )}
//       </Fetching>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flexDirection: "column",
//     flex: 1,
//     alignItems: "center",
//     paddingVertical: 14,
//     width: Dimensions.get("window").width,
//     paddingHorizontal: 22,
//   },
//   innerContainer: {
//     flexDirection: "column",
//     alignItems: "center",
//     paddingTop: 57,
//   },
//   containerImage: {
//     flex: 1,
//     flexDirection: "column",
//     justifyContent: "center",
//   },
//   imageDetail: {
//     width: 120,
//     height: 120,
//   },
//   text1: {
//     fontSize: 24,
//     color: "white",
//     fontWeight: "400",
//     alignSelf: "center",
//   },
//   text2: {
//     fontSize: 32,
//     color: "white",
//     fontWeight: "700",
//     alignSelf: "center",
//   },
//   containerTitle: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     paddingVertical: 20,
//     width: Dimensions.get("window").width - 44,
//   },
//   textTitle: {
//     fontSize: 24,
//     color: Colors.text,
//     marginRight: 32,
//   },
//   containerMomentum: {
//     borderBottomColor: Colors.text,
//     borderBottomWidth: StyleSheet.hairlineWidth,
//     paddingBottom: 9,
//     marginBottom: 20,
//   },
//   textMomentum: {
//     fontSize: 16,
//     fontWeight: "bold",
//     color: Colors.text,
//     width: Dimensions.get("window").width - 44,
//   },
//   containerButton: {
//     marginTop: 60,
//     marginBottom: 22,
//   },
// });

// export default Habits;
