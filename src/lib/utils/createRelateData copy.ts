///////합산가격과 위치값 계산/////////
export const makeRelateData_View = (
  selectedItem: number,
  relations:
    | {
        UpperId: number;
        LowerId: number;
        point: number;
      }[]
    | null,
  items: {
    id: number;
    itemName: string;
    unit: string;
    im_price: number;
    sum_im_price: number;
    ex_price: number;
    type: string;
    upperId: number;
  }[],
  top: number,
  left: number
) => {
  let extraTop = 0;
  let extraLeft = 0;
  let origin = 15;
  let lastTop = 0;
  let history: number[] = [];
  let viewArray: {
    currentId: number;
    top: number;
    left: number;
    point: number;
    ex_price: number;
    sum_im_price: number;
    type: string;
    upperId: number;
  }[] = [];
  let inheritPointArray: number[] = [];
  let inheritPoint = 1;

  const uppers = relations
    ?.filter((relation) => relation.UpperId === selectedItem)
    .map((relation) => relation.LowerId);
  const searchIm_price = (id: number) => {
    return items
      .filter((item) => item.id === id)
      .map((item) => item.im_price)[0];
  };
  const searchEx_price = (id: number) => {
    return items
      .filter((item) => item.id === id)
      .map((item) => item.ex_price)[0];
  };
  const searchItemName = (id: number) => {
    return items
      .filter((item) => item.id === id)
      .map((item) => item.itemName)[0];
  };
  const searchType = (id: number) => {
    return items.filter((item) => item.id === id).map((item) => item.type)[0];
  };
  const calculatePoint = (length: number) => {
    let point = 1;
    for (let i = length; i < inheritPointArray.length; i++) {
      point = inheritPointArray[i] * point;
    }
    return point;
  };
  const findChildren = (
    id: number,
    itemName: string,
    top: number = 15,
    left: number = 15,
    im_price: number,
    ex_price: number,
    inheritPoint: number,
    type: string,
    upperId: number
  ) => {
    if (relations) {
      const children = relations
        .filter((relate) => relate.UpperId === id)
        .map((relate) => ({
          current: relate.LowerId,
          itemName: searchItemName(relate.LowerId),
          im_price: searchIm_price(relate.LowerId),
          point: relate.point,
          ex_price: searchEx_price(relate.LowerId),
          type: searchType(relate.LowerId),
          upperId: relate.UpperId,
        }));
      children.sort(
        (a, b) =>
          relations.filter((relate) => relate.UpperId === a.current).length -
          relations.filter((relate) => relate.UpperId === b.current).length
      );

      if (type === "ASSY") {
        if (lastTop >= top) {
          top = lastTop + 80;
        }
      }
      const newItem = {
        currentId: id,
        itemName: searchItemName(id),
        top: top,
        left: left,
        point: inheritPoint,
        sum_im_price: Number(im_price),
        ex_price: Number(ex_price),
        type: type,
        upperId,
      };
      viewArray.push(newItem);

      if (history.length > 0) {
        viewArray.forEach((arr) =>
          history.forEach((his, index) =>
            arr.currentId === his
              ? (arr.sum_im_price +=
                  newItem.sum_im_price * calculatePoint(index) * 1)
              : 0
          )
        );
      }
      if (children.length === 0) {
        lastTop = top > lastTop ? top + 60 : lastTop;
        inheritPointArray.pop();
        history.pop();
        return;
      }
      for (let index = 0; index < children.length; index++) {
        if (uppers?.includes(children[index].current)) {
          history = [selectedItem];
          inheritPointArray = [];
          left = origin;
        }
        if (!history.includes(id)) {
          history.push(id);
        }
        inheritPoint = children[index].point;
        inheritPointArray.push(inheritPoint);
        extraLeft = index % 8;
        if (index === 0 && extraLeft === 0) {
          extraTop = 0;
        }
        if (index > 0 && extraLeft === 0) {
          extraTop += 1;
        }
        findChildren(
          children[index].current,
          itemName,
          children[index].type === "PARTS" ? top + 110 * extraTop : top + 110,
          children[index].type === "PARTS"
            ? left + 110 * (extraLeft + 1)
            : left + 70,
          children[index].im_price,
          children[index].ex_price,
          inheritPoint,
          children[index].type,
          children[index].upperId
        );
      }
    }
  };
  const createRelateView = (id: number, top: number, left: number) => {
    findChildren(
      id,
      "",
      top,
      left,
      searchIm_price(selectedItem),
      searchEx_price(selectedItem),
      inheritPoint,
      searchType(selectedItem),
      -1
    );
    return viewArray;
  };
  return createRelateView(selectedItem, top, left);
};
