export interface RelateRelation {
  UpperId: number | string;
  LowerId: number;
  point: number;
}

export interface RelateItem {
  id: number;
  itemName?: string;
  unit?: string;
  im_price?: number;
  sum_im_price?: number;
  ex_price?: number;
  type?: string;
  upperId?: number;
  category?: string;
}

export interface RelateViewNode {
  currentId: number;
  itemName: string;
  top: number;
  left: number;
  point: number;
  ex_price: number;
  sum_im_price: number;
  type: string;
  upperId: number;
}

export interface RelatePriceNode {
  currentId: number;
  point: number;
  sum_im_price: number;
}

// 헬퍼: relations 배열을 UpperId 기반 Map으로 사전 인덱싱 (O(1) 하위 부품 조회)
const buildRelationMap = (relations: RelateRelation[] | null): Map<number, RelateRelation[]> => {
  const map = new Map<number, RelateRelation[]>();
  if (!relations) return map;
  for (let i = 0; i < relations.length; i++) {
    const rel = relations[i];
    const upperId = Number(rel.UpperId);
    let list = map.get(upperId);
    if (!list) {
      list = [];
      map.set(upperId, list);
    }
    list.push(rel);
  }
  return map;
};

// 헬퍼: items 배열을 id 기반 Map으로 사전 인덱싱 (O(1) 아이템 정보 조회)
const buildItemMap = <T extends { id: number }>(items: T[] | null): Map<number, T> => {
  const map = new Map<number, T>();
  if (!items) return map;
  for (let i = 0; i < items.length; i++) {
    map.set(items[i].id, items[i]);
  }
  return map;
};

/////// 합산가격과 위치값 계산 (수평 모드) /////////
export const makeRelateData_View_Horizon = (
  selectedItem: number,
  relations: RelateRelation[] | null,
  items: RelateItem[],
  top: number = 15,
  left: number = 15
): RelateViewNode[] => {
  let extraTop = 0;
  let extraLeft = 0;
  const origin = 15;
  let lastTop = 0;
  let history: number[] = [];
  const viewArray: RelateViewNode[] = [];
  let inheritPointArray: number[] = [];
  let inheritPoint = 1;

  const itemMap = buildItemMap(items);
  const relationMap = buildRelationMap(relations);

  const uppersList = relationMap.get(selectedItem) || [];
  const uppersSet = new Set(uppersList.map((r) => r.LowerId));

  const getItem = (id: number) => itemMap.get(id);

  const calculatePoint = (length: number) => {
    let point = 1;
    for (let i = length; i < inheritPointArray.length; i++) {
      point *= inheritPointArray[i];
    }
    return point;
  };

  const findChildren = (
    id: number,
    itemName: string,
    currentTop: number,
    currentLeft: number,
    im_price: number,
    ex_price: number,
    currentInheritPoint: number,
    type: string,
    upperId: number
  ) => {
    const childRelations = relationMap.get(id) || [];
    const children = childRelations.map((relate) => {
      const childItem = getItem(relate.LowerId);
      const grandChildCount = relationMap.get(relate.LowerId)?.length || 0;
      return {
        current: relate.LowerId,
        itemName: childItem?.itemName || "",
        im_price: childItem?.im_price || 0,
        point: relate.point,
        ex_price: childItem?.ex_price || 0,
        type: childItem?.type || "",
        upperId: Number(relate.UpperId),
        childCount: grandChildCount,
      };
    });

    children.sort((a, b) => a.childCount - b.childCount);

    let calculatedTop = currentTop;
    if (type === "ASSY") {
      if (lastTop >= calculatedTop) {
        calculatedTop = lastTop + 50;
      }
    }

    const curItem = getItem(id);
    const newItem: RelateViewNode = {
      currentId: id,
      itemName: curItem?.itemName || itemName || "",
      top: calculatedTop,
      left: currentLeft,
      point: currentInheritPoint,
      sum_im_price: Number(im_price) || 0,
      ex_price: Number(ex_price) || 0,
      type: type,
      upperId,
    };
    viewArray.push(newItem);

    if (history.length > 0) {
      for (let i = 0; i < viewArray.length; i++) {
        const arr = viewArray[i];
        for (let hIdx = 0; hIdx < history.length; hIdx++) {
          if (arr.currentId === history[hIdx]) {
            arr.sum_im_price += newItem.sum_im_price * calculatePoint(hIdx) * 1;
          }
        }
      }
    }

    if (children.length === 0) {
      lastTop = calculatedTop > lastTop ? calculatedTop + 60 : lastTop;
      inheritPointArray.pop();
      history.pop();
      return;
    }

    for (let index = 0; index < children.length; index++) {
      if (uppersSet.has(children[index].current)) {
        history = [selectedItem];
        inheritPointArray = [];
        currentLeft = origin;
      }
      if (!history.includes(id)) {
        history.push(id);
      }
      inheritPoint = children[index].point;
      inheritPointArray.push(inheritPoint);
      extraLeft = index % 3;
      if (index === 0 && extraLeft === 0) {
        extraTop = 0;
      }
      if (index > 0 && extraLeft === 0) {
        extraTop += 1;
      }
      findChildren(
        children[index].current,
        itemName,
        children[index].type === "PARTS"
          ? calculatedTop + 110 * extraTop
          : calculatedTop + 110,
        children[index].type === "PARTS"
          ? currentLeft + 110 * (extraLeft + 1)
          : currentLeft + 70,
        children[index].im_price,
        children[index].ex_price,
        inheritPoint,
        children[index].type,
        children[index].upperId
      );
    }
  };

  const rootItem = getItem(selectedItem);
  findChildren(
    selectedItem,
    "",
    top,
    left,
    rootItem?.im_price || 0,
    rootItem?.ex_price || 0,
    inheritPoint,
    rootItem?.type || "",
    -1
  );

  return viewArray;
};

