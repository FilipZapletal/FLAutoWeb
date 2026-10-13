"use client";

import { usePathname, useRouter } from "next/navigation";
import { useSyncExternalStore } from "react";
import { ChevronLeftIcon } from "@/components/ui/icons";

const QUERY = "(display-mode: standalone)";

function subscribe(cb: () => void) {
  const mq = window.matchMedia(QUERY);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}

const isStandalone = () => window.matchMedia(QUERY).matches || (navigator as Navigator & { standalone?: boolean }).standalone === true;

/**
 * Tlačítko „Zpět“ pro web přidaný na plochu telefonu. Aplikace na ploše nemá tlačítko zpět z prohlížeče,
 * takže bez něj by se návštěvník z podstránky dostal jen přes logo. V běžném prohlížeči se nezobrazuje.
 * Na úvodní stránce (`home`) nic nezobrazí.
 */
export function StandaloneBackButton({ home = "/" }: { home?: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const standalone = useSyncExternalStore(subscribe, isStandalone, () => false);
  if (!standalone || pathname === home) return null;
  return (
    <button
      type="button"
      onClick={() => (window.history.length > 1 ? router.back() : router.push(home))}
      aria-label="Zpět"
      data-back
      className="btn-outline btn-sm shrink-0 !px-2.5"
    >
      <ChevronLeftIcon size={18} />
    </button>
  );
}
