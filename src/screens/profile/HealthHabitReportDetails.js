import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Dimensions, Text } from 'react-native';
import Default from '../../../assets/styles/Default';
import Colors from '../../../assets/styles/Colors';
import Header from '../../components/Header';
import { Button } from 'react-native-elements';
import { percentageOfValueFromTotal } from '../../utils/Utils';
import {
  getInitialAndFinalDateBasedOnPeriod,
  openPdf,
} from './HealthHabitReportUtils';

const HealthHabitReportDetails = props => {
  const [period, _setPeriod] = useState(props.route?.params?.period ?? 'Month');
  const [filtersForBackend] = useState(
    getInitialAndFinalDateBasedOnPeriod(period)
  );
  const [formattedData, _setFormattedData] = useState(
    props.route?.params?.formattedData ?? { categoryList: [] }
  );

  useEffect(() => {
    if (!props.route?.params?.formattedData) {
      props.navigation.navigate('HealthHabitReport');
    }
  }, []);

  const SectionInputs = () => (
    <View style={styles.sectionContainer}>
      <View style={[styles.inputContainer, { marginBottom: 16 }]}>
        <Text style={styles.inputLabel}>Period</Text>
        <Text style={styles.inputText}>{period}</Text>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Habits</Text>

        <View style={styles.categoriesContainer}>
          {formattedData?.categoryList &&
            formattedData.categoryList.map(item => (
              <View
                key={`category-${item.id}`}
                style={styles.categoryTagContainer}>
                <Text style={styles.categoryText}>
                  {item.hac_name ?? 'N/A'}
                </Text>

                <View style={styles.categoryLengthContainer}>
                  <Text style={styles.categoryLengthText}>
                    {item.habits ? item.habits.length : 0}
                  </Text>
                </View>
              </View>
            ))}
        </View>
      </View>
    </View>
  );

  const SectionCategoryAndHabits = ({ categoryAndHabit }) => {
    const categoryCheckPercentage = percentageOfValueFromTotal(
      categoryAndHabit.categoryHabitsChecked,
      categoryAndHabit.categoryHabitsNeeded
    );

    return (
      <View style={styles.sectionContainer}>
        <View style={styles.sectionTitleContainer}>
          <Text style={styles.sectionTitle}>
            {categoryAndHabit.hac_name ?? 'N/A'}
          </Text>
          <Text
            style={
              styles.sectionTitleOption
            }>{`${categoryCheckPercentage}%`}</Text>
        </View>

        <View style={styles.sectionHabits}>
          {categoryAndHabit.habits.map((habitItem, index) => {
            const habitCheckPercentage = percentageOfValueFromTotal(
              habitItem.habitsChecked,
              habitItem.habitsNeeded
            );

            return (
              <View
                style={[
                  styles.habitContainer,
                  index === categoryAndHabit.habits.length - 1
                    ? { marginBottom: 0 }
                    : null,
                ]}
                key={`category-${categoryAndHabit.id}-${habitItem.id}`}>
                <Text style={styles.habitName}>
                  {habitItem.habit?.hab_name ?? 'N/A'}
                </Text>

                <View style={styles.habitBarContainer}>
                  <View
                    style={[
                      styles.habitDoneBarContainer,
                      { width: `${habitCheckPercentage}%` },
                    ]}
                  />
                </View>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  return (
    <View style={Default.container}>
      <Header
        customHeaderStyle={styles.customHeader}
        navigation={props.navigation}
        backButton
        title="Health Habits Report"
      />

      <View style={styles.headerSeparator} />

      <ScrollView>
        <View style={styles.container}>
          <SectionInputs />

          {formattedData?.categoryList ? (
            <View style={styles.sectionHabitsContainer}>
              {formattedData?.categoryList.map(item => (
                <SectionCategoryAndHabits
                  key={`section-${item.id}`}
                  categoryAndHabit={item}
                />
              ))}
            </View>
          ) : null}

          <Button
            buttonStyle={styles.exportButton}
            titleStyle={styles.exportButtonText}
            onPress={() => openPdf(filtersForBackend, period)}
            title="EXPORT TO PDF"
          />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    flex: 1,
    paddingBottom: 24,
    width: Dimensions.get('window').width,
    paddingHorizontal: 22,
  },
  customHeader: {
    paddingTop: 15,
    marginBottom: 16,
    textAlign: 'center',
  },
  headerSeparator: {
    marginBottom: 17,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.primary4,
    opacity: 0.2,
    width: Dimensions.get('window').width - 44,
    alignSelf: 'center',
  },
  sectionContainer: {
    flexDirection: 'column',
    marginBottom: 40,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 8,
    borderBottomColor: 'rgba(156, 198, 255, 0.4)',
    borderBottomWidth: StyleSheet.hairlineWidth,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    color: Colors.text,
    fontWeight: '700',
    marginRight: 32,
    lineHeight: 20.6,
  },
  sectionTitleOption: {
    fontSize: 18,
    color: Colors.text,
    fontWeight: '400',
  },
  inputContainer: {
    flexDirection: 'column',
    paddingBottom: 10,
    borderBottomColor: 'rgba(156, 198, 255, 0.4)',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  inputLabel: {
    fontSize: 16,
    color: Colors.text,
    lineHeight: 16,
    fontWeight: '400',
  },
  inputText: {
    fontSize: 16,
    marginTop: 8,
    color: Colors.primary4,
    opacity: 0.4,
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  categoryTagContainer: {
    flexDirection: 'row',
    marginTop: 8,
    marginRight: 8,
    paddingVertical: 2.5,
    paddingHorizontal: 4,
    height: 20,
    alignSelf: 'flex-start',
    borderColor: Colors.primary10,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
  },
  categoryText: {
    fontSize: 11,
    lineHeight: 14,
    color: Colors.primary4,
    opacity: 0.4,
    textTransform: 'uppercase',
  },
  categoryLengthContainer: {
    backgroundColor: 'rgba(156, 198, 255, 0.4)',
    height: 12,
    width: 12,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  categoryLengthText: {
    color: Colors.text,
    fontSize: 8,
    lineHeight: 8,
    paddingTop: 1,
    fontWeight: '700',
  },
  sectionHabitsContainer: {
    flexDirection: 'column',
    paddingHorizontal: 8,
  },
  sectionHabits: {
    flexDirection: 'column',
  },
  habitContainer: {
    flexDirection: 'row',
    marginBottom: 24,
    justifyContent: 'space-between',
    flexGrow: 1,
  },
  habitName: {
    color: Colors.primary4,
    fontSize: 12,
    lineHeight: 13.4,
    width: '55.6%',
  },
  habitBarContainer: {
    borderRadius: 500,
    backgroundColor: '#992538',
    flex: 1,
    marginLeft: 4,
    height: 6,
  },
  habitDoneBarContainer: {
    borderRadius: 500,
    backgroundColor: Colors.primary4,
    height: '100%',
  },
  exportButton: {
    height: 64,
    borderRadius: 4,
    backgroundColor: '#992538',
    width: Dimensions.get('window').width - 44,
  },
  exportButtonText: {
    color: '#FCFCFC',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default HealthHabitReportDetails;
