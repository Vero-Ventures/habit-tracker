import React, { useState, useEffect, useRef } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  Dimensions,
  Text,
  Alert,
  TouchableOpacity,
  Image,
} from "react-native";
import Default from "../../../assets/styles/Default";
import Colors from "../../../assets/styles/Colors";
import Fetching from "../../components/Fetching";
import Header from "../../components/Header";
import moment from "moment";
import { checkUserHabit, getUserChecklist } from "../../store/ducks/habit";
import { Button } from "react-native-elements";
import { useSelector } from "react-redux";
import { getIcon } from "../../utils/Utils";
import Icon from "react-native-vector-icons/FontAwesome5";
import RBSheet from "react-native-raw-bottom-sheet";
import { systemWeights } from "react-native-typography";
import Swipeable from "react-native-swipeable";

const Checklist = (props) => {
  const [fetching, setFetching] = useState(false);
  const [momentum, setMomentum] = useState([]);
  const [current_day, setCurrentDay] = useState(moment());
  const [habits_missing, setHabitsMissing] = useState([]);

  const user = useSelector(({ user }) => user);

  const RBSCheckHabitsYesterday = useRef();

  useEffect(() => {
    setFetching(true);

    checkHabitsYesterday();

    fetchChecklist();
  }, []);

  useEffect(() => {
    setFetching(true);

    fetchChecklist();
  }, [current_day]);

  useEffect(() => {
    const unsubscribe = props.navigation.addListener("focus", () => {
      fetchChecklist();
    });

    return unsubscribe;
  }, [props.navigation, fetchChecklist]);

  const checkHabitsYesterday = () => {
    let date = moment().subtract(1, "day").format("YYYY-MM-DD");

    let habitsMissing = [];

    getUserChecklist({ date: date })
      .catch((err) => {
        Alert.alert(
          "Ops!",
          "Something went wrong with our servers. Please contact us.",
        );
      })
      .then((res) => {
        if (res?.status === 200) {
          if (!res.data.errors) {
            for (const [idx_category, category] of res.data.entries()) {
              for (const [
                idx_user_habit,
                user_habit,
              ] of category.habits.entries()) {
                if (!user_habit.user_habit_check) {
                  habitsMissing.push({ idx_category, idx_user_habit });
                }
              }
            }

            if (
              habitsMissing.length > 0 &&
              moment(user.created_at).format("YYYY-MM-DD") >
              moment().format("YYYY-MM-DD")
            ) {
              setHabitsMissing(habitsMissing);
              RBSCheckHabitsYesterday.current.open();
            }
          }
        }
      });
  };

  const fetchChecklist = () => {
    getUserChecklist({ date: moment(current_day).format("YYYY-MM-DD") })
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
            setMomentum(res.data);
          }
        }

        setFetching(false);
      });
  };

  const checkHabit = (
    category,
    habit,
    indexHabit,
    check,
    onLeftActionRelease = false,
  ) => {
    if (onLeftActionRelease) {
      Alert.alert(
        user.name,
        "Are you sure you want to uncheck this habit?",
        [
          {
            text: "No",
            onPress: () => {
              return;
            },
            style: "cancel",
          },
          {
            text: "Yes",
            onPress: () => {
              checkUserHabit(habit.id, {
                checked: check,
                date: moment(current_day).format("YYYY-MM-DD"),
              })
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
                      let habits = [...momentum];

                      habits.map((cat, i) => {
                        if (cat.id === category.id) {
                          if (cat.habits[indexHabit].user_habit_check) {
                            cat.habits[
                              indexHabit
                            ].user_habit_check.uhc_checked = check;
                          } else {
                            cat.habits[indexHabit].user_habit_check = {
                              uhc_checked: check,
                            };
                          }
                        }
                      });

                      setMomentum(habits);
                    }
                  }
                });
            },
          },
        ],
        { cancelable: false },
      );
    } else {
      checkUserHabit(habit.id, {
        checked: check,
        date: moment(current_day).format("YYYY-MM-DD"),
      })
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
              let habits = [...momentum];

              habits.map((cat, i) => {
                if (cat.id === category.id) {
                  if (cat.habits[indexHabit].user_habit_check) {
                    cat.habits[indexHabit].user_habit_check.uhc_checked = check;
                  } else {
                    cat.habits[indexHabit].user_habit_check = {
                      uhc_checked: check,
                    };
                  }
                }
              });

              setMomentum(habits);
            }
          }
        });
    }
  };

  const onConfirmCheckHabit = (section, obj, i) => {
    Alert.alert(
      obj.habit.hab_name,
      "Are you sure you want to check this habit?",
      [
        {
          text: "No",
          style: "cancel",
        },
        { text: "Yes", onPress: () => checkHabit(section, obj, i, true) },
      ],
      { cancelable: false },
    );
  };

  const addHabit = () => {
    props.navigation.push("Home", {
      screen: "Habits",
      params: { screen: "AddHabit" },
    });
  };

  const changeDay = (type) => {
    let current = moment(current_day);

    if (type === "sub") {
      current = current.subtract(1, "day");
    }

    if (type === "add") {
      current = current.add(1, "day");
    }

    setCurrentDay(current);
  };

  const reviewHabits = () => {
    RBSCheckHabitsYesterday.current.close();

    let yesterday = moment().subtract(1, "day");

    setCurrentDay(yesterday);
  };

  const dontReviewHabits = () => {
    RBSCheckHabitsYesterday.current.close();

    let yesterday = moment().subtract(1, "day").format("YYYY-MM-DD");

    habits_missing.map((obj, i) => {
      let user_habit_id =
        momentum[obj.idx_category].habits[obj.idx_user_habit].id;

      checkUserHabit(user_habit_id, { checked: false, date: yesterday })
        .catch((err) => { })
        .then((res) => { });
    });
  };

  const rightContent = (
    <View style={styles.containerCheckItemRight}>
      <Icon size={26} color={Colors.text} name="check" />
    </View>
  );

  const leftContent = (
    <View style={styles.containerCheckItemLeft}>
      <Icon size={26} color={Colors.text} name="redo" />
    </View>
  );

  const getTextCheckedStyle = (obj) => {
    if (obj.user_habit_check) {
      if (obj.user_habit_check.uhc_checked) {
        return styles.textChecked;
      }
    }
  };

  return (
    <View style={Default.container}>
      <ScrollView>
        <Header
          navigation={props.navigation}
          showMenu
          title="Daily Checklist"
        />

        <View style={styles.container}>
          <View style={styles.containerHeader}>
            {/* <Text style={styles.textChecklist}>DAILY CHECKLIST</Text> */}
            <Text style={styles.text1}>What can we improve in</Text>
            <Text style={styles.text2}>your life today?</Text>
          </View>

          <Fetching isFetching={fetching}>
            <View style={styles.separatorSubheader}>
              <View style={styles.containerSubheader}>
                <TouchableOpacity onPress={() => changeDay("sub")}>
                  {/* <Icon style={{ backgroundColor: 'red', position: 'absolute', left: -22, top: -22, paddingVertical: 22, paddingHorizontal: 22 }} size={10} color={Colors.text} name='chevron-left' /> */}

                  <Icon
                    style={{
                      marginLeft: -22,
                      paddingVertical: 22,
                      paddingHorizontal: 22,
                    }}
                    size={10}
                    color={Colors.text}
                    name="chevron-left"
                  />
                </TouchableOpacity>

                <Text style={styles.textDate}>
                  {moment().isSame(current_day, "day")
                    ? "Today"
                    : current_day.format("DD MMMM")}
                </Text>

                <TouchableOpacity onPress={() => changeDay("add")}>
                  <Icon
                    style={{
                      marginRight: -22,
                      paddingVertical: 22,
                      paddingHorizontal: 22,
                    }}
                    size={10}
                    color={Colors.text}
                    name="chevron-right"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {momentum.map((section) => {
              return (
                <View key={section.hac_name}>
                  <View style={styles.containerAccordionHeader}>
                    <Text style={styles.textAccordionHeader}>
                      {section.hac_name}
                    </Text>

                    {getIcon(section.hac_name, section.icon)}
                  </View>

                  <View style={styles.containerAccordionContent}>
                    {section.habits.map((obj, i) => {
                      return (
                        <Swipeable
                          key={i}
                          leftContent={leftContent}
                          rightContent={rightContent}
                          onRightActionRelease={() =>
                            checkHabit(section, obj, i, true)
                          }
                          rightActionActivationDistance={
                            Dimensions.get("window").width / 3
                          }
                          leftActionActivationDistance={
                            Dimensions.get("window").width / 3
                          }
                          onLeftActionRelease={() =>
                            checkHabit(section, obj, i, false, true)
                          }
                        >
                          <TouchableOpacity
                            onPress={() => onConfirmCheckHabit(section, obj, i)}
                          >
                            <View style={styles.habitItem}>
                              <Text
                                style={[
                                  styles.textAccordionContent,
                                  getTextCheckedStyle(obj),
                                ]}
                              >
                                {obj.habit.hab_name}
                              </Text>
                            </View>
                          </TouchableOpacity>
                        </Swipeable>
                      );
                    })}
                  </View>
                </View>
              );
            })}

            {momentum.length === 0 ? (
              <View style={styles.containerButton}>
                <Button
                  buttonStyle={Default.loginNextButton}
                  titleStyle={Default.loginButtonBoldTitle}
                  onPress={addHabit}
                  title="ADD YOUR FIRST HABIT"
                />
              </View>
            ) : null}
          </Fetching>
        </View>

        <RBSheet
          ref={RBSCheckHabitsYesterday}
          height={350}
          openDuration={250}
          customStyles={{ container: styles.containerBottomSheet }}
          closeOnPressBack={false}
          closeOnPressMask={false}
        >
          <View style={styles.containerTextBottomSheet}>
            <Image
              style={styles.warningIconStyle}
              source={require("../../../assets/icons/warning.png")}
            />
            <Text
              style={styles.textExit}
            >{`You've missed your habits yesterday, do\nyou want to review it?`}</Text>
          </View>

          <View style={styles.buttonContainer}>
            <Button
              buttonStyle={Default.loginNextButton}
              titleStyle={Default.loginButtonBoldTitle}
              onPress={reviewHabits}
              title="REVIEW HABITS"
            />

            <TouchableOpacity
              style={{ marginTop: 16 }}
              onPress={() => dontReviewHabits()}
            >
              <View style={{ alignItems: "center" }}>
                <Text style={[systemWeights.bold, styles.createAccountText]}>
                  I DIDN'T COMPLETE MY HABITS
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </RBSheet>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "column",
    flex: 1,
    alignItems: "center",
    paddingVertical: 14,
    width: Dimensions.get("window").width,
  },
  containerHeader: {
    alignItems: "center",
  },
  textChecklist: {
    color: Colors.primary4,
    fontSize: 12,
  },
  text1: {
    fontSize: 24,
    color: "white",
    fontWeight: "400",
    alignSelf: "center",
  },
  text2: {
    fontSize: 32,
    color: "white",
    fontWeight: "700",
    alignSelf: "center",
  },
  separatorSubheader: {
    borderBottomColor: "rgba(156,198,255,0.2)",
    borderBottomWidth: StyleSheet.hairlineWidth,
    marginTop: 69,
  },
  containerSubheader: {
    marginHorizontal: 22,
    width: Dimensions.get("window").width - 44,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  textDate: {
    color: Colors.text,
    fontSize: 20,
    fontWeight: "400",
    paddingVertical: 20,
  },
  containerAccordionHeader: {
    width: Dimensions.get("window").width,
    paddingHorizontal: 22,
    paddingVertical: 24,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  textAccordionHeader: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.text,
  },
  containerAccordionContent: {
    backgroundColor: Colors.primary6,
  },
  habitItem: {
    paddingVertical: 22,
    paddingHorizontal: 22,
    backgroundColor: Colors.primary6,
  },
  textAccordionContent: {
    fontSize: 14,
    color: Colors.text,
  },
  containerButton: {
    marginTop: 50,
    width: Dimensions.get("window").width,
    paddingHorizontal: 22,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  iconStyle: {
    width: 29,
    height: 24,
  },
  // BottomSheet
  containerBottomSheet: {
    alignItems: "center",
    backgroundColor: Colors.primary,
  },
  containerTextBottomSheet: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  warningIconStyle: {
    width: 80,
    height: 80,
  },
  textExit: {
    marginTop: 26,
    fontSize: 14,
    color: Colors.text,
    textAlign: "center",
  },
  buttonContainer: {
    marginBottom: 32,
    alignItems: "center",
  },
  createAccountText: {
    fontSize: 14,
    color: "white",
  },
  // Checklist
  containerCheckItemRight: {
    backgroundColor: Colors.primary4,
    paddingHorizontal: 22,
    flex: 1,
    justifyContent: "center",
  },
  containerCheckItemLeft: {
    backgroundColor: Colors.primary3,
    paddingHorizontal: 22,
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "flex-end",
  },
  textChecked: {
    textDecorationLine: "line-through",
    color: Colors.primary4,
  },
});

export default Checklist;
