import { call, put, takeLatest } from "redux-saga/effects";
import * as authAPI from "../../lib/api/authAPI";
import { authActions } from "../slices/authSlice";
function* loginSaga(action: { payload: { email: string; password: string } }) {
  try {
    const response: { data: string } = yield call(
      authAPI.login,
      action.payload
    );
    yield put(authActions.loginSuccess(response.data));
  } catch (e: any) {
    yield put(authActions.loginFailure(e.response.data));
  }
}
function* joinSaga(action: {
  payload: { email: string; name: string; password: string };
}) {
  try {
    const response: { data: string } = yield call(authAPI.join, action.payload);
    yield put(authActions.joinSuccess(response.data));
  } catch (e: any) {
    yield put(authActions.joinFailure(e.response.data));
  }
}
function* checkSaga() {
  try {
    const response: { data: { id: number; name: string } } = yield call(
      authAPI.check
    );
    // console.log(response.data);
    yield put(authActions.checkSuccess(response.data));
  } catch (e: any) {
    yield put(authActions.checkFailure(e.response.data));
  }
}
function* logoutSaga() {
  yield call(authAPI.logout);
  try {
    localStorage.removeItem("user");
  } catch (e) {
    console.error("localstorage is not working");
  }
}
function checkFailureSaga() {
  try {
    localStorage.removeItem("user");
  } catch (e) {
    console.error("localstorage is not working");
  }
}
export function* authSaga() {
  yield takeLatest(authActions.login, loginSaga);
  yield takeLatest(authActions.join, joinSaga);
  yield takeLatest(authActions.check, checkSaga);
  yield takeLatest(authActions.logout, logoutSaga);
  yield takeLatest(authActions.checkFailure, checkFailureSaga);
}
