import client from "./client";
export const addImage = (images: FormData) => {
  return client.post("item/images", images);
};
export const addItem = (item: {
  type: string;
  groupType: string;
  groupName: string;
  category: string;
  itemName: string;
  descript: string;
  unit: string;
  im_price: number;
  ex_price: number;
  use: boolean;
  supplyer: string;
  weight: number;
  cbm: number;
  moq: number;
  set: boolean;
  imageList: { url: string }[];
  dragItems: {}[];
}) => {
  item.unit = item.unit.slice(0, 1);
  // 원 단위인 ////을 //로 바꿔주기 위해서
  // console.log(item);
  return client.post("/item/item", item);
};
export const getItem = () => {
  return client.get("/item/items");
};
export const editItem = (item: {
  [key: string]: "" | number | string | { url: string }[] | boolean | {}[];
}) => {
  // console.log(item);
  return client.patch("/item/edit", item);
};
export const removeItem = (id: number | "") => {
  // console.log("deleteID", id);
  return client.delete(`/item/delete/${id}`);
};
export const excelAdd = (datas: any[] | null) => {
  // console.log("exceldatas", datas);
  return client.post("/item/excelAdd", datas);
};
export const inputPicked = (picked: {}[] | null) => {
  return client.post("/item/inputPicked", picked);
};
export const getPicked = () => {
  return client.get("/item/getPicked");
};
export const updateRfqStatus = (data: { id: number; rfq_status: string; selected_supplier?: string }) => {
  return client.patch("/item/updateRfqStatus", data);
};

export const inboundItem = (data: { id: number; inbound_qty: number; warehouse: string }) => {
  return client.patch("/item/inbound", data);
};


