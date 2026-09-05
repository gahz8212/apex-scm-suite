import { call, put, takeLatest } from "redux-saga/effects";
import * as itemAPI from "../../lib/api/itemAPI";
import { editActions } from "../slices/editSlice";

function* editImageSaga(action: { payload: FormData }) {
  try {
    const resonse: { data: { url: string }[] } = yield call(
      itemAPI.addImage,
      action.payload
    );
    yield put(editActions.editImageSuccess(resonse.data));
  } catch (e: any) {
    yield put(editActions.editImageFailure(e.response.data));
  }
}
function* editItemSaga(action: {
  payload: {
    [key: string]: "" | number | string | { url: string }[] | boolean | {}[];
  };
}) {
  try {
    const response: { data: string } = yield call(
      itemAPI.editItem,
      action.payload
    );

    yield put(editActions.editItemSuccess(response.data));
  } catch (e: any) {
    console.error(e);
    editActions.editItemFailure(e.response.data);
  }
}
function* removeItemSaga(action: { payload: number | "" }) {
  try {
    const response: { data: string } = yield call(
      itemAPI.removeItem,
      action.payload
    );
    yield call(itemAPI.removeItem, action.payload);
    yield put(editActions.removeItemSuccess(response.data));
  } catch (e: any) {
    console.error(e.response.data);
    yield put(editActions.removeItemFailure(e.response.data));
  }
}

export function* editSaga() {
  yield takeLatest(editActions.editImage, editImageSaga);
  yield takeLatest(editActions.editItem, editItemSaga);
  yield takeLatest(editActions.removeItem, removeItemSaga);
}
