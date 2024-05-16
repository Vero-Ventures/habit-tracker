import React, { useEffect } from 'react';
import { View, ScrollView, StyleSheet, Text, Image, Dimensions } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from 'react-native-elements';
import Default from '../../../assets/styles/Default';
import Colors from '../../../assets/styles/Colors';
import Fetching from '../../components/Fetching';
import Header from '../../components/Header';
import { useNavigation } from '@react-navigation/native';
import { fetchHabits } from '../../store/ducks/habit'; 
import * as Notifications from 'expo-notifications';

const Habits = (props) => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { habits, status } = useSelector((state) => state.habits);

  useEffect(() => {
    dispatch(fetchHabits());
    Notifications.cancelAllScheduledNotificationsAsync();
    registerPush();
  }, [dispatch]);

  const registerPush = async () => {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();

    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      return;
    }

    let token = await Notifications.getExpoPushTokenAsync();
    // Handle token (e.g., send it to your backend)
  };

  if (status === 'loading') {
    return <Fetching isFetching />;
  }

  return (
    <View style={Default.container}>
      {habits.length > 0 ? (
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <Header title="Habits" navigation={props.navigation} showMenu />
          <View style={styles.container}>
            <View style={[styles.innerContainer, { paddingTop: 0, flex: 1 }]}>
              <View style={styles.containerTitle}>
                <Text style={styles.textTitle}>Habits</Text>
              </View>
              <View style={styles.containerMomentum}>
                <Text style={styles.textMomentum}>My Momentum</Text>
              </View>
            </View>
            <View style={styles.containerButton}>
              <Button
                buttonStyle={[Default.loginCreateAccountButton, { marginBottom: 16 }]}
                titleStyle={Default.loginButtonBoldTitle}
                onPress={() => props.navigation.navigate('Titans')}
                title="SEE TITANS HABITS"
              />
              <Button
                buttonStyle={Default.loginNextButton}
                titleStyle={Default.loginButtonBoldTitle}
                onPress={() => navigation.navigate('AddHabit')}
                title="CREATE NEW HABIT"
              />
            </View>
          </View>
        </ScrollView>
      ) : (
        <View style={styles.container}>
          <View style={styles.innerContainer}>
            <Text style={styles.text1}>What can we improve in</Text>
            <Text style={styles.text2}>your life today?</Text>
          </View>
          <View style={styles.containerImage}>
            <Image
              source={require('../../../assets/images/Click.png')}
              style={styles.imageDetail}
            />
          </View>
          <View style={styles.containerButton}>
            <Button
              buttonStyle={Default.loginNextButton}
              titleStyle={Default.loginButtonBoldTitle}
              onPress={() => navigation.navigate('AddHabit')}
              title="ADD YOUR FIRST HABIT"
            />
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
    width: Dimensions.get('window').width,
    paddingHorizontal: 22,
  },
  innerContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    paddingTop: 57,
  },
  containerImage: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
  },
  imageDetail: {
    width: 120,
    height: 120,
  },
  text1: {
    fontSize: 24,
    color: 'white',
    fontWeight: '400',
    alignSelf: 'center',
  },
  text2: {
    fontSize: 32,
    color: 'white',
    fontWeight: '700',
    alignSelf: 'center',
  },
  containerTitle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 20,
    width: Dimensions.get('window').width - 44,
  },
  textTitle: {
    fontSize: 24,
    color: Colors.text,
    marginRight: 32,
  },
  containerMomentum: {
    borderBottomColor: Colors.text,
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingBottom: 9,
    marginBottom: 20,
  },
  textMomentum: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    width: Dimensions.get('window').width - 44,
  },
  containerButton: {
    marginTop: 60,
    marginBottom: 22,
  },
});

export default Habits;



