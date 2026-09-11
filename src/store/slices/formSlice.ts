import { createSlice, createSelector } from "@reduxjs/toolkit";
import { RootState } from "..";
type State = {
  [key: string]: {
    visible: boolean;
    position: { x: number; y: number };
  };
  input: { visible: boolean; position: { x: number; y: number } };
  edit: { visible: boolean; position: { x: number; y: number } };
  relate: { visible: boolean; position: { x: number; y: number } };
  invoice: { visible: boolean; position: { x: number; y: number } };
  packing: { visible: boolean; position: { x: number; y: number } };
  addItem: { visible: boolean; position: { x: number; y: number } };
  pallet: { visible: boolean; position: { x: number; y: number } };
  picker: { visible: boolean; position: { x: number; y: number } };
};

export const getCenterPosition = (form: string) => {
  if (typeof window === "undefined") {
    return { x: 300, y: 150 };
  }
  const widthMap: { [key: string]: number } = {
    input: 320,
    edit: 320,
    picker: 400,
    relate: 400,
    addItem: 400,
    invoice: 520,
    packing: 520,
    pallet: 650,
  };
  const heightMap: { [key: string]: number } = {
    input: 580,
    edit: 580,
    picker: 400,
    relate: 500,
    addItem: 500,
    invoice: 600,
    packing: 600,
    pallet: 600,
  };

  if (form === "packing") {
    // 패킹리스트와 팔레트가 함께 열릴 때 화면 중앙 기준으로 나란히 배치
    const totalW = 520 + 20 + 650; // 1190px
    if (window.innerWidth >= 1200) {
      const startX = Math.max(10, Math.floor((window.innerWidth - totalW) / 2));
      const y = Math.max(80, Math.floor((window.innerHeight - 600) / 2));
      return { x: startX, y };
    } else {
      const x = Math.max(10, Math.floor((window.innerWidth - 520) / 2) - 30);
      const y = Math.max(80, Math.floor((window.innerHeight - 600) / 2));
      return { x, y };
    }
  }

  if (form === "pallet") {
    // 팔레트는 패킹리스트 우측에 나란히 배치
    const totalW = 520 + 20 + 650; // 1190px
    if (window.innerWidth >= 1200) {
      const startX = Math.max(10, Math.floor((window.innerWidth - totalW) / 2));
      const y = Math.max(80, Math.floor((window.innerHeight - 600) / 2));
      return { x: startX + 540, y };
    } else {
      const x = Math.max(10, Math.floor((window.innerWidth - 650) / 2) + 30);
      const y = Math.max(80, Math.floor((window.innerHeight - 600) / 2));
      return { x, y };
    }
  }

  const w = widthMap[form] || 320;
  const h = heightMap[form] || 500;
  const x = Math.max(10, Math.floor((window.innerWidth - w) / 2));
  const y = Math.max(80, Math.floor((window.innerHeight - h) / 2));
  return { x, y };
};

const initialState: State = {
  input: { visible: false, position: getCenterPosition("input") },
  relate: { visible: false, position: { x: 180, y: 120 } },
  edit: { visible: false, position: getCenterPosition("edit") },
  invoice: { visible: false, position: getCenterPosition("invoice") },
  packing: { visible: false, position: getCenterPosition("packing") },
  pallet: { visible: false, position: getCenterPosition("pallet") },
  addItem: { visible: false, position: { x: 100, y: 120 } },
  picker: { visible: false, position: getCenterPosition("picker") },
};
const inputFormSelector = (state: RootState) => {
  return state.form.input;
};
const editFormSelector = (state: RootState) => {
  return state.form.edit;
};
const relateFormSelector = (state: RootState) => {
  return state.form.relate;
};
const invoiceFormSelector = (state: RootState) => {
  return state.form.invoice;
};
const packingFormSelector = (state: RootState) => {
  return state.form.packing;
};
const addItemFormSelector = (state: RootState) => {
  return state.form.addItem;
};
const palletFormSelector = (state: RootState) => {
  return state.form.pallet;
};
const pickerFormSelector = (state: RootState) => {
  return state.form.picker;
};
export const formSelector = createSelector(
  inputFormSelector,
  editFormSelector,
  invoiceFormSelector,
  packingFormSelector,
  addItemFormSelector,
  relateFormSelector,
  palletFormSelector,
  pickerFormSelector,
  (input, edit, invoice, packing, addItem, relate, pallet, picker) => ({
    input,
    edit,
    invoice,
    packing,
    addItem,
    relate,
    pallet,
    picker,
  })
);
const formSlice = createSlice({
  name: "form",
  initialState,
  reducers: {
    toggle_form: (state, { payload: { form, value } }) => {
      state[form].visible = value;
      if (value && ['edit', 'input', 'picker', 'invoice', 'packing', 'pallet'].includes(form)) {
        state[form].position = getCenterPosition(form);
      }
    },
    changePosition: (state, { payload: { form, position } }) => {
      state[form].position = {
        x: Math.max(0, position.x),
        y: Math.max(0, position.y),
      };
    },
    initPosition: (state, { payload: form }) => {
      state[form].position = getCenterPosition(form);
      state[form].visible = false;
    },
  },
});
export default formSlice.reducer;
export const formActions = formSlice.actions;
