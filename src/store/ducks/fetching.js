// Action Types

export const Types = {
  IS_FETCHING: "IS_FETCHING",
  DONE_FETCHING: "DONE_FETCHING",
};

// Reducer

const initialState = {
  isFetching: false,
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case Types.IS_FETCHING:
      return {
        ...state,
        isFetching: true,
      };
    case Types.DONE_FETCHING:
      return {
        ...state,
        isFetching: false,
      };
    default:
      return state;
  }
}

// Action Creators

export const isFetching = () => {
  return {
    type: Types.IS_FETCHING,
  };
};

export const doneFetching = () => {
  return {
    type: Types.DONE_FETCHING,
  };
};
