import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Dimensions,
  Image,
  FlatList,
  Text,
  RefreshControl,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  Share,
} from 'react-native';
import Default from '../../../assets/styles/Default';
import Colors from '../../../assets/styles/Colors';
import Fetching from '../../components/Fetching';
import Header from '../../components/Header';
// import { useDispatch, useSelector } from "react-redux";
import { Button } from 'react-native-elements';
import { systemWeights } from 'react-native-typography';
import moment from 'moment';
// import {
//   logout,
//   updateInfos,
//   getUserInfos,
//   userLogged,
// } from "../../store/ducks/user";
import { LinearGradient } from 'expo-linear-gradient';
import CardHabits from '../../components/community/CardHabits';
import CardCommunity from '../../components/community/CardCommunity';
import AsyncStorage from '@react-native-async-storage/async-storage';

const mockUser = {
  name: 'Kylie Jenner',
  image: { url: 'https://via.placeholder.com/70' },
  usr_quote_to_live_by: "It's not just a bag! It's Prada.",
  usr_biggest_hack: 'Botox of course.',
  usr_biggest_challenge: 'Being nice to my fans.',
  usr_favorite_book: 'To Kill a Mockingbird',
  image_book: { url: 'https://via.placeholder.com/150' },
  usr_favorite_food: 'Caviar',
  image_food: { url: 'https://via.placeholder.com/150' },
};

