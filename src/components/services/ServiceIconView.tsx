import type { ServiceIcon } from "@/generated/prisma/enums";
import { CarIcon, ShieldIcon, SparkleIcon, WrenchIcon } from "@/components/ui/icons";

const ICONS = { CAR: CarIcon, WRENCH: WrenchIcon, SPARKLE: SparkleIcon, SHIELD: ShieldIcon } as const;

export function ServiceIconView({ icon, size = 24 }: { icon: ServiceIcon; size?: number }) {
  const Icon = ICONS[icon] ?? WrenchIcon;
  return <Icon size={size} />;
}
