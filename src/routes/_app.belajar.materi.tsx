import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/belajar/materi")({
  beforeLoad: () => {
    throw redirect({
      to: "/roadmap/materi/$slug",
      params: { slug: "apa-itu-pajak" },
    });
  },
  component: () => null,
});
