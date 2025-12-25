import { authjsHandler, authjsSessionMiddleware } from "./authjs-handler";
import { createTodoHandler } from "./create-todo-handler";
import { apply, serve } from "@photonjs/express";
import express from "express";

const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

export default startApp() as unknown;

function startApp() {
  const app = express();

  apply(app, [
    // Append Auth.js session to context
    authjsSessionMiddleware,

    // Auth.js route. See https://authjs.dev/getting-started/installation
    authjsHandler,

    createTodoHandler,
  ]);

  return serve(app, {
    port,
  });
}
