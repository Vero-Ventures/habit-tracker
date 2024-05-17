// import { Alert } from "react-native";
// import { isFetching, doneFetching } from "./fetching";
// import { Constants } from "../../constants/Constants";
// import axios from "axios";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import * as Notifications from "expo-notifications";
// import { supabase } from "../../config/supabaseClient";
// import { useSelector } from "react-redux";

// // Action Types

export const Types = {
  USER_LOGGED_IN: 'USER_LOGGED_IN',
  USER_LOGGED_OUT: 'USER_LOGGED_OUT',
  USER_SET_REGISTER_DATA: 'USER_SET_REGISTER_DATA',
};

// // Reducer

const initialState = {};

export default function users(state = initialState, action) {
  switch (action.type) {
    case Types.USER_LOGGED_IN:
      var { session } = action.payload;
      return { ...state, session: session };
    case Types.USER_LOGGED_OUT:
      return {
        ...initialState,
      };
    // case Types.USER_SET_REGISTER_DATA:
    //   return action.payload;
    default:
      return state;
  }
}

// // Action Creators

export function userLogin(session) {
  return {
    type: Types.USER_LOGGED_IN,
    payload: { session },
  };
}

// export const getBasicInformationUser = (id) => {
//   return axios.get(`${Constants.baseUrl}/user/${id}`);
// };

// export const getUserInfos = (id) => {
//   return axios.post(`${Constants.baseUrl}/user/getInfos`);
// };

// export const setRegisterData = (payload) => {
//   return {
//     type: Types.USER_SET_REGISTER_DATA,
//     payload,
//   };
// };

// export const userLogged = (user) => {
//   return {
//     type: Types.USER_LOGGED_IN,
//     payload: user,
//   };
// };

// export const setLogout = () => {
//   return {
//     type: Types.USER_LOGGED_OUT,
//   };
// };

// export const login = (email, password) => {
// return (dispatch) => {
//   dispatch(isFetching());
//   axios
//     .post(`${Constants.baseUrl}/auth`, {
//       email: user.email,
//       password: user.password,
//       facebookToken: user.facebookToken,
//       googleToken: user.googleToken,
//       appleCredential: user.appleCredential,
//       firstLogin: user.firstLogin === undefined ? false : user.firstLogin,
//     })
//     .catch((err) => {
//       if (err?.response?.status === 500) {
//         AsyncStorage.multiRemove([
//           "password",
//           "email",
//           "token",
//           "facebookUser",
//           "googleToken",
//         ]);

//         Alert.alert(
//           "Ops!",
//           "Something went wrong with our servers. Please contact us.",
//         );
//       } else {
//         if (err.response.data?.errors?.email) {
//           Alert.alert("Ops!", err.response.data.errors.email[0]);
//         } else {
//           Alert.alert(
//             "Ops!",
//             "Something went wrong with our servers. Please contact us.",
//           );
//         }
//       }

//       dispatch(doneFetching());
//     })
//     .then((res) => {
//       if (res?.status === 200) {
//         if (res.data.errors) {
//           AsyncStorage.multiRemove([
//             "password",
//             "email",
//             "token",
//             "facebookUser",
//             "googleToken",
//           ]);

//           Alert.alert("Ops!", res.data.errors[0]);
//         } else {
//           AsyncStorage.setItem("email", res.data.user.email);
//           AsyncStorage.setItem("token", res.data.token);

//           user.password
//             ? AsyncStorage.setItem("password", user.password)
//             : null;
//           user.googleToken
//             ? AsyncStorage.setItem("googleToken", user.googleToken)
//             : null;
//           user.facebookToken
//             ? AsyncStorage.setItem("facebookToken", user.facebookToken)
//             : null;

//           var payload = res.data.user;
//           payload.isLogged = true;
//           payload.firstLogin = res.data.firstLogin;

//           axios.defaults.headers.common["Authorization"] =
//             `Bearer ${res.data.token}`;

//           axios.interceptors.response.use(
//             function (response) {
//               return response;
//             },
//             function (error) {
//               if (error.response.status === 401) {
//                 dispatch(logout());
//                 navigation.navigate("Auth");
//               }
//             },
//           );

//           dispatch(userLogged(payload));
//         }
//       }

//       dispatch(doneFetching());
//     });
// };
// };

// export const update = (user, navigation) => {
//   let userForm = new FormData();

//   userForm.append("name", user.name);
//   userForm.append("email", user.email);
//   userForm.append("gender", user.gender);

//   user.password ? userForm.append("password", user.password) : null;
//   user.profile_picture
//     ? userForm.append("profile_picture", user.profile_picture)
//     : null;

//   return (dispatch, getState) => {
//     dispatch(isFetching());

//     axios
//       .post(`${Constants.baseUrl}/user/update`, userForm)
//       .catch((err) => {
//         Alert.alert(
//           "Ops!",
//           "Something went wrong with our servers. Please contact us.",
//         );
//       })
//       .then((res) => {
//         if (res?.status === 200) {
//           if (res.data.errors) {
//             Alert.alert("Ops!", res.data.errors[0]);
//           } else {
//             AsyncStorage.setItem("email", user.email);
//             user.password
//               ? AsyncStorage.setItem("password", user.password)
//               : null;

//             let userAux = getState().user;

