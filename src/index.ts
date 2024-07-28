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

  const program = Effect.log("start").pipe(
    Effect.andThen(getUserFromDatabaseV2(username, password)),
    // Effect.andThen(Effect.log("getUserFromDatabaseV2")),
    Effect.andThen(signJwt(username))
    // Effect.andThen(Effect.log("signJwt")),
    // Effect.andThen(Effect.log("done"))
  );
  Effect.runSync(program);

  // Effect.runFork(program).pipe((user) => console.log(user.));

  return c.json({ message: "Hello Hono!" });
});

const getUserFromDatabaseV2 = (
  username: string,
  password: string
): Effect.Effect<UserDTO, Error> => {
  const user = Data.array(usersDTBO).find(
    (user) => user.username === username && user.password === password
  );
  return Effect.if(user !== undefined, {
    onTrue: () => Effect.succeed(user as UserDTO),
    onFalse: () => Effect.fail(new Error("User not found")),
  });

  // Effect.runSync(user).then(console.log);
};

export default app;
