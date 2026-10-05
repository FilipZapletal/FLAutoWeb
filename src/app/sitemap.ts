import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";
import { getSitemapVehicles } from "@/lib/vehicles/queries";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages = ["", "/vozy", "/servis", "/o-nas", "/kontakt", "/ochrana-osobnich-udaju", "/cookies", "/obchodni-udaje", "/reklamacni-rad", "/adr"];
  const vehicles = await getSitemapVehicles();
  return [
    ...staticPages.map((p) => ({ url: siteUrl(p || "/"), changeFrequency: "weekly" as const, priority: p === "" || p === "/vozy" ? 1 : 0.5 })),
    ...vehicles.map((v) => ({ url: siteUrl(`/vozy/${v.slug}`), lastModified: v.updatedAt, changeFrequency: "weekly" as const, priority: 0.8 })),
  ];
}
