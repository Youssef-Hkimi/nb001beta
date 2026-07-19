import express from "express";
import next from "next";

import { createDiscordWidgetRouter } from "./server/discord-widget-router.mjs";

function readPort() {
  const portFlagIndex = process.argv.findIndex(
    (argument) => argument === "-p" || argument === "--port",
  );
  const flagValue = portFlagIndex >= 0 ? process.argv[portFlagIndex + 1] : null;
  const inlineValue = process.argv
    .find((argument) => argument.startsWith("--port="))
    ?.split("=")[1];

  return Number.parseInt(flagValue || inlineValue || process.env.PORT || "3000", 10);
}

const port = readPort();
const hostname = process.env.HOSTNAME || "0.0.0.0";
const dev = process.env.NODE_ENV !== "production";
const nextApp = next({ dev, hostname, port, webpack: true });
const nextHandler = nextApp.getRequestHandler();

await nextApp.prepare();

const server = express();
server.disable("x-powered-by");
server.use("/api/discord/server-widget", createDiscordWidgetRouter());
server.use((request, response) => nextHandler(request, response));

const httpServer = server.listen(port, hostname, () => {
  console.log(`Nexus ready at http://localhost:${port}`);
});

let isClosing = false;

function closeServer() {
  if (isClosing) return;
  isClosing = true;
  httpServer.close(async () => {
    await nextApp.close();
    process.exit(0);
  });
}

process.on("SIGINT", closeServer);
process.on("SIGTERM", closeServer);
