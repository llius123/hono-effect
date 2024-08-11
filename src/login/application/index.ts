import { Effect, pipe } from "effect";
import { getUserFromDatabaseV2 } from "../adapter/database";
import { log } from "effect/Console";
import { signJwt } from "../adapter/jwt/jwt";

export default (username: string, password: string) =>
  Effect.gen(function* () {
    yield* Effect.log("loginV2 start");
    const userFromDB = yield* getUserFromDatabaseV2(username, password);
    const userLogged = yield* checkIfUserExists(userFromDB);
    const jwt = yield* signJwt(userLogged.username);
    yield* Effect.log("loginV2 end");
    return jwt;
  });

class ErrorLogin extends Error {
  readonly _tag = "ErrorLogin";
}

const checkIfUserExists = (user: UserDTO | undefined) => {
  return Effect.if(user !== undefined, {
    onTrue: () => Effect.succeed(user as UserDTO),
    onFalse: () => Effect.fail(new ErrorLogin("User not found")),
  });
};
