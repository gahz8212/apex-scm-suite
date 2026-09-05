import { createSlice, createSelector } from "@reduxjs/toolkit";
import { RootState } from "..";
type State = {
  currentPage: string;
};
const initialState: State = { currentPage: "Home" };
const pageSelector = (state: RootState) => {
  return state.page.currentPage;
};
export const PageData = createSelector(pageSelector, (currentPage) => ({
  currentPage,
}));
const pageSlice = createSlice({
  name: "page",
  initialState,
  reducers: {
    initPage: (state) => {
      state.currentPage = initialState.currentPage;
    },
    changePage: (state, { payload: page }) => {
      state.currentPage = page;
    },
  },
});
export default pageSlice.reducer;
export const PageActions = pageSlice.actions;
