import { Array, Console, Data, Effect, pipe, Random, Stream } from "effect";
import { Hono } from "hono";
import { signJwt } from "./jwt";

const app = new Hono();

interface UserDTO {
  username: String;
  password: String;
}

const usersDTBO: UserDTO[] = [
  {
    username: "hono",
    password: "hono",
  },
  {
    username: "llius123",
    password: "1234",
  },
];

app.post("/login", async (c) => {
  const { username, password } = await c.req.json();

  const user = getUserFromDatabase(username, password);

  return Effect.runPromise(user).then(
    () => c.json({ message: "Hello Hono!" }),
    () => c.json({ message: "Error" })
  );
});

const getUserFromDatabase = (
  username: string,
  password: string
): Effect.Effect<UserDTO, Error> => {
  const user = usersDTBO.find(
    (user) => user.username === username && user.password === password
  );

  return user ? Effect.succeed(user) : Effect.fail(new Error("User not found"));
};

app.post("/loginV2", async (c) => {
  const { username, password } = await c.req.json();

  const program = Effect.gen(function* () {
    yield* Effect.log("loginV2 start");
    yield* getUserFromDatabaseV2(username, password);
    const jwt = yield* signJwt(username);
    yield* Effect.log("loginV2 end");
    return jwt;
  });
  return Effect.runPromise(program).then(
    (success) => c.json({ message: "Hello Hono!" }),
    (error) => c.json({ message: "Error" })
  );
});

const getUserFromDatabaseV2 = (
  username: string,
  password: string
): Effect.Effect<UserDTO, Error> => {
  return Effect.gen(function* () {
    yield* Effect.log("getUserFromDatabaseV2");
    const user = Data.array(usersDTBO).find(
      (user) => user.username === username && user.password === password
    );

    const program = Effect.if(user !== undefined, {
      onTrue: () => Effect.succeed(user as UserDTO),
      onFalse: () => Effect.fail(new Error("User not found")),
    });

    return Effect.runSync(program);
  });
};

export default app;
