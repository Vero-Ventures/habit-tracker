import React from 'react';
import { useState, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView, TouchableOpacity, Image } from 'react-native';
import Colors from '../../../assets/styles/Colors';
import Icon from "react-native-vector-icons/FontAwesome5";

const AddHabit = (props) => {
    const [frequency_type_ios, setFrequencyTypeIos] = useState("EVERYDAY");
  const [frequency_days, setFrequencyDays] = useState([
    false,
    false,
    false,
    false,
    false,
    false,
    false,
  ]);
  const [isRemind, setIsRemind] = useState(false);
  const [time, setTime] = useState(new Date());
  const [timeIOS, setTimeIOS] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [habitPhoto, setHabitPhoto] = useState(null);

  const RBSTime = useRef();
  const RBSFrequency = useRef();
  const RBSFillFrequencyDays = useRef();
  const ASPhotoOptions = useRef();

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ alignItems: 'center', flexGrow: 1 }}
      >
        <View style={styles.innerContainer}>
          <Text style={styles.title}>Name</Text>
          {/* <Text style={styles.textContent}>{habit?.hab_name}</Text> */}

          <Text style={styles.title}>Category</Text>
          <Text style={styles.textContent}>
            {/* {habit?.category?.hac_name} */}
          </Text>

          <Text style={styles.title}>Description</Text>
          {/* <Text style={styles.textContent}>{habit?.hab_description}</Text> */}

          <Text style={styles.title}>Frequency</Text>

          <TouchableOpacity
            style={styles.containerSelectIOS}
            onPress={() => RBSFrequency.current.open()}
          >
            <Text
              style={[
                styles.textSelectIOS,
                {
                  color: frequency_type_ios ? Colors.primary4 : "#455c8a",
                },
              ]}
            >
              {frequency_type_ios
                ? frequency_type_ios
                : "Select habit frequency"}
            </Text>

            <Icon size={16} color={"#455c8a"} name="chevron-down" />
          </TouchableOpacity>

          <Text style={styles.title}>Reminders</Text>

          <View style={styles.containerReminders}>
            <TouchableOpacity onPress={() => changeTime()}>
              <View style={styles.containerTime}>
                <Text style={styles.textTime}>
                  {isRemind ? moment(time).format("HH:mm") : ""}
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => changeTime()}>
              <Text style={styles.textReminder}>Set Reminder</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 32,
    paddingHorizontal: 22,
    // alignItems: "center",
  },
  innerContainer: {
    flex: 1,
  },
  title: {
    color: "black",
    fontSize: 16,
    fontWeight: "400",
    marginBottom: 12,
  },
  textContent: {
    fontSize: 16,
    color: "black",
    fontWeight: "400",
    marginBottom: 32,
  },
  containerSelectIOS: {
    paddingVertical: 15,
    paddingHorizontal: 16,
    borderColor: "#455c8a",
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 2,
    marginBottom: 32,
    flexDirection: "row",
    justifyContent: "space-between",
    width: Dimensions.get("window").width - 44,
  },
  containerReminders: {
    flexDirection: "row",
    // alignItems: "center",
    marginTop: 24,
  },
  containerTime: {
    borderRadius: 25,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "black",
    justifyContent: "center",
    // alignItems: "center",
    paddingVertical: 6,
    height: 28,
    width: 53,
  },
  textTime: {
    color: "black",
    fontSize: 11,
    fontWeight: "bold",
  },
  textReminder: {
    marginLeft: 15,
    fontSize: 11,
    fontWeight: "bold",
    color: "black",
    marginRight: 12,
  },
});

export default AddHabit;
