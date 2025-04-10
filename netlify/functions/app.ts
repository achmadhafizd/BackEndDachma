import serverless from "serverless-http";
import { app } from "../../server";

console.log("✅ Netlify Function Initialized");

export const handler = serverless(app, {
  basePath: "/.netlify/functions/app",
});
