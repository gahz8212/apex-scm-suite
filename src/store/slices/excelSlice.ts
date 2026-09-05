import { createSlice, createSelector } from "@reduxjs/toolkit";
import { RootState } from "..";
type State = {
  file: ArrayBuffer | undefined | string | null;
  data: any[] | null;
  status: { error: string; loading: boolean };
};
const initialState: State = {
  file: null,
  data: null,
  status: { error: "", loading: false },
};
const fileSelector = (state: RootState) => {
  return state.excel.file;
};
const dataSelector = (state: RootState) => {
  return state.excel.data;
};
const statusSelector = (state: RootState) => {
  return state.excel.status;
};
export const ExcelData = createSelector(
  fileSelector,
  dataSelector,
  statusSelector,
  (file, data, status) => ({ file, data, status })
);
const excelSlice = createSlice({
  name: "excel",
  initialState,
  reducers: {
    initForm: (state) => {
      state.file = initialState.file;
      state.data = initialState.data;
    },
    onChange: (state, { payload: file }) => {
      state.file = file;
    },
    onSubmit: (state, { payload: data }) => {
      state.data = data;
    },
  },
});
export default excelSlice.reducer;
export const ExcelAction = excelSlice.actions;