/////// 합산가격과 위치값 계산 (기본 그리드 모드) /////////
export const makeRelateData_View = (
  selectedItem: number,
  relations: RelateRelation[] | null,
  items: RelateItem[],
  top: number = 15,
  left: number = 15
): RelateViewNode[] => {
  const origin = 15;
  let lastTop = 0;
  let history: number[] = [];
  const viewArray: RelateViewNode[] = [];
  let inheritPointArray: number[] = [];
  let inheritPoint = 1;

  const itemMap = buildItemMap(items);
  const relationMap = buildRelationMap(relations);

  const uppersList = relationMap.get(selectedItem) || [];
  const uppersSet = new Set(uppersList.map((r) => r.LowerId));

  const getItem = (id: number) => itemMap.get(id);

  const calculatePoint = (length: number) => {
    let point = 1;
    for (let i = length; i < inheritPointArray.length; i++) {
      point *= inheritPointArray[i];
    }
    return point;
  };

  const findChildren = (
    id: number,
    itemName: string,
    currentTop: number,
    currentLeft: number,
    im_price: number,
    ex_price: number,
    currentInheritPoint: number,
    type: string,
    upperId: number
  ) => {
    const childRelations = relationMap.get(id) || [];
    const children = childRelations.map((relate) => {
      const childItem = getItem(relate.LowerId);
      const grandChildCount = relationMap.get(relate.LowerId)?.length || 0;
      return {
        current: relate.LowerId,
        itemName: childItem?.itemName || "",
        im_price: childItem?.im_price || 0,
        point: relate.point,
        ex_price: childItem?.ex_price || 0,
        type: childItem?.type || "",
        upperId: Number(relate.UpperId),
        childCount: grandChildCount,
      };
    });

    children.sort((a, b) => a.childCount - b.childCount);

    let calculatedTop = currentTop;
    if (type === "ASSY") {
      if (lastTop >= calculatedTop) {
        calculatedTop = lastTop + 110;
      }
    }

    const curItem = getItem(id);
    const newItem: RelateViewNode = {
      currentId: id,
      itemName: curItem?.itemName || itemName || "",
      top: calculatedTop,
      left: currentLeft,
      point: currentInheritPoint,
      sum_im_price: Number(im_price) || 0,
      ex_price: Number(ex_price) || 0,
      type: type,
      upperId,
    };
    viewArray.push(newItem);

    if (history.length > 0) {
      for (let i = 0; i < viewArray.length; i++) {
        const arr = viewArray[i];
        for (let hIdx = 0; hIdx < history.length; hIdx++) {
          if (arr.currentId === history[hIdx]) {
            arr.sum_im_price += newItem.sum_im_price * calculatePoint(hIdx) * 1;
          }
        }
      }
    }

    if (children.length === 0) {
      lastTop = calculatedTop > lastTop ? calculatedTop : lastTop;
      inheritPointArray.pop();
      history.pop();
      return;
    }

    for (let index = 0; index < children.length; index++) {
      if (uppersSet.has(children[index].current)) {
        history = [selectedItem];
        inheritPointArray = [];
        currentLeft = origin;
      }
      if (!history.includes(id)) {
        history.push(id);
      }
      inheritPoint = children[index].point;
      inheritPointArray.push(inheritPoint);
      // 5개까지 1행(index 0~4), 6개(index 5)부터 다음 줄로 줄바꿈
      // 같은 라인(어셈블리 소속)임을 나타내기 위해 줄바꿈된 카드와 바로 위 카드 사이의 세로 여백을 절반(45px -> 22.5px)으로 설정 (101 * SCALE_Y 2.5 = 252.5px - 230px = 22.5px)
      const childCol = index % 5;
      const childRow = Math.floor(index / 5);
      findChildren(
        children[index].current,
        itemName,
        children[index].type === "PARTS"
          ? calculatedTop + 101 * childRow
          : calculatedTop + 110,
        children[index].type === "PARTS"
          ? currentLeft + 110 * (childCol + 1)
          : currentLeft + 70,
        children[index].im_price,
        children[index].ex_price,
        inheritPoint,
        children[index].type,
        children[index].upperId
      );
    }
  };

  const rootItem = getItem(selectedItem);
  findChildren(
    selectedItem,
    "",
    top,
    left,
    rootItem?.im_price || 0,
    rootItem?.ex_price || 0,
    inheritPoint,
    rootItem?.type || "",
    -1
  );

  return viewArray;
};

