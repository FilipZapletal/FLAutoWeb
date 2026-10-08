"use client";

import { openConsentSettings } from "@/lib/consent";

/** Odkaz „Nastavení soukromí“ v patičce – znovu otevře okno se souhlasem. */
export function PrivacySettingsButton({ className }: { className?: string }) {
  return (
    <button type="button" onClick={openConsentSettings} className={className}>
      Nastavení soukromí
    </button>
  );
}
