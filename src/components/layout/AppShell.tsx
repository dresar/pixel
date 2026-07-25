import { Link, useRouterState } from "@tanstack/react-router";
import { useState, useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import {
  Home,
  Map,
  BookOpen,
  Sparkles,
  Trophy,
  Calendar,
  Bookmark,
  Highlighter,
  Layers,
  ClipboardList,
  History,
  Download,
  BarChart3,
  Users,
  Image as ImageIcon,
  FileJson,
  Wand2,
  Settings,
  Sun,
  Moon,
  Menu,
  ChevronRight,
  LogOut,
  Book,
  Timer,
  Target,
  FlaskConical,
  Shield,
  Boxes,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/lib/theme";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { currentUser } from "@/lib/dummy";

type NavItem = { to: string; label: string; icon: any; badge?: string };

// Student Navigation
const mainNav: NavItem[] = [
  { to: "/beranda", label: "Beranda", icon: Home },
  { to: "/roadmap", label: "Roadmap", icon: Map },
  { to: "/belajar", label: "Belajar", icon: BookOpen },
  { to: "/ai/chat", label: "Tanya AI", icon: Sparkles, badge: "Baru" },
  { to: "/kuis", label: "Kuis", icon: ClipboardList },
  { to: "/kartu", label: "Kartu Belajar", icon: Layers },
];

const libraryNav: NavItem[] = [
  { to: "/glosarium", label: "Glosarium", icon: Book },
  { to: "/referensi", label: "Referensi UU", icon: FileJson },
  { to: "/tersimpan", label: "Tersimpan", icon: Bookmark },
  { to: "/sorotan", label: "Sorotan", icon: Highlighter },
  { to: "/riwayat", label: "Riwayat", icon: History },
  { to: "/unduhan", label: "Unduhan", icon: Download },
];

const progressNav: NavItem[] = [
  { to: "/progres", label: "Progres Belajar", icon: BarChart3 },
  { to: "/pencapaian", label: "Pencapaian", icon: Trophy },
  { to: "/peringkat", label: "Leaderboard", icon: Users },
  { to: "/kalender", label: "Kalender", icon: Calendar },
  { to: "/rencana", label: "Rencana Belajar", icon: Target },
  { to: "/pomodoro", label: "Timer Pomodoro", icon: Timer },
];

// Admin Navigation
const adminNav: NavItem[] = [
  { to: "/admin/dashboard", label: "Dashboard Admin", icon: Shield },
  { to: "/admin/modul", label: "Kelola Modul", icon: Boxes },
  { to: "/admin/materi", label: "Kelola Materi", icon: BookOpen },
  { to: "/admin/kuis", label: "Kelola Kuis", icon: ClipboardList },
  { to: "/admin/key", label: "Gemini Keys", icon: Wand2, badge: "API" },
  { to: "/admin/json", label: "Konten JSON", icon: FileJson },
  { to: "/admin/gambar", label: "Media", icon: ImageIcon },
  { to: "/admin/pengguna", label: "Pengguna", icon: Users },
  { to: "/admin/pengaturan", label: "Pengaturan", icon: Settings },
];

// Prompt Studio Sub-Navigation
const promptStudioNav: NavItem[] = [
  { to: "/admin/prompt-studio", label: "Engine Manager", icon: Sparkles },
  { to: "/admin/prompt-studio/compiler", label: "Prompt Compiler", icon: FlaskConical },
];

function NavList({ items, onNavigate }: { items: NavItem[]; onNavigate?: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <ul className="space-y-0.5">
      {items.map((item) => {
        const active =
          pathname === item.to || (item.to !== "/" && pathname.startsWith(item.to + "/")) ||
          (item.to === "/admin/dashboard" && (pathname === "/admin" || pathname === "/admin/"));
        const Icon = item.icon;
        return (
          <li key={item.to}>
            <Link
              to={item.to}
              onClick={onNavigate}
              className={cn(
                "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-xs font-semibold"
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
              )}
            >
              <Icon className="h-4 w-4 shrink-0" strokeWidth={2} />
              <span className="truncate">{item.label}</span>
              {item.badge && (
                <Badge variant="secondary" className="ml-auto h-5 px-1.5 text-[10px]">
                  {item.badge}
                </Badge>
              )}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

function AdminSidebarInner({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Header (Fixed) */}
      <div className="shrink-0 flex items-center justify-between px-4 py-5 border-b mb-2">
        <div className="flex items-center gap-2.5">
          <div className="grid h-9 w-9 place-items-center rounded-xl shadow-sm bg-destructive text-destructive-foreground">
            <Shield className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold tracking-tight">Admin Control Panel</p>
            <p className="truncate text-[11px] text-muted-foreground">Kelola Platform Pajak</p>
          </div>
        </div>
        <Badge variant="destructive" className="text-[9px] uppercase px-1.5 py-0.5 font-mono">
          ADMIN
        </Badge>
      </div>

      {/* Navigation list (Independently Scrollable) */}
      <nav className="flex-1 space-y-6 overflow-y-auto px-3 pb-6">
        <div>
          <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-destructive">
            Navigasi Admin Panel
          </p>
          <NavList items={adminNav} onNavigate={onNavigate} />
        </div>
        <div>
          <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-primary">
            Prompt Studio
          </p>
          <NavList items={promptStudioNav} onNavigate={onNavigate} />
        </div>
      </nav>

      {/* Profile Footer (Fixed) */}
      <div className="shrink-0 border-t p-3 bg-sidebar">
        <Link
          to="/admin/pengaturan"
          onClick={onNavigate}
          className="flex items-center gap-3 rounded-lg px-2 py-2 text-sm font-medium text-sidebar-foreground/80 hover:bg-sidebar-accent/60"
        >
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
              {currentUser.avatarInitials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{currentUser.name}</p>
            <p className="truncate text-[11px] text-muted-foreground">Administrator</p>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </Link>
      </div>
    </div>
  );
}

function StudentMobileMenuInner({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="flex items-center gap-2.5 px-4 py-5 border-b mb-2">
        <div className="grid h-9 w-9 place-items-center rounded-xl shadow-sm bg-primary text-primary-foreground">
          <Sparkles className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-bold tracking-tight">BrevetAI</p>
          <p className="truncate text-[11px] text-muted-foreground">Belajar Brevet Pajak A & B</p>
        </div>
      </div>
      <nav className="flex-1 space-y-6 overflow-y-auto px-3 pb-6">
        <div>
          <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Utama
          </p>
          <NavList items={mainNav} onNavigate={onNavigate} />
        </div>
        <div>
          <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Pustaka
          </p>
          <NavList items={libraryNav} onNavigate={onNavigate} />
        </div>
        <div>
          <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Progres
          </p>
          <NavList items={progressNav} onNavigate={onNavigate} />
        </div>
      </nav>
      <div className="shrink-0 border-t p-3 bg-sidebar">
        <Link
          to="/pengaturan"
          onClick={onNavigate}
          className="flex items-center gap-3 rounded-lg px-2 py-2 text-sm font-medium text-sidebar-foreground/80 hover:bg-sidebar-accent/60"
        >
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
              {currentUser.avatarInitials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{currentUser.name}</p>
            <p className="truncate text-[11px] text-muted-foreground">{currentUser.role}</p>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </Link>
      </div>
    </div>
  );
}

function ThemeToggle() {
  const { theme, toggle } = useTheme();
  return (
    <Button variant="ghost" size="icon" onClick={toggle} aria-label="Ganti tema" className="rounded-lg">
      {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </Button>
  );
}

function UserMenu() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isAdminArea = pathname.startsWith("/admin");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="gap-2 px-2">
          <Avatar className="h-7 w-7">
            <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
              {currentUser.avatarInitials}
            </AvatarFallback>
          </Avatar>
          <span className="hidden text-xs font-medium sm:inline">{currentUser.name}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel className="font-normal">
          <p className="text-xs font-semibold">{currentUser.name}</p>
          <p className="text-[11px] text-muted-foreground">{currentUser.email}</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {isAdminArea ? (
          <>
            <DropdownMenuItem asChild>
              <Link to="/admin/pengaturan">Pengaturan Admin</Link>
            </DropdownMenuItem>
          </>
        ) : (
          <>
            <DropdownMenuItem asChild>
              <Link to="/profil">Profil Saya</Link>
            </DropdownMenuItem>

            <DropdownMenuItem asChild>
              <Link to="/pengaturan">Pengaturan Akun</Link>
            </DropdownMenuItem>
          </>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild className="text-destructive">
          <Link to="/masuk">
            <LogOut className="mr-2 h-3.5 w-3.5" /> Keluar
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isAdminArea = pathname.startsWith("/admin");

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Admin Panel Desktop Sidebar (Only visible in /admin routes) */}
      {isAdminArea && (
        <aside className="hidden w-64 shrink-0 border-r bg-sidebar md:block sticky top-0 h-screen overflow-hidden">
          <AdminSidebarInner />
        </aside>
      )}

      {/* Main Layout Area */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-4 border-b bg-background/90 px-4 backdrop-blur-md sm:px-6">
          <div className="flex items-center gap-4 min-w-0">
            {/* Mobile Hamburger Drawer */}
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 p-0 bg-sidebar">
                {isAdminArea ? (
                  <AdminSidebarInner onNavigate={() => setOpen(false)} />
                ) : (
                  <StudentMobileMenuInner onNavigate={() => setOpen(false)} />
                )}
              </SheetContent>
            </Sheet>

            {/* Student Top Header Branding & Compact Navigation Dropdown (Desktop Only) */}
            {!isAdminArea && (
              <div className="flex items-center gap-6">
                <Link to="/beranda" className="flex items-center gap-2 text-primary font-bold">
                  <div className="grid h-8 w-8 place-items-center rounded-xl bg-primary text-primary-foreground shadow-xs">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <span className="text-base tracking-tight text-foreground font-extrabold hidden sm:inline">
                    BrevetAI
                  </span>
                </Link>

                {/* Compact Top Navigation Links */}
                <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
                  <Link
                    to="/beranda"
                    className={cn(
                      "px-3 py-1.5 rounded-lg transition-colors text-xs font-semibold",
                      pathname === "/beranda"
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                    )}
                  >
                    Beranda
                  </Link>

                  <Link
                    to="/roadmap"
                    className={cn(
                      "px-3 py-1.5 rounded-lg transition-colors text-xs font-semibold",
                      pathname === "/roadmap"
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                    )}
                  >
                    Roadmap
                  </Link>

                  <Link
                    to="/belajar"
                    className={cn(
                      "px-3 py-1.5 rounded-lg transition-colors text-xs font-semibold",
                      pathname === "/belajar" || pathname.startsWith("/belajar/")
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                    )}
                  >
                    Belajar
                  </Link>

                  <Link
                    to="/ai/chat"
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors text-xs font-semibold",
                      pathname === "/ai/chat"
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                    )}
                  >
                    <Sparkles className="h-3.5 w-3.5 text-primary" /> Tanya AI
                  </Link>

                  {/* Single Clean Dropdown for All Extra Learning Tools */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors">
                        Pustaka & Fitur <ChevronDown className="h-3.5 w-3.5 opacity-60" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-48">
                      <DropdownMenuLabel className="text-[10px] uppercase font-bold text-muted-foreground">
                        Pustaka Pajak
                      </DropdownMenuLabel>
                      <DropdownMenuItem asChild>
                        <Link to="/glosarium" className="flex items-center gap-2">
                          <Book className="h-4 w-4 text-primary" /> Glosarium Pajak
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/referensi" className="flex items-center gap-2">
                          <FileJson className="h-4 w-4 text-primary" /> Referensi UU
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuLabel className="text-[10px] uppercase font-bold text-muted-foreground">
                        Latihan & Progres
                      </DropdownMenuLabel>
                      <DropdownMenuItem asChild>
                        <Link to="/kuis" className="flex items-center gap-2">
                          <ClipboardList className="h-4 w-4 text-primary" /> Kuis Interaktif
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/kartu" className="flex items-center gap-2">
                          <Layers className="h-4 w-4 text-primary" /> Kartu Belajar
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/progres" className="flex items-center gap-2">
                          <BarChart3 className="h-4 w-4 text-primary" /> Progres Belajar
                        </Link>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </nav>
              </div>
            )}
          </div>

          {/* PORTAL TARGET FOR PAGE HEADER */}
          <div id="top-header-portal" className="flex-1 flex items-center justify-end md:justify-between min-w-0 px-2 sm:px-4" />

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <div className="h-4 w-px bg-border" />
            <UserMenu />
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 min-w-0 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}

export function PageHeader({
  title,
  description,
  breadcrumb,
  actions,
}: {
  title: string;
  description?: string;
  breadcrumb?: { label: string; to?: string }[];
  actions?: ReactNode;
}) {
  const [portalTarget, setPortalTarget] = useState<Element | null>(null);

  useEffect(() => {
    setPortalTarget(document.getElementById("top-header-portal"));
  }, []);

  // Bagian 1: Judul & Deskripsi di-render ke Top Navbar (Disembunyikan di Mobile)
  const headerContent = (
    <div className="hidden sm:flex flex-col min-w-0 justify-center pl-1">
      <h1 className="text-sm font-bold tracking-tight truncate text-foreground">{title}</h1>
      {description && <span className="text-[10px] text-muted-foreground truncate hidden lg:block">{description}</span>}
    </div>
  );

  return (
    <>
      {portalTarget && createPortal(headerContent, portalTarget)}

      {/* Bagian 2: Breadcrumb & Actions (Dirender di bawah Header) */}
      {(breadcrumb || actions) && (
        <div className="border-b bg-background/60 px-4 py-3 sm:px-6">
          <div className="mx-auto max-w-7xl flex flex-wrap items-center justify-between gap-3">
            <div className="flex-1 min-w-0">
              {breadcrumb && breadcrumb.length > 0 && (
                <nav className="flex items-center gap-1.5 text-xs text-muted-foreground truncate">
                  {breadcrumb.map((b, i) => (
                    <div key={i} className="flex items-center gap-1.5 truncate">
                      {i > 0 && <ChevronRight className="h-3 w-3 shrink-0" />}
                      {b.to ? (
                        <Link to={b.to} className="hover:text-foreground font-medium truncate">{b.label}</Link>
                      ) : (
                        <span className="font-medium text-foreground truncate">{b.label}</span>
                      )}
                    </div>
                  ))}
                </nav>
              )}
            </div>

            {actions && (
              <div className="flex shrink-0 items-center gap-2">
                {actions}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export function PageBody({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("mx-auto max-w-7xl p-4 sm:p-6", className)}>{children}</div>;
}
