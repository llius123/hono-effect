import { Effect } from "effect";
import createUserDB from "../adapter/database";

export default (
  username: string,
  password: string,
  password_repeated: string,
  email: string
) =>
  Effect.gen(function* () {
    yield* Effect.log("register start");
    yield* checkRepeatedPassword(password, password_repeated);
    yield* createUserDB(username, password);
    // Email sending with retries
    yield* Effect.log("register end");
  });

const checkRepeatedPassword = (password: string, repeatedPassword: string) => {
  return Effect.if(password === repeatedPassword, {
    onTrue: () => Effect.succeed(password),
    onFalse: () =>
      Effect.fail(new ErrorMatchingPasswords("Passwords do not match")),
  });
};

class ErrorMatchingPasswords extends Error {
  readonly _tag = "ErrorMatchingPasswords";
}