const Profile = props => {
  const [fetching, setFetching] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [text_quote, setTextQuote] = useState('');
  const [text_hack, setTextHack] = useState('');
  const [text_challenge, setTextChallenge] = useState('');
  const [last_user_score, setLastUserScore] = useState(null);
  const [can_review_score, setCanReviewScore] = useState(false);
  const [connections, setConnections] = useState([]);
  const [list_habits, setListHabits] = useState('');
  const [communities, setCommunities] = useState([]);
  const [modal, setModal] = useState(false);
  const [modal_type, setModalType] = useState('');

  //   const user = useSelector(({ user }) => user);

  //   const dispatch = useDispatch();

  const RBSExit = useRef();

  useEffect(() => {
    setInfos();
    fetchAll(true, false, false);
  }, []);

  useEffect(() => {
    const unsubscribe = props.navigation.addListener('focus', () => {
      fetchAll(false, false, true);
    });

    return unsubscribe;
  }, [props.navigation, fetchAll]);

  const setInfos = () => {
    mockUser?.usr_quote_to_live_by
      ? setTextQuote(mockUser?.usr_quote_to_live_by)
      : null;
    mockUser?.usr_biggest_hack ? setTextHack(mockUser?.usr_biggest_hack) : null;
    mockUser?.usr_biggest_challenge
      ? setTextChallenge(mockUser?.usr_biggest_challenge)
      : null;
  };

  const fetchAll = async (isFetching, isRefreshing, force) => {
    if (force || isFetching) {
      isRefreshing
        ? setRefreshing(true)
        : isFetching
          ? setFetching(true)
          : null;

      // Simulating API call
      setTimeout(() => {
        let habits_aux = [];

        setConnections([]);
        setCommunities([]);
        setLastUserScore(null);
        setListHabits(habits_aux);

        setFetching(false);
        setRefreshing(false);
      }, 1000);
    }
  };

  const onConnections = () => {
    props.navigation.navigate('Connections');
  };

  const onRanking = () => {
    props.navigation.navigate('Ranking');
  };

  const sendInfo = () => {
    let request = {
      type_info: modal_type,
      user_info:
        modal_type === 'quote'
          ? text_quote
          : modal_type === 'hack'
            ? text_hack
            : modal_type === 'challenge'
              ? text_challenge
              : null,
    };

    // Simulating API call
    Alert.alert('Info Saved', JSON.stringify(request));
  };

  const shareMyProfile = async () => {
    const urlAndroid =
      'https://play.google.com/store/apps/details?id=com.alex.live.timeless';
    const urlApple =
      'https://apps.apple.com/br/app/live-timeless/id1556115926?l=en';
    const message =
      'Check my profile on Live Timeless App.\nAndroid Link: ' +
      urlAndroid +
      '\nApple Link: ' +
      urlApple;

    try {
      const result = await Share.share({
        title: 'Join to my community in Live Timeless App',
        message,
        url: urlApple,
      });
      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          // shared with activity type of result.activityType
        } else {
        }
      } else if (result.action === Share.dismissedAction) {
        // dismissed
      }
    } catch (error) {
      alert(error.message);
    }
  };

  const handleLogout = () => {
    AsyncStorage.getAllKeys()
      .then(keys => AsyncStorage.multiRemove(keys))
      .then(() => navigation.reset({ index: 0, routes: [{ name: 'Login' }] }));
  };

  return (
    <View style={Default.container}>
      <ScrollView
        refreshControl={
          <RefreshControl
            colors={['#fff']}
            tintColor="#fff"
            onRefresh={() => fetchAll(false, true, true)}
            refreshing={refreshing}
          />
        }>
        <Header navigation={props.navigation} showBackgroundImage />

        <Fetching isFetching={fetching}>
          <View style={styles.container}>
            <View style={styles.containerHeader}>
              <View style={styles.containerPhoto}>
                {mockUser.image ? (
                  <View
                    styles={{
                      flex: 1,
                      flexDirection: 'row',
                      alignItems: 'center',
                    }}>
                    <Image
                      source={{ uri: mockUser.image.url }}
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
              <Text style={styles.textName} numberOfLines={1}>
                {`Hi, ${mockUser.name}`}
              </Text>
            </View>

            <View style={styles.containerActionsHeader}>
              <TouchableOpacity
                style={styles.editProfile}
                onPress={shareMyProfile}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Image
                    source={require('../../../assets/icons/share-profile.png')}
                    style={styles.iconsHeader}
                  />
                  <Text style={styles.editProfileText}>Share My Profile</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.editProfile}
                onPress={() => props.navigation.navigate('UpdateProfile')}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Image
                    source={require('../../../assets/icons/edit.png')}
                    style={styles.iconsHeader}
                  />
                  <Text style={styles.editProfileText}>Edit Profile</Text>
                </View>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={() => onRanking()}
              style={[styles.containerSection, { marginBottom: 8 }]}>
              <LinearGradient
                colors={['rgba(156, 198, 255, 0.042)', 'rgba(0, 37, 68, 0.15)']}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={styles.containerScore}>
                {last_user_score ? (
                  <>
                    <View
                      style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Image
                        source={require('../../../assets/icons/medal-score.png')}
                        style={styles.iconMedal}
                      />
                      <Text style={styles.textInfo}>Ranking</Text>
                    </View>

                    <View
                      style={{ flexDirection: 'row', alignItems: 'center' }}>
                      {can_review_score ? (
                        <TouchableOpacity
                          onPress={() => props.navigation.push('ScoreForm')}>
                          <Text style={styles.textReviewScore}>
                            Review Score
                          </Text>
                        </TouchableOpacity>
                      ) : null}
                      <Image
                        source={require('../../../assets/icons/ray.png')}
                        style={styles.iconRay}
                      />
                      <Text style={styles.userScore}>
                        {last_user_score.uss_score?.toFixed(0)}
                      </Text>
                    </View>
                  </>
                ) : (
                  <>
                    <View
                      style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Image
                        source={require('../../../assets/icons/medal-score.png')}
                        style={styles.iconMedal}
                      />
                      <Text style={styles.textInfo}>Ranking</Text>
                    </View>

                    <Button
                      buttonStyle={styles.btnGetScore}
                      titleStyle={styles.titleBtnGetScore}
                      onPress={() => props.navigation.push('ScoreForm')}
                      title="Get your score"
                    />
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>

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
                  <Text style={styles.textTotalConnections}>{connections}</Text>
                  <Text style={styles.textConnections}>Connections</Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => props.navigation.navigate('SavedPost')}
              style={[styles.containerSection, { marginBottom: 8 }]}>
              <LinearGradient
                colors={['rgba(156, 198, 255, 0.042)', 'rgba(0, 37, 68, 0.15)']}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={styles.containerSaved}>
                <Image
                  source={require('../../../assets/icons/bookmark-bordered.png')}
                  style={{ width: 24, height: 24, marginRight: 13 }}
                />
                <Text style={styles.textInfo}>Saved Items</Text>
              </LinearGradient>
            </TouchableOpacity>

            <Button
              buttonStyle={styles.healthHabitReportButton}
              titleStyle={Default.loginButtonBoldTitle}
              onPress={() => props.navigation.navigate('HealthHabitReport')}
              title="Health Habits Report"
            />

            <View style={styles.containerInfo}>
              <View style={styles.containerCard}>
                <Text style={styles.textInfo}>Quote to live by</Text>
                {mockUser?.usr_quote_to_live_by !== '' &&
                mockUser?.usr_quote_to_live_by !== null ? (
                  <>
                    <Text style={styles.textDescriptionInfo}>
                      {mockUser?.usr_quote_to_live_by}
                    </Text>
                    <TouchableOpacity
                      onPress={() => {
                        setModal(!modal), setModalType('quote');
                      }}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        marginTop: 16,
                      }}>
                      <Text style={styles.textTouchable}>Edit</Text>
                      <Image
                        source={require('../../../assets/icons/edit.png')}
                        style={{ marginLeft: 8, width: 20, height: 20 }}
                      />
                    </TouchableOpacity>
                  </>
                ) : (
                  <TouchableOpacity
                    onPress={() => {
                      setModal(!modal), setModalType('quote');
                    }}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      marginTop: 16,
                    }}>
                    <Text style={styles.textTouchable}>Phrases</Text>
                    <Image
                      source={require('../../../assets/icons/arrow-up-right.png')}
                      style={{ marginLeft: 8, width: 20, height: 20 }}
                    />
                  </TouchableOpacity>
                )}
              </View>
            </View>

            <View style={styles.containerBiggest}>
              <View style={styles.containerCardBiggest}>
                <Text style={styles.textBiggest}>Biggest</Text>
                <Text style={styles.textBiggest}>Hack in Life</Text>
                <View
                  style={{
                    flex: 1,
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}>
                  {mockUser?.usr_biggest_hack !== '' &&
                  mockUser?.usr_biggest_hack !== null ? (
                    <>
                      <Text style={styles.textDescriptionInfo}>
                        {mockUser?.usr_biggest_hack}
                      </Text>
                      <TouchableOpacity
                        onPress={() => {
                          setModal(!modal), setModalType('hack');
                        }}
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          marginTop: 16,
                        }}>
                        <Text style={styles.textTouchable}>Edit</Text>
                        <Image
                          source={require('../../../assets/icons/edit.png')}
                          style={{ marginLeft: 8, width: 20, height: 20 }}
                        />
                      </TouchableOpacity>
                    </>
                  ) : (
                    <>
                      <Text style={styles.textDescriptionInfo}></Text>
                      <TouchableOpacity
                        onPress={() => {
                          setModal(!modal), setModalType('hack');
                        }}
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          marginTop: 16,
                        }}>
                        <Text style={styles.textTouchable}>Hacks</Text>
                        <Image
                          source={require('../../../assets/icons/arrow-up-right.png')}
                          style={{ marginLeft: 8, width: 20, height: 20 }}
                        />
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              </View>
              <View style={styles.containerCardBiggest}>
                <Text style={styles.textBiggest}>Biggest Challenge</Text>
                <View
                  style={{
                    flex: 1,
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}>
                  {mockUser?.usr_biggest_challenge !== '' &&
                  mockUser?.usr_biggest_challenge !== null ? (
                    <>
                      <Text style={styles.textDescriptionInfo}>
                        {mockUser?.usr_biggest_challenge}
                      </Text>

                      <TouchableOpacity
                        onPress={() => {
                          setModal(!modal), setModalType('challenge');
                        }}
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          marginTop: 16,
                        }}>
                        <Text style={styles.textTouchable}>Edit</Text>
                        <Image
                          source={require('../../../assets/icons/edit.png')}
                          style={{ marginLeft: 8, width: 20, height: 20 }}
                        />
                      </TouchableOpacity>
                    </>
                  ) : (
                    <>
                      <Text style={styles.textDescriptionInfo}></Text>
                      <TouchableOpacity
                        onPress={() => {
                          setModal(!modal), setModalType('challenge');
                        }}
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          marginTop: 16,
                        }}>
                        <Text style={styles.textTouchable}>Challenges</Text>
                        <Image
                          source={require('../../../assets/icons/arrow-up-right.png')}
                          style={{ marginLeft: 8, width: 20, height: 20 }}
                        />
                      </TouchableOpacity>
                    </>
                  )}
                </View>
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
                {communities?.length > 0 ? (
                  <TouchableOpacity
                    style={styles.containerSeeAll}
                    onPress={() => props.navigation.push('UserCommunity')}>
                    <View style={styles.textSeeAll}>
                      <Text style={styles.textInfo}>See All</Text>
                    </View>
                  </TouchableOpacity>
                ) : null}
              </View>
              {communities?.length > 0 ? (
                <FlatList
                  contentContainerStyle={{ paddingRight: 16 }}
                  horizontal
                  data={communities}
                  keyExtractor={(item, index) => String(index)}
                  showsHorizontalScrollIndicator={false}
                  snapToAlignment={'start'}
                  scrollEventThrottle={16}
                  decelerationRate="fast"
                  renderItem={({ item }) => (
                    <CardCommunity
                      community={item}
                      type={'My Communities'}
                      navigation={props.navigation}
                    />
                  )}
                />
              ) : (
                <View style={styles.containerEmpty}>
                  <Text style={styles.textEmpty}>
                    We don't have any public communities yet.
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
                    onPress={() => props.navigation.push('UserHabit')}>
                    <View style={styles.textSeeAll}>
                      <Text style={styles.textInfo}>See All</Text>
                    </View>
                  </TouchableOpacity>
                ) : null}
              </View>
              {list_habits?.length > 0 ? (
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
                      type={list_habits.title}
                      navigation={props.navigation}
                      isMomentum={true}
                      currentStreak={item.hab.ush_current_streak}
                      myHabit={true}
                      userHabit={item.hab.id}
                    />
                  )}
                />
              ) : (
                <View style={styles.containerEmpty}>
                  <Text style={styles.textEmpty}>
                    We don't have habits yet.
                  </Text>
                </View>
              )}
            </LinearGradient>

            <View style={styles.containerBiggest}>
              <View style={[styles.containerCardBiggest]}>
                <Text style={styles.textBiggest}>Favorite Book</Text>
                <View
                  style={{
                    flex: 1,
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}>
                  {mockUser.image_book ? (
                    <>
                      <Text style={styles.textNameFavorite} numberOfLines={3}>
                        {mockUser?.usr_favorite_book}
                      </Text>
                      <View style={styles.containerFavorite}>
                        <Image
                          source={{ uri: mockUser.image_book?.url }}
                          style={styles.imageFavorite}
                          resizeMode="cover"
                        />
                      </View>
                    </>
                  ) : null}
                  <TouchableOpacity
                    onPress={() => props.navigation.push('UpdateFavoriteBook')}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      marginTop: 16,
                    }}>
                    <Text style={styles.textTouchable}>Edit</Text>
                    <Image
                      source={require('../../../assets/icons/edit.png')}
                      style={{ marginLeft: 8, width: 16, height: 16 }}
                    />
                  </TouchableOpacity>
                </View>
              </View>
              <View style={[styles.containerCardBiggest]}>
                <Text style={styles.textBiggest}>Favorite Food</Text>
                <View
                  style={{
                    flex: 1,
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}>
                  {mockUser.image_food ? (
                    <View
                      style={{
                        flex: 1,
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                      }}>
                      <Text style={styles.textNameFavorite} numberOfLines={3}>
                        {mockUser?.usr_favorite_food}
                      </Text>
                      <View style={styles.containerFavorite}>
                        <Image
                          source={{ uri: mockUser.image_food?.url }}
                          style={styles.imageFavorite}
                          resizeMode="cover"
                        />
                      </View>
                    </View>
                  ) : null}
                  <TouchableOpacity
                    onPress={() => props.navigation.push('UpdateFavoriteFood')}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      marginTop: 16,
                    }}>
                    <Text style={styles.textTouchable}>Edit</Text>
                    <Image
                      source={require('../../../assets/icons/edit.png')}
                      style={{ marginLeft: 8, width: 16, height: 16 }}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <View style={styles.containerSection}>
              <View style={styles.containerButton}>
                <TouchableOpacity
                  style={{ marginTop: 24, marginBottom: -24 }}
                  onPress={() => {
                    handleLogout();
                  }}>
                  <View style={{ alignItems: 'center' }}>
                    <Text style={[systemWeights.bold, styles.logoutText]}>
                      Logout
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          </View>
          <Modal
            animationType="slide"
            transparent={true}
            visible={modal}
            onRequestClose={() => setModal(!modal)}>
            <View style={styles.centeredView}>
              <View style={styles.modalView}>
                <TouchableOpacity
                  style={[styles.containerHeaderModal, { marginRight: 20 }]}
                  onPress={() => setModal(!modal)}>
                  <Image
                    style={styles.imageModalHeader}
                    source={require('../../../assets/icons/close.png')}
                  />
                </TouchableOpacity>
                {modal_type === 'quote' ? (
                  <View style={styles.containerSectionModal}>
                    <Text style={styles.textLabelModal}>Quote to live by</Text>
                    <TextInput
                      value={text_quote}
                      numberOfLines={4}
                      multiline
                      onChangeText={setTextQuote}
                      keyboardAppearance="dark"
                      style={styles.textInputStyle}
                      placeholder="..."
                      placeholderTextColor={'#9CC6FF'}
                    />
                  </View>
                ) : modal_type === 'hack' ? (
                  <View style={styles.containerSectionModal}>
                    <Text style={styles.textLabelModal}>
                      Biggest Hack in life
                    </Text>
                    <TextInput
                      value={text_hack}
                      numberOfLines={4}
                      multiline
                      onChangeText={setTextHack}
                      keyboardAppearance="dark"
                      style={styles.textInputStyle}
                      placeholder="..."
                      placeholderTextColor={'#9CC6FF'}
                    />
                  </View>
                ) : modal_type === 'challenge' ? (
                  <View style={styles.containerSectionModal}>
                    <Text style={styles.textLabelModal}>Biggest Challenge</Text>
                    <TextInput
                      value={text_challenge}
                      numberOfLines={4}
                      multiline
                      onChangeText={setTextChallenge}
                      keyboardAppearance="dark"
                      style={styles.textInputStyle}
                      placeholder="..."
                      placeholderTextColor={'#9CC6FF'}
                    />
                  </View>
                ) : null}
                <View style={styles.containerSectionModal}>
                  <Button
                    buttonStyle={[styles.modalButton]}
                    disabledStyle={[styles.modalButton]}
                    titleStyle={Default.loginButtonBoldTitle}
                    onPress={sendInfo}
                    title={'SAVE'}
                    disabled={fetching}
                    loading={fetching}
                  />
                </View>
              </View>
            </View>
          </Modal>
          {modal ? (
            <View
              onPress={() => setModal(!modal)}
              style={styles.containerShadow}></View>
          ) : null}
        </Fetching>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 15,
    paddingTop: 28,
    marginTop: -38,
    width: Dimensions.get('window').width,
    zIndex: 1,
    elevation: 1,
  },
  containerHeader: {
    flexDirection: 'column',
    alignSelf: 'center',
    alignItems: 'center',
    marginBottom: 32,
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
    position: 'relative',
  },
  borderPhoto: {
    alignSelf: 'center',
    width: 80,
    height: 80,
    borderRadius: 32,
    position: 'absolute',
  },
  containerFavorite: {
    //flex: 1,
    marginTop: 16,
    height: 191,
    width: (Dimensions.get('window').width - 110) / 2,
    borderRadius: 4,
    alignSelf: 'flex-end',
  },
  imageFavorite: {
    height: '100%',
    width: '100%',
    borderRadius: 4,
  },
  favoriteImage: {
    width: '100%',
    height: '100%',
  },
  iconsHeader: {
    marginRight: 4,
    alignSelf: 'center',
    width: 16,
    height: 16,
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
  textName: {
    fontSize: 24,
    color: Colors.text,
    marginTop: 14,
    alignSelf: 'center',
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
  containerShadow: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    zIndex: 1,
    elevation: 1,
    position: 'absolute',
    marginTop: -58,
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  },
  containerActionsHeader: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 34,
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
    borderRadius: 8,
  },
  textEmpty: {
    fontSize: 12,
    lineHeight: 16,
    height: 16,
    fontWeight: 'bold',
    color: Colors.text,
    marginLeft: 16,
  },
  containerBlur: {
    zIndex: 1,
    elevation: 1,
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    marginTop: -3,
  },
  warningIconStyle: {
    width: 80,
    height: 80,
  },
  containerScore: {
    borderRadius: 8,
    padding: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  containerConnection: {
    borderRadius: 8,
    padding: 28,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  containerSaved: {
    borderRadius: 8,
    padding: 28,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  containerProfile: {
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  containerCard: {
    borderRadius: 4,
    flexDirection: 'column',
    alignItems: 'flex-start',
    padding: 16,
    backgroundColor: 'rgba(14, 49, 80, 1)',
    width: Dimensions.get('window').width - 32,
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
    borderRadius: 4,
    padding: 16,
    alignItems: 'flex-start',
    backgroundColor: 'rgba(14, 49, 80, 1)',
  },
  containerGroup: {
    flexDirection: 'row',
    marginBottom: 24,
    justifyContent: 'space-between',
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
  textConnections: {
    color: Colors.text,
    fontWeight: '600',
    letterSpacing: -0.02,
    fontSize: 10,
    lineHeight: 10,
    marginTop: 3,
  },
  textTotalConnections: {
    color: Colors.text,
    fontSize: 13,
    lineHeight: 10,
    fontWeight: '600',
    textAlign: 'center',
    paddingTop: 3,
    marginRight: 4,
    marginTop: 4,
  },
  textRanking: {
    color: Colors.text,
    fontWeight: '400',
    letterSpacing: -0.02,
    fontSize: 20,
    lineHeight: 27,
  },
  textPositionRanking: {
    color: Colors.primary4,
    fontWeight: '700',
    letterSpacing: -0.02,
    fontSize: 20,
    lineHeight: 27,
    alignContent: 'center',
  },
  textInfo: {
    color: Colors.text,
    fontWeight: '700',
    fontSize: 16,
    lineHeight: 16,
  },
  textBiggest: {
    color: Colors.text,
    fontWeight: '700',
    fontSize: 16,
    lineHeight: 22.4,
  },
  textNameFavorite: {
    color: Colors.primary8,
    fontWeight: '700',
    fontSize: 14,
    lineHeight: 16,
  },
  textTouchable: {
    color: Colors.primary8,
    fontWeight: '700',
    fontSize: 14,
    lineHeight: 21,
  },
  textReviewScore: {
    color: Colors.primary4,
    fontSize: 14,
    lineHeight: 19,
    textDecorationLine: 'underline',
    //marginTop: 6
  },
  userScore: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    lineHeight: 16,
  },
  ratingUserScore: {
    fontSize: 16,
    lineHeight: 19,
    color: Colors.text,
  },
  btnGetScore: {
    backgroundColor: Colors.primary3,
    borderRadius: 4,
    paddingHorizontal: 35,
    paddingVertical: 12,
  },
  titleBtnGetScore: {
    color: Colors.text,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: 'bold',
  },
  containerButton: {
    marginTop: 12,
    marginBottom: 22,
    alignItems: 'center',
  },
  buttonProducts: {
    height: 56,
    borderRadius: 30,
    backgroundColor: 'transparent',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#9CC6FF',
    width: Dimensions.get('window').width - 44,
    marginHorizontal: 24,
  },
  titleProducts: {
    fontSize: 16,
    lineHeight: 21,
    color: Colors.primary4,
    alignContent: 'center',
  },
  containerEmpty: {
    alignSelf: 'flex-start',
    marginRight: 16,
    marginTop: 16,
  },
  logoutText: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '700',
    color: 'white',
  },
  editProfile: {
    alignSelf: 'flex-end',
  },
  editProfileText: {
    fontSize: 14,
    lineHeight: 19,
    color: Colors.primary8,
    fontWeight: '700',
  },
  centeredView: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalView: {
    borderRadius: 4,
    marginHorizontal: 32,
    alignItems: 'flex-start',
    shadowColor: '#000',
    paddingBottom: 50,
    paddingTop: 16,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    width: Dimensions.get('window').width - 44,
    shadowOpacity: 0.25,
    shadowRadius: 4,
    backgroundColor: '#082139',
  },
  containerTextModal: {
    alignContent: 'center',
  },
  textInputStyle: {
    color: Colors.primary4,
    borderColor: '#455c8a',
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 2,
    fontSize: 16,
    paddingHorizontal: 12,
    paddingTop: 13,
    height: 96,
    backgroundColor: Colors.primary,
    textAlignVertical: 'top',
    marginBottom: 26,
    marginTop: 12,
  },
  textDescriptionStyle: {
    color: Colors.text,
    textAlignVertical: 'top',
  },
  nextButton: {
    height: 64,
    borderRadius: 4,
    backgroundColor: '#982538',
    width: Dimensions.get('window').width - 48,
  },
  modalButton: {
    height: 56,
    borderRadius: 4,
    backgroundColor: '#982538',
  },
  modalInput: {
    borderColor: '#455c8a',
    color: Colors.primary4,
    fontSize: 16,
    width: Dimensions.get('window').width - 80,
  },
  containerHeaderModal: {
    flexDirection: 'row',
    alignSelf: 'flex-end',
    marginBottom: 12,
  },
  imageModalHeader: {
    width: 24,
    resizeMode: 'contain',
    height: 24,
  },
  containerSectionModal: {
    alignSelf: 'center',
    width: Dimensions.get('window').width - 80,
    zIndex: 5,
    elevation: 5,
  },
  textLabelModal: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 16,
    color: Colors.text,
  },
  textDescriptionInfo: {
    fontSize: 18,
    fontWeight: '400',
    lineHeight: 27,
    color: Colors.text,
    marginTop: 16,
  },
  healthHabitReportButton: {
    height: 64,
    borderRadius: 8,
    marginTop: 16,
    marginBottom: 16,
    backgroundColor: 'transparent',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#9CC6FF',
    width: Dimensions.get('window').width - 32,
  },
});
export default Profile;
