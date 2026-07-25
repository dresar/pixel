import { createFileRoute } from "@tanstack/react-router";
import { Bell, Check, Sparkles } from "lucide-react";
import { useState } from "react";
import { PageBody, PageHeader } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { notifications as dummyNotifications } from "@/lib/dummy";
import { getNotifikasi, tandaiNotifikasiDibaca } from "@/functions/notifications";

export const Route = createFileRoute("/_app/notifikasi")({
  loader: async () => {
    try {
      const res = await getNotifikasi();
      return { initialList: res.success && res.data ? res.data : [] };
    } catch {
      return { initialList: [] };
    }
  },
  head: () => ({
    meta: [
      { title: "Notifikasi — BrevetAI" },
      { name: "description", content: "Semua notifikasi belajar, kuis, dan pencapaianmu." },
    ],
  }),
  component: Notifikasi,
});

function Notifikasi() {
  const { initialList } = Route.useLoaderData();
  const [list, setList] = useState<any[]>(initialList);

  const handleTandaiSemuaDibaca = async () => {
    try {
      await tandaiNotifikasiDibaca({ data: {} });
      setList((prev) => prev.map((item) => ({ ...item, dibaca: true })));
    } catch {
      // ignore
    }
  };

  const displayList = list.length > 0 ? list : dummyNotifications;

  return (
    <>
      <PageHeader
        title="Notifikasi"
        description="Semua pemberitahuan aktivitas belajarmu."
        actions={
          <Button variant="outline" size="sm" onClick={handleTandaiSemuaDibaca}>
            <Check className="mr-1 h-3.5 w-3.5" /> Tandai semua dibaca
          </Button>
        }
      />
      <PageBody className="max-w-3xl">
        <Tabs defaultValue="semua">
          <TabsList>
            <TabsTrigger value="semua">Semua</TabsTrigger>
            <TabsTrigger value="belum">Belum dibaca</TabsTrigger>
          </TabsList>
          <TabsContent value="semua" className="mt-5">
            <ul className="space-y-2">
              {displayList.map((n: any, i: number) => {
                const isUnread = n.dibaca === false || n.unread === true;
                return (
                  <li
                    key={n.id || i}
                    className={
                      "flex items-start gap-3 rounded-xl border bg-card p-4 transition-colors " +
                      (isUnread ? "border-primary/30 bg-primary/5" : "")
                    }
                  >
                    <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                      <Bell className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{n.judul || n.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{n.pesan || n.time || "Pemberitahuan sistem"}</p>
                    </div>
                    {isUnread && <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary" />}
                  </li>
                );
              })}
            </ul>
          </TabsContent>
          <TabsContent value="belum" className="mt-5">
            <ul className="space-y-2">
              {displayList
                .filter((n: any) => n.dibaca === false || n.unread === true)
                .map((n: any, i: number) => (
                  <li key={n.id || i} className="flex items-start gap-3 rounded-xl border border-primary/30 bg-primary/5 p-4">
                    <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                      <Bell className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{n.judul || n.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{n.pesan || n.time}</p>
                    </div>
                  </li>
                ))}
              {displayList.filter((n: any) => n.dibaca === false || n.unread === true).length === 0 && (
                <p className="rounded-xl border bg-card p-8 text-center text-sm text-muted-foreground">
                  Tidak ada notifikasi belum dibaca.
                </p>
              )}
            </ul>
          </TabsContent>
        </Tabs>
      </PageBody>
    </>
  );
}
