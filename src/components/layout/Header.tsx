import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu, Bell, MessageSquare, Briefcase, LayoutDashboard, Users, LogOut, User as UserIcon, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { initials } from "@/lib/konekte";
import { supabase } from "@/integrations/supabase/client";

function LangSwitch() {
  const { lang, setLang } = useI18n();
  return (
    <div className="inline-flex items-center rounded-full border border-border bg-card p-0.5 text-xs font-semibold">
      {(["fr", "ht"] as const).map((l) => (
        <button
          key={l}
          onClick={() => setLang(l)}
          className={`rounded-full px-2.5 py-1 transition-colors ${
            lang === l ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {l === "fr" ? "FR" : "KR"}
        </button>
      ))}
    </div>
  );
}

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link to="/" className="flex items-center gap-2">
      <span className="grid h-8 w-8 place-items-center rounded-lg bg-gold-gradient font-display text-base font-extrabold text-gold-foreground">
        T
      </span>
      <span className={`font-display text-xl font-extrabold tracking-tight ${light ? "text-primary-foreground" : "text-foreground"}`}>
        RecruteHT
      </span>
    </Link>
  );
}

export function Header() {
  const { user, profile, role, signOut } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!user) {
      setUnread(0);
      return;
    }
    const load = async () => {
      const { count } = await supabase
        .from("notifications")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("is_read", false);
      setUnread(count ?? 0);
    };
    void load();
    const channel = supabase
      .channel("header-notifications")
      .on("postgres_changes", { event: "*", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` }, () => {
        void load();
      })
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [user]);

  const links = [
    { to: "/jobs", label: t("nav.jobs"), icon: Briefcase },
    ...(role === "institution" ? [{ to: "/candidates", label: t("nav.candidates"), icon: Users }] : []),
    ...(user ? [{ to: "/messages", label: t("nav.messages"), icon: MessageSquare }] : []),
    ...(user ? [{ to: "/dashboard", label: t("nav.dashboard"), icon: LayoutDashboard }] : []),
  ];

  const handleSignOut = async () => {
    await signOut();
    void navigate({ to: "/" });
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-4">
        <Logo />

        <nav className="ml-4 hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              activeProps={{ className: "rounded-md px-3 py-2 text-sm font-semibold text-primary bg-muted" }}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <LangSwitch />

          {user && (
            <Link to="/notifications" className="relative rounded-md p-2 hover:bg-muted" aria-label={t("nav.notifications")}>
              <Bell className="h-5 w-5" />
              {unread > 0 && (
                <Badge className="absolute -right-0.5 -top-0.5 h-4 min-w-4 justify-center rounded-full bg-accent px-1 text-[10px] text-accent-foreground">
                  {unread > 9 ? "9+" : unread}
                </Badge>
              )}
            </Link>
          )}

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="rounded-full" aria-label="menu">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary text-xs text-primary-foreground">
                      {initials(profile?.full_name || user.email)}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5 text-sm font-semibold">{profile?.full_name || user.email}</div>
                <DropdownMenuSeparator />
                {role === "institution" ? (
                  <>
                    <DropdownMenuItem onClick={() => navigate({ to: "/institution" })}>
                      <Building2 className="mr-2 h-4 w-4" /> {t("nav.institution")}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate({ to: "/post-job" })}>
                      <Briefcase className="mr-2 h-4 w-4" /> {t("nav.postjob")}
                    </DropdownMenuItem>
                  </>
                ) : (
                  <DropdownMenuItem onClick={() => navigate({ to: "/profile" })}>
                    <UserIcon className="mr-2 h-4 w-4" /> {t("nav.profile")}
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => navigate({ to: "/dashboard" })}>
                  <LayoutDashboard className="mr-2 h-4 w-4" /> {t("nav.dashboard")}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" /> {t("nav.signout")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild size="sm" className="hidden md:inline-flex">
              <Link to="/auth">{t("nav.signin")}</Link>
            </Button>
          )}

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden" aria-label="menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetTitle className="sr-only">Menu</SheetTitle>
              <div className="mt-6 flex flex-col gap-1">
                <Link to="/" onClick={() => setOpen(false)} className="rounded-md px-3 py-2.5 text-sm font-medium hover:bg-muted">
                  {t("nav.home")}
                </Link>
                {links.map((l) => (
                  <Link key={l.to} to={l.to} onClick={() => setOpen(false)} className="rounded-md px-3 py-2.5 text-sm font-medium hover:bg-muted">
                    {l.label}
                  </Link>
                ))}
                {role === "institution" && (
                  <Link to="/post-job" onClick={() => setOpen(false)} className="rounded-md px-3 py-2.5 text-sm font-medium hover:bg-muted">
                    {t("nav.postjob")}
                  </Link>
                )}
                {!user && (
                  <Button asChild className="mt-3">
                    <Link to="/auth" onClick={() => setOpen(false)}>
                      {t("nav.signin")}
                    </Link>
                  </Button>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

export function Footer() {
  const { t } = useI18n();
  return (
    <footer className="mt-16 border-t border-border bg-card">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
        <div>
          <Logo />
          <p className="mt-2 max-w-sm">{t("app.tagline")}</p>
        </div>
        <div className="flex flex-wrap gap-4">
          <Link to="/jobs" className="hover:text-foreground">
            {t("nav.jobs")}
          </Link>
          <Link to="/auth" className="hover:text-foreground">
            {t("nav.signin")}
          </Link>
        </div>
        <p>© {new Date().getFullYear()} RecruteHT — Ayiti</p>
      </div>
    </footer>
  );
}
