import { call, put, take, takeLatest } from "redux-saga/effects";
import { OrderAction } from "../slices/orderSlice";
import * as orderAPI from "../../lib/api/orderAPI";
function* getDummyItemSaga() {
  try {
    const response: { data: any[] } = yield call(orderAPI.getDummyItem);
    yield put(OrderAction.getDummyItemSuccess(response.data));
  } catch (e: any) {
    console.error(e);
    yield put(OrderAction.getDummyItemFailure(e.response.data));
  }
}
function* getOrderDataSaga() {
  try {
    const response: { data: any[] } = yield call(orderAPI.getOrderData);

    yield put(OrderAction.getOrderDataSuccess(response.data));
    yield put(OrderAction.inputOrderSuccess(response.data));
  } catch (e: any) {
    console.error(e);
    yield put(OrderAction.getOrderDataFailure(e.response.data));
  }
}
function* getPalletDataSaga() {
  try {
    const response: {
      data: { [key: string]: { [key: string]: string | number }[] };
    } = yield call(orderAPI.getPalletData);
    // console.log("response.data", response.data);
    yield put(OrderAction.getPalletDataSuccess(response.data));
  } catch (e: any) {
    console.error(e);
    yield put(OrderAction.getPalletDataFailure(e.response.data));
  }
}
function* inputOrderSaga(action: { payload: any[] | null }) {
  try {
    const response: { data: any[] } = yield call(
      orderAPI.orderInput,
      action.payload
    );
    yield put(OrderAction.inputOrderSuccess(response.data));
  } catch (e: any) {
    console.error(e);
    yield put(OrderAction.inputOrderFailure(e.response.data));
  }
}
function* inputGoodSaga(action: { payload: any[] | null }) {
  try {
    const response: { data: string } = yield call(
      orderAPI.goodInput,
      action.payload
    );

    yield put(OrderAction.inputGoodSuccess(response.data));
  } catch (e: any) {
    console.error(e);
    yield put(OrderAction.inputGoodFailure(e.response.data));
  }
}
function* inputPalletSaga(action: {
  payload: { [key: string]: { [key: string]: string | number }[] };
}) {
  try {
    const response: { data: any[] } = yield call(
      orderAPI.palletInput,
      action.payload
    );
    yield put(OrderAction.inputPalletSuccess(response.data));
  } catch (e: any) {
    console.error(e);
    yield put(OrderAction.inputPalletFailure(e.response.data));
  }
}
function* inputRepairToOrderSheetSaga(action: {
  payload:
    | {
        id: number;
        check: boolean;
        itemName: string;
        month: string;
        quantity: number;
        description: string;
        category: string;
        unit: string;
        ex_price: number;
        sets: string;
        weight: number;
        cbm: number;
        number1: number;
        use: boolean;
      }[]
    | null;
}) {
  try {
    const response: { data: string } = yield call(
      orderAPI.inputRepairToOrdersheet,
      action.payload
    );
    yield put(OrderAction.inputRepairToOrderSheetSuccess(response.data));
  } catch (e: any) {
    yield put(OrderAction.inputRepairToOrderSheetFailure(e.response.data));
  }
}
export function* orderSaga() {
  yield takeLatest(OrderAction.inputOrder, inputOrderSaga);
  yield takeLatest(OrderAction.inputGood, inputGoodSaga);
  yield takeLatest(OrderAction.getOrderData, getOrderDataSaga);
  yield takeLatest(OrderAction.getDummyItem, getDummyItemSaga);
  yield takeLatest(OrderAction.inputPallet, inputPalletSaga);
  yield takeLatest(OrderAction.getPalletData, getPalletDataSaga);
  yield takeLatest(
    OrderAction.inputRepairToOrderSheet,
    inputRepairToOrderSheetSaga
  );
}
