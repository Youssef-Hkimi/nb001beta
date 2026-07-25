import type { NextConfig } from "next";

const isDevelopment = process.env.NODE_ENV === "development";
const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDevelopment ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' blob: data: https://cdn.discordapp.com https://*.supabase.co https://res.cloudinary.com",
  "media-src 'self' blob: https://res.cloudinary.com https://*.supabase.co",
  "connect-src 'self' https://discord.com https://*.supabase.co wss://*.supabase.co",
  "font-src 'self' data:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {key: "Content-Security-Policy", value: contentSecurityPolicy},
          {key: "Referrer-Policy", value: "strict-origin-when-cross-origin"},
          {key: "X-Content-Type-Options", value: "nosniff"},
          {key: "X-Frame-Options", value: "DENY"},
          {key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()"},
        ],
      },
    ];
  },
};

export default nextConfig;
