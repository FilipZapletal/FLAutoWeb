import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { default: "Administrace", template: "%s | Administrace FL Auto" },
  robots: { index: false, follow: false },
  // Administraci lze přidat na plochu telefonu (na iPhonu je to podmínka pro upozornění).
  manifest: "/admin.webmanifest",
  icons: { apple: "/icons/admin-180.png" },
  appleWebApp: { capable: true, title: "FL Auto admin", statusBarStyle: "black-translucent" },
};

export default function AdminRootLayout({ children }: LayoutProps<"/admin">) {
  return children;
}
