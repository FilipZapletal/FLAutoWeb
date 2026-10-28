import Image from "next/image";

/** Fotografie provozovny FL Auto (Ostrava-Kunčičky). */
export function PremisesPhoto({ className = "" }: { className?: string }) {
  return (
    <Image
      src="/provozovna.jpg"
      alt="Provozovna FL Auto v Ostravě-Kunčičkách: budova autobazaru a autoservisu s parkovištěm před vchodem"
      width={1195}
      height={896}
      sizes="(min-width: 1152px) 1100px, 100vw"
      className={`h-auto w-full max-w-2xl rounded-inner ${className}`}
    />
  );
}
