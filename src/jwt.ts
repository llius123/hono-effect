import { Effect } from "effect";
import * as jwt from "jsonwebtoken";
const key = "KEY";

export const signJwt = (username: string) => {
  return Effect.succeed(jwt.sign({ username }, key, { expiresIn: "1h" }));
};
