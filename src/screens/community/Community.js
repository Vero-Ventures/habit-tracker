import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  StyleSheet,
  Alert,
  Dimensions,
  Text,
  FlatList,
  ScrollView,
  SafeAreaView,
  Keyboard,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import Default from "../../../assets/styles/Default";
import Colors from "../../../assets/styles/Colors";
import Fetching from "../../components/Fetching";
import CardCommunity from "../../components/community/CardCommunity";
import { searchCommunity, getByCategory } from "../../store/ducks/community";
import { TextInput } from "react-native-paper";
// import { useSelector } from "react-redux";
import { LinearGradient } from "expo-linear-gradient";
import debounce from "lodash.debounce";
import { Button } from "react-native-elements";

const Community = (props) => {
  const [fetching, setFetching] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [load_more, setLoadMore] = useState(true);
  const [category, setCategory] = useState("");
  const [communities, setCommunities] = useState([]);
  const [section_community, setSectionCommunity] = useState([]);
  const [see_all, setSeeAll] = useState(false);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
//   const user = useSelector(({ user }) => user);

  const RBSDelete = useRef();

  useEffect(() => {
    getCommunities(search, true, false);

    setPage(0);
    setSeeAll(false);
  }, []);

  useEffect(() => {
    const unsubscribe = props.navigation.addListener("focus", () => {
      if (see_all) {
        fetchCategory(search, category);
        return;
      }

      getCommunities("", false, false, false);
    });

    return unsubscribe;
  }, [
    props.navigation,
    search,
    category,
    see_all,
    fetchCategory,
    getCommunities,
  ]);

  const getCommunities = (filter, is_fetching, is_refreshing, force) => {
    if (filter === "" || force) {
      is_refreshing
        ? setRefreshing(true)
        : is_fetching
          ? setFetching(true)
          : null;

      searchCommunity({ search: filter })
        .catch((err) => {
          Alert.alert(
            "Ops!",
            "Something went wrong with our servers. Please contact us.",
          );
        })
        .then((res) => {
          if (res?.status === 200) {
            if (res.data.errors) {
              Alert.alert("Ops!", res.data.errors[0]);
            } else {
              setCommunities(res.data);
            }
          }
        })
        .finally(() => {
          setRefreshing(false);
          setFetching(false);
        });
    }
  };

  const onSearch = useCallback(
    debounce((filter) => {
      if (see_all) {
        fetchCategory(filter, category);
      } else {
        getCommunities(filter, false, false, true);
      }
    }, 700),
    [],
  );

  const onChangeSearchText = (filter) => {
    setSearch(filter);
    onSearch(filter);
  };

  const addCommunity = () => {
    props.navigation.navigate("CreateCommunity");
  };

  const verifySession = (session) => {
    return session === 0
      ? "my_communities"
      : session === 1
        ? "public_communities"
        : session === 2
          ? "private_communities"
          : null;
  };

  const formatTextCategory = (text) => {
    return text === "my_communities"
      ? "My Communities"
      : text === "public_communities"
        ? "Public Communities"
        : text === "private_communities"
          ? "Private Communities"
          : null;
  };

  const fetchCategory = (search, category) => {
    setFetching(true);

    let request = {
      page: 0,
      search: search,
      category: category,
    };

    getByCategory(request)
      .catch((err) => {
        Alert.alert(
          "Ops!",
          "Something went wrong with our servers. Please contact us.",
        );
      })
      .then((res) => {
        if (res?.status === 200) {
          if (res.data.errors) {
            Alert.alert("Ops!", res.data.errors[0]);
          } else {
            res.data.data.title = formatTextCategory(category);
            setSectionCommunity(res.data.data);
          }

          if (res.data.current_page === res.data.last_page) {
            setLoadMore(false);
            setPage(0);
          } else {
            setLoadMore(true);
          }
        }
      })
      .finally(() => {
        setFetching(false);
      });
  };

  const viewSectionCommunity = (session) => {
    let option = verifySession(session);
    setCategory(option);
    setSeeAll(!see_all);
    fetchCategory(search, option);
  };

  const handleDismiss = () => {
    setSeeAll(!see_all);
    setSectionCommunity([]);
    getCommunities(search, true, false);
  };

  const loadMore = () => {
    let community_aux = [];
    let number_page = page + 1;

    setPage(number_page);
    setLoading(true);

    let request = {
      page: number_page,
      search: search,
      category: category,
    };

    getByCategory(request)
      .catch((err) => {
        Alert.alert(
          "Ops!",
          "Something went wrong with our servers. Please contact us.",
        );
      })
      .then((res) => {
        if (res?.status === 200) {
          if (res.data.errors) {
            Alert.alert("Ops!", res.data.errors[0]);
          } else {
            community_aux = [...section_community];
            community_aux = community_aux.concat(res.data.data);
            community_aux.title = formatTextCategory(category);

            setSectionCommunity(community_aux);

            if (res.data.current_page === res.data.last_page) {
              setLoadMore(false);
              setPage(0);
            }
          }
        }
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const inputSearchTheme = {
    colors: {
      primary: Colors.primary4,
      text: "#FFFFFF",
      placeholder: Colors.primary4,
    },
    fonts: {
      regular: {
        fontSize: 12,
        lineHeight: 16,
        fontWeight: "normal",
      },
    },
    roundness: 8,
  };

  const isCloseToBottom = ({
    layoutMeasurement,
    contentOffset,
    contentSize,
  }) => {
    const paddingToBottom = 10;
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
            see_all &&
            load_more &&
            section_community.length > 0 &&
            isCloseToBottom(nativeEvent) &&
            !loading
          ) {
            loadMore();
          }
        }}
        style={styles.container}
        refreshControl={
          <RefreshControl
            colors={["#fff"]}
            tintColor="#fff"
            onRefresh={() => getCommunities("", false, true, false)}
            refreshing={refreshing}
          />
        }
      >
        <SafeAreaView style={{ flex: 1 }}>
          <View style={styles.containerHeader}>
            <View style={styles.containerHeaderTitle}>
              <Text style={styles.textName}>Community</Text>
            </View>
          </View>

          <View style={styles.containerButton}>
            <Button
              buttonStyle={[
                Default.loginNextButton,
                { width: Dimensions.get("window").width - 48 },
              ]}
              titleStyle={Default.loginButtonBoldTitle}
              onPress={addCommunity}
              title={"CREATE COMMUNITY"}
            />
          </View>

          <View style={styles.containerSearch}>
            <TextInput
              value={search}
              keyboardAppearance="dark"
              onSubmitEditing={Keyboard.dismiss}
              returnKeyType="done"
              outlineColor="transparent"
              placeholder="Community"
              selectionColor="#9CC6FF"
              underlineColor="white"
              mode="outlined"
              style={styles.inputSearch}
              dense
              left={
                <TextInput.Icon
                  color={"white"}
                  name="magnify"
                  style={{ marginTop: 12, marginLeft: 10 }}
                />
              }
              theme={inputSearchTheme}
              onChangeText={(e) => onChangeSearchText(e)}
              blurOnSubmit={false}
            />
          </View>
          <Fetching isFetching={fetching}>
            {!see_all ? (
              communities.length > 0 ? (
                communities.map((community, i) => {
                  return (
                    <LinearGradient
                      key={i}
                      colors={[
                        "rgba(156, 198, 255, 0.042)",
                        "rgba(0, 37, 68, 0.15)",
                      ]}
                      start={{ x: 0, y: 0.5 }}
                      end={{ x: 1, y: 0.5 }}
                      style={styles.containerList}
                    >
                      <View>
                        <Text style={styles.sectionHeader}>
                          {community.title}
                        </Text>
                        {community.data.length > 0 ? (
                          <TouchableOpacity
                            style={styles.containerSeeAll}
                            onPress={() => viewSectionCommunity(i)}
                          >
                            <View style={styles.textSeeAll}>
                              <Text style={styles.sectionHeader}>See All</Text>
                            </View>
                          </TouchableOpacity>
                        ) : null}
                      </View>

                      {community.data.length > 0 ? (
                        <FlatList
                          contentContainerStyle={{ paddingRight: 16 }}
                          horizontal
                          data={community.data}
                          keyExtractor={(item, index) => String(index)}
                          showsHorizontalScrollIndicator={false}
                          snapToAlignment={"start"}
                          scrollEventThrottle={16}
                          decelerationRate="fast"
                          renderItem={({ item }) => (
                            <CardCommunity
                              community={item}
                              type={community.title}
                              navigation={props.navigation}
                            />
                          )}
                        />
                      ) : (
                        <View style={styles.textEmpty}>
                          <Text style={styles.textNotCommunities}>
                            {community.title === "My Communities"
                              ? "You don't have any communities yet"
                              : community.title === "Public Communities"
                                ? "We don't have any public communities yet."
                                : community.title === "Private Communities"
                                  ? "We don't have any private communities yet"
                                  : null}
                          </Text>
                        </View>
                      )}
                    </LinearGradient>
                  );
                })
              ) : null
            ) : (
              <LinearGradient
                colors={["rgba(156, 198, 255, 0.042)", "rgba(0, 37, 68, 0.15)"]}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={styles.containerViewSection}
              >
                <View>
                  <Text style={styles.sectionHeader}>
                    {section_community.title}
                  </Text>
                  <TouchableOpacity
                    style={styles.containerSeeAll}
                    onPress={handleDismiss}
                  >
                    <View style={styles.textSeeAll}>
                      <Text style={styles.sectionHeader}>Dismiss</Text>
                    </View>
                  </TouchableOpacity>
                </View>

                <View
                  style={[
                    styles.containerCom,
                    section_community.length < 6
                      ? { height: Dimensions.get("window").height - 50 }
                      : null,
                  ]}
                >
                  {section_community.length > 0 ? (
                    section_community.map((obj, i) => {
                      return (
                        <CardCommunity
                          key={i}
                          community={obj}
                          type={section_community.title}
                          navigation={props.navigation}
                        />
                      );
                    })
                  ) : (
                    <View style={styles.textEmpty}>
                      <Text style={styles.textNotCommunities}>
                        No communities found in this section
                      </Text>
                    </View>
                  )}
                </View>

                {loading ? (
                  <View
                    style={{
                      flex: 1,
                      justifyContent: "center",
                      marginBottom: 16,
                    }}
                  >
                    <ActivityIndicator size="small" color="#fff" />
                  </View>
                ) : null}
              </LinearGradient>
            )}
          </Fetching>
        </SafeAreaView>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    //flex: 2,
    width: Dimensions.get("window").width,
  },
  containerList: {
    marginBottom: 8,
    paddingVertical: 16,
    zIndex: 1,
    elevation: 1,
  },
  containerCom: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 16,
    marginRight: 16,
  },
  containerViewSection: {
    flex: 1,
    paddingTop: 16,
    paddingBottom: 32,
    zIndex: 1,
    elevation: 1,
  },
  textNotCommunities: {
    fontSize: 12,
    lineHeight: 16,
    height: 16,
    fontWeight: "bold",
    color: Colors.text,
    marginLeft: 16,
  },
  containerSearch: {
    flexDirection: "row",
    width: Dimensions.get("window").width,
    alignSelf: "center",
  },
  containerButton: {
    justifyContent: "flex-end",
    alignItems: "center",
    marginBottom: 8,
    //marginHorizontal: 4,
  },
  inputSearch: {
    flex: 1,
    backgroundColor: "#002544",
    borderRadius: 8,
    marginHorizontal: 24,
    marginBottom: 16,
    height: 64,
  },
  containerHeaderTitle: {
    alignSelf: "center",
  },
  containerSeeAll: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignSelf: "flex-end",
    marginLeft: 16,
    zIndex: 4,
    elevation: 4,
    position: "absolute",
  },
  textName: {
    fontSize: 24,
    color: Colors.text,
    alignSelf: "center",
    lineHeight: 32,
  },
  image: {
    alignSelf: "center",
    height: 121,
    marginLeft: 4,
    marginBottom: 0,
  },
  containerHeader: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 18,
    marginTop: 16,
  },
  textSeeAll: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignSelf: "flex-end",
    marginRight: 16,
  },
  textEmpty: {
    alignSelf: "flex-start",
    marginRight: 16,
    marginTop: 16,
  },
  sectionHeader: {
    fontWeight: "700",
    fontSize: 16,
    lineHeight: 16,
    color: "#FCFCFC",
    marginLeft: 16,
    zIndex: 2,
    elevation: 2,
  },
});

export default Community;
