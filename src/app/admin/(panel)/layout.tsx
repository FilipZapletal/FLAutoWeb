import Link from "next/link";
import { AdminBottomBar, AdminNav } from "@/components/admin/AdminNav";
import { PushToggle } from "@/components/admin/PushToggle";
import { Toaster } from "@/components/admin/Toaster";
import { StandaloneBackButton } from "@/components/layout/StandaloneBackButton";
import { Logo } from "@/components/ui/Logo";
import { ThemeSwitch } from "@/components/ui/ThemeSwitch";
import { requireAdminPage } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { countPendingReviews } from "@/lib/reviews/service";

export const dynamic = "force-dynamic";

export default async function AdminPanelLayout({ children }: LayoutProps<"/admin">) {
  const admin = await requireAdminPage();
  const [newLeads, pendingReviews] = await Promise.all([db.lead.count({ where: { status: "NEW" } }), countPendingReviews()]);
  const counts = { newLeads, pendingReviews };
  return (
    <>
      <header className="border-b border-line bg-bg pt-[env(safe-area-inset-top)]">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-2 md:py-3">
          <div className="flex items-center gap-2">
            <StandaloneBackButton home="/admin" />
            <Link href="/admin" className="flex items-center gap-3">
              <Logo height={32} sizes="90px" />
              <span className="hidden font-display text-xs uppercase tracking-widest text-muted sm:block">Administrace</span>
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-xs text-muted sm:block">{admin.email}</span>
            <PushToggle />
            <ThemeSwitch />
          </div>
        </div>
      </header>
      <div className="mx-auto grid w-full max-w-7xl flex-1 content-start gap-6 px-4 pb-6 pt-4 md:pt-6 md:grid-cols-[180px_minmax(0,1fr)]">
        <AdminNav counts={counts} />
        <main className="min-w-0">{children}</main>
      </div>
      <p className="px-4 pb-[calc(5.5rem+env(safe-area-inset-bottom))] text-center text-xs text-muted md:pb-4">
        Verze webu: {process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? "lokální"}
      </p>
      <AdminBottomBar counts={counts} />
      <Toaster />
    </>
  );
}
