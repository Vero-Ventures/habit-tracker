import { Constants } from "../../constants/Constants";
import axios from "axios";

// Action Types

export const Types = {};

// Reducer

const initialState = {};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    default:
      return state;
  }
}

// Action Creators

export const listConnection = () => {
  return axios.get(`${Constants.baseUrl}/userconnection/list`);
};

export const listConnectionByUser = (id) => {
  return axios.get(`${Constants.baseUrl}/userconnection/listByUser/${id}`);
};

export const getPending = () => {
  return axios.get(`${Constants.baseUrl}/userconnection/pending`);
};

export const storeConnection = (data) => {
  return axios.post(`${Constants.baseUrl}/userconnection`, data);
};

export const searchConnection = (search) => {
  return axios.post(`${Constants.baseUrl}/userconnection/search`, search);
};

export const getConnection = (id) => {
  return axios.get(`${Constants.baseUrl}/userconnection/${id}`);
};

export const getUsersByEmails = (data) => {
  return axios.post(`${Constants.baseUrl}/userconnection/getByEmails`, data);
};

export const answerConnection = (id, data) => {
  return axios.put(`${Constants.baseUrl}/userconnection/answer/${id}`, data);
};

export const cancelConnection = (id) => {
  return axios.put(`${Constants.baseUrl}/userconnection/cancel/${id}`);
};

export const cancelFirstInvite = (id) => {
  return axios.delete(
    `${Constants.baseUrl}/userconnection/cancelFirstInvite/${id}`,
  );
};

export const inviteAll = (data) => {
  return axios.post(`${Constants.baseUrl}/userconnection/inviteAll`, data);
};

export const cancelAll = (data) => {
  return axios.post(`${Constants.baseUrl}/userconnection/cancelAll`, data);
};

export const deleteConnection = (id) => {
  return axios.delete(`${Constants.baseUrl}/userconnection/${id}`);
};
