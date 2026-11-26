import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    agentFeedback: true,
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  headers() {
    const scriptSource = process.env.NODE_ENV !== "production"
      ? "'self' 'unsafe-inline' 'unsafe-eval'"
      : "'self' 'unsafe-inline'";
    const headers = [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "X-Frame-Options", value: "DENY" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
      // Next 인라인 스크립트 때문에 unsafe-inline 필요, nonce 방식은 추후 과제
      { key: "Content-Security-Policy", value: `default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src ${scriptSource}; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'` },
    ];
    if (process.env.NODE_ENV === "production") {
      headers.push({ key: "Strict-Transport-Security", value: "max-age=31536000" });
    }
    return [{ source: "/(.*)", headers }];
  },
};

export default nextConfig;
