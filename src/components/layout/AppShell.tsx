import { Link, useRouterState } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
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
  Award,
  BarChart3,
  Users,
  Image as ImageIcon,
  FileJson,
  Wand2,
  Settings,
  Bell,
  Search,
  Sun,
  Moon,
  Menu,
  ChevronRight,
  LogOut,
  Book,
  Timer,
  Target,
  Shield,
  Boxes,
  Command as CommandIcon,
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
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { currentUser, notifications } from "@/lib/dummy";

type NavItem = { to: string; label: string; icon: any; badge?: string };

const mainNav: NavItem[] = [
  { to: "/beranda", label: "Beranda", icon: Home },
  { to: "/roadmap", label: "Roadmap belajar", icon: Map },
  { to: "/belajar", label: "Belajar", icon: BookOpen },
  { to: "/ai/chat", label: "Tanya AI", icon: Sparkles, badge: "Baru" },
  { to: "/kuis", label: "Kuis", icon: ClipboardList },
  { to: "/kartu", label: "Kartu belajar", icon: Layers },
];

const libraryNav: NavItem[] = [
  { to: "/tersimpan", label: "Tersimpan", icon: Bookmark },
  { to: "/sorotan", label: "Sorotan", icon: Highlighter },
  { to: "/riwayat", label: "Riwayat", icon: History },
  { to: "/unduhan", label: "Unduhan", icon: Download },
  { to: "/glosarium", label: "Glosarium", icon: Book },
  { to: "/referensi", label: "Referensi", icon: FileJson },
];

const progressNav: NavItem[] = [
  { to: "/progres", label: "Progres", icon: BarChart3 },
  { to: "/sertifikat", label: "Sertifikat", icon: Award },
  { to: "/pencapaian", label: "Pencapaian", icon: Trophy },
  { to: "/peringkat", label: "Peringkat", icon: Users },
  { to: "/kalender", label: "Kalender", icon: Calendar },
  { to: "/rencana", label: "Rencana belajar", icon: Target },
  { to: "/pomodoro", label: "Pomodoro", icon: Timer },
];

const adminNav: NavItem[] = [
  { to: "/admin", label: "Admin", icon: Shield },
  { to: "/admin/modul", label: "Modul", icon: Boxes },
  { to: "/admin/materi", label: "Materi", icon: BookOpen },
  { to: "/admin/prompt", label: "Prompt", icon: Wand2 },
  { to: "/admin/json", label: "JSON", icon: FileJson },
  { to: "/admin/gambar", label: "Gambar", icon: ImageIcon },
  { to: "/admin/pengguna", label: "Pengguna", icon: Users },
  { to: "/admin/analitik", label: "Analitik", icon: BarChart3 },
  { to: "/admin/pengaturan", label: "Pengaturan", icon: Settings },
];

const mobileNav = [
  { to: "/beranda", label: "Beranda", icon: Home },
  { to: "/roadmap", label: "Roadmap", icon: Map },
  { to: "/belajar", label: "Belajar", icon: BookOpen },
  { to: "/ai/chat", label: "AI", icon: Sparkles },
  { to: "/profil", label: "Profil", icon: Users },
];

