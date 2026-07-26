import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/belajar/materi/$slug")({
  beforeLoad: ({ params }) => {
    const slug = params.slug || "apa-itu-pajak";
    throw redirect({
      to: "/roadmap/materi/$slug",
      params: { slug },
    });
  },
  component: () => null,
});
