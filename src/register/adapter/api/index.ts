import { zValidator } from "@hono/zod-validator";
import { Effect } from "effect";
import { Hono } from "hono";
import { BlankEnv, BlankSchema } from "hono/types";
import { z } from "zod";
import { RegisterDTO } from "../../core/RegisterDTO";
import register from "../../application";

export default async (app: Hono<BlankEnv, BlankSchema, "/">) => {
  app.post(
    "/register",
    zValidator("json", schema, (result, c) => {}),
    async (c) => {
      const { email, password, password_repeated, username } =
        (await c.req.json()) as RegisterDTO;
      const program = register(
        username,
        password,
        password_repeated,
        email
      ).pipe(
        Effect.catchTags({
          ErrorMatchingPasswords: () => Effect.fail("Passwords do not match"),
          ErrorDB: (error) => Effect.fail("ErrorDB"),
          UserExistsError: () => Effect.fail("User already exists"),
        })
      );

      return Effect.runPromise(program).then(
        () => c.json({ success: "OK" }, 200),
        (error) => c.json({ error: error.message }, 400)
      );
    }
  );
};

const schema: z.ZodType<RegisterDTO> = z.object({
  username: z.string(),
  password: z.string(),
  password_repeated: z.string(),
  email: z.string().email(),
});
