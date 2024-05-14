import moment from 'moment';
import { percentageOfValueFromTotal } from '../../utils/Utils';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Constants } from '../../constants/Constants';
import { Linking } from 'react-native';

const dividedPeriods = 5;

export const getInitialAndFinalDateBasedOnPeriod = period => {
  if (period === 'Month') {
    return {
      initialDate: moment().subtract(30, 'd').format('YYYY-MM-DD'),
      finalDate: moment().subtract(1, 'd').format('YYYY-MM-DD'),
    };
  }

  if (period === 'Quarter') {
    return {
      initialDate: moment().subtract(90, 'd').format('YYYY-MM-DD'),
      finalDate: moment().subtract(1, 'd').format('YYYY-MM-DD'),
    };
  }

  return {
    initialDate: moment().subtract(365, 'd').format('YYYY-MM-DD'),
    finalDate: moment().subtract(1, 'd').format('YYYY-MM-DD'),
  };
};

export const formatCategoryAndUserHabits = (
  data,
  { initialDate, finalDate }
) => {
  if (!data || (Array.isArray(data) && data.length === 0)) {
    return { categoryList: [] };
  }

  const totalDays = getDifferenceInDaysAndAddOneToIncludeLastDate(
    initialDate,
    finalDate
  );
  const totalNumberOfEachDayInWeek = generateAndReturnTotalDaysOnWeekBaseList(
    totalDays,
    initialDate
  );

  // totalNeededAndDoneInPeriods é apenas um array base para ser clonado.
  const totalNeededAndDoneInPeriods =
    generateAndReturnTotalCheckAndDoneInFourPeriodsBaseList(
      totalDays,
      initialDate
    );

  let totalOfAllCategoriesChecked = 0;
  let totalOfAllCategoriesNeeded = 0;

  const formattedHabitsAndCategories = data.map(categoryItem => {
    let categoryHabitsNeeded = 0,
      categoryHabitsChecked = 0;
    let categoryTotalNeededAndDoneInPeriods = [...totalNeededAndDoneInPeriods];

    const habits = categoryItem.habits.map(habitItem => {
      const { habitsChecked, habitsNeeded, habitTotalNeededAndDoneInPeriods } =
        getHabitsCheckAndNeeded(
          habitItem,
          totalDays,
          totalNumberOfEachDayInWeek,
          totalNeededAndDoneInPeriods
        );

      categoryHabitsChecked += habitsChecked;
      categoryHabitsNeeded += habitsNeeded;

      habitTotalNeededAndDoneInPeriods.forEach((item, index) => {
        categoryTotalNeededAndDoneInPeriods[index] = {
          ...categoryTotalNeededAndDoneInPeriods[index],
          checked:
            categoryTotalNeededAndDoneInPeriods[index].checked + item.checked,
          needed:
            categoryTotalNeededAndDoneInPeriods[index].needed + item.needed,
        };
      });

      return {
        ...habitItem,
        habitsChecked,
        habitsNeeded,
        habitTotalNeededAndDoneInPeriods,
      };
    });

    totalOfAllCategoriesChecked += categoryHabitsChecked;
    totalOfAllCategoriesNeeded += categoryHabitsNeeded;

    return {
      ...categoryItem,
      categoryHabitsChecked,
      categoryHabitsNeeded,
      categoryTotalNeededAndDoneInPeriods,
      habits,
    };
  });

  return {
    totalOfAllCategoriesChecked,
    totalOfAllCategoriesNeeded,
    categoryList: formattedHabitsAndCategories,
  };
};

const getDifferenceInDaysAndAddOneToIncludeLastDate = (
  initialDate,
  finalDate
) => {
  const momentInitialDate = moment(initialDate);
  const momentFinalDate = moment(finalDate);

  return momentFinalDate.diff(momentInitialDate, 'd') + 1;
};

const generateAndReturnTotalDaysOnWeekBaseList = (totalDays, initialDate) => {
  // Formato utilizado [Domingo, S, T, Q, Q, S, Sábado], o mesmo do day() do Moment.JS.
  let totalNumberOfEachDayInWeek = [0, 0, 0, 0, 0, 0, 0];

  Array(totalDays)
    .fill()
    .forEach((_item, index) => {
      const initialDateClone = moment(initialDate);
      const dayOfWeek = initialDateClone.add(index, 'd').day();

      totalNumberOfEachDayInWeek[dayOfWeek]++;
    });

  return totalNumberOfEachDayInWeek;
};

