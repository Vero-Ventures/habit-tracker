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

export const getRanking = (data) => {
  return axios.post(`${Constants.baseUrl}/ranking/list`, data);
};

export const getUserRankingPosition = (data) => {
  return axios.get(`${Constants.baseUrl}/ranking/position`);
};
