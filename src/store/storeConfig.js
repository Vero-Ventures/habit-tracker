import { createStore, combineReducers, compose, applyMiddleware } from "redux";
import thunk from "redux-thunk";
import user from "./ducks/user";
import product from "./ducks/product";
import fetching from "./ducks/fetching";
import habit from "./ducks/habit";
import titan from "./ducks/titan";
import extraTip from "./ducks/extraTip";

const reducers = combineReducers({
  fetching,
  user,
  product,
  habit,
  titan,
  extraTip,
});

let store = createStore(reducers, compose(applyMiddleware(thunk)));

export default store;
