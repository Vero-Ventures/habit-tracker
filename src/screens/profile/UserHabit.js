import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  Text,
  RefreshControl,
  ScrollView,
  Image,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Default from '../../../assets/styles/Default';
import Header from '../../components/Header';
import Colors from '../../../assets/styles/Colors';
import Fetching from '../../components/Fetching';
import Icon from 'react-native-vector-icons/FontAwesome5';
import CardHabits from '../../components/community/CardHabits';
import { getAllUserHabits, getMomentum } from '../../store/ducks/habit';
import { getBasicInformationUser } from '../../store/ducks/user';

const UserHabit = props => {
  const [fetching, setFetching] = useState(false);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [load_more, setLoadMore] = useState(true);
  const [list_habits, setListHabits] = useState([]);

  const [page, setPage] = useState(0);
  const [option_bar, setOptionBar] = useState(1);

  useEffect(() => {
    fetchHabits(true, false);
  }, []);

  const fetchHabits = (isFetching, isRefreshing) => {
    isFetching ? setFetching(true) : isRefreshing ? setRefreshing(true) : null;

    props.route?.params?.user ? habitsUserProfile() : habitsUserLogged();
  };

  const habitsUserLogged = () => {
    getMomentum()
      .catch(err => {
        Alert.alert(
          'Ops!',
          'Something went wrong with our servers. Please contact us.'
        );
      })
      .then(res => {
        if (res?.status === 200) {
          if (res.data.errors) {
            Alert.alert('Ops!', res.data.errors[0]);
          } else {
            let habits_aux = [];

            res.data.forEach(obj => {
              let aux_category = obj.hac_name;

              obj.habits.forEach(hab => {
                let data = {};
                hab.habit.category = aux_category;
                data.hab = hab;
                habits_aux.push(data);
              });
            });

            setListHabits(habits_aux);
          }
        }
      })
      .finally(() => {
        setFetching(false);
        setRefreshing(false);
      });
  };

  const habitsUserProfile = () => {
    getBasicInformationUser(props.route.params.user)
      .catch(err => {
        Alert.alert(
          'Ops!',
          'Something went wrong with our servers. Please contact us.'
        );
      })
      .then(res => {
        if (res.data.errors) {
          Alert.alert('Ops!', res.data.errors[0]);
        } else {
          let habits_aux = [];

          res.data.momentum.forEach(obj => {
            let data = {};
            let aux_category = obj.hac_name;

            obj.habits.forEach(hab => {
              hab.habit.category = aux_category;
              data.hab = hab;
              habits_aux.push(data);
            });
          });

          setListHabits(habits_aux);
        }
      })
      .finally(() => {
        setFetching(false);
        setRefreshing(false);
      });
  };

  return (
    <View style={Default.container}>
      <ScrollView
        scrollEnabled
        refreshControl={
          <RefreshControl
            colors={['#000']}
            tintColor="#fff"
            onRefresh={() => fetchHabits(false, true)}
            refreshing={refreshing}
          />
        }>
        <Header navigation={props.navigation} showBackgroundImage />
        <Fetching isFetching={fetching}>
          <View style={styles.container}>
            <SafeAreaView style={{ flex: 1 }}>
              <View style={styles.containerActions}>
                <TouchableOpacity
                  style={styles.backButtonStyle}
                  onPress={() => props.navigation.pop()}>
                  <Icon
                    type="font-awesome"
                    name="chevron-left"
                    size={16}
                    color={'#FFFFFF'}
                  />
                </TouchableOpacity>

                <Text
                  style={styles.textUserHeaderName}
                  type="font-awesome"
                  name="chevron-left"
                  size={14}
                  color={Colors.text}>
                  Habits
                </Text>
              </View>
              <View
                style={[styles.containerViewSection, { paddingBottom: 32 }]}>
                <View style={styles.containerHabits}>
                  {list_habits.length > 0
                    ? list_habits.map((obj, i) => {
                        return (
                          <View key={i}>
                            <CardHabits
                              habit={obj.hab.habit}
                              type={'My Communities'}
                              navigation={props.navigation}
                              isMomentum={true}
                              currentStreak={obj.hab.ush_current_streak}
                              myHabit={true}
                              userHabit={obj.hab.id}
                            />
                          </View>
                        );
                      })
                    : null}
                </View>
                {loading ? (
                  <View
                    style={{
                      flex: 1,
                      justifyContent: 'center',
                      margintTop: 16,
                      paddingBottom: 16,
                    }}>
                    <ActivityIndicator size="small" color="#fff" />
                  </View>
                ) : null}
              </View>
            </SafeAreaView>
          </View>
        </Fetching>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: Dimensions.get('window').width,
  },
  containerActions: {
    flexDirection: 'column',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomColor: '#264261',
    borderBottomWidth: StyleSheet.hairlineWidth,
    //marginTop: 32,
    //height: 26
  },
  textUserHeaderName: {
    color: Colors.text,
    fontWeight: '400',
    fontSize: 20,
    lineHeight: 27,
    alignSelf: 'center',
  },
  containerHeaderImage: {
    height: 189,
    flex: 1,
    justifyContent: 'flex-end',
    width: Dimensions.get('window').width,
    zIndex: 0,
    elevation: 0,
  },
  containerList: {
    height: 268,
    marginBottom: 8,
    paddingVertical: 16,
    zIndex: 1,
    elevation: 1,
  },
  containerViewSection: {
    flex: 1,
    zIndex: 1,
    elevation: 1,
  },
  backButtonStyle: {
    marginLeft: 24,
    alignSelf: 'flex-start',
    marginBottom: -23,
  },
  containerHabits: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
    marginTop: -8,
  },
});

export default UserHabit;
