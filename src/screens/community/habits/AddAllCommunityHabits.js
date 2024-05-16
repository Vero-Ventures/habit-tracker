import React, { useState, useEffect, useRef } from "react";
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
  Modal,
  ActivityIndicator,
} from "react-native";
import Default from "../../../../assets/styles/Default";
import Colors from "../../../../assets/styles/Colors";
import Fetching from "../../../components/Fetching";
import { listHabits } from "../../../store/ducks/community";
import { LinearGradient } from "expo-linear-gradient";
import { Button } from "react-native-elements";
import { BlurView } from "expo-blur";
import CardHabits from "../../../components/community/CardHabits";
import Header from "../../../components/Header";
import { storeWithCommunityHabits } from "../../../store/ducks/habit";

const AddAllCommunityHabits = (props) => {
  const [fetching, setFetching] = useState(true);
  const [showModalAddAllHabitsRequest, setShowModalAddAllHabitsRequest] =
    useState(false);
  const [isAddingAllHabits, setIsAddingAllHabits] = useState(false);
  const [showModalAddAllHabitsError, setShowModalAddAllHabitsError] =
    useState(false);
  const [success, setSuccess] = useState(false);
  const [showModalAddAllHabitsSuccess, setShowModalAddAllHabitsSuccess] =
    useState(false);
  const [communityHabits, setCommunityHabits] = useState("");

  useEffect(() => {
    fetchHabits(props.route.params.community.id);
  }, [props]);

  useEffect(() => {
    if (!showModalAddAllHabitsSuccess && success) {
      props.navigation.pop();
    }
  }, [showModalAddAllHabitsSuccess, success]);

  const fetchHabits = (communityId) => {
    if (!fetching) {
      setFetching(true);
    }

    listHabits(communityId)
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
            setCommunityHabits(res.data);
          }
        }
      })
      .finally(() => {
        setFetching(false);
      });
  };

  const handleAddAllHabitsPressed = () => {
    setShowModalAddAllHabitsRequest(true);
  };

  const handleModalAddAllHabitsPressed = () => {
    setIsAddingAllHabits(true);

    const formData = new FormData();

    communityHabits.forEach((communityHabit, i) => {
      formData.append(`communityHabits[${i}]`, communityHabit.id);
    });

    storeWithCommunityHabits(formData)
      .catch((err) => {
        setShowModalAddAllHabitsRequest(false);
        setShowModalAddAllHabitsError(true);
      })
      .then((res) => {
        if (res?.status === 200) {
          if (res.data.errors) {
            setShowModalAddAllHabitsRequest(false);
            setShowModalAddAllHabitsError(true);
          } else {
            setShowModalAddAllHabitsRequest(false);
            setShowModalAddAllHabitsSuccess(true);
          }
        }
      })
      .finally(() => {
        setIsAddingAllHabits(false);
      });
  };

  const handleModalBackToCommunityPress = () => {
    setShowModalAddAllHabitsSuccess(false);
    setSuccess(true);
  };

  return (
    <View style={Default.container}>
      <ScrollView
        scrollEnabled
        refreshControl={
          <RefreshControl
            colors={["#000"]}
            tintColor="#fff"
            onRefresh={() => fetchHabits(props.route.params.community.id)}
            refreshing={fetching}
          />
        }
      >
        <Header
          title="Add all habits"
          navigation={props.navigation}
          backButton
        />

        <Fetching isFetching={fetching}>
          <SafeAreaView style={{ flex: 1 }}>
            <View style={styles.container}>
              <View style={styles.containerButton}>
                <Button
                  buttonStyle={styles.addAllHabitsButton}
                  titleStyle={Default.loginButtonBoldTitle}
                  onPress={handleAddAllHabitsPressed}
                  title={"ADD ALL HABITS"}
                />
              </View>

              <LinearGradient
                colors={
                  communityHabits.length === 0
                    ? ["rgba(0, 37, 68, 0.15)", "rgba(0, 37, 68, 0.15)"]
                    : ["rgba(156, 198, 255, 0.042)", "rgba(0, 37, 68, 0.15)"]
                }
                locations={[0, 0.21]}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={[styles.containerViewSection, { paddingBottom: 32 }]}
              >
                <View style={{ marginBottom: 16 }}>
                  <Text style={styles.sectionHeader}>
                    Daily Habits from community
                  </Text>
                </View>

                <View style={[styles.containerHabits, { marginTop: -16 }]}>
                  {communityHabits.length > 0
                    ? communityHabits.map((obj, i) => {
                        return (
                          <View key={i}>
                            <CardHabits
                              community={{
                                id: props.route.params.community.id,
                              }}
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
              </LinearGradient>
            </View>

            <Modal
              animationType="none"
              transparent={true}
              visible={showModalAddAllHabitsRequest}
              onRequestClose={() =>
                setShowModalAddAllHabitsRequest(!showModalAddAllHabitsRequest)
              }
            >
              <View style={styles.centeredView}>
                <View style={styles.modalView}>
                  <View style={styles.containerModal}>
                    <TouchableOpacity
                      style={styles.containerHeaderModal}
                      onPress={() =>
                        setShowModalAddAllHabitsRequest(
                          !showModalAddAllHabitsRequest,
                        )
                      }
                    >
                      <Image
                        style={styles.imageModalHeader}
                        source={require("../../../../assets/icons/close.png")}
                      />
                    </TouchableOpacity>

                    {isAddingAllHabits ? (
                      <>
                        <Text style={styles.textHeaderModal}>
                          {"Adding all habits"}
                        </Text>

                        <Text style={styles.textDescriptionModal}>
                          {"Wait..."}
                        </Text>

                        <ActivityIndicator
                          style={{ marginTop: 16 }}
                          size="small"
                          color={Colors.text}
                        />
                      </>
                    ) : (
                      <>
                        <Text style={styles.textHeaderModal}>
                          {"Are you sure you want to add all these habits?"}
                        </Text>

                        <Text style={styles.textDescriptionModal}>
                          {"Those that you already have will not be added."}
                        </Text>

                        <View style={styles.modalButtonContainer}>
                          <TouchableOpacity
                            style={{ display: "flex", flexDirection: "row" }}
                            onPress={handleModalAddAllHabitsPressed}
                          >
                            <Text style={[styles.modalTextButton]}>
                              Add all habits
                            </Text>

                            <Image
                              style={[
                                styles.modalImageButton,
                                { marginLeft: 8 },
                              ]}
                              source={require("../../../../assets/icons/arrow-right.png")}
                            />
                          </TouchableOpacity>
                        </View>
                      </>
                    )}
                  </View>
                </View>
              </View>
            </Modal>

            <Modal
              animationType="slide"
              transparent={true}
              visible={showModalAddAllHabitsError}
              onRequestClose={() =>
                setShowModalAddAllHabitsError(!showModalAddAllHabitsError)
              }
            >
              <View style={styles.centeredView}>
                <View style={styles.modalView}>
                  <View style={styles.containerModal}>
                    <TouchableOpacity
                      style={styles.containerHeaderModal}
                      onPress={() =>
                        setShowModalAddAllHabitsError(
                          !showModalAddAllHabitsError,
                        )
                      }
                    >
                      <Image
                        style={styles.imageModalHeader}
                        source={require("../../../../assets/icons/close.png")}
                      />
                    </TouchableOpacity>

                    <View style={styles.modalSuccessImageContainer}>
                      <Image
                        style={styles.modalSuccessImage}
                        source={require("../../../../assets/icons/wrong.png")}
                      />
                    </View>

                    <Text style={styles.textHeaderModal}>
                      {"Something wrong happened!"}
                    </Text>

                    <View style={styles.modalButtonContainer}>
                      <TouchableOpacity
                        style={{ display: "flex", flexDirection: "row" }}
                        onPress={() =>
                          setShowModalAddAllHabitsError(
                            !showModalAddAllHabitsError,
                          )
                        }
                      >
                        <Image
                          style={[
                            styles.modalImageButton,
                            {
                              marginRight: 8,
                              transform: [{ rotate: "180deg" }],
                            },
                          ]}
                          source={require("../../../../assets/icons/arrow-right.png")}
                        />

                        <Text style={[styles.modalTextButton]}>
                          Close error
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </View>
            </Modal>

            <Modal
              animationType="slide"
              transparent={true}
              visible={showModalAddAllHabitsSuccess}
              onRequestClose={handleModalBackToCommunityPress}
            >
              <View style={styles.centeredView}>
                <View style={styles.modalView}>
                  <View style={styles.containerModal}>
                    <TouchableOpacity
                      style={styles.containerHeaderModal}
                      onPress={handleModalBackToCommunityPress}
                    >
                      <Image
                        style={styles.imageModalHeader}
                        source={require("../../../../assets/icons/close.png")}
                      />
                    </TouchableOpacity>

                    <View style={styles.modalSuccessImageContainer}>
                      <Image
                        style={styles.modalSuccessImage}
                        source={require("../../../../assets/icons/check.png")}
                      />
                    </View>

                    <Text style={styles.textHeaderModal}>
                      {"Habits successfully added!"}
                    </Text>

                    <Text style={styles.textDescriptionModal}>
                      {
                        "Those that you already had and were disabled became active again."
                      }
                    </Text>

                    <View style={styles.modalButtonContainer}>
                      <TouchableOpacity
                        style={{ display: "flex", flexDirection: "row" }}
                        onPress={handleModalBackToCommunityPress}
                      >
                        <Image
                          style={[
                            styles.modalImageButton,
                            {
                              marginRight: 8,
                              transform: [{ rotate: "180deg" }],
                            },
                          ]}
                          source={require("../../../../assets/icons/arrow-right.png")}
                        />

                        <Text style={[styles.modalTextButton]}>
                          Back to community
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </View>
            </Modal>
          </SafeAreaView>
        </Fetching>
        {showModalAddAllHabitsRequest ||
        showModalAddAllHabitsSuccess ||
        showModalAddAllHabitsError ? (
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
    width: Dimensions.get("window").width,
    zIndex: 1,
    elevation: 1,
  },
  containerButton: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
    marginBottom: 16,
    width: "100%",
  },
  containerShadow: {
    backgroundColor: "rgba(0,0,0,0.6)",
    zIndex: 1,
    elevation: 1,
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  },
  containerBlur: {
    zIndex: 1,
    elevation: 1,
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    marginTop: -3,
  },
  addAllHabitsButton: {
    height: 64,
    borderRadius: 4,
    backgroundColor: "#982538",
    width: Dimensions.get("window").width - 32,
  },
  headerIcon: {
    width: 18,
    height: 18,
    marginRight: 3,
  },
  typeCommunityText: {
    fontWeight: "600",
    fontSize: 13,
    lineHeight: 16,
    color: "#FCFCFC",
  },
  containerHabits: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    //alignItems: 'center',
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
  containerViewSection: {
    flex: 1,
    paddingTop: 16,
    zIndex: 1,
    elevation: 1,
  },
  modalView: {
    borderRadius: 4,
    marginHorizontal: 32,
    alignItems: "flex-start",
    shadowColor: "#000",
    paddingBottom: 50,
    paddingTop: 16,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    width: Dimensions.get("window").width - 44,
    shadowOpacity: 0.25,
    shadowRadius: 4,
    backgroundColor: "#082139",
  },
  centeredView: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
  containerModal: {
    flexDirection: "column",
    alignSelf: "center",
    alignItems: "center",
    width: Dimensions.get("window").width - 76,
  },
  containerHeaderModal: {
    flexDirection: "row",
    alignSelf: "flex-end",
    marginBottom: 8,
  },
  imageModalHeader: {
    resizeMode: "cover",
    width: 24,
    height: 24,
    borderRadius: 62,
    //marginRight: 12,
    //marginLeft: 16,
  },
  containerTextModal: {
    alignContent: "center",
  },
  textHeaderModal: {
    textAlign: "center",
    fontSize: 24,
    fontWeight: "700",
    lineHeight: 33,
    color: Colors.text,
  },
  textDescriptionModal: {
    textAlign: "center",
    fontSize: 14,
    fontWeight: "400",
    lineHeight: 21,
    marginTop: 16,
    color: Colors.text,
  },
  confirmButton: {
    height: 64,
    borderRadius: 4,
    backgroundColor: "#982538",
  },
  modalButtonContainer: {
    display: "flex",
    justifyContent: "center",
    textAlign: "center",
    marginTop: 32,
  },
  modalTextButton: {
    textAlign: "center",
    fontSize: 16,
    fontWeight: "700",
    lineHeight: 24,
    color: Colors.primary8,
  },
  modalTextButton: {
    textAlign: "center",
    fontSize: 16,
    fontWeight: "700",
    lineHeight: 24,
    color: Colors.primary8,
  },
  modalImageButton: {
    resizeMode: "cover",
    width: 24,
    height: 24,
    borderRadius: 62,
  },
  modalSuccessImageContainer: {
    display: "flex",
    justifyContent: "center",
    textAlign: "center",
  },
  modalSuccessImage: {
    height: 80,
    width: 80,
  },
});

export default AddAllCommunityHabits;
