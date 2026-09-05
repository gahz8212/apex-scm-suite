import { call, put, takeLatest } from "redux-saga/effects";
import { itemActions } from "../slices/itemSlice";
import * as itemAPI from "../../lib/api/itemAPI";
function* excelAddSaga(action: { payload: any[] | null }) {
  try {
    const response: { data: any[] } = yield call(
      itemAPI.excelAdd,
      action.payload
    );
    yield put(itemActions.excelAddSuccess(response.data))
  } catch (e: any) {
    console.error(e);
    yield put(itemActions.excelAddFailure(e.response.data));
  }
}
export function* excelSaga() {
  yield takeLatest(itemActions.excelAdd, excelAddSaga);
}
