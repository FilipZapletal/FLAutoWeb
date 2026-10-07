import type { MetadataRoute } from "next";
import { getSitemapServices } from "@/lib/services/public";
import { siteUrl } from "@/lib/site";
import { getSitemapVehicles } from "@/lib/vehicles/queries";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages = ["", "/vozy", "/servis", "/o-nas", "/kontakt", "/ochrana-osobnich-udaju", "/cookies", "/obchodni-udaje", "/reklamacni-rad", "/adr"];
  const [vehicles, services] = await Promise.all([getSitemapVehicles(), getSitemapServices()]);
  return [
    ...staticPages.map((p) => ({ url: siteUrl(p || "/"), changeFrequency: "weekly" as const, priority: p === "" || p === "/vozy" ? 1 : 0.5 })),
    ...services.map((s) => ({ url: siteUrl(`/servis/${s.slug}`), lastModified: s.updatedAt, changeFrequency: "monthly" as const, priority: 0.6 })),
    ...vehicles.map((v) => ({ url: siteUrl(`/vozy/${v.slug}`), lastModified: v.updatedAt, changeFrequency: "weekly" as const, priority: 0.8 })),
  ];
}
