import { createSelector, createSlice } from "@reduxjs/toolkit";
import { RootState } from "..";
import { Root } from "react-dom/client";
type State = {
  totalPrice: { [key: number]: number } | undefined;
  relate_view:
    | {
        [key: string]: number | string;
        currentId: number;
        itemName: string;
        top: number;
        left: number;
        point: number;
        sum_im_price: number;
        ex_price: number;
      }[]
    | null;
  relate_view_horizon:
    | {
        [key: string]: number | string;
        currentId: number;
        type: string;
        itemName: string;
        top: number;
        left: number;
        point: number;
        sum_im_price: number;
        ex_price: number;
      }[]
    | null;
  relate_price:
    | {
        currentId: number;
        im_price: number;
      }[]
    | null;
  selectedItemId: number | null;
  viewMode: boolean;
};
const initialState: State = {
  totalPrice: undefined,
  relate_view: null,
  relate_view_horizon: null,
  relate_price: null,
  selectedItemId: null,
  viewMode: false,
};
const viewSelector = (state: RootState) => {
  return state.relate.relate_view;
};
const viewHorizonSelector = (state: RootState) => {
  return state.relate.relate_view_horizon;
};
const priceSelector = (state: RootState) => {
  return state.relate.relate_price;
};
const totalPriceSelector = (state: RootState) => {
  return state.relate.totalPrice;
};
const selectedSelector = (state: RootState) => {
  return state.relate.selectedItemId;
};
const viewModeSelector = (state: RootState) => {
  return state.relate.viewMode;
};
export const relateData = createSelector(
  viewSelector,
  viewHorizonSelector,
  priceSelector,
  totalPriceSelector,
  selectedSelector,
  viewModeSelector,
  (
    relate_view,
    relate_view_horizon,
    relate_price,
    totalPrice,
    selectedItem,
    viewMode
  ) => ({
    relate_view,
    relate_view_horizon,
    relate_price,
    totalPrice,
    selectedItem,
    viewMode,
  })
);
const relateSlice = createSlice({
  name: "relate",
  initialState,
  reducers: {
    initRelate: (state) => {
      state.relate_view = initialState.relate_view;
      state.relate_price = initialState.relate_price;
      state.viewMode = false;
    },
    insertRelation_view: (state, { payload: relate }) => {
      // console.log("final_relate", relate);
      state.relate_view = relate;
    },
    insertRelation_view_horizon: (state, { payload: relate }) => {
      // console.log("relate", relate);
      state.relate_view_horizon = relate;
    },
    insertRelation_price: (state, { payload: relate }) => {
      state.relate_price = relate;
    },
    addCountRelateView: (state, { payload: currentId }) => {
      // if (state.relate_view) {
      //   const idx = state.relate_view?.findIndex(
      //     (view) => view.currentId === currentId
      //   );
      // console.log("idx of addCountRelateView", currentId, idx);
      // state.relate_view[idx].point += 1;
      // }
    },
    removeCountRelateView: (state, { payload: currentId }) => {
      if (state.relate_view) {
        console.log("currentId", currentId);
        const idx = state.relate_view?.findIndex(
          (view) => view.currentId === currentId
        );
        // console.log("idx", idx);
        state.relate_view.splice(idx, 1);
      }
    },
    calculateTotalPrice: (state, { payload: totalPrice }) => {
      state.totalPrice = totalPrice;
    },
    setSelectedItemId: (state, { payload: selectedId }) => {
      state.selectedItemId = selectedId;
    },
    setViewMode: (state, { payload: mode }) => {
      state.viewMode = mode;
    },
  },
});
export default relateSlice.reducer;
export const relateActions = relateSlice.actions;
