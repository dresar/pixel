import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { getProfilPengguna } from "@/functions/users";

export const Route = createFileRoute("/_app")({
  beforeLoad: async ({ location }) => {
    // Validasi autentikasi hanya dijalankan di browser (client-side) di mana token/cookies berada
    if (typeof window === "undefined") return;

    try {
      const res = await getProfilPengguna();
      const isOk = res && (res.success || res.sukses) && res.data;

      if (!isOk) {
        throw redirect({
          to: "/masuk",
          search: { redirect: location.pathname },
        });
      }
      return { userProfile: res.data };
    } catch (err: any) {
      if (err?.to || err?.status === 307 || err?.status === 302 || err?.isRedirect) throw err;
      throw redirect({
        to: "/masuk",
        search: { redirect: location.pathname },
      });
    }
  },
  component: () => (
    <AppShell>
      <Outlet />
    </AppShell>
  ),
});
