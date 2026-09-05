import { makeRelateData_Price } from "./createRelateData";

export const changeRelationToDragItems = (
  items: {
    id: number;
    itemName: string;
    type: string;
    category: string;
    im_price: number;
  }[],
  relations: {
    LowerId: number;
    UpperId: string | number;
    point: number;
  }[]
) => {
  const newArray: {
    [key: string]: number | string;
    id: number;
    point: number;
    targetId: string | number;
    itemName: string;
    type: string;
    category: string;
    im_price: number;
  }[] = [];

  if (!relations || !items) return newArray;

  const itemMap = new Map<number, (typeof items)[0]>();
  for (let i = 0; i < items.length; i++) {
    itemMap.set(items[i].id, items[i]);
  }

  for (let i = 0; i < relations.length; i++) {
    const relation = relations[i];
    const item = itemMap.get(relation.LowerId);
    if (item) {
      newArray.push({
        id: relation.LowerId,
        point: relation.point,
        targetId: relation.UpperId,
        itemName: item.itemName,
        type: item.type,
        category: item.category,
        im_price: item.im_price,
      });
    }
  }

  return newArray;
};

export const returnTotalPrice = (
  items: {
    id: number;
    itemName: string;
    unit: string;
    im_price: number;
    sum_im_price: number;
    ex_price: number;
    type: string;
  }[],
  relations: {
    LowerId: number;
    UpperId: string | number;
    point: number;
  }[],
  dragItems: {
    type: string;
    id: number;
    point: number;
    targetId: string | number;
    im_price: number;
  }[]
) => {
  if (dragItems) {
    const result = dragItems.reduce(
      (acc: { [key: number | string]: number }, curr) => {
        if (curr.type === "SET" || curr.type === "ASSY") {
          if (items) {
            const view = makeRelateData_Price(curr.id, relations, items);
            const unitSum = view[0]?.sum_im_price ?? 0;
            const price = unitSum * curr.point;

            if (acc[curr.targetId]) {
              acc[curr.targetId] += price;
            } else {
              acc[curr.targetId] = price;
            }
          }
        } else {
          const price = curr.im_price * curr.point;
          if (acc[curr.targetId]) {
            acc[curr.targetId] += price;
          } else {
            acc[curr.targetId] = price;
          }
        }

        return acc;
      },
      {}
    );
    return result;
  }
};
