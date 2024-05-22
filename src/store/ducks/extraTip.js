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

export const get = (id) => {
  return axios.get(`${Constants.baseUrl}/extratip/${id}`);
};

export const getAll = () => {
  return axios.get(`${Constants.baseUrl}/extratip/all`);
};
