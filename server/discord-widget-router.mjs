import express from "express";

import { verifyDiscordWidget } from "./discord-widget-service.mjs";

export function createDiscordWidgetRouter() {
  const router = express.Router();

  router.use(express.json({ limit: "8kb" }));
  router.post("/", async (request, response) => {
    response.set("Cache-Control", "no-store, max-age=0");

    const result = await verifyDiscordWidget(request.body?.guildId, {
      forceRefresh: request.body?.forceRefresh !== false,
      // This router is used only by the manual publish/verification action.
      cacheBust: true,
    });

    response.status(result.ok ? 200 : result.status).json(
      result.ok
        ? { verified: result.verified, guild: result.guild }
        : {
            error: result.error,
            ...(result.cachedGuild ? { cachedGuild: result.cachedGuild } : {}),
          },
    );
  });

  router.use((error, _request, response, next) => {
    if (error instanceof SyntaxError) {
      response.status(400).json({ error: "invalid_request" });
      return;
    }
    next(error);
  });

  return router;
}
