import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Dimensions,
  Text,
  Image,
  Alert,
  TouchableOpacity,
} from 'react-native';
import Default from '../../../assets/styles/Default';
import Colors from '../../../assets/styles/Colors';
import Fetching from '../../components/Fetching';
import Header from '../../components/Header';
import { Button } from 'react-native-elements';
import { getAllCategoryWithCheckedHabbits } from '../../store/ducks/habit';
import CustomPicker from '../../components/CustomPicker';
import { LineChart } from 'react-native-chart-kit';
import { LinearGradient, Svg, Defs, Stop, Rect } from 'react-native-svg';
import Icon from 'react-native-vector-icons/FontAwesome5';
import {
  formatCategoryAndUserHabits,
  getHabitsByCategoryBarColor,
  getInitialAndFinalDateBasedOnPeriod,
  getOverallSummaryContent,
  getPeriodLabelList,
  openPdf,
} from './HealthHabitReportUtils';
import { percentageOfValueFromTotal } from '../../utils/Utils';

const HealthHabitReport = props => {
  const [fetching, setFetching] = useState(true);

  const [inputsValue, setInputsValue] = useState({
    period: 'Month',
    habit: '',
  });
  const [filtersForBackend, setFiltersForBackend] = useState(
    getInitialAndFinalDateBasedOnPeriod(inputsValue.period)
  );
  const [overallSummaryLabels, setOverallSummaryLabels] = useState(
    getPeriodLabelList(inputsValue.period)
  );

  const [formattedData, setFormattedData] = useState({ categoryList: [] });
  const [periodList, _setPeriodList] = useState(['Month', 'Quarter', 'Year']);

  useEffect(() => {
    fetchFormatAndSetData();
  }, []);

  useEffect(() => {
    if (!fetching) {
      setFetching(true);

      fetchFormatAndSetData();
    }
  }, [filtersForBackend]);

  const fetchFormatAndSetData = () => {
    getAllCategoryWithCheckedHabbits(filtersForBackend)
      .catch(res => {
        Alert.alert(
          'Ops!',
          'Something went wrong with our servers. Please contact us.'
        );
      })
      .then(res => {
        if (res.status === 200) {
          if (res.data.errors) {
            Alert.alert(
              'Ops!',
              'Something went wrong with our servers. Please contact us.'
            );
          } else {
            const formattedData = formatCategoryAndUserHabits(
              res.data,
              filtersForBackend
            );

            formattedData.categoryList = formattedData.categoryList.sort(
              (a, b) =>
                percentageOfValueFromTotal(
                  b.categoryHabitsChecked,
                  b.categoryHabitsNeeded
                ) -
                percentageOfValueFromTotal(
                  a.categoryHabitsChecked,
                  a.categoryHabitsNeeded
                )
            );

            setFormattedData(formattedData);
          }
        }
      })
      .finally(e => {
        setFetching(false);
      });
  };

  const SectionInputs = () => (
    <View style={[styles.sectionContainer, { marginBottom: 40 }]}>
      <CustomPicker
        selectedValue={inputsValue.period}
        onValueChange={itemValue => customSetInputsValue('period', itemValue)}
        customKey="period-key"
        label="Period"
        customContainerStyle={{ marginBottom: 17 }}
        options={periodList.map(item => ({ label: item, value: item }))}
      />
      <CustomPicker
        selectedValue={inputsValue.habit}
        onValueChange={itemValue => customSetInputsValue('habit', itemValue)}
        customKey="habit-key"
        label="Habit"
        placeholder="Select a Habit"
        options={getHabitsLabelAndValue()}
      />
    </View>
  );

  const getHabitsLabelAndValue = () => {
    const habits = [];

    formattedData?.categoryList?.forEach(item =>
      item?.habits?.forEach(habitItem => {
        habits.push({ label: habitItem.habit.hab_name, value: habitItem.id });
        return { label: habitItem.habit.hab_name, value: habitItem.id };
      })
    );

    return habits;
  };

  const customSetInputsValue = (key, value) => {
    setInputsValue({
      ...inputsValue,
      [key]: value,
    });

    if (key === 'period') {
      setOverallSummaryLabels(getPeriodLabelList(value));
      setFiltersForBackend(getInitialAndFinalDateBasedOnPeriod(value));
      return;
    }
  };

  const SectionOverallSummary = () => {
    const overallSummaryContent =
      formattedData.categoryList.length > 0
        ? getOverallSummaryContent(formattedData, inputsValue.habit)
        : { average: 0, data: [0, 0, 0, 0, 0] };

    return (
      <View style={[styles.sectionContainer, { marginBottom: 48 }]}>
        <View style={styles.sectionTitleContainer}>
          <Text style={styles.sectionTitle}>Overall Summary</Text>
          <TouchableOpacity onPress={navigateToHealthHabitReportDetails}>
            <Text style={styles.sectionTitleOption}>See details</Text>
          </TouchableOpacity>
        </View>
        <Text
          style={
            styles.overallSummaryEstimatedTextContainer
          }>{`${overallSummaryContent.average}%`}</Text>
        <LineChart
          data={{
            // labels: overallSummaryLabels,
            datasets: [
              { data: overallSummaryContent.data },
              { data: [100], withDots: false },
            ],
          }}
          bezier
          height={199}
          width={Dimensions.get('window').width + 70}
          withHorizontalLines={false}
          withVerticalLines={false}
          withDots={false}
          fromZero
          yAxisInterval={25}
          formatYLabel={y => `${y}%`}
          xLabelsOffset={0}
          yLabelsOffset={8}
          chartConfig={{
            backgroundGradientFrom: Colors.background,
            backgroundGradientTo: Colors.background,
            fillShadowGradientFrom: '#9CC6FF',
            fillShadowGradientFromOpacity: 1,
            fillShadowGradientTo: Colors.background,
            decimalPlaces: 0,
            color: () => '#9CC6FF',
            labelColor: () => Colors.text,
          }}
          style={{
            marginLeft: -30,
            marginBottom: 0,
            paddingBottom: 0,
          }}
        />
        <View style={styles.overallSummaryBottomGraphContainer}>
          {overallSummaryLabels.map((item, index) => (
            <Text
              key={`period-${index}`}
              style={styles.overallSummaryBottomGraphLabel}>
              {item}
            </Text>
          ))}
        </View>
      </View>
    );
  };

  const navigateToHealthHabitReportDetails = () =>
    props.navigation.navigate('HealthHabitReportDetails', {
      category: inputsValue.habit,
      period: inputsValue.period,
      formattedData,
    });

  const SectionHabitsByCategory = () => (
    <View style={[styles.sectionContainer, { marginBottom: 24 }]}>
      <View style={styles.sectionTitleContainer}>
        <Text style={styles.sectionTitle}>Habits by Category</Text>
      </View>

      {formattedData?.categoryList ? (
        <View style={styles.habitsByCategoryBarContainer}>
          {formattedData?.categoryList.map((item, idx) => {
            const categoryCheckPercentage = percentageOfValueFromTotal(
              item.categoryHabitsChecked,
              item.categoryHabitsNeeded
            );
            const barColors = getHabitsByCategoryBarColor(
              categoryCheckPercentage
            );

            return (
              <View
                style={[
                  styles.habitByCategoryItem,
                  idx === formattedData?.categoryList.length - 1
                    ? { marginBottom: 12 }
                    : {},
                ]}
                key={`section-${item.id}`}>
                <View
                  style={{
                    display: 'flex',
                    width: `100%`,
                    flexDirection: 'row',
                    paddingLeft: 8,
                    alignItems: 'center',
                    position: 'relative',
                  }}>
                  <Svg
                    style={[
                      styles.habitBarContainer,
                      {
                        width: `${categoryCheckPercentage}%`,
                        position: 'absolute',
                      },
                    ]}>
                    <Defs>
                      <LinearGradient
                        id={`grad-${idx}`}
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="0%">
                        <Stop offset="0" stopColor={barColors.from} />

                        <Stop offset="1" stopColor={barColors.to} />
                      </LinearGradient>
                    </Defs>

                    <Rect
                      rx={4}
                      width="100%"
                      height="100%"
                      fill={`url(#grad-${idx})`}
                    />
                  </Svg>

                  <View
                    style={{
                      justifyContent: 'center',
                      alignItems: 'center',
                      height: 19,
                      width: 19,
                      borderRadius: 2,
                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    }}>
                    <Icon
                      type="font-awesome"
                      name="clock"
                      size={9.5}
                      color={'#FFFFFF'}
                    />
                  </View>

                  <Text
                    style={[
                      styles.habitByCategoryBarLabel,
                      {
                        minWidth: 70,
                        width: `${categoryCheckPercentage - 8}%`,
                      },
                    ]}>
                    {item.hac_name}
                  </Text>

                  <Text
                    style={[
                      styles.habitByCategoryItemLabel,
                      categoryCheckPercentage >= 95
                        ? { position: 'absolute', right: 16 }
                        : null,
                    ]}>
                    {categoryCheckPercentage}
                  </Text>
                </View>
              </View>
            );
          })}

          <View style={styles.habitByCategoyBottomLabelContainer}>
            <Text style={styles.habitByCategoyBottomLabel}>0</Text>
            <Text style={styles.habitByCategoyBottomLabel}>25</Text>
            <Text style={styles.habitByCategoyBottomLabel}>50</Text>
            <Text style={styles.habitByCategoyBottomLabel}>75</Text>
            <Text style={styles.habitByCategoyBottomLabel}>100</Text>
          </View>
        </View>
      ) : null}
    </View>
  );

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
        <Fetching isFetching={fetching}>
          <View style={styles.container}>
            <SectionInputs />

            <SectionOverallSummary />

            <SectionHabitsByCategory />

            <View style={styles.moreDetailsContainer}>
              <TouchableOpacity
                onPress={navigateToHealthHabitReportDetails}
                style={styles.moreDetailsTouchableContainer}>
                <Text style={styles.moreDetailsText}>More details</Text>
                <Image
                  style={styles.moreDetailsArrow}
                  source={require('../../../assets/icons/arrow-up-right.png')}
                />
              </TouchableOpacity>
            </View>

            <Button
              buttonStyle={styles.exportButton}
              titleStyle={styles.exportButtonText}
              onPress={() => openPdf(filtersForBackend, inputsValue.period)}
              title="EXPORT TO PDF"
            />
          </View>
        </Fetching>
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
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    width: Dimensions.get('window').width - 44,
  },
  sectionTitle: {
    fontSize: 16,
    color: Colors.text,
    fontWeight: '700',
    marginRight: 32,
  },
  sectionTitleOption: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '700',
  },
  viewPicker: {
    marginBottom: 32,
    borderBottomRadius: 2,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(156, 198, 255, 0.4)',
    alignItems: 'center',
    width: Dimensions.get('window').width - 40,
  },
  pickerStyle: {
    width: Dimensions.get('window').width - 44,
    backgroundColor: Colors.primary,
    borderRadius: 2,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#455c8a',
    marginHorizontal: 10,
    paddingHorizontal: 16,
    paddingVertical: 15,
    marginBottom: 32,
    fontSize: 16,
    color: Colors.text,
  },
  pickerStyleAndroid: {
    marginHorizontal: 0,
    paddingVertical: 15,
    marginBottom: 0,
    color: Colors.primary4,
  },
  pickerStyleIOS: {
    backgroundColor: '#1c1c1e',
    borderWidth: 0,
    color: Colors.text,
    height: 200,
    paddingVertical: 0,
    marginVertical: 0,
  },
  containerSelectIOS: {
    paddingVertical: 15,
    paddingHorizontal: 16,
    borderColor: '#455c8a',
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 2,
    marginBottom: 32,
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: Dimensions.get('window').width - 44,
  },
  textSelectIOS: {
    fontSize: 16,
    color: '#455c8a',
  },
  moreDetailsContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 40,
  },
  moreDetailsTouchableContainer: {
    flexDirection: 'row',
  },
  moreDetailsText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.primary8,
    marginRight: 13,
  },
  moreDetailsArrow: {
    width: 24,
    height: 24,
    transform: [{ rotate: '45deg' }],
  },
  overallSummaryEstimatedTextContainer: {
    color: Colors.text,
    fontWeight: '600',
    lineHeight: 46,
    fontSize: 34,
    marginBottom: 16,
  },
  overallSummaryBottomGraphContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingLeft: 34,
    marginTop: -20,
  },
  overallSummaryBottomGraphLabel: {
    color: Colors.text,
    fontWeight: '400',
    fontSize: 12,
    lineHeight: 16,
  },
  habitsByCategoryBarContainer: {
    flexDirection: 'column',
  },
  habitByCategoryItem: {
    flexDirection: 'row',
    height: 32,
    marginBottom: 8,
    alignItems: 'center',
  },
  habitBarContainer: {
    height: '100%',
    borderRadius: 4,
  },
  habitByCategoryBarContainer: {
    display: 'flex',
    flexDirection: 'row',
  },
  habitByCategoryBarLabel: {
    fontWeight: '700',
    color: Colors.text,
    marginLeft: 8,
    fontSize: 14,
    lineHeight: 16,
  },
  habitByCategoryItemLabel: {
    fontWeight: '700',
    color: Colors.text,
    marginLeft: 8,
    fontSize: 12,
    lineHeight: 16,
  },
  habitByCategoyBottomLabelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  habitByCategoyBottomLabel: {
    color: Colors.text,
    fontWeight: '400',
    fontSize: 12,
    lineHeight: 16,
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

export default HealthHabitReport;
