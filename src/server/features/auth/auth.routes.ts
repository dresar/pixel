/**
 * Auth Routes — /api/auth/*
 * Better-Auth menangani semua routing auth secara internal
 */

import { Hono } from "hono";
import { auth } from "./auth.config.js";
import { env } from "../../config/env.js";

const authRoutes = new Hono();

// Better-Auth handler — menangani semua route /api/auth/*
// Menjamin header CORS selalu terpasang sempurna untuk cross-origin (port 3000 -> port 3001)
authRoutes.all("/*", async (c) => {
  const reqOrigin = c.req.header("origin") || env.FRONTEND_URL;

  // Handle preflight OPTIONS
  if (c.req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": reqOrigin,
        "Access-Control-Allow-Credentials": "true",
        "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization, Cookie",
      },
    });
  }

  try {
    // Pass request to Better-Auth handler
    const res = await auth.handler(c.req.raw);

    // Copy response and attach CORS headers
    const newHeaders = new Headers(res.headers);
    newHeaders.set("Access-Control-Allow-Origin", reqOrigin);
    newHeaders.set("Access-Control-Allow-Credentials", "true");

    return new Response(res.body, {
      status: res.status,
      statusText: res.statusText,
      headers: newHeaders,
    });
  } catch (err: any) {
    console.error("❌ Better-Auth Handler Error:", err);
    return new Response(JSON.stringify({ error: "AUTH_ERROR", message: err.message || String(err) }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": reqOrigin,
        "Access-Control-Allow-Credentials": "true",
      },
    });
  }
});

export { authRoutes };
