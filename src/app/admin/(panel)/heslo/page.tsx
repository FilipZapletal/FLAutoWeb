import { PasswordForm } from "@/components/admin/PasswordForm";
import { PageHead } from "@/components/admin/ui";

export const metadata = { title: "Změna hesla" };

export default function PasswordPage() {
  return (
    <>
      <PageHead title="Změna hesla" />
      <PasswordForm />
    </>
  );
}
