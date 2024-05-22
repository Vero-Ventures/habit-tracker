import { combineReducers } from 'redux';
import { configureStore } from '@reduxjs/toolkit';
import user from './ducks/user';
// import product from "./ducks/product";
// import fetching from "./ducks/fetching";
import habit from './ducks/habit';
// import titan from "./ducks/titan";
// import extraTip from "./ducks/extraTip";

// const reducers = combineReducers({
//   fetching,
//   user,
//   product,
//   habit,
//   titan,
//   extraTip,
// });

const reducers = combineReducers({
  user,
  habit,
});

const store = configureStore({
  reducer: reducers,
});

export default store;
