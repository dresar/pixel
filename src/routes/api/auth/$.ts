import { createFileRoute } from "@tanstack/react-router";

const BACKEND_URL = (import.meta as any).env?.VITE_API_URL || "http://localhost:3001";

function forwardHeaders(headers: Headers): Headers {
  const h = new Headers(headers);
  h.delete("host");
  return h;
}

export const Route = createFileRoute("/api/auth/$")({
  server: {
    handlers: {
      GET: async ({ request }: { request: Request }) => {
        const url = new URL(request.url);
        const targetUrl = `${BACKEND_URL}${url.pathname}${url.search}`;
        return fetch(targetUrl, {
          method: "GET",
          headers: forwardHeaders(request.headers),
        });
      },
      POST: async ({ request }: { request: Request }) => {
        const url = new URL(request.url);
        const targetUrl = `${BACKEND_URL}${url.pathname}${url.search}`;
        const body = await request.text();
        return fetch(targetUrl, {
          method: "POST",
          headers: forwardHeaders(request.headers),
          body: body || undefined,
        });
      },
    },
  },
});
