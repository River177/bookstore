// api/index.ts - Vercel Serverless Entry Point
import { authjsHandler, authjsSessionMiddleware } from "../server/authjs-handler";
import { apiHandler } from "../server/handlers/api.handler";
import { serve } from "@photonjs/vercel";

export default serve([
  // Append Auth.js session to context
  authjsSessionMiddleware,

  // Auth.js route
  authjsHandler,

  // Bookstore API routes
  apiHandler,
]);

