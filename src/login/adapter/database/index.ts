import { Data, Effect, pipe } from "effect";
import fs from "node:fs";

const DB_PATH = "db/user.json";

export const getUserFromDatabaseV2 = (username: string, password: string) => {
  return Effect.gen(function* () {
    yield* Effect.log("getUserFromDatabaseV2");
    const allUsers = yield* getAllUsersFromDB();
    const userOnDB = yield* filterUser(allUsers, username, password);
    return userOnDB;
  });
};

const getAllUsersFromDB = () =>
  Effect.try({
    try: () => {
      const users = fs.readFileSync(DB_PATH, "utf8");
      return Data.array(JSON.parse(users) as UserDTO[]);
    },
    catch: () => new ErrorDB("getallUsersFromDB"),
  });
const filterUser = (
  users: readonly UserDTO[],
  username: string,
  password: string
) => {
  const user = users.find(
    (user) => user.username === username && user.password === password
  );
  return Effect.succeed(user);
};

class ErrorDB extends Error {
  readonly _tag = "ErrorDB";
}
