import { Hono } from "hono";
import { loginAPI } from "./login/adapter/api";

const app = new Hono();

loginAPI(app);
export default app;
