import { Context, Hono } from "hono";
import { BlankEnv, BlankSchema, Env } from "hono/types";
import { login } from "../../application/login";
import { z } from "zod";
import { password } from "bun";
import { validator } from "hono/validator";
import { zValidator } from "@hono/zod-validator";
import { Effect } from "effect";

export const loginAPI = async (app: Hono<BlankEnv, BlankSchema, "/">) => {
  app.post(
    "/login",
    zValidator("json", schema, (result, c) => {
      return Effect.runPromise(program(result, c)).then(
        () => {},
        () => {
          return c.json({ error: "Not valid schema" }, 400);
        }
      );
    }),
    async (c) => {
      const { username, password } = await c.req.json();

      const user = login(username, password);

      return c.json({ token: user }, 200);
    }
  );
};
const schema = z.object({
  username: z.string(),
  password: z.string(),
});

const program = (result: { success: boolean }, c: Context<Env, string, {}>) => {
  return Effect.gen(function* () {
    yield* Effect.log("schema validator start");
    return yield* Effect.if(result.success, {
      onTrue: () => Effect.succeed("Ok"),
      onFalse: () => Effect.fail(new ErrorSchema("Error schema")),
    });
  });
};
class ErrorSchema extends Error {
  readonly _tag = "ErrorSchema";
}
