import { Context, Hono } from "hono";
import { BlankEnv, BlankSchema, Env } from "hono/types";
import login from "../../application";
import { z } from "zod";
import { password } from "bun";
import { validator } from "hono/validator";
import { zValidator } from "@hono/zod-validator";
import { Effect } from "effect";

export default async (app: Hono<BlankEnv, BlankSchema, "/">) => {
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
      const { username, password } = (await c.req.json()) as UserDTO;

      const program = login(username, password).pipe(
        Effect.catchTags({
          ErrorDB: (error) => Effect.fail("ErrorDB"),
          ErrorLogin: (error) => Effect.fail("ErrorLogin"),
        })
      );

      return Effect.runPromise(program).then(
        (result) => c.json({ success: result }, 200),
        (error) => c.json({ error: error.message }, 400)
      );
    }
  );
};
const schema: z.ZodType<UserDTO> = z.object({
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
