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

export const getLastUserScore = (id) => {
  return axios.get(`${Constants.baseUrl}/userscore/last/${id}`);
};

export const storeUserScore = (data) => {
  return axios.post(`${Constants.baseUrl}/userscore`, data);
};

export const getScoreForm = (id) => {
  return axios.get(`${Constants.baseUrl}/scoreform/${id}`);
};
