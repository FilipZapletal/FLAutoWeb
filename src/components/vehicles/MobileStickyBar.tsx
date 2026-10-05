import { PhoneIcon } from "@/components/ui/icons";
import { phoneDigits } from "@/lib/format";

/** Spodní lišta na mobilu: [Zavolat] [Poptat vůz]. */
export function MobileStickyBar({ phone, showInquiry }: { phone: string; showInquiry: boolean }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 flex gap-2 border-t border-line bg-card p-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] md:hidden">
      <a href={`tel:${phoneDigits(phone)}`} className="btn-outline flex-1">
        <PhoneIcon size={16} /> Zavolat
      </a>
      {showInquiry && (
        <a href="#poptavka" className="btn flex-1">
          Poptat vůz
        </a>
      )}
    </div>
  );
}