function NavList({ items, onNavigate }: { items: NavItem[]; onNavigate?: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <ul className="space-y-0.5">
      {items.map((item) => {
        const active =
          pathname === item.to || (item.to !== "/" && pathname.startsWith(item.to + "/")) ||
          (item.to === "/admin" && pathname === "/admin");
        const Icon = item.icon;
        return (
          <li key={item.to}>
            <Link
              to={item.to}
              onClick={onNavigate}
              className={cn(
                "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
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

function SidebarInner({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2.5 px-4 py-5">
        <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground shadow-sm">
          <Sparkles className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold tracking-tight">BrevetAI</p>
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
        <div>
          <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Admin
          </p>
          <NavList items={adminNav} onNavigate={onNavigate} />
        </div>
      </nav>
      <div className="border-t p-3">
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

function NotificationsMenu() {
  const unread = notifications.filter((n) => n.unread).length;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Notifikasi" className="relative rounded-lg">
          <Bell className="h-4 w-4" />
          {unread > 0 && (
            <span className="absolute right-1.5 top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-primary px-1 text-[9px] font-semibold text-primary-foreground">
              {unread}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifikasi</span>
          <Link to="/notifikasi" className="text-xs font-medium text-primary hover:underline">
            Lihat semua
          </Link>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {notifications.slice(0, 4).map((n) => (
          <DropdownMenuItem key={n.id} className="items-start gap-2 py-2">
            <span
              className={cn(
                "mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full",
                n.unread ? "bg-primary" : "bg-muted-foreground/40",
              )}
            />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{n.title}</p>
              <p className="text-[11px] text-muted-foreground">{n.time}</p>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function CommandPalette({ open, setOpen }: { open: boolean; setOpen: (v: boolean) => void }) {
  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Cari materi, kuis, atau aksi cepat..." />
      <CommandList>
        <CommandEmpty>Tidak ada hasil.</CommandEmpty>
        <CommandGroup heading="Navigasi cepat">
          {[...mainNav, ...libraryNav].slice(0, 8).map((n) => (
            <CommandItem
              key={n.to}
              onSelect={() => {
                setOpen(false);
                window.location.assign(n.to);
              }}
            >
              <n.icon className="mr-2 h-4 w-4" />
              {n.label}
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandGroup heading="Aksi AI">
          <CommandItem>
            <Sparkles className="mr-2 h-4 w-4" /> Tanya AI
          </CommandItem>
          <CommandItem>
            <Wand2 className="mr-2 h-4 w-4" /> Jelaskan halaman ini
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [cmdOpen, setCmdOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="min-h-dvh bg-background">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r bg-sidebar lg:block">
        <SidebarInner />
      </aside>

      <div className="lg:pl-64">
        {/* Topbar */}
        <header className="sticky top-0 z-20 border-b bg-background/80 backdrop-blur-md">
          <div className="flex h-14 items-center gap-2 px-3 sm:px-4 lg:px-6">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Buka menu">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 p-0">
                <SidebarInner onNavigate={() => setMobileOpen(false)} />
              </SheetContent>
            </Sheet>

            <Link to="/beranda" className="flex items-center gap-2 lg:hidden">
              <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground">
                <Sparkles className="h-4 w-4" />
              </div>
              <span className="text-sm font-semibold">BrevetAI</span>
            </Link>

            <button
              onClick={() => setCmdOpen(true)}
              className="hidden h-9 flex-1 items-center gap-2 rounded-lg border bg-card px-3 text-sm text-muted-foreground transition-colors hover:bg-accent sm:flex sm:max-w-md"
            >
              <Search className="h-4 w-4" />
              <span className="flex-1 text-left">Cari materi, kuis, atau aksi...</span>
              <kbd className="hidden items-center gap-1 rounded-md border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground md:inline-flex">
                <CommandIcon className="h-3 w-3" />K
              </kbd>
            </button>

            <div className="ml-auto flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="sm:hidden"
                onClick={() => setCmdOpen(true)}
                aria-label="Cari"
              >
                <Search className="h-4 w-4" />
              </Button>
              <NotificationsMenu />
              <ThemeToggle />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="ml-1 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                        {currentUser.avatarInitials}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div>
                      <p className="text-sm font-semibold">{currentUser.name}</p>
                      <p className="text-[11px] font-normal text-muted-foreground">{currentUser.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/profil">
                      <Users className="mr-2 h-4 w-4" /> Profil
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/pengaturan">
                      <Settings className="mr-2 h-4 w-4" /> Pengaturan
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/masuk">
                      <LogOut className="mr-2 h-4 w-4" /> Keluar
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        <main className="pb-24 lg:pb-8">{children}</main>
      </div>

      {/* Floating AI button */}
      <Link
        to="/ai/chat"
        className="fixed bottom-20 right-4 z-30 grid h-12 w-12 place-items-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/25 transition-transform hover:scale-105 lg:bottom-6 lg:right-6"
        aria-label="Tanya AI"
      >
        <Sparkles className="h-5 w-5" />
      </Link>

      {/* Mobile bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-20 border-t bg-background/95 backdrop-blur lg:hidden">
        <ul className="grid grid-cols-5">
          {mobileNav.map((n) => {
            const active = pathname === n.to || pathname.startsWith(n.to + "/");
            const Icon = n.icon;
            return (
              <li key={n.to}>
                <Link
                  to={n.to}
                  className={cn(
                    "flex flex-col items-center gap-1 py-2.5 text-[10px] font-medium transition-colors",
                    active ? "text-primary" : "text-muted-foreground",
                  )}
                >
                  <Icon className="h-5 w-5" strokeWidth={active ? 2.4 : 2} />
                  <span>{n.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <CommandPalette open={cmdOpen} setOpen={setCmdOpen} />
    </div>
  );
}

export function PageHeader({
  title,
  description,
  actions,
  breadcrumb,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  breadcrumb?: { label: string; to?: string }[];
}) {
  return (
    <div className="border-b bg-background/60">
      <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
        {breadcrumb && (
          <nav className="mb-2 flex items-center gap-1 text-xs text-muted-foreground">
            {breadcrumb.map((b, i) => (
              <span key={i} className="flex items-center gap-1">
                {i > 0 && <ChevronRight className="h-3 w-3" />}
                {b.to ? (
                  <Link to={b.to} className="hover:text-foreground">
                    {b.label}
                  </Link>
                ) : (
                  <span>{b.label}</span>
                )}
              </span>
            ))}
          </nav>
        )}
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 sm:flex sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h1 className="truncate text-xl font-semibold tracking-tight sm:text-2xl">{title}</h1>
            {description && (
              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{description}</p>
            )}
          </div>
          {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
        </div>
      </div>
    </div>
  );
}

export function PageBody({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8", className)}>{children}</div>
  );
}
