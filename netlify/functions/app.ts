import express from "express";
import serverless from "serverless-http";
import { app } from "../../server";
import { APIGatewayProxyEvent, Context } from "aws-lambda";

app.use(express.json());

console.log("✅ Netlify Function Initialized");

export const handler = serverless(app, {
  basePath: "/.netlify/functions/app",
  request: (request: Request, event : APIGatewayProxyEvent, context: Context) => {
    // ✅ Manual parser karena body masih berupa Buffer/string
    if (event.body && typeof event.body === "string") {
      try {
        (request.body as any) = JSON.parse(event.body);
      } catch (e) {
        console.error("Failed to parse event.body", e);
      }
    }
    return request;
  },
});
