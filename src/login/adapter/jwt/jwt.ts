import { Effect } from "effect";
import * as jwt from "jsonwebtoken";
const key = "KEY";

export const signJwt = (
  username: String
): Effect.Effect<string, never, never> => {
  const program = Effect.gen(function* () {
    yield* Effect.log("signJwt");

    return Effect.succeed(jwt.sign({ username }, key, { expiresIn: "1h" }));
  });

  return Effect.runSync(program);
};
