import { createFileRoute } from "@tanstack/react-router";

const BACKEND_URL = (import.meta as any).env?.VITE_API_URL ?? "http://localhost:3001";

export const Route = createFileRoute("/api/auth/$")({
  server: {
    handlers: {
      GET: async ({ request }: { request: Request }) => {
        const url = new URL(request.url);
        const targetUrl = `${BACKEND_URL}${url.pathname}${url.search}`;
        return fetch(targetUrl, {
          method: "GET",
          headers: request.headers,
        });
      },
      POST: async ({ request }: { request: Request }) => {
        const url = new URL(request.url);
        const targetUrl = `${BACKEND_URL}${url.pathname}${url.search}`;
        return fetch(targetUrl, {
          method: "POST",
          headers: request.headers,
          body: await request.text(),
        });
      },
    },
  },
});
