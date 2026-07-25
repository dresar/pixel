import { createFileRoute } from "@tanstack/react-router";
import { auth } from "../../../server/features/auth/auth.config";

export const Route = createFileRoute("/api/auth/$")({
  server: {
    handlers: {
      GET: async ({ request }: { request: Request }) => auth.handler(request),
      POST: async ({ request }: { request: Request }) => auth.handler(request),
    },
  },
});