/////// 최상위 합산가격만 계산 /////////
export const makeRelateData_Price = (
  selectedItem: number,
  relations: RelateRelation[] | null,
  items: {
    id: number;
    unit?: string;
    im_price?: number;
    sum_im_price?: number;
  }[]
): RelatePriceNode[] => {
  let history: number[] = [];
  const priceArray: RelatePriceNode[] = [];
  let inheritPointArray: number[] = [];
  let inheritPoint = 1;

  const itemMap = buildItemMap(items);
  const relationMap = buildRelationMap(relations);

  const uppersList = relationMap.get(selectedItem) || [];
  const uppersSet = new Set(uppersList.map((r) => r.LowerId));

  const getItemPrice = (id: number) => itemMap.get(id)?.im_price || 0;

  const calculatePoint = (length: number) => {
    let point = 1;
    for (let i = length; i < inheritPointArray.length; i++) {
      point *= inheritPointArray[i];
    }
    return point;
  };

  const findChildren = (
    id: number,
    im_price: number,
    currentInheritPoint: number
  ) => {
    const childRelations = relationMap.get(id) || [];
    const children = childRelations.map((relate) => ({
      current: relate.LowerId,
      im_price: getItemPrice(relate.LowerId),
      point: relate.point,
      childCount: relationMap.get(relate.LowerId)?.length || 0,
    }));

    children.sort((a, b) => a.childCount - b.childCount);

    const newItem: RelatePriceNode = {
      currentId: id,
      point: currentInheritPoint,
      sum_im_price: Number(im_price) || 0,
    };
    priceArray.push(newItem);

    if (history.length > 0) {
      for (let i = 0; i < priceArray.length; i++) {
        const arr = priceArray[i];
        for (let hIdx = 0; hIdx < history.length; hIdx++) {
          if (arr.currentId === history[hIdx]) {
            arr.sum_im_price += newItem.sum_im_price * calculatePoint(hIdx) * 1;
          }
        }
      }
    }

    if (children.length === 0) {
      inheritPointArray.pop();
      history.pop();
      return;
    }

    for (let index = 0; index < children.length; index++) {
      if (uppersSet.has(children[index].current)) {
        history = [selectedItem];
        inheritPointArray = [];
      }
      if (!history.includes(id)) {
        history.push(id);
      }
      inheritPoint = children[index].point;
      inheritPointArray.push(inheritPoint);

      findChildren(
        children[index].current,
        children[index].im_price,
        inheritPoint
      );
    }
  };

  findChildren(selectedItem, getItemPrice(selectedItem), inheritPoint);
  return priceArray;
};
