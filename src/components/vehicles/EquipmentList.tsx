import { CheckIcon } from "@/components/ui/icons";
import type { EquipmentCategory } from "@/generated/prisma/enums";
import { EQUIPMENT_CATEGORY_LABELS } from "@/lib/labels";

type Item = { id: number; name: string; category: EquipmentCategory };

export function EquipmentList({ items }: { items: Item[] }) {
  const categories = Object.keys(EQUIPMENT_CATEGORY_LABELS) as EquipmentCategory[];
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {categories.map((cat) => {
        const list = items.filter((i) => i.category === cat);
        if (!list.length) return null;
        return (
          <section key={cat}>
            <h3 className="mb-2 text-sm text-muted">{EQUIPMENT_CATEGORY_LABELS[cat]}</h3>
            <ul className="space-y-1.5 text-sm">
              {list.map((i) => (
                <li key={i.id} className="flex items-start gap-2">
                  <CheckIcon size={16} className="mt-0.5 shrink-0 text-acc" />
                  {i.name}
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
