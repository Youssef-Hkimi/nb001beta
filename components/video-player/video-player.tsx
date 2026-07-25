"use client";

import {
  Maximize,
  Pause,
  Play,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

type VideoPlayerProps = {
  src: string;
  autoPlay?: boolean;
  thumbnail?: string;
};

function formatTime(value: number) {
  if (!Number.isFinite(value)) return "0:00";

  const minutes = Math.floor(value / 60);
  const seconds = Math.floor(value % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}

export function VideoPlayer({
  src,
  autoPlay = false,
  thumbnail,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) videoRef.current?.focus();
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const togglePlayback = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      void video.play();
    } else {
      video.pause();
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  const toggleFullscreen = () => {
    if (!playerRef.current) return;
    if (document.fullscreenElement) {
      void document.exitFullscreen();
      return;
    }
    void playerRef.current.requestFullscreen();
  };

  return (
    <div
      ref={playerRef}
      className="group relative aspect-video w-full overflow-hidden rounded-xl bg-black shadow-sm"
    >
      <video
        ref={videoRef}
        autoPlay={autoPlay}
        className="size-full object-contain"
        playsInline
        poster={thumbnail}
        preload="metadata"
        src={src}
        onClick={togglePlayback}
        onDurationChange={(event) => setDuration(event.currentTarget.duration || 0)}
        onEnded={() => setIsPlaying(false)}
        onError={() => setHasError(true)}
        onLoadedData={() => setHasError(false)}
        onPause={() => setIsPlaying(false)}
        onPlay={() => setIsPlaying(true)}
        onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
      />

      {hasError ? (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-black/90 p-6 text-center text-white">
          <p className="text-sm">The video guide could not load in this browser.</p>
          <a
            className="rounded-full bg-white px-4 py-2 text-sm font-medium text-black"
            href={src}
            rel="noreferrer"
            target="_blank"
          >
            Open video guide
          </a>
        </div>
      ) : null}

      {!isPlaying ? (
        <button
          aria-label="Play widget setup guide"
          className="absolute inset-0 m-auto flex size-14 items-center justify-center rounded-full bg-white/90 text-black shadow-lg transition-transform hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          type="button"
          onClick={togglePlayback}
        >
          <Play className="ml-0.5 size-6 fill-current" />
        </button>
      ) : null}

      <div className="absolute inset-x-0 bottom-0 flex items-center gap-2 bg-gradient-to-t from-black/90 via-black/60 to-transparent px-3 pb-3 pt-8 text-white opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
        <button
          aria-label={isPlaying ? "Pause video" : "Play video"}
          className="flex size-8 shrink-0 items-center justify-center rounded-full bg-white/15 transition-colors hover:bg-white/25 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          type="button"
          onClick={togglePlayback}
        >
          {isPlaying ? <Pause className="size-4 fill-current" /> : <Play className="size-4 fill-current" />}
        </button>

        <span className="min-w-20 text-xs tabular-nums">
          {formatTime(currentTime)} / {formatTime(duration)}
        </span>

        <input
          aria-label="Video progress"
          className="h-1 min-w-0 flex-1 cursor-pointer accent-[#629BF8]"
          max={duration || 0}
          min="0"
          step="0.1"
          type="range"
          value={Math.min(currentTime, duration || 0)}
          onChange={(event) => {
            const nextTime = Number(event.target.value);
            if (videoRef.current) videoRef.current.currentTime = nextTime;
            setCurrentTime(nextTime);
          }}
        />

        <button
          aria-label={isMuted ? "Unmute video" : "Mute video"}
          className="flex size-8 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          type="button"
          onClick={toggleMute}
        >
          {isMuted ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
        </button>

        <input
          aria-label="Video volume"
          className="hidden h-1 w-16 cursor-pointer accent-[#629BF8] sm:block"
          max="1"
          min="0"
          step="0.05"
          type="range"
          value={isMuted ? 0 : volume}
          onChange={(event) => {
            const nextVolume = Number(event.target.value);
            if (videoRef.current) {
              videoRef.current.volume = nextVolume;
              videoRef.current.muted = nextVolume === 0;
            }
            setVolume(nextVolume);
            setIsMuted(nextVolume === 0);
          }}
        />

        <button
          aria-label="Enter fullscreen"
          className="flex size-8 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          type="button"
          onClick={toggleFullscreen}
        >
          <Maximize className="size-4" />
        </button>
      </div>
    </div>
  );
}
