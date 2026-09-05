import { createSlice, createSelector, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../";
type State = {
  [key: string]: {
    [key: string]: string | { id: number | ""; name: string } | null;
  };
  login: { email: string; password: string };
  join: { email: string; password: string; name: string };
  status: {
    message: string;
    error: string;
    auth: { id: number | ""; name: string } | null;
  };
};

const initialState: State = {
  login: { email: "", password: "" },
  join: { email: "", name: "", password: "" },
  status: { message: "", error: "", auth: null },
};
const errorSelector = (state: RootState) => {
  return state.auth.status.error;
};
const messageSelector = (state: RootState) => {
  return state.auth.status.message;
};
const authSelector = (state: RootState) => {
  return state.auth.status.auth;
};
const loginSelector = (state: RootState) => {
  return state.auth.login;
};
const joinSelector = (state: RootState) => {
  return state.auth.join;
};
export const response = createSelector(
  errorSelector,
  messageSelector,
  authSelector,
  loginSelector,
  joinSelector,
  (error, message, auth, loginData, joinData) => ({
    error,
    message,
    auth,
    loginData,
    joinData,
  })
);
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    initForm: (state, { payload: form }) => {
      state[form] = initialState[form];
      state.status.message = initialState.status.message;
      state.status.error = initialState.status.error;
    },
    errorReset: (state) => {
      state.status.error = "";
    },
    changeField: (state, { payload: { form, key, value } }) => {
      state[form][key] = value;
    },
    login: (
      state,
      action: PayloadAction<{ email: string; password: string }>
    ) => {
      state.status.error = "";
      state.status.message = "";
    },
    loginSuccess: (state, { payload: message }) => {
      state.status.message = message;
      state.status.error = "";
    },
    loginFailure: (state, { payload: error }) => {
      state.status.message = "";
      state.status.error = error;
    },
    join: (
      state,
      action: PayloadAction<{ email: string; password: string; name: string }>
    ) => {
      state.status.message = "";
      state.status.error = "";
    },
    joinSuccess: (state, { payload: message }) => {
      state.status.message = message;
      state.status.error = "";
    },
    joinFailure: (state, { payload: error }) => {
      state.status.message = "";
      state.status.error = error;
    },
    check: (state) => {
      state.status.error = "";
      state.status.message = "";
    },
    checkSuccess: (state, { payload: auth }) => {
      // console.log("auth", auth);
      state.status.auth = auth;
      state.status.error = "";
    },
    checkFailure: (state, { payload: error }) => {
      state.status.error = error;
    },
    logout: (state) => {
      state.status.auth = initialState.status.auth;
    },
  },
});
export default authSlice.reducer;
export const authActions = authSlice.actions;
