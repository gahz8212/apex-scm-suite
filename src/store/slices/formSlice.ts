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

const initialState: State = {
  input: { visible: false, position: { x: 250, y: 300 } },
  relate: { visible: false, position: { x: 250, y: 300 } },
  edit: { visible: false, position: { x: 250, y: 300 } },
  invoice: { visible: false, position: { x: 100, y: 200 } },
  packing: { visible: false, position: { x: 820, y: 200 } },
  pallet: { visible: false, position: { x: 1400, y: 200 } },
  addItem: { visible: false, position: { x: 100, y: 200 } },
  picker: { visible: false, position: { x: 250, y: 300 } },
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
    },
    changePosition: (state, { payload: { form, position } }) => {
      if (position.x > 0 && position.y > 160 && position.y < 900) {
        state[form].position = position;
      } else {
        if (position.x < 0 && position.y < 160) {
          state[form].position.x = 0;
          state[form].position.y = 160;
        } else if (position.x < 0 && position.y > 900) {
          state[form].position.x = 0;
          state[form].position.y = 900;
        } else if (position.x < 0) {
          state[form].position = position;
          state[form].position.x = 0;
        } else if (position.y < 160) {
          state[form].position = position;
          state[form].position.y = 160;
        } else if (position.y > 900) {
          state[form].position = position;
          state[form].position.y = 900;
        }
      }
    },
    initPosition: (state, { payload: form }) => {
      state[form].position.x = initialState[form].position.x;
      state[form].visible = false;
      state[form].position.y = initialState[form].position.y;
      state[form].visible = false;
    },
  },
});
export default formSlice.reducer;
export const formActions = formSlice.actions;
