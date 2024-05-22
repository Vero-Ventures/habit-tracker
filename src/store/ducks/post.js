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

export const getMyConnectionPost = (data) => {
  return axios.post(`${Constants.baseUrl}/post/connection`, data);
};

export const getTimelineMyPosts = (data) => {
  return axios.post(`${Constants.baseUrl}/post/timeline/myPosts`, data);
};

export const getTimelineAllPosts = (data) => {
  return axios.post(`${Constants.baseUrl}/post/timeline/all`, data);
};

export const getMyPost = (data) => {
  return axios.post(`${Constants.baseUrl}/post/user`, data);
};

export const getPost = (id) => {
  return axios.get(`${Constants.baseUrl}/post/${id}`);
};

export const updatePost = (id, data) => {
  return axios.get(`${Constants.baseUrl}/post/${id}?_method=PUT`, data);
};

export const savePost = (id) => {
  return axios.post(`${Constants.baseUrl}/post/save/${id}`);
};

export const storeComment = (id, data) => {
  return axios.post(`${Constants.baseUrl}/post/comment/${id}`, data);
};

export const likePost = (id) => {
  return axios.post(`${Constants.baseUrl}/post/like/${id}`);
};

export const deletePost = (id) => {
  return axios.delete(`${Constants.baseUrl}/post/${id}`);
};
export const deleteComment = (id) => {
  return axios.delete(`${Constants.baseUrl}/post/${id}`);
};

export const randomHabits = () => {
  return axios.post(`${Constants.baseUrl}/habit/random`);
};

export const listRandomHabits = (data) => {
  return axios.post(`${Constants.baseUrl}/habit/list`, data);
};
