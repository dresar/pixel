import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { getProfilPengguna } from "@/functions/users";

export const Route = createFileRoute("/_app")({
  beforeLoad: async ({ location }) => {
    try {
      const res = await getProfilPengguna();
      if (!res || !res.success || !res.data) {
        throw redirect({
          to: "/masuk",
          search: { redirect: location.href },
        });
      }
      return { userProfile: res.data };
    } catch (err: any) {
      if (err?.to || err?.status === 307 || err?.status === 302) throw err;
      throw redirect({
        to: "/masuk",
        search: { redirect: location.href },
      });
    }
  },
  component: () => (
    <AppShell>
      <Outlet />
    </AppShell>
  ),
});
