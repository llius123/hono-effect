import { Data, Effect } from "effect";
import fs from "node:fs";

const DB_PATH = "db/user.json";

export default (username: string, password: string) => {
  return Effect.gen(function* () {
    yield* Effect.log("createUserDB");
    const allUsers = yield* getAllUsersFromDB();
    yield* checkUserExists(allUsers, username);
    const userOnDB = yield* createUser(username, password);
    yield* saveAllUsersOnDB([...allUsers, userOnDB]);
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
class ErrorDB extends Error {
  readonly _tag = "ErrorDB";
}

const createUser = (username: string, password: string) =>
  Effect.succeed({
    username,
    password,
  } as UserDTO);

const saveAllUsersOnDB = (users: readonly UserDTO[]) => {
  return Effect.try({
    try: () => {
      fs.writeFileSync(DB_PATH, JSON.stringify(users));
    },
    catch: () => new ErrorDB("saveAllUsersOnDB"),
  });
};

const checkUserExists = (allUsers: readonly UserDTO[], username: string) => {
  return Effect.gen(function* () {
    const user = yield* filterUser(allUsers, username);
    if (user != undefined) {
      yield* Effect.fail(new UserExistsError());
    }
  });
};
const filterUser = (users: readonly UserDTO[], username: string) => {
  const user = users.find((user) => user.username === username);
  return Effect.succeed(user);
};

class UserExistsError extends Error {
  readonly _tag = "UserExistsError";
}
