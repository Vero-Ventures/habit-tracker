import { Constants } from "../../constants/Constants";
import axios from "axios";

// Action Types

export const Types = {
  TEAM_SET_CREATE_DATA: "TEAM_SET_CREATE_DATA",
};

// Reducer

const initialState = {
  createTeamData: {},
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case Types.TEAM_SET_CREATE_DATA:
      return {
        ...initialState,
        createTeamData: action.payload,
      };
    default:
      return state;
  }
}

// Action Creators

export const setCreateTeamData = (payload) => {
  return {
    type: Types.TEAM_SET_CREATE_DATA,
    payload,
  };
};

export const exitTeam = (id) => {
  return axios.put(`${Constants.baseUrl}/team/exit/${id}`);
};

export const getAll = () => {
  return axios.get(`${Constants.baseUrl}/team/all`);
};

export const get = (id) => {
  return axios.get(`${Constants.baseUrl}/team/${id}`);
};

export const store = (team) => {
  return axios.post(`${Constants.baseUrl}/team`, team);
};

export const addHabitsToUserTeam = (data) => {
  return axios.post(`${Constants.baseUrl}/userteam/habits`, data);
};

export const removeHabitFromUserTeam = (id) => {
  return axios.delete(`${Constants.baseUrl}/userteam/habits/${id}`);
};

export const inviteUsersToUserTeam = (data) => {
  return axios.post(`${Constants.baseUrl}/userteam/invite`, data);
};

export const removeUserFromUserTeam = (id) => {
  return axios.delete(`${Constants.baseUrl}/userteam/user/${id}`);
};
