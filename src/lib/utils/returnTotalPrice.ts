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
  let newArray: {
    [key: string]: number | string;
    id: number;
    point: number;
    targetId: string | number;
    itemName: string;
    type: string;
    category: string;
    im_price: number;
  }[] = [];
  relations?.filter((relation) =>
    items?.filter((item) => {
      if (relation.LowerId === item.id) {
        newArray.push({
          id: relation.LowerId,
          point: relation.point,
          targetId: relation.UpperId,
          itemName: item.itemName,
          type: item.type,
          category: item.category,
          im_price: item.im_price,
        });
        return newArray;
      } else {
        return null;
      }
    })
  );
  return newArray;
  // dispatch(itemActions.inputDragItems(newArray));
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
            const price = view[0].sum_im_price * curr.point;

            if (acc[curr.targetId]) {
              acc[curr.targetId] = price + acc[curr.targetId];
            } else {
              acc[curr.targetId] = price + acc[curr.targetId];
            }
          }
        } else {
          if (acc[curr.targetId]) {
            acc[curr.targetId] += curr.im_price * curr.point;
          } else {
            acc[curr.targetId] = curr.im_price * curr.point;
          }
        }

        return acc;
      },
      {}
    );
    return result;
  }
};
