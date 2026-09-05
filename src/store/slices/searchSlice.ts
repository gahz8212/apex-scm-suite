import { createSlice, createSelector } from "@reduxjs/toolkit";
import { RootState } from "..";
type State = {
  [key: string]: {} | null;

  all: {
    typeALL: boolean;
    setALL: boolean;
    groupALL: boolean;
  };
  type: {
    [key: string]: boolean;
    SET: boolean;
    ASSY: boolean;
    PARTS: boolean;
  };
  set: {
    [key: string]: boolean;
    EDT: boolean;
    NOBARK: boolean;
    RDT: boolean;
    LAUNCHER: boolean;
    기타: boolean;
  };
  group: {
    [key: string]: boolean;
    회로: boolean;
    전장: boolean;
    기구: boolean;
    포장: boolean;
    기타: boolean;
  };
  filteredItems:
    | {
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
      }[]
    | null;
  sort: {
    [key: string]: {
      [key: string]: boolean | number;
      active: boolean;
      number: number;
      asc: boolean;
    };
    type: {
      active: boolean;
      number: number;
      asc: boolean;
    };
    category: {
      active: boolean;
      number: number;
      asc: boolean;
    };
    itemName: {
      active: boolean;
      number: number;
      asc: boolean;
    };
    createdAt: {
      active: boolean;
      number: number;
      asc: boolean;
    };
  };
};
const initialState: State = {
  all: {
    typeALL: true,
    setALL: true,
    groupALL: true,
  },
  type: {
    SET: true,
    ASSY: true,
    PARTS: true,
  },
  set: {
    EDT: true,
    NOBARK: true,
    RDT: true,
    LAUNCHER: true,
    기타: true,
  },
  group: {
    회로: true,
    전장: true,
    기구: true,
    포장: true,
    기타: true,
  },
  filteredItems: null,
  sort: {
    type: { active: false, number: 0, asc: true },
    category: { active: false, number: 1, asc: true },
    itemName: { active: false, number: 2, asc: true },
    createdAt: { active: false, number: 3, asc: true },
  },
};
const searchSelector = (state: RootState) => {
  return state.search;
};
const filteredSelector = (state: RootState) => {
  return state.search.filteredItems;
};

export const SearchData = createSelector(
  searchSelector,
  filteredSelector,
  (search, filtered) => ({
    search,
    filtered,
  })
);
const searchSlice = createSlice({
  name: "search",
  initialState,
  reducers: {
    initState: (state) => {
      state = initialState;
    },
    typeCheckAll: (state, { payload: value }) => {
      state.all.typeALL = value;
    },
    groupCheckAll: (state, { payload: value }) => {
      state.all.groupALL = value;
    },
    setCheckAll: (state, { payload: value }) => {
      state.all.setALL = value;
    },
    typeALL: (state, { payload: value }) => {
      console.log("value", value);
      state.all.typeALL = value;
      state.type.SET = value;
      state.type.ASSY = value;
      state.type.PARTS = value;
    },
    groupALL: (state, { payload: value }) => {
      state.all.groupALL = value;
      state.group.회로 = value;
      state.group.전장 = value;
      state.group.기구 = value;
      state.group.포장 = value;
      state.group.기타 = value;
    },
    setALL: (state, { payload: value }) => {
      state.all.setALL = value;
      state.set.EDT = value;
      state.set.NOBARK = value;
      state.set.RDT = value;
      state.set.LAUNCHER = value;
      state.set.기타 = value;
    },
    checkType: (state, { payload: category }) => {
      state.type[category] = !state.type[category];
    },
    checkGroup: (state, { payload: category }) => {
      state.group[category] = !state.group[category];
    },
    checkSet: (state, { payload: category }) => {
      state.set[category] = !state.set[category];
    },
    checkSort: (state, { payload: category }) => {
      state.sort[category].active = !state.sort[category].active;
    },
    getFilteredItems: (state, { payload: newItem }) => {
      state.filteredItems = newItem;
    },
    sortChange: (state, { payload: itemCurrent }) => {
      const { dragItem, dragOverItem, orders } = itemCurrent;
      state.sort[orders[dragItem].sorting].number = dragOverItem;
      state.sort[orders[dragOverItem].sorting].number = dragItem;
    },
    checkAsc: (state, { payload: name }) => {
      state.sort[name].asc = !state.sort[name].asc;
    },
  
  },
});
export default searchSlice.reducer;
export const SearchActions = searchSlice.actions;
