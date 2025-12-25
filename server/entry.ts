// server/entry.ts - Server Entry Point
import { authjsHandler, authjsSessionMiddleware } from "./authjs-handler";
import { apiHandler } from "./handlers/api.handler";
import { apply, serve } from "@photonjs/express";
import express from "express";

const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

export default startApp() as unknown;

function startApp() {
  const app = express();

  // Parse JSON body
  app.use(express.json());

  apply(app, [
    // Append Auth.js session to context
    authjsSessionMiddleware,

    // Auth.js route
    authjsHandler,

    // Bookstore API routes
    apiHandler,
  ]);

  return serve(app, {
    port,
  });
}
