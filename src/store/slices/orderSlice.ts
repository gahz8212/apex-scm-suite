import { createSlice, createSelector, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "..";
type State = {
  orderFile: ArrayBuffer | undefined | null;
  orderData: any[] | null;
  // packingData: any[] | null;
  palletData: {
    [key: number]: {
      [key: string]: string | number;
      item: string;
      CT_qty: number;
      sets: string;
      weight: number;
      cbm: number;
      moq: number;
    }[];
  };
  repairData:
    | {
        [key: string]: string | number | boolean;
        item: string;
        month: number;
        description: string;
        category: string;
        unit: string;
        ex_price: number;
        CT_qty: number;
        sets: string;
        weight: number;
        cbm: number;
        moq: number;
        number1: number;
        use: boolean;
      }[]
    | null;
  months: string[] | null;
  dummyItems: any[] | null;

  status: { error: string; loading: boolean; message: string };
};
const initialState: State = {
  orderFile: null,
  orderData: null,
  // packingData: null,
  palletData: {
    0: [],
    1: [],
    2: [],
    3: [],
    4: [],
    5: [],
    6: [],
    7: [],
    8: [],
    9: [],
  },
  repairData: null,
  months: null,
  dummyItems: null,
  // invoiceData: null,
  status: { error: "", loading: false, message: "" },
};
const orderSelector = (state: RootState) => {
  return state.order.orderData;
};
const monthSelector = (state: RootState) => {
  return state.order.months;
};
const dummyItemSelector = (state: RootState) => {
  return state.order.dummyItems;
};
const palletSelector = (state: RootState) => {
  return state.order.palletData;
};

export const OrderData = createSelector(
  orderSelector,
  monthSelector,
  dummyItemSelector,
  palletSelector,

  (orderData, months, dummyItems, palletData) => ({
    orderData,
    months,
    dummyItems,
    palletData,
  })
);
const orderSlice = createSlice({
  name: "order",
  initialState,
  reducers: {
    initForm: (state) => {
      state.orderData = initialState.orderData;
    },
    changeFile: (state, { payload: file }) => {
      state.orderData = file;
    },
    getData: (state, { payload: data }) => {
      state.orderData = data;
    },
    getMonth: (state, { payload: months }) => {
      state.months = months;
    },
    inputOrder: (state, action: PayloadAction<any[] | null>) => {
      state.status.loading = true;
      state.status.error = "";
    },
    inputOrderSuccess: (state, { payload: order }) => {
      state.status.loading = false;
      state.status.error = "";
      state.orderData = order;
      // state.packingData = order;
      state.months = Object.keys(order[0]).slice(1, 6);
    },
    inputOrderFailure: (state, { payload: error }) => {
      state.status.error = error;
      state.status.loading = false;
      state.status.message = "";
    },
    inputPallet: (
      state,
      action: PayloadAction<{
        [key: string]: { [key: string]: string | number }[];
      }>
    ) => {
      state.status.loading = true;
      state.status.error = "";
    },
    inputPalletSuccess: (state, { payload: palletData }) => {
      state.status.loading = false;
      state.status.error = "";
      state.palletData = palletData;
    },
    inputPalletFailure: (state, action: PayloadAction<any[] | null>) => {
      state.status.loading = false;
      state.status.error = "";
      state.status.message = "";
    },
    getDummyItem: (state) => {
      state.status.loading = true;
      state.status.error = "";
    },
    getDummyItemSuccess: (state, { payload: dummyItems }) => {
      state.status.loading = false;
      state.status.error = "";
      state.dummyItems = dummyItems;
    },
    getDummyItemFailure: (state, { payload: error }) => {
      state.status.loading = false;
      state.status.error = error;
    },
    inputGood: (state, action: PayloadAction<any[] | null>) => {
      state.status.loading = true;
      state.status.error = "";
    },
    inputGoodSuccess: (state, { payload: message }) => {
      state.status.loading = false;
      state.status.error = "";
      state.status.message = message;
    },
    inputGoodFailure: (state, { payload: error }) => {
      state.status.error = error;
      state.status.loading = false;
      state.status.message = "";
    },
    getOrderData: (state) => {
      state.status.error = "";
      state.status.loading = true;
      state.status.message = "";
    },
    getOrderDataSuccess: (state, { payload: invoiceData }) => {
      // console.log("invoiceData", invoiceData);
      state.status.error = "";
      state.status.loading = false;
      state.orderData = invoiceData;
    },
    getOrderDataFailure: (state, { payload: error }) => {
      state.status.error = error;
      state.status.loading = false;
      state.status.message = "";
    },
    getPalletData: (state) => {
      state.status.error = "";
      state.status.loading = true;
      state.status.message = "";
    },
    getPalletDataSuccess: (state, { payload: palletData }) => {
      state.status.error = "";
      state.status.loading = false;
      // console.log("palletData", palletData);
      for (let i = 0; i < 10; i++) {
        state.palletData[i] = palletData.filter(
          (data: { no: number }) => data.no === i
        );
      }
    },
    getPalletDataFailure: (state, { payload: error }) => {
      state.status.error = error;
      state.status.loading = false;
      state.status.message = "";
    },
    settingPallet: (state, { payload: packingData }) => {
      const { pNo, itemData } = packingData;
      // console.log("pNo", pNo + 1, "itemData", itemData);
      const items = state.palletData[pNo].map((data) => data.item);
      if (!items.includes(itemData.item)) {
        state.palletData[pNo] = [itemData, ...state.palletData[pNo]];
      }
    },
    updatePallet: (state, { payload: packingData }) => {
      const { pNo, itemData } = packingData;
      // console.log("itemData", itemData);
      //드래그중에 컨트롤키 누르면 복사 아니면 이동
      //이동일때는 기존의 파렛트 인덱스에서 삭제
      const items = state.palletData[pNo].map((data) => data.item);
      if (!items.includes(itemData.item)) {
        state.palletData[pNo] = [itemData, ...state.palletData[pNo]];
      }
    },
    addCount: (state, { payload: items }) => {
      const { id, item, value } = items;
      // console.log(value);

      let idx = state.palletData[id].findIndex((data) => data.item === item);
      // if (state.palletData[id][idx].CT_qty === value) {
      //   state.palletData[id][idx].CT_qty = value;
      // } else {
      // }
      state.palletData[id][idx].CT_qty += 1;
    },
    removeCount: (state, { payload: items }) => {
      const { id, item } = items;
      let idx = state.palletData[id].findIndex((data) => data.item === item);
      state.palletData[id][idx].CT_qty -= 1;
      if (state.palletData[id][idx].CT_qty < 1) {
        state.palletData[id][idx].CT_qty = 1;
      }
    },
    removeItem: (state, { payload: items }) => {
      const { id, item } = items;
      let idx = state.palletData[id].findIndex((data) => data.item === item);
      state.palletData[id].splice(idx, 1);
    },
    resetPallet: (state) => {
      state.palletData = initialState.palletData;
    },
    inputRepairToOrderSheet: (
      state,
      action: PayloadAction<
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
        | null
      >
    ) => {
      state.status.loading = true;
      state.status.error = "";
    },
    inputRepairToOrderSheetSuccess: (state, { payload: message }) => {
      state.status.message = message;
      state.status.error = "";
    },
    inputRepairToOrderSheetFailure: (state, { payload: error }) => {
      state.status.error = error;
    },
  },
});

export default orderSlice.reducer;
export const OrderAction = orderSlice.actions;
