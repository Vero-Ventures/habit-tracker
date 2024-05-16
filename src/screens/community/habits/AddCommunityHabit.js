import React, { useState, useEffect } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  Dimensions,
  Text,
  Alert,
} from "react-native";
import { ListItem } from "react-native-elements";
import Default from "../../../../assets/styles/Default";
import Colors from "../../../../assets/styles/Colors";
import Fetching from "../../../components/Fetching";
import Header from "../../../components/Header";
import Icon from "react-native-vector-icons/FontAwesome5";
import { getAllCategory } from "../../../store/ducks/habit";
import { getIcon } from "../../../utils/Utils";

const AddCommunityHabit = (props) => {
  const [fetching, setFetching] = useState(false);
  const [habits, setHabits] = useState([]);

  useEffect(() => {
    setFetching(true);

    getAllCategory()
      .catch((err) => {
        Alert.alert(
          "Ops!",
          "Something went wrong with our servers. Please contact us.",
        );
      })
      .then((res) => {
        if (res?.status === 200) {
          setHabits(res.data);
        }

        setFetching(false);
      });
  }, []);

  const addHabit = (hab_id) => {
    props.navigation.push("HabitCommunitySelected", {
      hab_id,
      community: { id: props.route?.params?.community?.id },
    });
  };

  return (
    <View style={[Default.container, { marginTop: -32 }]}>
      <Header title="Create Habit" navigation={props.navigation} backButton />

      <ScrollView>
        <Fetching isFetching={fetching}>
          <View style={styles.container}>
            <View>
              <ListItem
                containerStyle={styles.containerCustomHabit}
                onPress={() => {
                  props.navigation.push("CreateCustomHabitCommunity", {
                    community: { id: props.route?.params?.community?.id },
                  });
                }}
              >
                <Icon size={22} color={Colors.primary4} name="plus-square" />
                <ListItem.Content>
                  <ListItem.Title style={styles.titleCustomHabit}>
                    CUSTOM HABIT
                  </ListItem.Title>
                </ListItem.Content>
                <ListItem.Chevron color={Colors.primary4} />
              </ListItem>
            </View>

            {habits.map((hab, i) => {
              return (
                <View key={i}>
                  <View style={styles.containerHeader}>
                    <Text style={styles.headerHabit}>{hab.hac_name}</Text>

                    {getIcon(hab.hac_name, hab.icon)}
                  </View>

                  {hab.pre_established_habits.map((obj, i) => {
                    return (
                      <ListItem
                        key={i}
                        containerStyle={styles.containerListItem}
                        onPress={() => addHabit(obj.id)}
                      >
                        <ListItem.Content>
                          <ListItem.Title style={styles.titleListItem}>
                            {obj.hab_name}
                          </ListItem.Title>
                        </ListItem.Content>
                        <ListItem.Chevron color={Colors.primary4} />
                      </ListItem>
                    );
                  })}
                </View>
              );
            })}
          </View>
        </Fetching>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingBottom: 22,
    width: Dimensions.get("window").width,
  },
  textCreate: {
    color: "#FCFCFC",
    fontSize: 24,
    marginBottom: 10,
  },
  containerCustomHabit: {
    backgroundColor: Colors.primary,
    borderBottomColor: "#264261",
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 0,
  },
  titleCustomHabit: {
    fontSize: 12,
    color: Colors.primary4,
  },
  containerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 24,
    marginBottom: 10,
  },
  headerHabit: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: "bold",
  },
  titleListItem: {
    color: Colors.primary4,
    fontSize: 12,
  },
  containerListItem: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 0,
  },
});

export default AddCommunityHabit;
