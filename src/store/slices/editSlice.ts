import { createSlice, createSelector, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "..";
type State = {
  prev: {
    id: number;
    type: string;
    groupType: string;
    category: string;
    itemName: string;
    descript: string;
    unit: string;
    im_price: number;
    sum_im_price: number;
    ex_price: number;
    use: boolean;
    supplyer: string;
    weight: number;
    cbm: number;
    moq: number;
    set: boolean;
    Images: { url: string }[];
    Good: { groupName: string };
    left: number;
    top: number;
    point: number;

    // visible: boolean;
  };
  next: {
    [key: string]:
      | string
      | number
      | boolean
      | { groupName: string }
      | { url: string }[];
    id: number;
    type: string;
    groupType: string;
    category: string;
    itemName: string;
    descript: string;
    unit: string;
    im_price: number;
    sum_im_price: number;
    ex_price: number;
    use: boolean;
    supplyer: string;
    weight: number;
    cbm: number;
    moq: number;
    set: boolean;
    Images: { url: string }[];
    Good: { groupName: string };
    left: number;
    top: number;
    point: number;
    upperId: number;
    // visible: boolean;
  };
  dragItem: {
    targetId: number;
    id: number;
    point: number;
    type: string;
    category: string;
    itemName: string;
    unit: string;
    im_price: number;
    sum_im_price: number;
    // use: boolean;
    // descript: string;
  } | null;
  dragItems:
    | {
        [key: string]: number | string;
        id: number;
        point: number;
        type: string;
        category: string;
        itemName: string;
        unit: string;
        im_price: number;
        sum_im_price: number;
        // targetId: number;
        // descript: string;
        // use: boolean;
      }[]
    | null;
  status: {
    error: string;
    loading: boolean;
    message: string;
  };
};

const initialState: State = {
  prev: {
    id: -1,
    type: "",
    groupType: "",
    category: "",
    itemName: "",
    descript: "",
    unit: "\\",
    im_price: 0,
    ex_price: 0,
    sum_im_price: 0,
    use: false,
    supplyer: "",
    weight: 0,
    cbm: 0,
    moq: 0,
    set: true,
    Images: [],
    Good: { groupName: "" },
    left: 0,
    top: 0,
    point: 0,
    // visible: false,
  },
  next: {
    id: -1,
    type: "",
    groupType: "",
    category: "",
    itemName: "",
    descript: "",
    unit: "\\",
    im_price: 0,
    ex_price: 0,
    sum_im_price: 0,
    use: false,
    supplyer: "",
    weight: 0,
    cbm: 0,
    moq: 0,
    set: true,
    Images: [],
    Good: { groupName: "" },
    left: 0,
    top: 0,
    point: 0,
    visible: false,
    upperId: -1,
  },
  dragItem: null,
  dragItems: null,
  status: { error: "", loading: false, message: "" },
};
const selectSelector = (state: RootState) => {
  return state.edit.prev;
};
const editSelector = (state: RootState) => {
  return state.edit.next;
};

const stateSelector = (state: RootState) => {
  return state.edit.status;
};
const dragItemSelector = (state: RootState) => {
  return state.edit.dragItem;
};
const dragItemsSelector = (state: RootState) => {
  return state.edit.dragItems;
};
export const editData = createSelector(
  selectSelector,
  editSelector,
  stateSelector,
  dragItemSelector,
  dragItemsSelector,
  (prev, next, status, dragItem, dragItems) => ({
    prev,
    next,
    status,
    dragItem,
    dragItems,
  })
);
const editSlice = createSlice({
  name: "edit",
  initialState,
  reducers: {
    initForm: (state) => {
      state.prev = initialState.prev;
      state.next = initialState.next;
      state.status = initialState.status;
      state.dragItems = initialState.dragItems;
    },
    initStatus: (state) => {
      state.status = initialState.status;
    },
    changeField: (state, { payload: { name, value } }) => {
      state.next[name] = value;
    },
    selectItem: (state, { payload: item }) => {
      state.prev = item;
      state.next = item;
    },
    editImage: (state, action: PayloadAction<FormData>) => {
      state.status.error = "";
      state.status.loading = true;
    },
    editImageSuccess: (state, { payload: images }) => {
      state.next.Images = state.next.Images.concat(images);
      state.status.loading = false;
      state.status.error = "";
    },
    editImageFailure: (state, { payload: error }) => {
      state.status.error = error;
      state.status.loading = false;
    },
    editItem: (
      state,
      action: PayloadAction<{
        [key: string]: number | string | { url: string }[] | boolean | {}[];
      }>
    ) => {
      state.status.loading = true;
      state.status.error = "";
      state.status.message = "";
    },
    editItemSuccess: (state, { payload: message }) => {
      // console.log(result.relations);
      state.status.message = message;
      state.status.error = "";
    },
    editItemFailure: (state, { payload: error }) => {
      state.status.error = error;
      state.status.message = "";
    },
    removeItem: (state, action: PayloadAction<number | "">) => {
      state.status.message = "";
      state.status.error = "";
    },
    removeItemSuccess: (state, { payload: message }) => {
      state.status.message = message;
      state.status.error = "";
    },
    removeItemFailure: (state, { payload: error }) => {
      state.status.error = error;
      state.status.message = "";
    },
    removeImage: (state, { payload: image }) => {
      state.next.Images = image;
    },
    addCount: (state, { payload: itemsId }) => {
      // console.log("edit_itemsId.idx", itemsId.idx);
      if (state.dragItems) {
        state.dragItems[itemsId.idx].point =
          state.dragItems[itemsId.idx].point + 1;
        state.dragItems[itemsId.idx].sum_im_price =
          state.dragItems[itemsId.idx].point *
          state.dragItems[itemsId.idx].im_price;
      }
    },
    removeCount: (state, { payload: itemsId }) => {
      if (state.dragItems) {
        if (state.dragItems[itemsId.idx].point > 0) {
          state.dragItems[itemsId.idx].point =
            state.dragItems[itemsId.idx].point - 1;
          state.dragItems[itemsId.idx].sum_im_price =
            state.dragItems[itemsId.idx].point *
            state.dragItems[itemsId.idx].im_price;
        } else {
          if (itemsId.mode === "") {
            state.dragItems.splice(itemsId.idx, 1);
          }
        }
      }
    },
    inputDragItem: (state, { payload: item }) => {
      state.dragItem = item;
    },
    drag_on: (state, { payload: targetId }) => {
      if (state.dragItem && state.dragItems) {
        state.dragItem.targetId = targetId;
        state.dragItems = [state.dragItem, ...state.dragItems];
        state.dragItem = null;
      }
    },
    inputDragItems: (state, { payload: dragItems }) => {
      // console.log("dragItems", dragItems);
      state.dragItems = dragItems;
    },
    initialDragItem: (state) => {
      state.dragItem = null;
      // state.dragItems = null;
    },
  },
});
export default editSlice.reducer;
export const editActions = editSlice.actions;
