import type { ReactNode } from "react";
import { Sparkles } from "lucide-react";
import { PageHeader, PageBody } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";

export function PlaceholderPage({
  title,
  description,
  breadcrumb,
  icon: Icon = Sparkles,
  hint,
  actions,
  children,
}: {
  title: string;
  description?: string;
  breadcrumb?: { label: string; to?: string }[];
  icon?: any;
  hint?: string;
  actions?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <>
      <PageHeader title={title} description={description} breadcrumb={breadcrumb} actions={actions} />
      <PageBody>
        {children ?? (
          <div className="mx-auto flex max-w-md flex-col items-center rounded-2xl border bg-card p-10 text-center">
            <div className="mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-primary/10 text-primary">
              <Icon className="h-6 w-6" />
            </div>
            <h2 className="text-lg font-semibold">Halaman siap dibangun</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {hint ?? "Antarmuka ini akan diisi konten lengkap pada fase berikutnya."}
            </p>
            <Button className="mt-5">Mulai</Button>
          </div>
        )}
      </PageBody>
    </>
  );
}
