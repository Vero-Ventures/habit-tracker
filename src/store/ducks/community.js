import { Constants } from "../../constants/Constants";
import axios from "axios";

export const searchCommunity = (search) => {
  return axios.post(`${Constants.baseUrl}/community/search`, search);
};

export const getByCategory = (data) => {
  return axios.post(`${Constants.baseUrl}/community/getByCategory`, data);
};

export const listPublicCommunities = (data) => {
  return axios.post(
    `${Constants.baseUrl}/community/listPublicCommunities`,
    data,
  );
};

export const get = (id) => {
  return axios.get(`${Constants.baseUrl}/community/${id}`);
};

export const sendRequest = (data) => {
  return axios.post(`${Constants.baseUrl}/community/joinCommunity`, data);
};

export const store = (data) => {
  return axios.post(`${Constants.baseUrl}/community`, data);
};

export const updateAutomaticPublish = (id, data) => {
  return axios.put(`${Constants.baseUrl}/community/settings/${id}`, data);
};

export const getSettings = (id) => {
  return axios.get(`${Constants.baseUrl}/community/settings/${id}`);
};

export const getMembers = (data) => {
  return axios.post(`${Constants.baseUrl}/community/member/getAll`, data);
};

export const updateMember = (data) => {
  return axios.post(`${Constants.baseUrl}/community/member/update`, data);
};

export const answerRequest = (data) => {
  return axios.post(`${Constants.baseUrl}/community/member/answer`, data);
};

export const removeMember = (data) => {
  return axios.post(`${Constants.baseUrl}/community/member/remove`, data);
};

export const leaveCommunity = (data) => {
  return axios.post(`${Constants.baseUrl}/community/member/leave`, data);
};

export const getOldestMember = (id) => {
  return axios.get(`${Constants.baseUrl}/community/member/oldMember/${id}`);
};

export const listPosts = (data) => {
  return axios.post(`${Constants.baseUrl}/community/post/list`, data);
};

export const storePost = (data) => {
  return axios.post(`${Constants.baseUrl}/community/post`, data);
};

export const likePost = (id) => {
  return axios.post(`${Constants.baseUrl}/community/post/like/${id}`);
};

export const savePost = (id) => {
  return axios.post(`${Constants.baseUrl}/community/post/save/${id}`);
};

export const getPost = (id) => {
  return axios.get(`${Constants.baseUrl}/community/post/${id}`);
};

export const updatePost = (id, data) => {
  return axios.post(
    `${Constants.baseUrl}/community/post/${id}?_method=PUT`,
    data,
  );
};

export const storeComment = (id, data) => {
  return axios.post(`${Constants.baseUrl}/community/post/comment/${id}`, data);
};

export const listHabits = (id) => {
  return axios.get(`${Constants.baseUrl}/community/habit/list/${id}`);
};

export const getCommunityHabit = (id) => {
  return axios.get(`${Constants.baseUrl}/community/habit/${id}`);
};

export const storeCommunityHabit = (data) => {
  return axios.post(`${Constants.baseUrl}/community/habit`, data);
};

export const storeCustomCommunityHabit = (data) => {
  return axios.post(`${Constants.baseUrl}/community/habit/custom`, data);
};

export const updateCustomCommunityHabit = (data) => {
  return axios.post(`${Constants.baseUrl}/community/habit/updateCustom`, data);
};

export const updateCommunityHabit = (id, data) => {
  return axios.put(`${Constants.baseUrl}/community/habit/${id}`, data);
};

export const deleteCommunityHabit = (id) => {
  return axios.delete(`${Constants.baseUrl}/community/habit/${id}`);
};

export const deleteCommunityPost = (id) => {
  return axios.delete(`${Constants.baseUrl}/community/post/${id}`);
};
