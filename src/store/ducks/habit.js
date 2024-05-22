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
  return axios.get(`${Constants.baseUrl}/habit/${id}`);
};

export const storeUserHabit = (user_habit) => {
  return axios.post(`${Constants.baseUrl}/userhabit`, user_habit);
};

export const deleteUserHabit = (id) => {
  return axios.delete(`${Constants.baseUrl}/userhabit/${id}`);
};

export const checkUserHabit = (id, data) => {
  return axios.put(`${Constants.baseUrl}/userhabit/check/${id}`, data);
};

export const storeCustom = (user_habit) => {
  return axios.post(`${Constants.baseUrl}/userhabit/custom`, user_habit);
};

export const getMomentum = () => {
  return axios.get(`${Constants.baseUrl}/userhabit/momentum`);
};

export const getAllCategory = () => {
  return axios.get(`${Constants.baseUrl}/category/all`);
};

export const getAllCategoryUserHabits = () => {
  return axios.get(`${Constants.baseUrl}/userhabit/category/all`);
};

export const getUserHabit = (id) => {
  return axios.get(`${Constants.baseUrl}/userhabit/${id}`);
};

export const updateCustomUserHabit = (data) => {
  return axios.post(`${Constants.baseUrl}/userhabit/updateCustom`, data);
};

export const updateUserHabit = (id, data) => {
  return axios.put(`${Constants.baseUrl}/userhabit/${id}`, data);
};

export const getAllUserHabits = () => {
  return axios.get(`${Constants.baseUrl}/userhabit/all`);
};

export const listAllHabitsByUser = (id) => {
  return axios.get(`${Constants.baseUrl}/userhabit/listByUser/${id}`);
};

export const getUserChecklist = (data) => {
  return axios.post(`${Constants.baseUrl}/userhabit/checklist`, data);
};

export const toggleUserHabit = (id, data) => {
  return axios.put(`${Constants.baseUrl}/userhabit/toggle/${id}`, data);
};

export const getAllCategoryWithCheckedHabbits = (data) => {
  return axios.post(
    `${Constants.baseUrl}/userhabit/category/getAllCategoryWithCheckedHabbits`,
    data,
  );
};

export const storeWithCommunityHabits = (communityHabitsId) => {
  return axios.post(
    `${Constants.baseUrl}/userhabit/withCommunityHabits`,
    communityHabitsId,
  );
};
