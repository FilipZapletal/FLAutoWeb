import { SettingsForm } from "@/components/admin/SettingsForm";
import { PageHead } from "@/components/admin/ui";
import { getSettings } from "@/lib/settings";

export const metadata = { title: "Nastavení webu" };

export default async function SettingsPage() {
  return (
    <>
      <PageHead title="Nastavení webu" />
      <SettingsForm initial={await getSettings()} />
    </>
  );
}
