import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  Text,
  TouchableOpacity,
} from "react-native";
import Accordion from "react-native-collapsible/Accordion";
import Icon from "react-native-vector-icons/FontAwesome5";
import Colors from "../../../assets/styles/Colors"; 

const HabitPlan = ({ habitPlan }) => {
  const [activeSections, setActiveSections] = useState([]);
  const [parsedHabitPlan, setParsedHabitPlan] = useState([]);

  useEffect(() => {
    if (habitPlan) {
      try {
        console.log("Raw habit plan:", habitPlan);
        const parsed = JSON.parse(habitPlan);
        console.log("Parsed habit plan:", parsed);
        const formattedPlan = Object.keys(parsed).map((habitName) => ({
          hac_name: habitName,
          stages: parsed[habitName][0].stages,
        }));
        console.log("Formatted habit plan:", formattedPlan);
        setParsedHabitPlan(formattedPlan);
      } catch (error) {
        console.error("Error parsing habit plan:", error);
      }
    }
  }, [habitPlan]);

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
            activeSections.includes(index) ? styles.headerOpened : null,
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
        {section.stages.map((stage, i) => (
          <View key={i} style={styles.stageItem}>
            <Text style={styles.stageTitle}>{stage.name}</Text>
            <Text style={styles.stageDuration}>
              Duration: {stage.duration_weeks} weeks
            </Text>
            <Text style={styles.stageGoals}>Goals: {stage.goals}</Text>
            {stage.steps.map((step, j) => (
              <Text key={j} style={styles.stepDescription}>
                Step {j + 1}: {step.description}
              </Text>
            ))}
          </View>
        ))}
      </View>
    );
  };

  return (
    <View>
      <Accordion
        sections={parsedHabitPlan}
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
    paddingVertical: 15,
  },
  textAccordionContent: {
    flex: 1,
    fontSize: 14,
    color: Colors.text,
  },
  stageItem: {
    marginBottom: 10,
  },
  stageTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  stageDuration: {
    fontSize: 14,
    marginBottom: 5,
  },
  stageGoals: {
    fontSize: 14,
    marginBottom: 10,
  },
  stepDescription: {
    fontSize: 14,
    marginLeft: 10,
    marginBottom: 5,
  },
  headerOpened: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
});

export default HabitPlan;