//             userAux.name = user.name;
//             userAux.email = user.email;
//             userAux.image = res.data.image;
//             userAux.usr_gender = user.gender;

//             dispatch(userLogged(userAux));

//             Alert.alert(
//               "Success",
//               "Your profile was successfully updated!",
//               [
//                 {
//                   text: "Ok",
//                   onPress: () => [navigation.pop()],
//                 },
//               ],
//               { cancelable: false },
//             );
//           }
//         }

//         dispatch(doneFetching());
//       });
//   };
// };

// export const deleteAccount = () => {
//   return axios.delete(`${Constants.baseUrl}/user`);
// };

// export const register = (user) => {
//   return axios.post(`${Constants.baseUrl}/register`, user);
// };

// export const updateInfos = (data) => {
//   return (dispatch, getState) => {
//     dispatch(isFetching());

//     axios
//       .post(`${Constants.baseUrl}/user/updateInfos`, data)
//       .catch((err) => {
//         Alert.alert(
//           "Ops!",
//           "Something went wrong with our servers. Please contact us.",
//         );
//       })
//       .then((res) => {
//         if (res?.status === 200) {
//           if (res.data.errors) {
//             Alert.alert("Ops!", res.data.errors[0]);
//           } else {
//             let userAux = getState().user;

//             userAux.usr_quote_to_live_by = res.data.usr_quote_to_live_by;
//             userAux.usr_biggest_hack = res.data.usr_biggest_hack;
//             userAux.usr_biggest_challenge = res.data.usr_biggest_challenge;

//             dispatch(userLogged(userAux));

//             Alert.alert("Success", "Your profile was successfully updated!");
//           }
//         }

//         dispatch(doneFetching());
//       });
//   };
// };

// export const updateFavoriteBook = (data, navigation) => {
//   let userForm = new FormData();

//   userForm.append("book_name", data.book_name);
//   data.book_picture && data.image_changed
//     ? userForm.append("book_picture", data.book_picture)
//     : null;

//   return (dispatch, getState) => {
//     dispatch(isFetching());

//     axios
//       .post(`${Constants.baseUrl}/user/updateBook`, userForm)
//       .catch((err) => {
//         Alert.alert(
//           "Ops!",
//           "Something went wrong with our servers. Please contact us.",
//         );
//       })
//       .then((res) => {
//         if (res?.status === 200) {
//           if (res.data.errors) {
//             Alert.alert("Ops!", res.data.errors[0]);
//           } else {
//             let userAux = getState().user;

//             userAux.usr_favorite_book = data.book_name;
//             userAux.image_book = res.data.image_book;

//             dispatch(userLogged(userAux));

//             Alert.alert(
//               "Success",
//               "Your profile was successfully updated!",
//               [
//                 {
//                   text: "Ok",
//                   onPress: () => [navigation.pop()],
//                 },
//               ],
//               { cancelable: false },
//             );
//           }
//         }

//         dispatch(doneFetching());
//       });
//   };
// };

// export const updateFavoriteFood = (data, navigation) => {
//   let userForm = new FormData();

//   userForm.append("food_name", data.food_name);
//   data.food_picture && data.image_changed
//     ? userForm.append("food_picture", data.food_picture)
//     : null;

//   return (dispatch, getState) => {
//     dispatch(isFetching());

//     axios
//       .post(`${Constants.baseUrl}/user/updateFood`, userForm)
//       .catch((err) => {
//         Alert.alert(
//           "Ops!",
//           "Something went wrong with our servers. Please contact us.",
//         );
//       })
//       .then((res) => {
//         if (res?.status === 200) {
//           if (res.data.errors) {
//             Alert.alert("Ops!", res.data.errors[0]);
//           } else {
//             let userAux = getState().user;

//             userAux.usr_favorite_food = data.food_name;
//             userAux.image_food = res.data.image_food;

//             dispatch(userLogged(userAux));

//             Alert.alert(
//               "Success",
//               "Your profile was successfully updated!",
//               [
//                 {
//                   text: "Ok",
//                   onPress: () => [navigation.pop()],
//                 },
//               ],
//               { cancelable: false },
//             );
//           }
//         }

//         dispatch(doneFetching());
//       });
//   };
// };

// export const logout = () => {
//   return (dispatch) => {
//     AsyncStorage.multiRemove([
//       "password",
//       "email",
//       "token",
//       "googleToken",
//       "facebookToken",
//     ]);

//     dispatch(removePush());
//     dispatch(setLogout());
//   };
// };

// export const sendPush = (dados) => {
//   if (Platform.OS === "android") {
//     Notifications.createChannelAndroidAsync("pushChannel", {
//       name: "pushChannel",
//       priority: "max",
//       vibrate: [0, 250, 250, 250],
//     });
//   }

//   return axios.post(`${Constants.baseUrl}/push`, dados);
// };

// export const removePush = () => {
//   return (dispatch) => {
//     axios.delete(`${Constants.baseUrl}/push`).catch((err) => {
//       dispatch(
//         setMessage({
//           title: "Erro",
//           text: "Ocorreu um erro inesperado!",
//         }),
//       );
//     });
//   };
// };

// export const getSavedPosts = (data) => {
//   return axios.post(`${Constants.baseUrl}/user/savedPosts`, data);
// };

// export const checkEmail = (data) => {
//   return axios.post(`${Constants.baseUrl}/checkEmail`, data);
// };
