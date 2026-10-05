import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { default: "Administrace", template: "%s | Administrace FL Auto" },
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: LayoutProps<"/admin">) {
  return children;
}
