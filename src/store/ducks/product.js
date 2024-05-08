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

export const deleteUserProduct = (id) => {
  return axios.delete(`${Constants.baseUrl}/userproduct/${id}`);
};

export const getAllUserProduct = () => {
  return axios.get(`${Constants.baseUrl}/userproduct/all`);
};

export const getAll = () => {
  return axios.get(`${Constants.baseUrl}/product/all`);
};

export const storeUserProduct = (ids) => {
  return axios.post(`${Constants.baseUrl}/userproduct`, ids);
};