const generateAndReturnTotalCheckAndDoneInFourPeriodsBaseList = (
  totalDays,
  initialDate
) =>
  Array(dividedPeriods)
    .fill({ checked: 0, needed: 0 })
    .map((item, index) => {
      const startDate = moment(initialDate).add(
        index * (totalDays / dividedPeriods),
        'd'
      );

      // O -1 faz com que a finalDate termine exatamente na data esperada,
      // isso é necessário pois a initialDate está inclusa no período.
      const finalDate = moment(initialDate).add(
        (index + 1) * (totalDays / dividedPeriods) - 1,
        'd'
      );

      return { ...item, startDate, finalDate };
    });

const getHabitsCheckAndNeeded = (
  habitItem,
  totalDays,
  totalNumberOfEachDayInWeek,
  totalNeededAndDoneInPeriods
) => {
  const habitItemFrequency = JSON.parse(habitItem.ush_frequency);

  if (habitItemFrequency.type === 'EVERYDAY') {
    // Usa totalDays e habitItem.user_habit_check.length pois é todo dia.

    return {
      habitsNeeded: totalDays,
      habitsChecked: habitItem.user_habit_check.length,

      habitTotalNeededAndDoneInPeriods: getHabitTotalNeededAndDoneInPeriods(
        totalNeededAndDoneInPeriods,
        totalDays,
        habitItem.user_habit_check
      ),
    };
  }

  if (habitItemFrequency.type === 'WEEKDAY') {
    // Retira o Domingo (index 0) e Sábado (index 6).
    const habitsNeeded = totalNumberOfEachDayInWeek
      .filter((_item, index) => index !== 0 && index !== 6)
      .reduce(
        (totalNumberInWeekDayA, totalNumberInWeekDayB) =>
          totalNumberInWeekDayA + totalNumberInWeekDayB,
        0
      );
    const habitCheckedList = habitItem.user_habit_check.filter(item => {
      const dayOfWeekChecked = moment(item.uhc_date).day();

      return dayOfWeekChecked !== 0 && dayOfWeekChecked !== 6;
    });

    return {
      habitsNeeded: habitsNeeded,
      habitsChecked: habitCheckedList.length,

      habitTotalNeededAndDoneInPeriods: getHabitTotalNeededAndDoneInPeriods(
        totalNeededAndDoneInPeriods,
        habitsNeeded,
        habitCheckedList
      ),
    };
  }

  // Como o habitItemFrequency.days é retornado em um array de boolean da para utilizá-lo
  // como variável TRUE / FALSE para filtrar o array,
  // se tiver preenchido ele será TRUE e se não for utilizado será FALSE.

  const customHabitsNeeded = totalNumberOfEachDayInWeek
    .filter(
      (_item, index) =>
        habitItemFrequency.days[transformDayNumberOnWeekToStoredFormat(index)]
    )
    .reduce(
      (totalNumberInWeekDayA, totalNumberInWeekDayB) =>
        totalNumberInWeekDayA + totalNumberInWeekDayB,
      0
    );

  const customHabitsCheckedList = habitItem.user_habit_check.filter(item => {
    const formattedDayOfWeekChecked = transformDayNumberOnWeekToStoredFormat(
      moment(item.uhc_date).day()
    );

    return habitItemFrequency.days[formattedDayOfWeekChecked];
  });

  return {
    habitsNeeded: customHabitsNeeded,
    habitsChecked: customHabitsCheckedList.length,

    habitTotalNeededAndDoneInPeriods: getHabitTotalNeededAndDoneInPeriods(
      totalNeededAndDoneInPeriods,
      customHabitsNeeded,
      customHabitsCheckedList
    ),
  };
};

const transformDayNumberOnWeekToStoredFormat = numberInMoment => {
  // O formato que o Backend salva que dia o CUSTOM HABIT acontece é [Sábado, D, S, T, Q, Q, Sexta].
  // O utilizado no totalNumberOfEachDayInWeek foi [Domingo, S, T, Q, Q, S, Sábado], o mesmo do day() do Moment.JS.

  if (numberInMoment === 6) {
    return 0;
  }

  return numberInMoment + 1;
};

