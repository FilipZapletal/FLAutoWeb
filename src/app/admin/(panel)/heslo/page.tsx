import { PasswordForm } from "@/components/admin/PasswordForm";
import { TwoFactorSettings } from "@/components/admin/TwoFactorSettings";
import { PageHead } from "@/components/admin/ui";
import { requireAdminPage } from "@/lib/auth/session";
import { db } from "@/lib/db";

export const metadata = { title: "Heslo a 2FA" };

export default async function PasswordPage() {
  const session = await requireAdminPage();
  const admin = await db.admin.findUnique({ where: { id: session.id }, select: { totpEnabledAt: true, recoveryCodes: true } });

  return (
    <>
      <PageHead title="Heslo a 2FA" />
      <div className="grid gap-6">
        <TwoFactorSettings
          enabled={Boolean(admin?.totpEnabledAt)}
          enabledAt={admin?.totpEnabledAt?.toISOString() ?? null}
          recoveryLeft={admin?.recoveryCodes.length ?? 0}
        />
        <div>
          <h2 className="mb-3 text-lg font-bold">Změna hesla</h2>
          <PasswordForm />
        </div>
      </div>
    </>
  );
}
