import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  BackHandler,
  StyleSheet,
  Dimensions,
  Image,
  Text,
  TouchableOpacity,
  Alert,
  FlatList,
} from 'react-native';
import Default from '../../../assets/styles/Default';
import Colors from '../../../assets/styles/Colors';
import Fetching from '../../components/Fetching';
import Header from '../../components/Header';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { Button } from 'react-native-elements';
// import { useSelector } from "react-redux";
import {
  storeConnection,
  answerConnection,
  deleteConnection,
  cancelConnection,
} from '../../store/ducks/connection';
import { listPublicCommunities } from '../../store/ducks/community';
// import { getBasicInformationUser } from "../../store/ducks/user";
import { LinearGradient } from 'expo-linear-gradient';
import { getAchievements } from '../../utils/Utils';
import CardHabits from '../../components/community/CardHabits';
import CardCommunity from '../../components/community/CardCommunity';

const Profile = props => {
  const [fetching, setFetching] = useState(false);
  const [achievements, setAchievements] = useState([]);
  const [user_profile, setUserProfile] = useState(null);
  const [communities, setCommunities] = useState([]);
  const [list_habits, setListHabits] = useState([]);
  const user = useSelector(({ user }) => user);

  // useEffect(() => {
  //   fetchAll();
  // }, []);

  // useEffect(() => {
  //   BackHandler.addEventListener("hardwareBackPress", backAction);

  //   return () =>
  //     BackHandler.removeEventListener("hardwareBackPress", backAction);
  // }, []);

  // Mock values:
  useEffect(() => {
    // Initialize with default values
    setUserProfile({
      image: null,
      name: 'Default Name',
      usr_quote_to_live_by: 'Default Quote',
      usr_biggest_hack: 'Default Hack',
      usr_biggest_challenge: 'Default Challenge',
      usr_favorite_book: 'Default Book',
      usr_favorite_food: 'Default Food',
      type_connection: 'not_connection',
      connections: 0,
      ranking: 'N/A',
      momentum: [],
    });
    setCommunities({ data: [] });
    setListHabits([]);
  }, []);

  useEffect(() => {
    BackHandler.addEventListener('hardwareBackPress', backAction);

    return () =>
      BackHandler.removeEventListener('hardwareBackPress', backAction);
  }, []);

  const backAction = () => {
    props.route.params?.prevPage
      ? props.navigation.navigate(props.route.params?.prevPage)
      : props.navigation.goBack();
    return true;
  };

  const fetchAll = async () => {
    setFetching(true);

    await getBasicInformationUser(props.route.params.user.id_user)
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
          setUserProfile(res.data);

          let achievements_aux = [];
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

          if (res.data.momentum.length > 0) {
            achievements_aux = getAchievements(res.data.momentum);

            setAchievements(achievements_aux);
          }
        }

        setFetching(false);
      });

    let request = {
      page: 0,
      cme_id_user: props.route.params.user.id_user,
    };

    await listPublicCommunities(request)
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
            setCommunities(res.data);
          }

          setFetching(false);
        }
      });
  };

  const sendInvite = () => {
    let data = { usc_id_user_received_request: user_profile.id };

    storeConnection(data)
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
            fetchAll();
          }
        }
      });
  };

  const answerInvite = accept => {
    let data = { accepted: accept };

    let id_connection =
      props.route.params.user.id_connection ?? user_profile.connection_id;

    answerConnection(id_connection, data)
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
            fetchAll();
          }
        }
      });
  };

  const doCancelConnection = () => {
    Alert.alert(
      user.name,
      'Are you sure you want to cancel this connection request?',
      [
        {
          text: 'No',
          style: 'cancel',
        },
        {
          text: 'Yes',
          onPress: () =>
            cancelConnection(user_profile?.connection_id)
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
                    fetchAll();
                  }
                }
              }),
        },
      ],
      { cancelable: false }
    );
  };

  const breakConnection = () => {
    let id_connection =
      props.route.params.user.id_connection ?? user_profile.connection_id;

    Alert.alert(
      user.name,
      'Are you sure you want to break this connection?',
      [
        {
          text: 'No',
          style: 'cancel',
        },
        {
          text: 'Yes',
          onPress: () =>
            deleteConnection(id_connection)
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
                    fetchAll();
                  }
                }
              }),
        },
      ],
      { cancelable: false }
    );
  };

  const onRanking = () => {
    props.navigation.navigate('Ranking');
  };

  const onConnections = () => {
    props.navigation.navigate('UserConnections', {
      user: { id: user_profile?.id },
    });
  };

  return (
    <View style={Default.container}>
      <ScrollView>
        <Header navigation={props.navigation} showBackgroundImage />

        <TouchableOpacity
          style={[styles.backButtonStyle]}
          onPress={() =>
            props.route.params.prevPage
              ? [
                  props.navigation.navigate(props.route.params.prevPage),
                  (props.route.params.prevPage = null),
                ]
              : props.navigation.pop()
          }>
          <Icon
            type="font-awesome"
            name="chevron-left"
            size={14}
            color={Colors.text}
          />
        </TouchableOpacity>

        <Fetching isFetching={fetching}>
          <View style={styles.container}>
            <View style={styles.containerHeader}>
              <View style={styles.containerPhoto}>
                {user_profile?.image ? (
                  <View
                    styles={{
                      flex: 1,
                      flexDirection: 'row',
                      alignItems: 'center',
                    }}>
                    <Image
                      source={{ uri: user_profile.image.url }}
                      style={styles.userPhoto}
                    />
                    <Image
                      source={require('../../../assets/icons/ellipse.png')}
                      style={styles.borderPhoto}
                    />
                  </View>
                ) : (
                  <View
                    styles={{
                      flex: 1,
                      flexDirection: 'row',
                      alignItems: 'center',
                    }}>
                    <Image
                      source={require('../../../assets/images/no-profile.png')}
                      style={styles.userPhoto}
                    />
                    <Image
                      source={require('../../../assets/icons/ellipse.png')}
                      style={styles.borderPhoto}
                    />
                  </View>
                )}
              </View>
              <Text style={styles.textName}>{`${user_profile?.name}`}</Text>
            </View>

            {user_profile?.type_connection === 'connection' ? (
              <TouchableOpacity
                onPress={() => onRanking()}
                style={[styles.containerSection, { marginBottom: 8 }]}>
                <LinearGradient
                  colors={[
                    'rgba(156, 198, 255, 0.042)',
                    'rgba(0, 37, 68, 0.15)',
                  ]}
                  start={{ x: 0, y: 0.5 }}
                  end={{ x: 1, y: 0.5 }}
                  style={styles.containerScore}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Image
                      source={require('../../../assets/icons/medal-score.png')}
                      style={styles.iconMedal}
                    />
                    <Text style={styles.textRanking}>Ranking</Text>
                  </View>

                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Image
                      source={require('../../../assets/icons/ray.png')}
                      style={styles.iconRay}
                    />
                    <Text style={styles.textPositionRanking}>
                      {user_profile?.ranking}
                    </Text>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            ) : null}

            <TouchableOpacity
              onPress={() => onConnections()}
              style={[styles.containerSection, { marginBottom: 8 }]}>
              <LinearGradient
                colors={['rgba(156, 198, 255, 0.042)', 'rgba(0, 37, 68, 0.15)']}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={styles.containerConnection}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Image
                    source={require('../../../assets/icons/users-selected.png')}
                    style={{ width: 24, height: 24, marginRight: 8 }}
                  />
                  <Text style={styles.textTotalConnections}>
                    {user_profile?.connections} Connections
                  </Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>

            {user_profile?.type_connection === 'not_connection' ? (
              <TouchableOpacity
                style={styles.containerButtonAddConnection}
                onPress={() => sendInvite()}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Image
                    source={require('../../../assets/icons/user-plus.png')}
                    style={{ width: 24, height: 24, marginRight: 8 }}
                  />
                  <Text style={styles.titleInvite}>ADD CONNECTION</Text>
                </View>
              </TouchableOpacity>
            ) : null}

            {user_profile?.type_connection === 'connection' ? (
              <View style={styles.containerButton}>
                <Button
                  buttonStyle={styles.buttonConnection}
                  titleStyle={styles.titleInvite}
                  onPress={() => breakConnection()}
                  title="BREAK CONNECTION"
                />
              </View>
            ) : null}

            {user_profile?.type_connection === 'invited' ? (
              <View style={styles.containerButton}>
                <Button
                  buttonStyle={styles.buttonConnection}
                  titleStyle={styles.titleInvite}
                  onPress={() => doCancelConnection()}
                  title="CANCEL CONNECTION REQUEST"
                />
              </View>
            ) : null}

            {user_profile?.type_connection === 'pending' ? (
              <View>
                <View style={{ flexDirection: 'row' }}>
                  <View style={styles.containerButton}>
                    <Button
                      buttonStyle={styles.buttonInvite}
                      titleStyle={styles.titleInvite}
                      ViewComponent={LinearGradient}
                      linearGradientProps={{
                        colors: ['#72C6EF', '#004E8F'],
                        start: { x: 0, y: 0.5 },
                        end: { x: 1, y: 0.5 },
                      }}
                      onPress={() => answerInvite(true)}
                      title="Accept"
                    />
                  </View>
                  <View style={[styles.containerButton, { marginLeft: 16 }]}>
                    <Button
                      buttonStyle={[
                        styles.buttonInvite,
                        {
                          backgroundColor: 'transparent',
                          borderColor: '#9CC6FF',
                        },
                      ]}
                      titleStyle={styles.titleInvite}
                      onPress={() => answerInvite(false)}
                      title="Decline"
                    />
                  </View>
                </View>
                <View style={[styles.containerGroup, { flexDirection: 'row' }]}>
                  <View style={styles.containerProfile}>
                    <Image
                      source={require('../../../assets/icons/users.png')}
                      style={{ width: 23, height: 28 }}
                    />
                    <Text
                      ellipsizeMode="tail"
                      numberOfLines={1}
                      style={styles.textConnections}>
                      Connections
                    </Text>
                    <Text style={styles.textTotalConnections}>
                      {user_profile?.connections}
                    </Text>
                  </View>
                </View>
              </View>
            ) : null}

            <View style={styles.containerInfo}>
              <View style={styles.containerCard}>
                <Text style={styles.textInfo}>Quote to live by</Text>
                {user_profile?.usr_quote_to_live_by !== '' &&
                user_profile?.usr_quote_to_live_by !== null ? (
                  <Text style={styles.textDescriptionInfo}>
                    {user_profile?.usr_quote_to_live_by}
                  </Text>
                ) : (
                  <Text style={styles.textNoInfos}>
                    No quotes for this user.
                  </Text>
                )}
              </View>
            </View>

            <View style={styles.containerBiggest}>
              <View style={styles.containerCardBiggest}>
                <Text style={styles.textInfo}>Biggest</Text>
                <Text style={styles.textInfo}>Hack in Life</Text>
                {user_profile?.usr_biggest_hack !== '' &&
                user_profile?.usr_biggest_hack !== null ? (
                  <Text style={styles.textDescriptionInfo}>
                    {user_profile?.usr_biggest_hack}
                  </Text>
                ) : (
                  <Text style={styles.textNoInfos}>
                    No biggest hack in life for this user.
                  </Text>
                )}
              </View>
              <View style={styles.containerCardBiggest}>
                <Text style={styles.textInfo}>Biggest Challenge</Text>
                {user_profile?.usr_biggest_challenge !== '' &&
                user_profile?.usr_biggest_hack !== null ? (
                  <Text style={styles.textDescriptionInfo}>
                    {user_profile?.usr_biggest_challenge}
                  </Text>
                ) : (
                  <Text style={styles.textNoInfos}>
                    No biggest challenge for this user.
                  </Text>
                )}
              </View>
            </View>

            <LinearGradient
              colors={['rgba(156, 198, 255, 0.042)', 'rgba(0, 37, 68, 0.15)']}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={styles.containerList}>
              <View>
                <Text style={[styles.textInfo, { marginLeft: 16 }]}>
                  Communities Public
                </Text>
                {communities.data?.length > 0 ? (
                  <TouchableOpacity
                    style={styles.containerSeeAll}
                    onPress={() =>
                      props.navigation.push('UserCommunity', {
                        user: user_profile?.id,
                      })
                    }>
                    <View style={styles.textSeeAll}>
                      <Text style={styles.textInfo}>See All</Text>
                    </View>
                  </TouchableOpacity>
                ) : null}
              </View>
              {communities.data?.length > 0 ? (
                <FlatList
                  contentContainerStyle={{ paddingRight: 16 }}
                  horizontal
                  data={communities.data}
                  keyExtractor={(item, index) => String(index)}
                  showsHorizontalScrollIndicator={false}
                  snapToAlignment={'start'}
                  scrollEventThrottle={16}
                  decelerationRate="fast"
                  renderItem={({ item }) => (
                    <CardCommunity
                      community={item}
                      type={item.title}
                      navigation={props.navigation}
                    />
                  )}
                />
              ) : (
                <View style={styles.containerEmpty}>
                  <Text style={styles.textEmpty}>
                    No public communities yet.
                  </Text>
                </View>
              )}
            </LinearGradient>

            <LinearGradient
              colors={['rgba(156, 198, 255, 0.042)', 'rgba(0, 37, 68, 0.15)']}
              locations={[0, 0.21]}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={styles.containerList}>
              <View>
                <Text style={[styles.textInfo, { marginLeft: 16 }]}>
                  Daily Habits
                </Text>
                {list_habits.length > 0 ? (
                  <TouchableOpacity
                    style={styles.containerSeeAll}
                    onPress={() =>
                      props.navigation.push('UserHabit', {
                        user: user_profile?.id,
                      })
                    }>
                    <View style={styles.textSeeAll}>
                      <Text style={styles.textInfo}>See All</Text>
                    </View>
                  </TouchableOpacity>
                ) : null}
              </View>
              {list_habits.length > 0 ? (
                <FlatList
                  contentContainerStyle={{ paddingRight: 16 }}
                  horizontal={true}
                  data={list_habits}
                  keyExtractor={(item, index) => String(index)}
                  showsHorizontalScrollIndicator={false}
                  snapToAlignment={'start'}
                  scrollEventThrottle={16}
                  decelerationRate="fast"
                  renderItem={({ item }) => (
                    <CardHabits
                      habit={item.hab.habit}
                      timeline
                      type={list_habits.title}
                      navigation={props.navigation}
                      isMomentum={true}
                      currentStreak={item.hab.ush_current_streak}
                    />
                  )}
                />
              ) : (
                <View style={styles.containerEmpty}>
                  <Text style={styles.textEmpty}>No habits yet.</Text>
                </View>
              )}
            </LinearGradient>

            <View style={styles.containerBiggest}>
              <View
                style={[
                  styles.containerCardBiggest,
                  user_profile?.image_food || user_profile?.image_book
                    ? { height: 315, justifyContent: 'space-between' }
                    : null,
                ]}>
                <Text style={styles.textBiggest}>Favorite Book</Text>
                {user_profile?.image_book ? (
                  <>
                    <Text style={styles.textNameFavorite}>
                      {user_profile?.usr_favorite_book}
                    </Text>
                    <View style={styles.containerFavorite}>
                      <Image
                        source={{ uri: user_profile?.image_book?.url }}
                        style={styles.imageFavorite}
                        resizeMode="cover"
                      />
                    </View>
                  </>
                ) : (
                  <Text style={styles.textNoInfos}>No favorite book yet.</Text>
                )}
              </View>
              <View
                style={[
                  styles.containerCardBiggest,
                  user_profile?.image_food || user_profile?.image_book
                    ? { height: 315, justifyContent: 'space-between' }
                    : null,
                ]}>
                <Text style={styles.textBiggest}>Favorite Food</Text>
                {user_profile?.image_food ? (
                  <>
                    <Text style={styles.textNameFavorite}>
                      {user_profile?.usr_favorite_food}
                    </Text>
                    <View style={styles.containerFavorite}>
                      <Image
                        source={{ uri: user_profile?.image_food?.url }}
                        style={styles.imageFavorite}
                        resizeMode="cover"
                      />
                    </View>
                  </>
                ) : (
                  <Text style={styles.textNoInfos}>No favorite food yet.</Text>
                )}
              </View>
            </View>
          </View>
        </Fetching>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    width: Dimensions.get('window').width,
  },
  containerHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  containerPhoto: {
    flexDirection: 'row',
  },
  userPhoto: {
    alignSelf: 'center',
    width: 70,
    height: 70,
    borderRadius: 32,
    marginTop: 5,
    position: 'absolute',
  },
  borderPhoto: {
    alignSelf: 'center',
    width: 80,
    height: 80,
    borderRadius: 32,
    position: 'relative',
  },
  containerScore: {
    borderRadius: 8,
    padding: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconMedal: {
    marginRight: 8,
    alignSelf: 'center',
    width: 32,
    height: 32,
  },
  iconRay: {
    marginRight: 8,
    alignSelf: 'center',
    width: 24,
    height: 24,
  },
  containerConnection: {
    borderRadius: 8,
    padding: 28,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  containerInfo: {
    width: Dimensions.get('window').width,
    marginBottom: 8,
    alignSelf: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'rgba(13, 40, 65, 1)',
  },
  containerCard: {
    borderRadius: 4,
    flexDirection: 'column',
    alignItems: 'flex-start',
    padding: 16,
    backgroundColor: 'rgba(14, 49, 80, 1)',
    width: Dimensions.get('window').width - 32,
  },
  textInfo: {
    color: Colors.text,
    fontWeight: '700',
    fontSize: 16,
    lineHeight: 16,
  },
  textDescriptionInfo: {
    fontSize: 18,
    fontWeight: '400',
    lineHeight: 27,
    color: Colors.text,
    marginTop: 16,
  },
  textNoInfos: {
    marginTop: 16,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: 'bold',
    color: Colors.text,
    textAlign: 'justify',
    alignSelf: 'flex-start',
  },
  containerBiggest: {
    flexGrow: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignSelf: 'center',
    alignItems: 'flex-start',
    padding: 16,
    backgroundColor: 'rgba(13, 40, 65, 1)',
    width: Dimensions.get('window').width,
    marginBottom: 8,
  },
  containerCardBiggest: {
    display: 'flex',
    height: '100%',
    flexDirection: 'column',
    width: (Dimensions.get('window').width - 48) / 2,
    backgroundColor: 'rgba(156, 198, 255, 0.042)',
    borderRadius: 4,
    padding: 16,
    alignItems: 'flex-start',
    backgroundColor: 'rgba(14, 49, 80, 1)',
  },
  containerList: {
    marginBottom: 8,
    paddingVertical: 16,
    zIndex: 1,
    elevation: 1,
    marginHorizontal: -16,
  },
  textSeeAll: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignSelf: 'flex-end',
    marginRight: 16,
  },
  containerSeeAll: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignSelf: 'flex-end',
    marginLeft: 16,
    zIndex: 4,
    elevation: 4,
    position: 'absolute',
  },
  textEmpty: {
    fontSize: 12,
    lineHeight: 16,
    height: 16,
    fontWeight: 'bold',
    color: Colors.text,
    marginLeft: 16,
  },
  containerEmpty: {
    alignSelf: 'flex-start',
    marginRight: 16,
    marginTop: 16,
  },
  textBiggest: {
    color: Colors.text,
    fontWeight: '700',
    fontSize: 16,
    lineHeight: 22.4,
  },
  textName: {
    fontSize: 24,
    color: Colors.text,
    marginTop: 8,
  },
  containerTitle: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#264261',
    paddingBottom: 8,
    marginBottom: 19,
  },
  textTitle: {
    fontSize: 16,
    color: Colors.text,
    fontWeight: 'bold',
  },
  containerSection: {
    marginBottom: 40,
  },
  containerAchievement: {
    backgroundColor: Colors.primary2,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderRadius: 4,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  containerAchievementName: {
    flexDirection: 'row',
  },
  achievementHabitNme: {
    color: Colors.text,
    paddingVertical: 20,
    marginLeft: 15,
    fontSize: 12,
  },
  containerAchievementCategory: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  achievementCategory: {
    marginLeft: 8,
    fontSize: 12,
    color: Colors.text,
  },
  containerProfile: {
    flex: 1,
    width: (Dimensions.get('window').width - 64) / 2,
    backgroundColor: 'rgba(156, 198, 255, 0.042)',
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  containerGroup: {
    flexDirection: 'row',
    marginBottom: 24,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  textConnections: {
    color: Colors.text,
    flexShrink: 1,
    fontWeight: '400',
    letterSpacing: -0.02,
    fontSize: 20,
    lineHeight: 27,
  },
  textTotalConnections: {
    color: Colors.text,
    fontWeight: '600',
    letterSpacing: -0.02,
    fontSize: 13,
    lineHeight: 16,
    alignContent: 'center',
  },
  textRanking: {
    color: Colors.text,
    fontWeight: '400',
    letterSpacing: -0.02,
    fontSize: 20,
    lineHeight: 27,
  },
  textPositionRanking: {
    color: Colors.text,
    fontWeight: '700',
    letterSpacing: -0.02,
    fontSize: 16,
    lineHeight: 16,
    alignSelf: 'center',
  },
  containerButton: {
    marginBottom: 8,
    alignItems: 'center',
  },
  containerButtonAddConnection: {
    marginBottom: 8,
    borderRadius: 4,
    padding: 16,
    alignItems: 'center',
    backgroundColor: '#992538',
  },
  buttonConnection: {
    height: 56,
    borderRadius: 4,
    backgroundColor: '#992538',
    width: Dimensions.get('window').width - 32,
    marginHorizontal: 16,
  },
  buttonInvite: {
    height: 56,
    borderRadius: 30,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'transparent',
    width: (Dimensions.get('window').width - 64) / 2,
    alignItems: 'center',
  },
  titleDefaultButton: {
    fontSize: 16,
    lineHeight: 21,
    color: Colors.primary4,
    alignContent: 'center',
  },
  titleInvite: {
    fontSize: 16,
    lineHeight: 21,
    color: 'white',
    alignContent: 'center',
  },
  backButtonStyle: {
    width: 50,
    height: 50,
    marginTop: -33,
    marginLeft: 12,
    marginBottom: -33,
  },
});
export default Profile;
