import { Effect, pipe } from "effect";
import { getUserFromDatabaseV2 } from "../adapter/database";
import { log } from "effect/Console";
import { signJwt } from "../adapter/jwt/jwt";

export const login = (username: string, password: string) =>
  Effect.runSync(
    Effect.gen(function* () {
      yield* Effect.log("loginV2 start");

      const userFromDB = yield* getUserFromDatabaseV2(username, password).pipe(
        Effect.catchTag("ErrorDB", (_HttpError) => Effect.fail("ErrorDB"))
      );
      const userLogged = yield* checkIfUserExists(userFromDB).pipe(
        Effect.catchTag("ErrorLogin", (_HttpError) => Effect.fail("ErrorLogin"))
      );
      const jwt = yield* signJwt(userLogged.username);
      yield* Effect.log("loginV2 end");
      return jwt;
    })
  );

class ErrorLogin extends Error {
  readonly _tag = "ErrorLogin";
}

const checkIfUserExists = (user: UserDTO | undefined) => {
  return Effect.if(user !== undefined, {
    onTrue: () => Effect.succeed(user as UserDTO),
    onFalse: () => Effect.fail(new ErrorLogin("User not found")),
  });
};
