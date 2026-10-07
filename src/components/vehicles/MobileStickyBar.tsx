import { PhoneIcon } from "@/components/ui/icons";
import type { OwnerContact } from "@/lib/contacts";

/** Spodní lišta na mobilu: zavolat každému z majitelů + [Poptat vůz]. */
export function MobileStickyBar({ contacts, showInquiry }: { contacts: OwnerContact[]; showInquiry: boolean }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 flex gap-2 border-t border-line bg-card p-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] md:hidden">
      {contacts
        .filter((c) => c.tel)
        .map((c) => (
          <a key={c.name} href={`tel:${c.tel}`} className="btn-outline flex-1 px-2" aria-label={`Zavolat – ${c.name}`}>
            <PhoneIcon size={16} /> {c.firstName}
          </a>
        ))}
      {showInquiry && (
        <a href="#poptavka" className="btn flex-[1.4] px-2">
          Poptat vůz
        </a>
      )}
    </div>
  );
}
