import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { getSettings } from "@/lib/settings";

// Veřejné stránky čtou aktuální data z DB při každém požadavku (změny z adminu jsou vidět hned).
export const dynamic = "force-dynamic";

export default async function WebLayout({ children }: LayoutProps<"/">) {
  const settings = await getSettings();
  return (
    <>
      <Header phone={settings.phone} />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 md:py-8">{children}</main>
      <Footer settings={settings} />
    </>
  );
}