const getHabitTotalNeededAndDoneInPeriods = (
  totalNeededAndDoneInPeriods,
  totalNeeded,
  listToFilter
) => {
  const formattedListPeriod = totalNeededAndDoneInPeriods.map(item => {
    const filteredHabitChecks = listToFilter.filter(
      (userHabitCheckItem, index) => {
        const momentUhcDate = moment(userHabitCheckItem.uhc_date);

        // Inclui tanto a primeira data quanto a última, ou seja, [].
        return momentUhcDate.isBetween(
          item.startDate,
          item.finalDate,
          undefined,
          '[]'
        );
      }
    );

    return {
      ...item,
      needed: totalNeeded / dividedPeriods,
      checked: filteredHabitChecks.length,
    };
  });

  return formattedListPeriod;
};

export const getPeriodLabelList = period => {
  if (period === 'Month') {
    return ['1ST WEEK', '2ND WEEK', '3RD WEEK', '4TH WEEK'];
  }

  if (period === 'Quarter') {
    return ['1ST MONTH', '2ND MONTH', '3RD MONTH'];
  }

  return ['1ST QUART.', '2ND QUART.', '3RD QUART.', '4TH QUART.'];
};

export const getOverallSummaryContent = (formattedData, habitInputValue) => {
  if (habitInputValue) {
    const categoryIndex = formattedData.categoryList.findIndex(item =>
      item.habits.some(userHabitItem => userHabitItem.id === habitInputValue)
    );
    const userHabitIndex = formattedData.categoryList[
      categoryIndex
    ].habits.findIndex(userHabitItem => userHabitItem.id === habitInputValue);
    const selectedUserHabit =
      formattedData.categoryList[categoryIndex].habits[userHabitIndex];

    return {
      average: percentageOfValueFromTotal(
        selectedUserHabit.habitsChecked,
        selectedUserHabit.habitsNeeded
      ),
      data: selectedUserHabit.habitTotalNeededAndDoneInPeriods.map(item =>
        percentageOfValueFromTotal(item.checked, item.needed)
      ),
    };
  }

  let parcialData = Array(dividedPeriods)
    .fill(null)
    .map(() => ({ checked: 0, needed: 0 }));

  formattedData.categoryList.forEach(item => {
    item.categoryTotalNeededAndDoneInPeriods.forEach(
      (categoryTotalPeriodItem, index) => {
        parcialData[index].checked =
          parcialData[index].checked + categoryTotalPeriodItem.checked;
        parcialData[index].needed += categoryTotalPeriodItem.needed;
      }
    );
  });

  return {
    average: percentageOfValueFromTotal(
      formattedData.totalOfAllCategoriesChecked,
      formattedData.totalOfAllCategoriesNeeded
    ),
    data: parcialData.map(item =>
      percentageOfValueFromTotal(item.checked, item.needed)
    ),
  };
};

export const getHabitsByCategoryBarColor = donePercentage => {
  if (donePercentage >= 60) {
    return { from: '#33BD8A', to: '#21835F' };
  }

  if (donePercentage >= 40) {
    return { from: '#DACE67', to: '#9A9C26' };
  }

  return { from: '#DA6767', to: '#C53030' };
};

export const openPdf = async (filtersForBackend, period) => {
  let value = await AsyncStorage.getItem('token');
  let initialDateClone = filtersForBackend.initialDate;

  // Foram utilizados valores de 28 para Month e 364 para Year pois se pode dividir isto em 4 períodos que é o que o PDF pede.
  if (period === 'Month')
    initialDateClone = moment(initialDateClone)
      .add(2, 'd')
      .format('YYYY-MM-DD');
  if (period === 'Year')
    initialDateClone = moment(initialDateClone)
      .add(1, 'd')
      .format('YYYY-MM-DD');

  Linking.openURL(
    `${Constants.baseUrl}/getPdfHistoricoFicha?token=${value}&initialDate=${initialDateClone}&finalDate=${filtersForBackend.finalDate}`
  );
};
