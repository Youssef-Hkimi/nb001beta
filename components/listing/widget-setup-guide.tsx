"use client";

import { Alert } from "@heroui/react";
import { TriangleAlert } from "lucide-react";

import { VideoPlayer } from "@/components/video-player/video-player";

const WIDGET_HELP_VIDEO_URL =
  "https://res.cloudinary.com/zux0o0wz/video/upload/v1784559620/WIDGETGUIDE_vtxvge.mp4";

export function WidgetSetupGuide() {
  return (
    <div className="space-y-4">
      <Alert status="warning" className="widget-verification-guide-alert">
        <Alert.Indicator><TriangleAlert className="size-4" /></Alert.Indicator>
        <Alert.Content>
          <Alert.Title>Enable your Discord server widget</Alert.Title>
          <Alert.Description>
            Discord could not access this server&apos;s public widget. In Discord, go to{" "}
            <strong>Server Settings → Engagement → Widget</strong>, enable the server widget,
            and choose a public invite channel.
          </Alert.Description>
        </Alert.Content>
      </Alert>

      <div>
        <p className="mb-2 text-sm font-medium text-foreground">Watch the setup guide</p>
        <VideoPlayer src={WIDGET_HELP_VIDEO_URL} />
      </div>
    </div>
  );
}
