import { combineReducers, configureStore } from "@reduxjs/toolkit";
import createSagaMiddleware from "redux-saga";
import { all, call } from "redux-saga/effects";
import { authSaga } from "./sagas/authSaga";
import { itemSaga } from "./sagas/itemSaga";
import { editSaga } from "./sagas/editSaga";
import { excelSaga } from "./sagas/excelSaga";
import { orderSaga } from "./sagas/orderSaga";
import { currencySaga } from "./sagas/currencySaga";
import authSlice, { authActions } from "./slices/authSlice";
import itemSlice from "./slices/itemSlice";
import editSlice from "./slices/editSlice";
import formSlice from "./slices/formSlice";
import excelSlice from "./slices/excelSlice";
import searchSlice from "./slices/searchSlice";
import pageSlice from "./slices/pageSlice";
import orderSlice from "./slices/orderSlice";
import relateSlice from "./slices/relationSlice";
import currencySlice from "./slices/currencySlice";

const reducers = combineReducers({
  auth: authSlice,
  item: itemSlice,
  edit: editSlice,
  form: formSlice,
  excel: excelSlice,
  search: searchSlice,
  page: pageSlice,
  order: orderSlice,
  relate: relateSlice,
  currency: currencySlice,
});
function* rootSaga() {
  yield all([
    call(authSaga),
    call(itemSaga),
    call(editSaga),
    call(excelSaga),
    call(orderSaga),
    call(currencySaga),
  ]);
}
const sagaMiddleware = createSagaMiddleware();
const getUser = () => {
  try {
    const user = localStorage.getItem("user");
    if (!user) return;
    store.dispatch(authActions.check());
  } catch (e) {
    console.log("local storage is not working");
  }
};
const createStore = () => {
  const store = configureStore({
    reducer: reducers,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({ serializableCheck: false }).concat(sagaMiddleware),
  });
  sagaMiddleware.run(rootSaga);

  return store;
};
const store = createStore();
getUser();
export default store;
export type RootState = ReturnType<typeof store.getState>;
