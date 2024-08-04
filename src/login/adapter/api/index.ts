import { Hono } from "hono";
import { BlankEnv, BlankSchema } from "hono/types";
import { login } from "../../application/login";

export const loginAPI = async (app: Hono<BlankEnv, BlankSchema, "/">) => {
  app.post("/loginV2", async (c) => {
    const { username, password } = await c.req.json();

    const user = login(username, password);

    return c.json({ token: user });
  });
};
