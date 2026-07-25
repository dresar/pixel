import { createFileRoute } from "@tanstack/react-router";
import { Bell, Check } from "lucide-react";
import { PageBody, PageHeader } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { notifications } from "@/lib/dummy";

export const Route = createFileRoute("/_app/notifikasi")({
  head: () => ({
    meta: [
      { title: "Notifikasi — BrevetAI" },
      { name: "description", content: "Semua notifikasi belajar, kuis, dan pencapaianmu." },
    ],
  }),
  component: Notifikasi,
});

function Notifikasi() {
  return (
    <>
      <PageHeader
        title="Notifikasi"
        description="Semua pemberitahuan aktivitas belajarmu."
        actions={
          <Button variant="outline" size="sm">
            <Check className="mr-1 h-3.5 w-3.5" /> Tandai baca
          </Button>
        }
      />
      <PageBody className="max-w-3xl">
        <Tabs defaultValue="semua">
          <TabsList>
            <TabsTrigger value="semua">Semua</TabsTrigger>
            <TabsTrigger value="belum">Belum dibaca</TabsTrigger>
            <TabsTrigger value="sistem">Sistem</TabsTrigger>
          </TabsList>
          <TabsContent value="semua" className="mt-5">
            <ul className="space-y-2">
              {notifications.concat(notifications).map((n, i) => (
                <li key={i} className={"flex items-start gap-3 rounded-xl border bg-card p-4 " + (n.unread ? "border-primary/30 bg-primary/5" : "")}>
                  <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                    <Bell className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{n.title}</p>
                    <p className="text-xs text-muted-foreground">{n.time}</p>
                  </div>
                  {n.unread && <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary" />}
                </li>
              ))}
            </ul>
          </TabsContent>
          <TabsContent value="belum" className="mt-5">
            <p className="rounded-xl border bg-card p-8 text-center text-sm text-muted-foreground">
              Tidak ada notifikasi belum dibaca.
            </p>
          </TabsContent>
          <TabsContent value="sistem" className="mt-5">
            <p className="rounded-xl border bg-card p-8 text-center text-sm text-muted-foreground">
              Belum ada notifikasi sistem.
            </p>
          </TabsContent>
        </Tabs>
      </PageBody>
    </>
  );
}
