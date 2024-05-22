import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  Text,
  RefreshControl,
  ScrollView,
  Image,
  FlatList,
  SectionList,
  SafeAreaView,
  Keyboard,
  TouchableOpacity,
  Alert,
  Modal,
  Share,
} from 'react-native';
import Default from '../../../assets/styles/Default';
import moment from 'moment';
import Colors from '../../../assets/styles/Colors';
import Fetching from '../../components/Fetching';
import Icon from 'react-native-vector-icons/FontAwesome5';
// import {
//   get as getCommunity,
//   sendRequest as joinCommunity,
//   updateAutomaticPublish,
//   listHabits,
// } from "../../store/ducks/community";
import { useSelector } from 'react-redux';
import { LinearGradient } from 'expo-linear-gradient';
import { Button } from 'react-native-elements';
import { BlurView } from 'expo-blur';
import CardHabits from '../../components/community/CardHabits';

const ViewCommunity = props => {
  const [fetching, setFetching] = useState(false);
  const [fetching_habits, setFetchingHabits] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [modalSucess, setModalSucess] = useState(false);
  const [modalSucessPrivate, setModalSucessPrivate] = useState(false);
  const [publish_automatic, setPublishAutomatic] = useState(false);
  const [community, setCommunity] = useState({});
  const [admins_info, setAdminsInfo] = useState('');
  const [moderators_info, setModeratorsInfo] = useState('');
  const [option_bar, setOptionBar] = useState(2);
  const [see_all, setSeeAll] = useState(false);
  const user = useSelector(({ user }) => user);
  const [list_habits, setListHabits] = useState('');

  const RBSDelete = useRef();

  useEffect(() => {
    fetchCommunity(true, false);
  }, [props]);

  const fetchCommunity = (is_fetching, is_refreshing) => {
    is_fetching
      ? setFetching(true)
      : is_refreshing
        ? setRefreshing(true)
        : null;

    getCommunity(props.route.params.community.id)
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
            setCommunity(res.data);

            let admins = res.data?.admins_moderators.filter(
              item => item.cme_role === 'ADMIN'
            );
            let moderators = res.data?.admins_moderators.filter(
              item => item.cme_role === 'MODERATOR'
            );

            if (admins?.length === 1) {
              setAdminsInfo(
                admins[0]?.user?.name?.split(' ', 1) + ' is administrator. '
              );
            } else if (admins?.length > 1) {
              let aux = admins
                .map((obj, i) => {
                  return (
                    (i + 1 === admins.length
                      ? 'and ' + obj.user.name.split(' ', 1)
                      : obj.user.name.split(' ', 1)) +
                    (i + 2 === admins.length ? '' : ',')
                  );
                })
                .join(' ');

              setAdminsInfo(aux.slice(0, -1) + ' are administrators. ');
            }

            if (moderators?.length === 1) {
              setModeratorsInfo(
                moderators[0]?.user?.name?.split(' ', 1) + ' is moderator. '
              );
            } else if (moderators?.length > 1) {
              let aux = moderators
                .map((obj, i) => {
                  return (
                    (i + 1 === moderators.length
                      ? 'and ' + obj.user.name.split(' ', 1)
                      : obj.user.name.split(' ', 1)) +
                    (i + 2 === moderators.length ? '' : ',')
                  );
                })
                .join(' ');

              setModeratorsInfo(aux.slice(0, -1) + ' are moderators.');
            }
          }
        }
      })
      .finally(() => {
        setFetching(false);
        setRefreshing(false);
      });
  };

  useEffect(() => {
    if (option_bar === 1) {
      setFetchingHabits(true);
      fetchHabits();
      // return () => {
      //    setListPosts([]);
      // }
    }
  }, [option_bar]);

  const fetchHabits = () => {
    listHabits(community.id)
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
            setListHabits(res.data);
          }
        }
      })
      .finally(() => {
        setFetchingHabits(false);
      });
  };

  const handleJoinCommunity = () => {
    let request = {
      cme_id_community: community.id,
    };

    joinCommunity(request)
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
            community.com_private
              ? setModalSucessPrivate(true)
              : setModalSucess(true);
            fetchCommunity(false, false);
          }
        }
      })
      .finally(() => {});
  };

  const shareCommunity = async () => {
    const urlAndroid =
      'https://play.google.com/store/apps/details?id=com.alex.live.timeless';
    const urlApple =
      'https://apps.apple.com/br/app/live-timeless/id1556115926?l=en';
    const message =
      'Check my community ' +
      community?.com_name +
      ' on Live Timeless App.\nAndroid Link: ' +
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

  const inputSearchTheme = {
    colors: {
      primary: Colors.primary4,
      text: '#FFFFFF',
      placeholder: Colors.primary4,
    },
    fonts: {
      regular: {
        fontSize: 12,
        lineHeight: 16,
        fontWeight: 'normal',
      },
    },
    roundness: 8,
  };

  const handleNextModal = () => {
    setRefreshing(true);
    setModalSucess(false);
    if (!community.com_private) {
      props.navigation.push('FeedCommunity', {
        community: { id: community.id, option: 3 },
      });
    }
    setRefreshing(false);
  };

  const setAutomaticPost = value => {
    setRefreshing(true);
    setPublishAutomatic(value);

    updateAutomaticPublish(community.id, { cme_automatic_posting: value })
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
          }
        }
      })
      .finally(() => {
        setRefreshing(false);
      });
    setRefreshing(false);
  };

  return (
    <View style={Default.container}>
      <ScrollView
        scrollEnabled
        refreshControl={
          <RefreshControl
            colors={['#000']}
            tintColor="#fff"
            onRefresh={() => fetchCommunity(false, true)}
            refreshing={refreshing}
          />
        }>
        <Fetching isFetching={fetching}>
          <View style={styles.container}>
            <SafeAreaView style={{ flex: 1 }}>
              <View style={styles.containerHeaderImage}>
                <Image
                  source={{ uri: community.image?.url }}
                  style={styles.communityImage}
                  resizeMode="cover"
                />

                <TouchableOpacity
                  style={styles.backButton}
                  onPress={() =>
                    props.route.params?.backPop
                      ? props.navigation.pop()
                      : props.navigation.navigate('CommunityIndex')
                  }>
                  <Icon
                    type="font-awesome"
                    name="chevron-left"
                    size={16}
                    color="white"
                  />
                </TouchableOpacity>

                {community.com_private ? (
                  <View style={styles.typeCommunity}>
                    <Image
                      source={require('../../../assets/icons/icon-privacy.png')}
                      style={styles.headerIcon}
                    />
                    <Text style={styles.typeCommunityText}>
                      Private community
                    </Text>
                  </View>
                ) : null}
              </View>

              <View style={styles.containerTitle}>
                <Text style={styles.textTitle}>{community.com_name}</Text>
              </View>

              {community.members?.length > 0 && !community.com_private ? (
                <View style={styles.containerMembers}>
                  {community.members?.length > 0 ? (
                    <View
                      style={{ flexDirection: 'row', alignItems: 'center' }}>
                      {community.members.map((obj, i) => {
                        return obj.user?.image ? (
                          <Image
                            key={i}
                            style={[
                              styles.imageModalHeader,
                              { marginRight: -6 },
                            ]}
                            source={{ uri: obj.user?.image?.url }}
                          />
                        ) : (
                          <Image
                            key={i}
                            style={[
                              styles.imageModalHeader,
                              { marginRight: -6 },
                            ]}
                            source={require('../../../assets/images/no-profile.png')}
                          />
                        );
                      })}
                      <Image
                        source={require('../../../assets/icons/ellipse-separator.png')}
                        style={styles.ellipseIcon}
                      />
                      <Text style={styles.typeCommunityText}>
                        {community.members_count} members
                      </Text>
                    </View>
                  ) : null}

                  {!community.com_private ? (
                    <Button
                      buttonStyle={styles.shareButton}
                      titleStyle={Default.loginButtonBoldTitle}
                      onPress={shareCommunity}
                      icon={{ name: 'share', size: 20, color: 'white' }}
                      title={'Share'}
                    />
                  ) : null}
                </View>
              ) : null}

              <View style={styles.containerNavBar}>
                <TouchableOpacity
                  style={[
                    styles.containerItemNavBar,
                    option_bar === 1
                      ? {
                          borderBottomColor: 'rgba(153, 37, 56, 1)',
                          borderBottomWidth: 2,
                        }
                      : null,
                  ]}
                  onPress={() => setOptionBar(1)}>
                  <Text style={styles.textPost}>Habits</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.containerItemNavBar,
                    option_bar === 2
                      ? {
                          borderBottomColor: 'rgba(153, 37, 56, 1)',
                          borderBottomWidth: 2,
                        }
                      : null,
                  ]}
                  onPress={() => setOptionBar(2)}>
                  <Text style={styles.textPost}>About</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.containerButton}>
                {community.user_member?.cme_approved === 0 &&
                community.user_member?.cme_active ? (
                  <Button
                    buttonStyle={styles.joinButton}
                    titleStyle={Default.loginButtonBoldTitle}
                    onPress={handleJoinCommunity}
                    title={'PENDING APPROVAL'}
                  />
                ) : (
                  <Button
                    buttonStyle={styles.joinButton}
                    titleStyle={Default.loginButtonBoldTitle}
                    onPress={handleJoinCommunity}
                    title={'JOIN COMMUNITY'}
                  />
                )}
              </View>

              <View style={styles.containerBody}>
                {option_bar === 2 ? (
                  <>
                    <LinearGradient
                      colors={[
                        'rgba(156, 198, 255, 0.042)',
                        'rgba(0, 37, 68, 0.15)',
                      ]}
                      start={{ x: 0, y: 0.5 }}
                      end={{ x: 1, y: 0.5 }}
                      style={styles.containerList}>
                      <View style={styles.infoCommunity}>
                        <Text style={styles.textInfo}>
                          {community.com_description}
                        </Text>
                      </View>
                      <View style={styles.infoCommunity}>
                        <View style={styles.containerInfo}>
                          <Image
                            source={require('../../../assets/icons/icon-privacy.png')}
                            style={styles.infoIcon}
                          />
                          <Text style={styles.textTitleSection}>
                            {community.com_private ? 'Private' : 'Public'}
                          </Text>
                        </View>
                        <Text style={styles.textInfo}>
                          {community.com_private
                            ? 'Only members can see who is in the Community  and what is published in it. '
                            : 'Anyone can see who is in the group and what is posted in it. '}
                        </Text>
                      </View>
                      <View style={styles.infoCommunity}>
                        <View style={styles.containerInfo}>
                          <Image
                            source={require('../../../assets/icons/eye.png')}
                            style={styles.infoIcon}
                          />
                          <Text style={styles.textTitleSection}>Visible</Text>
                        </View>
                        <Text style={styles.textInfo}>
                          {community.com_private
                            ? 'Anyone can find the Community '
                            : 'Anyone can find the Community '}
                        </Text>
                      </View>
                    </LinearGradient>

                    <LinearGradient
                      colors={[
                        'rgba(156, 198, 255, 0.042)',
                        'rgba(0, 37, 68, 0.15)',
                      ]}
                      start={{ x: 0, y: 0.5 }}
                      end={{ x: 1, y: 0.5 }}
                      style={styles.containerList}>
                      <View style={styles.infoCommunity}>
                        <Text style={styles.textTitleSection}>
                          Administrators' Rules
                        </Text>
                        {community.rules?.length > 0
                          ? community.rules.map((rul, i) => {
                              return (
                                <View key={i} style={{ marginBottom: 12 }}>
                                  <Text
                                    style={[
                                      styles.textTitleSection,
                                      {
                                        marginTop: 8,
                                        marginLeft: 4,
                                        marginBottom: -1,
                                      },
                                    ]}>
                                    {i + 1}. {rul.cor_title}
                                  </Text>
                                  <Text style={styles.textInfo}>
                                    {rul.cor_description}
                                  </Text>
                                </View>
                              );
                            })
                          : null}
                      </View>
                    </LinearGradient>

                    <LinearGradient
                      colors={[
                        'rgba(156, 198, 255, 0.042)',
                        'rgba(0, 37, 68, 0.15)',
                      ]}
                      start={{ x: 0, y: 0.5 }}
                      end={{ x: 1, y: 0.5 }}
                      style={styles.containerList}>
                      <View style={styles.infoCommunity}>
                        <Text style={styles.textTitleSection}>
                          Administrators and moderators
                        </Text>
                        <View style={styles.containerAdmins}>
                          {community.admins_moderators?.length > 0
                            ? community.admins_moderators.map((obj, i) => {
                                return (
                                  <View
                                    key={i}
                                    style={{
                                      flexDirection: 'row',
                                      marginRight: 16,
                                      marginBottom: 16,
                                    }}>
                                    {obj.user.image ? (
                                      <Image
                                        source={{ uri: obj.user.image?.url }}
                                        style={styles.adminsPhoto}
                                      />
                                    ) : (
                                      <Image
                                        source={require('../../../assets/images/no-profile.png')}
                                        style={styles.adminsPhoto}
                                      />
                                    )}
                                    <View
                                      style={{
                                        flexDirection: 'column',
                                        justifyContent: 'flex-start',
                                      }}>
                                      <Text style={styles.textUserName}>
                                        {obj.user.name.split(' ', 1)}
                                      </Text>
                                      <Text style={styles.textSubtitle}>
                                        {obj.cme_role}
                                      </Text>
                                    </View>
                                  </View>
                                );
                              })
                            : null}
                        </View>
                        <View>
                          <Text style={styles.textInfo}>
                            {admins_info + moderators_info}
                          </Text>
                        </View>
                      </View>
                    </LinearGradient>

                    <LinearGradient
                      colors={[
                        'rgba(156, 198, 255, 0.042)',
                        'rgba(0, 37, 68, 0.15)',
                      ]}
                      start={{ x: 0, y: 0.5 }}
                      end={{ x: 1, y: 0.5 }}
                      style={styles.containerList}>
                      <View style={styles.infoCommunity}>
                        <Text style={styles.textTitleSection}>
                          Community Activities
                        </Text>
                        <View
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            marginTop: 17,
                          }}>
                          <Image
                            source={require('../../../assets/icons/icon-comment.png')}
                            style={styles.infoIcon}
                          />
                          <Text style={styles.textUserName}>
                            {community.post_count} new publications today
                          </Text>
                        </View>

                        <Text style={styles.textCountPosts}>
                          {community.last_month_post_count} publications in the
                          last month
                        </Text>

                        <View
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            marginTop: 17,
                          }}>
                          <Image
                            source={require('../../../assets/icons/users-white.png')}
                            style={styles.infoIcon}
                          />
                          <Text style={styles.textUserName}>
                            Created{' '}
                            {moment().diff(
                              moment(community?.created_at).format(
                                'YYYY-MM-DD'
                              ),
                              'months'
                            )}{' '}
                            months ago
                          </Text>
                        </View>
                      </View>
                    </LinearGradient>

                    <View style={styles.containerButton}>
                      {community.user_member?.cme_approved === 0 &&
                      community.user_member?.cme_active ? (
                        <Button
                          buttonStyle={styles.joinButton}
                          titleStyle={Default.loginButtonBoldTitle}
                          onPress={handleJoinCommunity}
                          title={'PENDING APPROVAL'}
                        />
                      ) : (
                        <Button
                          buttonStyle={styles.joinButton}
                          titleStyle={Default.loginButtonBoldTitle}
                          onPress={handleJoinCommunity}
                          title={'JOIN COMMUNITY'}
                        />
                      )}
                    </View>
                  </>
                ) : (
                  <Fetching isFetching={fetching_habits}>
                    <LinearGradient
                      colors={
                        list_habits.length === 0 && see_all
                          ? ['rgba(0, 37, 68, 0.15)', 'rgba(0, 37, 68, 0.15)']
                          : [
                              'rgba(156, 198, 255, 0.042)',
                              'rgba(0, 37, 68, 0.15)',
                            ]
                      }
                      locations={[0, 0.21]}
                      start={{ x: 0, y: 0.5 }}
                      end={{ x: 1, y: 0.5 }}
                      style={
                        see_all
                          ? [styles.containerViewSection, { paddingBottom: 32 }]
                          : [styles.containerListHabits, { marginBottom: 0 }]
                      }>
                      <View
                        style={
                          see_all ? { marginBottom: 16 } : { marginBottom: 0 }
                        }>
                        <Text style={styles.sectionHeader}>Daily Habits</Text>
                        {list_habits.length > 0 ? (
                          <TouchableOpacity
                            style={styles.containerSeeAll}
                            onPress={() => setSeeAll(!see_all)}>
                            <View style={styles.textSeeAll}>
                              <Text style={styles.sectionHeader}>
                                {see_all ? 'Dismiss' : 'See All'}
                              </Text>
                            </View>
                          </TouchableOpacity>
                        ) : null}
                      </View>

                      {!see_all ? (
                        <>
                          {list_habits.length > 0 ? (
                            <FlatList
                              key={!see_all ? 'h' : 'v'}
                              contentContainerStyle={{ paddingRight: 16 }}
                              horizontal={!see_all}
                              data={list_habits}
                              keyExtractor={(item, index) => String(index)}
                              showsHorizontalScrollIndicator={false}
                              scrollEnabled={!see_all}
                              snapToAlignment={'start'}
                              scrollEventThrottle={16}
                              decelerationRate="fast"
                              numColumns={see_all ? 2 : 0}
                              renderItem={({ item }) => (
                                <CardHabits
                                  community={community}
                                  habit={item?.habit}
                                  type={list_habits.title}
                                  navigation={props.navigation}
                                  communityHabit={item?.id}
                                  admin={false}
                                  onlyViewMode
                                />
                              )}
                            />
                          ) : (
                            <View style={styles.textEmpty}>
                              <Text style={styles.textNoHabits}>
                                We don't have any Habits yet
                              </Text>
                            </View>
                          )}
                        </>
                      ) : (
                        <View
                          style={[styles.containerHabits, { marginTop: -16 }]}>
                          {list_habits.length > 0
                            ? list_habits.map((obj, i) => {
                                return (
                                  <View key={i}>
                                    <CardHabits
                                      community={community}
                                      habit={obj?.habit}
                                      type={obj.title}
                                      navigation={props.navigation}
                                      communityHabit={obj?.id}
                                      admin={false}
                                      onlyViewMode
                                    />
                                  </View>
                                );
                              })
                            : null}
                        </View>
                      )}
                    </LinearGradient>
                  </Fetching>
                )}
              </View>

              <Modal
                animationType="slide"
                transparent={true}
                visible={modalSucess}
                onRequestClose={handleNextModal}>
                <View style={styles.centeredView}>
                  <View style={styles.modalView}>
                    <View style={styles.containerSectionSucessModal}>
                      <TouchableOpacity
                        style={styles.containerHeaderModal}
                        onPress={handleNextModal}>
                        <Image
                          style={styles.imageModalHeader}
                          source={require('../../../assets/icons/close.png')}
                        />
                      </TouchableOpacity>

                      <LinearGradient
                        colors={[
                          'rgba(1, 50, 91, 0.5)',
                          'rgba(48, 46, 80, 0.5)',
                          'rgba(237, 28, 36, 0.2)',
                        ]}
                        start={{ x: 0, y: 0.8 }}
                        end={{ x: 0.8, y: 1 }}
                        style={styles.typeCommunityModal}>
                        <Image
                          source={require('../../../assets/icons/icon-privacy.png')}
                          style={styles.headerIcon}
                        />
                        <Text style={styles.typeCommunityText}>
                          {community.com_private
                            ? 'Private community'
                            : 'Public community'}
                        </Text>
                      </LinearGradient>

                      <View style={styles.containerTextModal}>
                        <Text style={styles.textSucessModal}>
                          Your application has
                        </Text>
                        <Text style={styles.textSucessModal}>
                          been approved!
                        </Text>
                      </View>

                      <TouchableOpacity
                        onPress={() => setAutomaticPost(!publish_automatic)}
                        style={styles.containerAutomaticPublish}>
                        {publish_automatic ? (
                          <Image
                            source={require('../../../assets/icons/circle-selected.png')}
                            style={styles.circleIcon}
                          />
                        ) : (
                          <Image
                            source={require('../../../assets/icons/circle.png')}
                            style={styles.circleIcon}
                          />
                        )}
                        <View style={{ flex: 1, marginLeft: 16 }}>
                          <Text style={styles.textInfoModal}>
                            Do you want to automatically publish your actions on
                            the community timeline?
                          </Text>
                        </View>
                      </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        alignSelf: 'center',
                        marginTop: 32,
                      }}
                      onPress={handleNextModal}>
                      <Text style={styles.inviteText}>Community Rules</Text>
                      <Image
                        style={[styles.imageModalHeader, { marginLeft: 13 }]}
                        source={require('../../../assets/icons/arrow-right.png')}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              </Modal>

              <Modal
                animationType="slide"
                transparent={true}
                visible={modalSucessPrivate}
                onRequestClose={() =>
                  setModalSucessPrivate(!modalSucessPrivate)
                }>
                <View style={styles.centeredView}>
                  <View style={styles.modalView}>
                    <View style={styles.containerSectionSucessModal}>
                      <TouchableOpacity
                        style={styles.containerHeaderModal}
                        onPress={() =>
                          setModalSucessPrivate(!modalSucessPrivate)
                        }>
                        <Image
                          style={styles.imageModalHeader}
                          source={require('../../../assets/icons/close.png')}
                        />
                      </TouchableOpacity>

                      <LinearGradient
                        colors={[
                          'rgba(1, 50, 91, 0.5)',
                          'rgba(48, 46, 80, 0.5)',
                          'rgba(237, 28, 36, 0.2)',
                        ]}
                        start={{ x: 0, y: 0.8 }}
                        end={{ x: 0.8, y: 1 }}
                        style={styles.typeCommunityModal}>
                        <Image
                          source={require('../../../assets/icons/icon-privacy.png')}
                          style={styles.headerIcon}
                        />
                        <Text style={styles.typeCommunityText}>
                          {community.com_private
                            ? 'Private community'
                            : 'Public community'}
                        </Text>
                      </LinearGradient>

                      <View style={styles.containerTextModal}>
                        <Text style={styles.textSucessModal}>
                          {community.com_name}
                        </Text>
                      </View>

                      <View style={styles.containerAutomaticPublish}>
                        <View style={{ flex: 1, marginLeft: 16 }}>
                          <Text
                            style={[
                              styles.textInfoModal,
                              { textAlign: 'center' },
                            ]}>
                            Your membership approval is pending. The group
                            administrators will review your request to join.{' '}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>
                </View>
              </Modal>
            </SafeAreaView>
          </View>
        </Fetching>

        {modalSucess || modalSucessPrivate ? (
          <>
            <BlurView style={styles.containerBlur} tint="dark" intensity={20} />
            <View style={styles.containerShadow}></View>
          </>
        ) : null}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: Dimensions.get('window').width,
    zIndex: 1,
    elevation: 1,
  },
  containerBody: {
    flex: 1,
    alignItems: 'flex-start',
    marginHorizontal: 4,
    zIndex: 4,
    elevation: 4,
  },
  containerHeaderImage: {
    height: 189,
    flex: 1,
    justifyContent: 'flex-end',
    width: Dimensions.get('window').width,
    zIndex: 0,
    elevation: 0,
  },
  containerTitle: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignSelf: 'center',
    paddingVertical: 16,
    width: Dimensions.get('window').width - 32,
  },
  containerList: {
    marginBottom: 8,
    paddingHorizontal: 16,
    paddingTop: 16,
    zIndex: 1,
    elevation: 1,
    width: Dimensions.get('window').width,
  },
  containerButton: {
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 16,
  },
  containerMembers: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 16,
    height: 40,
  },
  containerAutomaticPublish: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    width: Dimensions.get('window').width - 76,
  },
  circleIcon: {
    width: 32,
    height: 32,
  },
  containerShadow: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    zIndex: 1,
    elevation: 1,
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
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
  textSucessModal: {
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 33,
    color: Colors.text,
  },
  adminsPhoto: {
    width: 38,
    height: 38,
    borderRadius: 32,
    marginRight: 12,
    //marginLeft: 16,
  },
  containerHeaderModal: {
    flexDirection: 'row',
    alignSelf: 'flex-end',
    marginBottom: 12,
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
  containerSectionSucessModal: {
    flexDirection: 'column',
    alignSelf: 'center',
    alignItems: 'center',
    width: Dimensions.get('window').width - 76,
  },
  containerSectionModal: {
    alignSelf: 'center',
    width: Dimensions.get('window').width - 80,
    zIndex: 5,
    elevation: 5,
  },
  typeCommunityModal: {
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    borderRadius: 4,
    padding: 9,
  },
  inviteText: {
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 24,
    color: Colors.primary8,
  },
  infoMembers: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: Dimensions.get('window').width - 211,
  },
  containerAdmins: {
    flex: 1,
    flexDirection: 'row',
    //justifyContent: 'flex-start',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    marginTop: 16,
  },
  joinButton: {
    height: 64,
    borderRadius: 4,
    backgroundColor: '#982538',
    width: Dimensions.get('window').width - 32,
  },
  textUserName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 22,
    color: Colors.text,
  },
  textCountPosts: {
    flex: 1,
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 21,
    color: Colors.text,
    marginTop: 9,
  },
  textSubtitle: {
    fontWeight: '400',
    fontSize: 13,
    lineHeight: 18,
    color: '#FCFCFC',
  },
  headerIcon: {
    width: 18,
    height: 18,
    marginRight: 3,
  },
  infoIcon: {
    width: 24,
    height: 24,
    marginRight: 8,
  },
  ellipseIcon: {
    width: 4,
    height: 4,
    marginLeft: 14,
    marginRight: 8,
    alignSelf: 'center',
    left: 0,
  },
  backButton: {
    marginLeft: 25,
    marginTop: 32,
    width: 60,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    top: 0,
    zIndex: 3,
    elevation: 3,
    position: 'absolute',
  },
  imageModalHeader: {
    resizeMode: 'cover',
    width: 24,
    height: 24,
    borderRadius: 62,
    //marginRight: 12,
    //marginLeft: 16,
  },
  typeCommunity: {
    marginLeft: 32,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(48, 46, 80, 0.5)',
    width: Dimensions.get('window').width - 215,
    borderRadius: 4,
    padding: 9,
  },
  containerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputSearch: {
    flex: 1,
    fontSize: 16,
    lineHeight: 16,
    backgroundColor: '#002544',
    borderRadius: 8,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  shareButton: {
    height: 40,
    borderRadius: 4,
    padding: 8,
    backgroundColor: 'rgba(153, 37, 56, 1)',
    width: 163,
  },
  containerHeader: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 18,
    marginTop: 16,
  },
  infoCommunity: {
    marginBottom: 17,
  },
  textTitleSection: {
    fontWeight: '700',
    fontSize: 16,
    lineHeight: 16,
    color: '#FCFCFC',
  },
  textInfo: {
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 19,
    color: '#FFFFFF',
    marginTop: 8,
  },
  textInfoModal: {
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 21,
    color: '#FFFFFF',
  },
  textTitle: {
    fontWeight: '700',
    fontSize: 20,
    lineHeight: 30,
    color: '#FCFCFC',
    width: Dimensions.get('window').width - 78,
  },
  typeCommunityText: {
    fontWeight: '600',
    fontSize: 13,
    lineHeight: 16,
    color: '#FCFCFC',
  },
  communityImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  containerNavBar: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: Dimensions.get('window').width - 32,
    alignSelf: 'center',
    alignItems: 'center',
  },
  containerItemNavBar: {
    alignItems: 'center',
    width: (Dimensions.get('window').width - 32) / 2,
    paddingBottom: 8,
  },
  textPost: {
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 21,
    color: '#FFFFFF',
    marginHorizontal: 16,
  },
  containerHabits: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    //alignItems: 'center',
  },
  sectionHeader: {
    fontWeight: '700',
    fontSize: 16,
    lineHeight: 16,
    color: '#FCFCFC',
    marginLeft: 16,
    zIndex: 2,
    elevation: 2,
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
  containerListHabits: {
    //height: 268,
    marginBottom: 8,
    paddingVertical: 16,
    zIndex: 1,
    elevation: 1,
  },
  containerViewSection: {
    flex: 1,
    paddingTop: 16,
    zIndex: 1,
    elevation: 1,
  },
  textSeeAll: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignSelf: 'flex-end',
    marginRight: 16,
  },
  textEmpty: {
    alignSelf: 'flex-start',
    marginRight: 16,
    marginTop: 16,
  },
  textNoHabits: {
    fontSize: 12,
    lineHeight: 16,
    height: 16,
    fontWeight: 'bold',
    color: Colors.text,
    marginLeft: 16,
  },
});

export default ViewCommunity;
