import React, { useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Dimensions,
  Platform,
} from 'react-native';
import Colors from '../../assets/styles/Colors';
import { Picker } from '@react-native-picker/picker';
import RBSheet from 'react-native-raw-bottom-sheet';
import Icon from 'react-native-vector-icons/FontAwesome5';

const CustomPicker = props => {
  const values = props.placeholder
    ? [{ label: props.placeholder, value: '' }, ...props.options]
    : [...props.options];

  const RBSCustomPicker = useRef();

  const [valueIOS, setValueIOS] = useState(props.selectedValue ?? '');

  const closeModalIOS = change => {
    if (change) {
      props.onValueChange(valueIOS);
    }

    RBSCustomPicker.current.close();
  };

  const CustomPickerComponent = () => {
    let customProperties;

    if (Platform.OS === 'ios') {
      customProperties = {
        style: styles.pickerStyleIOS,
        selectedValue: valueIOS,
        onValueChange: (itemValue, itemIndex) => setValueIOS(itemValue),
        itemStyle: styles.pickerText,
        dropdownIconColor: Colors.text,
      };
    } else {
      customProperties = {
        style: styles.pickerText,
        selectedValue: props.selectedValue ?? '',
        onValueChange: (itemValue, itemIndex) => props.onValueChange(itemValue),
        placeholder: props.placeholder ?? null,
        dropdownIconColor: Colors.primary4,
      };
    }

    return (
      <Picker {...customProperties}>
        {values
          ? values.map(option => (
              <Picker.Item
                key={`${props.key}-option`}
                label={option.label}
                value={option.value}
              />
            ))
          : null}
      </Picker>
    );
  };

  const AndroidPicker = () => (
    <View
      style={[
        styles.customPickerContainer,
        props.customContainerStyle ?? null,
      ]}>
      <Text style={styles.pickerLabel}>{props.label}</Text>
      <CustomPickerComponent />
    </View>
  );

  return Platform.OS === 'ios' ? (
    <>
      <View
        style={[
          styles.customPickerContainer,
          props.customContainerStyle ?? null,
        ]}
        onPress={() => RBSCustomPicker.current.open()}>
        <Text style={styles.pickerLabel}>{props.label}</Text>

        <TouchableOpacity
          style={styles.touchableOpacityContainerIOS}
          onPress={() => RBSCustomPicker.current.open()}>
          <Text style={styles.pickerText}>
            {values.find(item => item.value === props.selectedValue)?.label ??
              ''}
          </Text>

          <Icon
            style={{ opacity: 0.4 }}
            size={10}
            color={'#9CC6FF'}
            name="chevron-down"
          />
        </TouchableOpacity>
      </View>
      <RBSheet
        ref={RBSCustomPicker}
        height={300}
        openDuration={250}
        customStyles={{ container: styles.containerBottomSheet }}
        closeOnPressBack={false}
        closeOnPressMask={false}
        onOpen={() => setValueIOS(props.selectedValue)}>
        <View style={styles.containerHeaderBottomSheet}>
          <TouchableOpacity onPress={() => closeModalIOS(false)}>
            <Text style={styles.textHeaderBottomSheet}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => closeModalIOS(true)}>
            <Text style={styles.textHeaderBottomSheet}>Confirm</Text>
          </TouchableOpacity>
        </View>

        <CustomPickerComponent />
      </RBSheet>
    </>
  ) : (
    <AndroidPicker />
  );
};

const styles = StyleSheet.create({
  customPickerContainer: {
    flexDirection: 'column',
    borderBottomColor: 'rgba(156, 198, 255, 0.4)',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  touchableOpacityContainerIOS: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingRight: 8,
    paddingBottom: 10,
  },
  pickerLabel: {
    fontSize: 16,
    color: Colors.text,
    lineHeight: 16,
    fontWeight: '400',
    marginBottom: 8,
  },
  pickerText: {
    fontSize: 16,
    color: Colors.primary4,
    opacity: 0.4,
  },
  containerHeaderBottomSheet: {
    backgroundColor: '#282828',
    paddingHorizontal: 16,
    paddingVertical: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: Dimensions.get('window').width,
  },
  textHeaderBottomSheet: {
    fontSize: 16,
    color: '#d7892b',
  },
  containerBottomSheet: {
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1c1c1e',
  },
  pickerStyleIOS: {
    width: Dimensions.get('window').width - 44,
    height: 200,
    backgroundColor: '#1c1c1e',
    borderRadius: 2,
    borderWidth: 0,
    color: Colors.text,
    borderColor: '#455c8a',
    marginHorizontal: 10,
    paddingHorizontal: 16,
    marginVertical: 0,
    paddingVertical: 0,
    marginBottom: 32,
    fontSize: 16,
  },
});

export default CustomPicker;
