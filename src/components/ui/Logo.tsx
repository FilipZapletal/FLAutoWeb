import Image from "next/image";

type Props = { height?: number; priority?: boolean; eager?: boolean; className?: string; sizes?: string };

/** Logo pro oba motivy – viditelnost přepíná CSS podle data-theme. */
export function Logo({ height, priority = false, eager = false, className = "w-auto", sizes }: Props) {
  const style = height ? { height } : undefined;
  const loading = eager ? "eager" : undefined;
  return (
    <>
      <Image src="/logo-dark.png" alt="FL Auto" width={913} height={416} priority={priority} loading={loading} sizes={sizes} className={`logo-dark ${className}`} style={style} />
      <Image src="/logo-light.png" alt="FL Auto" width={1024} height={455} priority={priority} loading={loading} sizes={sizes} className={`logo-light ${className}`} style={style} />
    </>
  );
}
