import { readFile } from "fs";
import client from "./client";
export const orderInput = (order: any[] | null) => {
  return client.post("/order/orderinput", { order });
};
export const goodInput = (good: any[] | null) => {
  return client.post("/order/goodinput", { good });
};
export const getOrderData = () => {
  return client.get("/order/getOrderData");
};
export const getDummyItem = () => {
  return client.get("/order/getDummyItem");
};
export const palletInput = (palletData: {
  [key: string]: { [key: string]: string | number }[];
}) => {
  return client.post("/order/palletData", palletData);
};
export const getPalletData = () => {
  return client.get("/order/getPalletData");
};
export const inputRepairToOrdersheet = (
  repair:
    | {
        itemName: string;
        check:boolean;
        month: string;
        quantity: number;
        description: string;
        category: string;
        unit: string;
        ex_price: number;
        sets: string;
        weight: number;
        cbm: number;
        number1: number;
        use: boolean;
      }[]
    | null
) => {
  if (repair) {
    console.log(repair);
    return client.post("/order/inputRepair", repair);
  }
};
