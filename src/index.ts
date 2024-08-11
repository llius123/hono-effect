import { Hono } from "hono";
import loginAPI from "./login/adapter/api";
import registerAPI from "./register/adapter/api";

const app = new Hono();

loginAPI(app);
registerAPI(app);
export default app;
