"use client";

import Link from "next/link";
import { Logo } from "@/components/ui/Logo";

/** Chybová stránka pro neočekávané chyby (např. nedostupná databáze). */
export default function ErrorPage({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  const isDev = process.env.NODE_ENV === "development";

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-4 py-20 text-center">
      <Logo height={48} />
      <h1 className="mt-8 text-2xl">Něco se pokazilo</h1>
      <p className="mt-2 max-w-md text-muted">Stránku se teď nepodařilo načíst. Zkuste to prosím za chvíli znovu.</p>
      {isDev && (
        <p className="card mt-6 max-w-md p-4 text-left text-sm">
          <strong>Vývoj:</strong> nejčastější příčinou je, že neběží databáze. Spusťte web příkazem <code>npm run dev:local</code> (spustí i databázi), nebo v jiném terminálu <code>npm run db:local</code>.
        </p>
      )}
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <button type="button" onClick={() => retry()} className="btn">
          Zkusit znovu
        </button>
        <Link href="/" className="btn-outline">
          Úvodní stránka
        </Link>
      </div>
    </main>
  );
}
