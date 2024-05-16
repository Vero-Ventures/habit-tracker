import { configureStore } from '@reduxjs/toolkit';
import habitsReducer from './ducks/habit';

const store = configureStore({
  reducer: {
    habits: habitsReducer, 
  },
});

export default store;




// import { createStore, combineReducers, compose, applyMiddleware } from "redux";
// import thunk from "redux-thunk";
// import user from "./ducks/user";
// import product from "./ducks/product";
// import fetching from "./ducks/fetching";
// import habit from "./ducks/habit";
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

// let store = createStore(reducers, compose(applyMiddleware(thunk)));

// export default store;


// import { configureStore } from '@reduxjs/toolkit';
// import userReducer from './ducks/user';
// import productReducer from './ducks/product';
// import fetchingReducer from './ducks/fetching';
// import habitReducer from './ducks/habit';
// import extraTipReducer from './ducks/extraTip';

// const store = configureStore({
//   reducer: {
//     fetching: fetchingReducer,
//     user: userReducer,
//     product: productReducer,
//     habits: habitReducer,
//     extraTip: extraTipReducer,
//   },
//   devTools: process.env.NODE_ENV !== 'production',
// });

// export default store;



