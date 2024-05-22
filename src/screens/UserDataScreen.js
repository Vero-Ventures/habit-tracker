// Desc: This page works as is, but API calls are disabled for non-web applications.
// This is because emailjs is not supported on mobile devices.

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  ScrollView,
} from 'react-native';
import emailjs from '@emailjs/react-native';
import { supabase } from '../config/supabaseClient';
import store from '../store/storeConfig';

const serviceId = process.env.EXPO_PUBLIC_SERVICE_ID;
const templateId = process.env.EXPO_PUBLIC_TEMPLATE_ID;
const publicKey = process.env.EXPO_PUBLIC_PUBLIC_KEY;

const ContactForm = () => {
  const [email, setEmail] = useState();
  const [name, setName] = useState();
  const [message, setMessage] = useState();
  const session = store.getState().user.session;

  useEffect(() => {
    const fetchUserData = async () => {
      const { data } = await supabase.rpc('get_user_data', {
        p_user_id: session.user.id,
      });
      setMessage(JSON.stringify(data, null, 2));
    };

    fetchUserData();
  }, []);

  const onSubmit = async () => {
    emailjs
      .send(
        serviceId,
        templateId,
        {
          from_name: 'Ozan',
          to_email: 'sukhrajsidhu@live.ca',
          message: 'it works',
        },
        {
          publicKey: publicKey,
        }
      )
      .then(
        response => {
          console.log('SUCCESS!', response.status, response.text);
        },
        err => {
          console.log('FAILED...', err);
        }
      );
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.formElement}>
        <Text style={styles.label}>Name</Text>
        <TextInput
          style={styles.input}
          inputMode="text"
          placeholder="Your name.."
          value={name}
          onChangeText={setName}
        />
      </View>

      <View style={styles.formElement}>
        <Text style={styles.label}>E-mail</Text>
        <TextInput
          style={styles.input}
          inputMode="email"
          placeholder="Your email.."
          value={email}
          onChangeText={setEmail}
        />
      </View>

      <View style={styles.formElement}>
        <Text style={styles.label}>Message</Text>
        <TextInput
          style={styles.textarea}
          inputMode="text"
          placeholder="Your message.."
          value={message ? JSON.stringify(message, null, 2) : ''}
          editable={false}
          multiline
        />
      </View>
      <Button title="Submit" onPress={onSubmit} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 20,
    marginBottom: 20,
    textAlign: 'center',
  },
  formElement: {
    marginBottom: 15,
  },
  label: {
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 5,
  },
  textarea: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 5,
    height: 100,
  },
});

export default ContactForm;
