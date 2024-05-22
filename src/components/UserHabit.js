import React, { useState } from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  Text,
  TouchableOpacity,
} from "react-native";
import Colors from "../../assets/styles/Colors";
import Accordion from "react-native-collapsible/Accordion";
import Icon from "react-native-vector-icons/FontAwesome5";

const UserHabit = (props) => {
  const [activeSections, setActiveSections] = useState([]);

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
        <View
          style={[
            styles.containerAccordionHeader,
            index === activeSections ? styles.headerOpened : null,
          ]}
        >
          <Text style={styles.textAccordionHeader}>{section.hac_name}</Text>

          <Icon
            size={15}
            color={Colors.primary4}
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
              onPress={() =>
                props.navigation.navigate("Home", {
                  screen: "Habits",
                  params: {
                    screen: "ViewHabit",
                    params: { user_habit_id: obj.id },
                  },
                })
              }
            >
              <View style={styles.habitItem}>
                <Text style={styles.textAccordionContent}>
                  {obj.habit.hab_name}
                </Text>

                <Icon
                  style={{ marginRight: 5, marginLeft: 10 }}
                  size={15}
                  color={Colors.primary4}
                  name="chevron-right"
                />
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  return (
    <View>
      <Accordion
        sections={props.user_habits}
        activeSections={activeSections}
        renderHeader={_renderHeader}
        renderContent={_renderContent}
        onChange={() => null}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  containerAccordionHeader: {
    width: Dimensions.get("window").width - 44,
    backgroundColor: "rgba(156, 198, 255, 0.084)",
    paddingVertical: 17,
    paddingHorizontal: 17,
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
    backgroundColor: "rgba(156, 198, 255, 0.084)",
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
    paddingHorizontal: 14,
    // paddingVertical: 15,
  },
  textAccordionContent: {
    flex: 1,
    fontSize: 14,
    color: Colors.text,
  },
  habitItem: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.primary4,
    flexDirection: "row",
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerOpened: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
});

export default UserHabit;
