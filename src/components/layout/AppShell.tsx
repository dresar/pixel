import {
  BookOpen,
  Briefcase,
  Calendar,
  ChevronDown,
  ChevronRight,
  Compass,
  CreditCard,
  FileCode2,
  FileQuestion,
  FileText,
  Flame,
  FolderOpen,
  GraduationCap,
  HelpCircle,
  History,
  Image as ImageIcon,
  Key,
  LayoutDashboard,
  LayoutGrid,
  Library,
  LogOut,
  Menu,
  MessageSquare,
  Moon,
  PanelLeftClose,
  PenTool,
  Search,
  Settings,
  Sparkles,
  Sun,
  Trophy,
  User,
  Users,
  X,
  ArrowLeft,
} from "lucide-react";
import { ReactNode, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// ── TIPE NAVIGASI ────────────────────────────────────────────────────────────
interface NavItem {
  label: string;
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  badgeVariant?: "default" | "secondary" | "destructive" | "outline";
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

// ── GRUP NAVIGASI UTAMA (STUDENT/USER) ───────────────────────────────────────
const studentNavGroups: NavGroup[] = [
  {
    title: "PEMBELAJARAN",
    items: [
      { label: "Beranda", to: "/beranda", icon: LayoutDashboard },
      { label: "Roadmap Kurikulum", to: "/roadmap", icon: Compass, badge: "UTAMA" },
      { label: "Modul & Materi", to: "/belajar", icon: BookOpen },
      { label: "Kuis & Evaluasi", to: "/kuis", icon: FileQuestion },
      { label: "Studi Kasus & Simulasi", to: "/studi-kasus", icon: PenTool },
    ],
  },
  {
    title: "ASISTEN AI & PERALATAN",
    items: [
      { label: "Tanya AI Asisten", to: "/ai/chat", icon: Sparkles, badge: "AI" },
      { label: "AI Jelaskan Pasal", to: "/ai/jelaskan", icon: FileText },
      { label: "Catatan AI", to: "/ai/catatan", icon: History },
      { label: "Referensi Hukum", to: "/referensi", icon: Library },
      { label: "Glosarium Pajak", to: "/glosarium", icon: FolderOpen },
    ],
  },
  {
    title: "PROGRES & KOMUNITAS",
    items: [
      { label: "Progres Belajar", to: "/progres", icon: Trophy },
      { label: "Peringkat (Leaderboard)", to: "/peringkat", icon: Flame },
      { label: "Kartu Belajar", to: "/kartu", icon: CreditCard },
      { label: "Kalender Pajak", to: "/kalender", icon: Calendar },
    ],
  },
];

// ── GRUP NAVIGASI ADMIN PANEL ────────────────────────────────────────────────
const adminNavGroups: NavGroup[] = [
  {
    title: "RINGKASAN & ANALITIK",
    items: [
      { label: "Dashboard Admin", to: "/admin/dashboard", icon: LayoutDashboard },
    ],
  },
  {
    title: "MANAJEMEN KONTEN BREVET",
    items: [
      { label: "Modul Kurikulum", to: "/admin/modul", icon: BookOpen },
      { label: "Materi & Bab", to: "/admin/materi", icon: FileText },
      { label: "Bank Kuis & Evaluasi", to: "/admin/kuis", icon: FileQuestion },
      { label: "Studi Kasus & Simulasi", to: "/admin/studi-kasus", icon: Briefcase },
      { label: "Galeri Gambar & Visual", to: "/admin/gambar", icon: ImageIcon },
      { label: "Referensi Hukum & UU", to: "/admin/referensi", icon: Library },
      { label: "Glosarium Istilah", to: "/admin/glosarium", icon: FolderOpen },
    ],
  },
  {
    title: "STUDIO INTELIJEN AI",
    items: [
      { label: "Studio Asisten AI", to: "/admin/prompt-studio", icon: FileCode2, badge: "AI" },
      { label: "Kunci Akses Asisten AI", to: "/admin/key", icon: Key },
    ],
  },
  {
    title: "PENGGUNA & PENGATURAN",
    items: [
      { label: "Manajemen Pengguna", to: "/admin/pengguna", icon: Users },
      { label: "Pengaturan Sistem", to: "/admin/pengaturan", icon: Settings },
    ],
  },
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const { data: session } = useSession();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarHidden, setSidebarHidden] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  const isAdmin = pathname.startsWith("/admin");
  const navGroups = isAdmin ? adminNavGroups : studentNavGroups;
  const userRole = (session?.user as any)?.role || "STUDENT";

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "dark" | "light" | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle("dark", savedTheme === "dark");
    } else {
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/sign-out", { method: "POST" });
      window.location.href = "/masuk";
    } catch {
      window.location.href = "/masuk";
    }
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-background text-foreground flex flex-col font-sans selection:bg-primary selection:text-primary-foreground">
      {/* ── 1. FIXED TOP HEADER NAVBAR (TOGGLE BUTTON UNTUK SIDEBAR & LOGO & TITLE) ── */}
      <header className="h-14 shrink-0 z-30 flex items-center justify-between border-b border-border/80 bg-card/90 px-3 sm:px-6 backdrop-blur-md">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          {/* Tombol Mobile Menu */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden h-9 w-9 rounded-xl text-muted-foreground hover:text-foreground shrink-0"
            aria-label="Buka Menu Navigasi"
          >
            <Menu className="h-5 w-5" />
          </Button>

          {/* Tombol Toggle Sembunyikan / Tampilkan Sidebar Desktop */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarHidden(!sidebarHidden)}
            className="hidden lg:flex h-9 w-9 rounded-xl text-muted-foreground hover:text-foreground shrink-0"
            title={sidebarHidden ? "Tampilkan Sidebar Navigasi" : "Sembunyikan Sidebar Navigasi"}
          >
            <PanelLeftClose className={cn("h-5 w-5 transition-transform duration-300", sidebarHidden && "rotate-180")} />
          </Button>

          <Link to="/" className="flex items-center gap-2 group shrink-0">
            <div className="grid h-8 w-8 sm:h-9 sm:w-9 place-items-center rounded-xl bg-gradient-to-br from-primary via-blue-600 to-amber-500 text-white font-black text-xs sm:text-sm shadow-md group-hover:scale-105 transition-transform">
              B
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-xs sm:text-base tracking-tight leading-none text-foreground flex items-center gap-1.5">
                BrevetAI <Badge variant="outline" className="text-[9px] font-mono px-1 py-0 border-primary/30 text-primary hidden sm:inline-flex">Resmi</Badge>
              </span>
              <span className="text-[10px] text-muted-foreground font-mono leading-none mt-0.5 hidden sm:block">
                Platform Edukasi Brevet Pajak A/B
              </span>
            </div>
          </Link>

          {/* PORTAL CONTAINER UNTUK JUDUL TERLETAK DI SAMPING LOGO */}
          <div id="top-header-portal" className="ml-3 pl-3 border-l border-border/60 flex items-center min-w-0 font-extrabold text-xs sm:text-sm text-foreground truncate max-w-[200px] sm:max-w-xs md:max-w-sm shrink-0" />
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 ml-2">
          {userRole === "ADMIN" && (
            <Button
              asChild
              size="sm"
              variant={isAdmin ? "default" : "outline"}
              className="h-8 rounded-xl text-xs font-bold gap-1.5 px-2.5 sm:px-3"
            >
              <Link to={isAdmin ? "/beranda" : "/admin/dashboard"}>
                <LayoutGrid className="h-3.5 w-3.5" />
                <span className="hidden md:inline">{isAdmin ? "Modus Siswa" : "Admin Panel"}</span>
              </Link>
            </Button>
          )}

          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl text-muted-foreground hover:text-foreground"
            title="Ganti Tema"
          >
            {theme === "dark" ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-slate-700" />}
          </Button>

          {session?.user ? (
            <div className="flex items-center gap-1.5 sm:gap-2 pl-1.5 sm:pl-2 border-l border-border/60">
              <Link to="/profil" className="flex items-center gap-2 group">
                <Avatar className="h-8 w-8 rounded-xl border border-primary/30 group-hover:border-primary transition-colors">
                  <AvatarImage src={session.user.image || ""} />
                  <AvatarFallback className="bg-primary/20 text-primary font-bold text-xs">
                    {session.user.name?.slice(0, 2).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden lg:flex flex-col text-left">
                  <span className="text-xs font-bold text-foreground truncate max-w-[100px]">
                    {session.user.name || "Pengguna"}
                  </span>
                  <span className="text-[9px] text-muted-foreground font-mono">
                    {userRole === "ADMIN" ? "Administrator" : "Siswa Brevet"}
                  </span>
                </div>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                className="h-8 w-8 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                title="Keluar"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Button asChild size="sm" className="rounded-xl font-bold text-xs h-8 px-3 sm:px-4 bg-primary text-primary-foreground">
              <Link to="/masuk">Masuk</Link>
            </Button>
          )}
        </div>
      </header>

      {/* ── 2. VIEWPORT CONTENT WRAPPER ── */}
      <div className="flex-1 flex min-w-0 overflow-hidden relative">
        {/* ── SIDEBAR DRAWER OVERLAY (MOBILE) ── */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden animate-in fade-in"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* ── 3. COLLAPSIBLE SIDEBAR NAVIGATION (DESKTOP HIDDEN TOGGLEABLE) ── */}
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-40 border-r border-border/80 bg-card/95 backdrop-blur-md flex flex-col transition-all duration-300 lg:static lg:translate-x-0 shrink-0 h-full overflow-y-auto",
            sidebarOpen ? "translate-x-0 w-64" : "-translate-x-full lg:translate-x-0",
            sidebarHidden ? "lg:w-0 lg:p-0 lg:border-r-0 lg:opacity-0 pointer-events-none overflow-hidden" : "lg:w-64"
          )}
        >
          <div className="h-14 flex items-center justify-between px-4 border-b border-border/60 lg:hidden">
            <span className="font-extrabold text-sm text-foreground flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" /> Menu Navigasi
            </span>
            <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)} className="h-8 w-8 rounded-xl">
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {navGroups.map((group, gIdx) => (
              <div key={gIdx} className="space-y-1.5">
                <span className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground/80 font-mono">
                  {group.title}
                </span>
                <div className="space-y-1 pt-1">
                  {group.items.map((item, iIdx) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.to || (item.to !== "/beranda" && item.to !== "/admin/dashboard" && pathname.startsWith(item.to));

                    return (
                      <Link
                        key={iIdx}
                        to={item.to}
                        onClick={() => setSidebarOpen(false)}
                        className={cn(
                          "flex items-center justify-between rounded-xl px-3 py-2 text-xs font-bold transition-all group",
                          isActive
                            ? "bg-primary text-primary-foreground shadow-xs"
                            : "text-muted-foreground hover:bg-accent hover:text-foreground"
                        )}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Icon className={cn("h-4 w-4 shrink-0 transition-transform group-hover:scale-110", isActive ? "text-primary-foreground" : "text-primary")} />
                          <span className="truncate">{item.label}</span>
                        </div>

                        {item.badge && (
                          <Badge
                            variant={item.badgeVariant || (isActive ? "secondary" : "outline")}
                            className="text-[9px] font-mono font-bold px-1.5 py-0 rounded-md shrink-0"
                          >
                            {item.badge}
                          </Badge>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 border-t border-border/60 bg-muted/20 text-[11px] text-muted-foreground space-y-2">
            <div className="flex items-center justify-between font-mono text-[10px]">
              <span>Kurikulum 2026</span>
              <span className="text-emerald-400 font-bold">UU HPP & PMK 168</span>
            </div>
            <p className="text-[10px] leading-normal text-muted-foreground/80">
              Hak Cipta © 2026 BrevetAI. Seluruh Hak Dilindungi.
            </p>
          </div>
        </aside>

        {/* ── 4. MAIN CONTENT AREA (SCROLLABLE, CLEAN FULL HEIGHT) ── */}
        <main className="flex-1 min-w-0 flex flex-col overflow-y-auto h-full relative">
          {children}
        </main>
      </div>
    </div>
  );
}

// ── PAGE HEADER (PURE TRANSPARENT FLOATING PILL OVERLAY, ZERO BLACK BAR, ZERO CARD BACKGROUND) ─────
export function PageHeader({
  title,
  description,
  actions,
}: {
  title?: string;
  description?: string;
  breadcrumb?: { label: string; to?: string }[];
  actions?: ReactNode;
}) {
  const [headerTitlePortal, setHeaderTitlePortal] = useState<Element | null>(null);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isAdmin = pathname.startsWith("/admin");

  useEffect(() => {
    setHeaderTitlePortal(document.getElementById("top-header-portal"));
  }, []);

  return (
    <>
      {/* Judul portaled into top header navbar next to logo */}
      {headerTitlePortal && title && !isAdmin && createPortal(
        <span className="truncate font-extrabold text-xs sm:text-sm text-foreground tracking-tight">{title}</span>,
        headerTitlePortal
      )}

      {/* PURE TRANSPARENT FLOATING PILL BUTTONS (NO FULL WIDTH BAR, NO BACKGROUND BOX) */}
      {actions && (
        <div className="sticky top-2 z-30 flex items-center justify-end pointer-events-none mb-0 -mt-1">
          <div className="pointer-events-auto flex items-center gap-2 shrink-0 ml-auto bg-card/85 backdrop-blur-md p-1 rounded-full border border-border/50 shadow-md">
            {actions}
          </div>
        </div>
      )}
    </>
  );
}

export function PageBody({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("p-4 sm:p-6 pt-3 sm:pt-4", className)}>{children}</div>;
}
