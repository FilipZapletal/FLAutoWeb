import type { Metadata } from "next";
import { LoginForm } from "@/components/admin/LoginForm";
import { Logo } from "@/components/ui/Logo";
import { ThemeSwitch } from "@/components/ui/ThemeSwitch";

export const metadata: Metadata = { title: "Přihlášení" };

export default function LoginPage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-4 py-12">
      <div className="mb-6 flex w-full max-w-sm items-center justify-between">
        <Logo height={40} priority sizes="100px" />
        <ThemeSwitch />
      </div>
      <div className="card w-full max-w-sm p-6">
        <h1 className="mb-4 flex items-center gap-2 text-lg">
          <span className="accent-bar" /> Přihlášení do administrace
        </h1>
        <LoginForm />
      </div>
    </main>
  );
}
