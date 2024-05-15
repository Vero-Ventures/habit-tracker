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
import CardCommunity from '../../components/community/CardCommunity';
import { listPublicCommunities } from '../../store/ducks/community';

const UserCommunity = props => {
  const [fetching, setFetching] = useState(false);
  const [loading, setLoading] = useState(false);
  const [user_id, setUserId] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [load_more, setLoadMore] = useState(true);

  const [list_communities, setListCommunities] = useState([]);

  const [page, setPage] = useState(0);

  useEffect(() => {
    fetchCommunities(true, false);
  }, []);

  useEffect(() => {
    const unsubscribe = props.navigation.addListener('focus', () => {
      fetchCommunities(false, false);
    });

    return unsubscribe;
  }, [props.navigation, fetchCommunities]);

  const fetchCommunities = (isFetching, isRefreshing) => {
    isFetching ? setFetching(true) : isRefreshing ? setRefreshing(true) : null;

    let request = {
      page: 0,
    };

    props.route?.params?.user
      ? [
          (request.cme_id_user = props.route.params.user),
          setUserId(props.route?.params?.user),
        ]
      : null;

    listPublicCommunities(request)
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
            setListCommunities(res.data.data);

            if (res.data?.current_page === res.data?.last_page) {
              setLoadMore(false);
              setPage(0);
            } else {
              setLoadMore(true);
            }
          }
        }
      })
      .finally(() => {
        setFetching(false);
        setRefreshing(false);
      });
  };

  const loadMore = () => {
    let communities_aux = [];
    let number_page = page + 1;

    setPage(number_page);
    setLoading(true);

    let request = {
      page: number_page,
    };

    user_id ? (request.cme_id_user = user_id) : null;

    listPublicCommunities(request)
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
            communities_aux = [...list_communities];
            communities_aux = communities_aux.concat(res.data.data);

            setListCommunities(communities_aux);

            if (res.data?.current_page === res.data?.last_page) {
              setLoadMore(false);
              setPage(0);
            }
          }

          setLoading(false);
        }
      });
  };

  const isCloseToBottom = ({
    layoutMeasurement,
    contentOffset,
    contentSize,
  }) => {
    const paddingToBottom = 15;
    return (
      layoutMeasurement.height + contentOffset.y >=
      contentSize.height - paddingToBottom
    );
  };

  return (
    <View style={Default.container}>
      <ScrollView
        onScroll={({ nativeEvent }) => {
          if (
            list_communities.length > 0 &&
            load_more &&
            isCloseToBottom(nativeEvent)
          ) {
            loadMore();
          }
        }}
        scrollEnabled
        refreshControl={
          <RefreshControl
            colors={['#000']}
            tintColor="#fff"
            onRefresh={() => fetchCommunities(false, true)}
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
                  Communities
                </Text>
              </View>
              <View
                style={[styles.containerViewSection, { paddingBottom: 32 }]}>
                <View style={styles.containerHabits}>
                  {list_communities.length > 0
                    ? list_communities.map((obj, i) => {
                        return (
                          <View key={i}>
                            <CardCommunity
                              community={obj}
                              type={'My Communities'}
                              navigation={props.navigation}
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

export default UserCommunity;
