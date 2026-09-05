import client from "./client";
export const currency = () => {
  return client.get(
    `https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/krw.json`
  );
};
