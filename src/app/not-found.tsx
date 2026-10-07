import Link from "next/link";
import { connection } from "next/server";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { ownerContacts } from "@/lib/contacts";
import { getSettings } from "@/lib/settings";

export default async function NotFound() {
  // Kontakty v patičce se čtou z DB při každém požadavku, ne jednou při buildu.
  await connection();
  const settings = await getSettings();
  return (
    <>
      <Header contacts={ownerContacts(settings)} />
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col items-center justify-center px-4 py-20 text-center">
        <p className="font-display text-6xl font-bold text-acc">404</p>
        <h1 className="mt-2 text-2xl">Stránka nenalezena</h1>
        <p className="mt-2 max-w-md text-muted">Hledaný vůz už možná není v nabídce, nebo se změnila adresa stránky.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Link href="/vozy" className="btn">Zobrazit nabídku vozů</Link>
          <Link href="/" className="btn-outline">Úvodní stránka</Link>
        </div>
      </main>
      <Footer settings={settings} />
    </>
  );
}
