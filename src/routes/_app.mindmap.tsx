import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@/components/layout/PlaceholderPage";
import { Network } from "lucide-react";

export const Route = createFileRoute("/_app/mindmap")({
  head: () => ({
    meta: [
      { title: "Mindmap — BrevetAI" },
      { name: "description", content: "Peta pikiran visual untuk memahami konsep pajak." },
    ],
  }),
  component: () => (
    <PlaceholderPage
      title="Mindmap"
      description="Visualisasi peta pikiran konsep perpajakan."
      breadcrumb={[{ label: "Belajar", to: "/belajar" }, { label: "Mindmap" }]}
      icon={Network}
      hint="Peta pikiran akan menampilkan hubungan antar konsep pajak secara visual."
    />
  ),
});
