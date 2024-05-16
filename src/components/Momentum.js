import React, { useState, useRef } from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  Text,
  Alert,
  TouchableOpacity,
  Image,
} from "react-native";
import Default from "../../assets/styles/Default";
import Colors from "../../assets/styles/Colors";
import { Button } from "react-native-elements";
import Accordion from "react-native-collapsible/Accordion";
import Icon from "react-native-vector-icons/FontAwesome5";
import RBSheet from "react-native-raw-bottom-sheet";
import { systemWeights } from "react-native-typography";
import { deleteUserHabit } from "../store/ducks/habit";

const Momentum = (props) => {
  const [activeSections, setActiveSections] = useState([]);
  const [habit_delete, setHabitDelete] = useState(null);

  const RBSDelete = useRef();

  const deleteHabit = () => {
    deleteUserHabit(habit_delete.id)
      .catch((err) => {
        Alert.alert(
          "Ops!",
          "Something went wrong with our servers. Please contact us.",
        );
      })
      .then((res) => {
        if (res?.status === 200) {
          if (res.data.errors) {
            Alert.alert("Ops", res.data.errors[0]);
          } else {
            setHabitDelete(null);

            RBSDelete.current.close();

            props.onRefresh();
          }
        }
      });
  };

  const updateActiveSections = (indexNumber) => {
    let activeSectionsAux = [...activeSections];
    const index = activeSections.indexOf(indexNumber);

    if (index !== -1) {
      activeSectionsAux.splice(index, 1);
    } else {
      activeSectionsAux.push(indexNumber);
    }

    setActiveSections(activeSectionsAux);
  };

  const _renderHeader = (section, index, isActive) => {
    return (
      <TouchableOpacity onPress={() => updateActiveSections(index)}>
        <View style={styles.containerAccordionHeader}>
          <Text style={styles.textAccordionHeader}>{section.hac_name}</Text>

          <Icon
            size={20}
            color={Colors.text}
            name={isActive ? "chevron-up" : "chevron-down"}
          />
        </View>
      </TouchableOpacity>
    );
  };

  const _renderContent = (section) => {
    return (
      <View style={styles.containerAccordionContent}>
        {section.habits.map((obj, i) => {
          return (
            <TouchableOpacity
              key={i}
              onPress={() => (props.deleteHabit ? onDeleteHabit(obj) : null)}
            >
              <View style={styles.habitItem}>
                <Text style={styles.textAccordionContent}>
                  {obj.habit.hab_name}
                </Text>

                <View style={styles.containerStreak}>
                  <Text
                    style={styles.textStreak}
                  >{`${obj.ush_current_streak}/30`}</Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  const onDeleteHabit = (obj) => {
    setHabitDelete(obj);

    RBSDelete.current.open();
  };

  return (
    <View>
      <Accordion
        sections={props.momentum}
        activeSections={activeSections}
        renderHeader={_renderHeader}
        renderContent={_renderContent}
        onChange={() => null}
      />

      <RBSheet
        ref={RBSDelete}
        height={350}
        openDuration={250}
        customStyles={{ container: styles.containerBottomSheet }}
      >
        <View style={styles.containerTextBottomSheet}>
          <Image
            style={styles.warningIconStyle}
            source={require("../../assets/icons/wrong.png")}
          />
          <Text style={styles.textDelete}>
            Are you sure to delete this habit?
          </Text>
        </View>

        <View style={styles.buttonContainer}>
          <Button
            buttonStyle={Default.loginNextButton}
            titleStyle={Default.loginButtonBoldTitle}
            onPress={deleteHabit}
            title="DELETE"
          />

          <TouchableOpacity
            style={{ marginTop: 16 }}
            onPress={() => RBSDelete.current.close()}
          >
            <View style={{ alignItems: "center" }}>
              <Text style={[systemWeights.bold, styles.createAccountText]}>
                Cancel
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </RBSheet>
    </View>
  );
};

const styles = StyleSheet.create({
  containerAccordionHeader: {
    width: Dimensions.get("window").width - 44,
    backgroundColor: "#004B7F",
    paddingVertical: 17,
    paddingHorizontal: 14,
    borderRadius: 4,
    marginTop: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  textAccordionHeader: {
    fontSize: 16,
    color: Colors.text,
  },
  containerAccordionContent: {
    width: Dimensions.get("window").width - 44,
    backgroundColor: "#0a2a41",
    borderRadius: 4,
    paddingHorizontal: 14,
    paddingVertical: 15,
  },
  textAccordionContent: {
    flex: 1,
    fontSize: 14,
    color: Colors.text,
  },
  habitItem: {
    flexDirection: "row",
    paddingVertical: 15,
    alignItems: "center",
    justifyContent: "space-between",
  },
  containerStreak: {
    marginLeft: 15,
    height: 36,
    width: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: "#318FC5",
    alignItems: "center",
    justifyContent: "center",
  },
  textStreak: {
    fontSize: 9,
    color: Colors.text,
  },
  containerBottomSheet: {
    alignItems: "center",
    backgroundColor: Colors.primary,
  },
  containerTextBottomSheet: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonContainer: {
    marginBottom: 30,
    alignItems: "center",
  },
  createAccountText: {
    fontSize: 14,
    color: "white",
  },
  textDelete: {
    marginTop: 26,
    fontSize: 14,
    color: Colors.text,
  },
  warningIconStyle: {
    width: 80,
    height: 80,
  },
});

export default Momentum;
