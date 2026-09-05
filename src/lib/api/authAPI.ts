import client from "./client";
export const login = (authData: { email: string; password: string }) => {
  return client.post("/auth/login", authData);
};
export const join = (authData: {
  email: string;
  password: string;
  name: string;
}) => {
  return client.post("/auth/join", authData);
};
export const check = () => {
  return client.get("/auth/check");
};
export const logout = () => {
  return client.post("/auth/logout");
};
