import { createSlice, createSelector } from "@reduxjs/toolkit";
import { RootState } from "..";

type State = {
  fromCurrency: string;
  resultCurrency: {} | null;

  status: {
    [key: string]: string | boolean;
    message: string;
    error: string;
    loading: boolean;
  };
};
const initialState: State = {
  fromCurrency: "krw",
  resultCurrency: null,
  status: { message: "", error: "", loading: false },
};
const fromCurrencySelector = (state: RootState) => {
  return state.currency.fromCurrency;
};
const resultSelector = (state: RootState) => {
  return state.currency.resultCurrency;
};
const currencyStatusSelector = (state: RootState) => {
  return state.currency.status;
};
export const currencyData = createSelector(
  fromCurrencySelector,
  resultSelector,
  currencyStatusSelector,
  (fromCurrency, resultCurrency, status) => ({
    fromCurrency,
    resultCurrency,
    status,
  })
);
const currencySlice = createSlice({
  name: "currency",
  initialState,
  reducers: {
    searchCurrency: (state) => {
      state.status.message = "";
      state.status.error = "";
      state.status.loading = true;
    },
    searchCurrencySuccess: (state, { payload: resultCurrency }) => {
      state.status.message = "search currency_ok";
      state.status.loading = false;
      state.resultCurrency = resultCurrency;
    },
    searchCurrencyFailure: (state, { payload: error }) => {
      state.status.loading = false;
      state.status.error = error;
    },
  },
});
export default currencySlice.reducer;
export const currencyActions = currencySlice.actions;
