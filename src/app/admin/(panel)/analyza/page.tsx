import Link from "next/link";
import { PageHead, StatCard } from "@/components/admin/ui";
import { getAnalytics } from "@/lib/analytics/stats";

export const metadata = { title: "Analýza návštěvnosti" };

const PERIODS = [7, 30, 90];
const fmt = (n: number) => n.toLocaleString("cs-CZ");
const shortDate = (iso: string) => `${Number(iso.slice(8))}. ${Number(iso.slice(5, 7))}.`;

function Bar({ value, label, sub, tone = "acc" }: { value: number; label: string; sub?: string; tone?: "acc" | "sold" }) {
  return (
    <li>
      <div className="mb-1 flex items-baseline justify-between gap-3 text-sm">
        <span className="min-w-0 truncate">{label}</span>
        <span className="shrink-0 font-semibold">{sub}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-card2">
        <div className={`h-full rounded-full ${tone === "sold" ? "bg-sold" : "bg-acc"}`} style={{ width: `${Math.max(2, Math.min(100, value))}%` }} />
      </div>
    </li>
  );
}

export default async function AnalyticsPage({ searchParams }: PageProps<"/admin/analyza">) {
  const sp = await searchParams;
  const requested = Number(typeof sp.dny === "string" ? sp.dny : 30);
  const days = PERIODS.includes(requested) ? requested : 30;
  const a = await getAnalytics(days);
  const t = a.totals;
  const maxVisitors = Math.max(1, ...a.daily.map((d) => d.visitors));

  return (
    <>
      <PageHead title="Analýza návštěvnosti">
        <nav aria-label="Období" className="flex gap-2">
          {PERIODS.map((p) => (
            <Link key={p} href={`/admin/analyza?dny=${p}`} aria-current={p === days ? "page" : undefined} className={`btn-outline btn-sm ${p === days ? "border-acc text-acc" : ""}`}>
              {p} dní
            </Link>
          ))}
        </nav>
      </PageHead>

      {!a.hasData ? (
        <div className="card p-5 text-sm">
          <p className="font-semibold">Zatím tu nejsou žádná data.</p>
          <p className="mt-1 text-muted">Měření běží od nasazení této funkce. Jakmile někdo navštíví web, začnou se tu objevovat čísla. Vaše vlastní procházení webu (když jste přihlášeni do adminu) se nepočítá.</p>
        </div>
      ) : (
        <>
          <div className="mb-6 grid grid-cols-2 gap-2 md:grid-cols-3 md:gap-3 xl:grid-cols-6">
            <StatCard label="Návštěvníci" value={t.visitors} />
            <StatCard label="Návštěvy" value={t.sessions} />
            <StatCard label="Zobrazení stránek" value={t.pageviews} />
            <StatCard label={`Konverze (${t.conversionRate} %)`} value={t.converted} />
            <StatCard label={`Odešli bez akce (${t.noConversionRate} %)`} value={t.noConversion} />
            <StatCard label={`Jen jedna stránka (${t.bounceRate} %)`} value={t.bounced} />
          </div>

          <section className="card mb-6 p-4 md:p-5">
            <h2 className="mb-1 text-base">Návštěvníci po dnech</h2>
            <p className="mb-4 text-xs text-muted">Šedě všichni návštěvníci dne, zeleně návštěvy, které skončily kontaktem (konverzí).</p>
            <div className="flex h-36 items-end gap-px md:gap-0.5" role="img" aria-label="Sloupcový graf návštěvníků po dnech">
              {a.daily.map((d) => (
                <div key={d.date} className="group relative flex h-full flex-1 flex-col justify-end" title={`${shortDate(d.date)}: ${d.visitors} návštěvníků, ${d.converted} konverzí`}>
                  <div className="relative w-full rounded-t-sm bg-card2" style={{ height: `${(d.visitors / maxVisitors) * 100}%`, minHeight: d.visitors ? 2 : 0 }}>
                    {d.converted > 0 && <div className="absolute inset-x-0 bottom-0 rounded-t-sm bg-sold" style={{ height: `${Math.min(100, (d.converted / d.visitors) * 100)}%` }} />}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-2 flex justify-between text-xs text-muted">
              <span>{shortDate(a.daily[0].date)}</span>
              <span>{shortDate(a.daily[a.daily.length - 1].date)}</span>
            </div>
          </section>

          <div className="mb-6 grid gap-6 lg:grid-cols-2">
            <section className="card p-4 md:p-5">
              <h2 className="mb-1 text-base">Cesta k akci</h2>
              <p className="mb-4 text-xs text-muted">Kolik návštěv došlo do kterého kroku. Číslo vpravo je podíl z předchozího kroku.</p>
              <ol className="space-y-4">
                {a.funnel.map((f, i) => (
                  <Bar key={f.label} value={f.pctOfFirst} tone={i === a.funnel.length - 1 ? "sold" : "acc"} label={f.label} sub={`${fmt(f.count)}${i > 0 ? ` · ${f.pctOfPrev} %` : ""}`} />
                ))}
              </ol>
              {a.funnel[0].count > 0 &&
                (() => {
                  const worst = a.funnel.slice(1).reduce((w, f) => (f.lost > w.lost ? f : w), a.funnel[1]);
                  return worst.lost > 0 ? (
                    <p className="mt-4 rounded-inner bg-card2 p-3 text-sm">
                      Nejvíc návštěvníků se ztratí před krokem <strong>„{worst.label}“</strong> ({fmt(worst.lost)} návštěv, tedy {100 - worst.pctOfPrev} % z předchozího kroku).
                    </p>
                  ) : null;
                })()}
            </section>

            <section className="card p-4 md:p-5">
              <h2 className="mb-1 text-base">Kde nejčastěji odcházejí</h2>
              <p className="mb-4 text-xs text-muted">Poslední stránka návštěv, které neskončily kontaktem. Vpravo počet odchodů a kolik % zobrazení té stránky tím skončilo.</p>
              {a.exits.length === 0 ? (
                <p className="text-sm text-muted">Zatím nic.</p>
              ) : (
                <ul className="space-y-4">
                  {a.exits.map((e) => (
                    <Bar key={e.label} value={e.shareOfLeavers} label={e.label} sub={`${fmt(e.count)} · ${e.exitRate} %`} />
                  ))}
                </ul>
              )}
            </section>
          </div>

          <div className="mb-6 grid gap-6 lg:grid-cols-2">
            <section className="card p-4 md:p-5">
              <h2 className="mb-3 text-base">Co návštěvníci dělají</h2>
              {a.actions.length === 0 ? (
                <p className="text-sm text-muted">Zatím žádné akce.</p>
              ) : (
                <ul className="divide-y divide-line text-sm">
                  {a.actions.map((x) => (
                    <li key={x.name} className="flex items-center justify-between gap-3 py-2">
                      <span className="min-w-0">
                        {x.label}
                        {x.conversion && <span className="ml-2 rounded-full bg-sold px-2 py-0.5 text-[10px] font-bold uppercase text-[#0b0c0e]">konverze</span>}
                      </span>
                      <span className="font-semibold">{fmt(x.count)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="card p-4 md:p-5">
              <h2 className="mb-3 text-base">Odkud přicházejí</h2>
              <ul className="space-y-3">
                {a.sources.map((s) => (
                  <Bar key={s.label} value={s.pct} label={s.label} sub={`${fmt(s.count)} · ${s.pct} %`} />
                ))}
              </ul>
              <h3 className="mb-3 mt-6 text-sm text-muted">Zařízení</h3>
              <ul className="space-y-3">
                {a.devices.map((s) => (
                  <Bar key={s.label} value={s.pct} label={s.label} sub={`${s.pct} %`} />
                ))}
              </ul>
            </section>
          </div>

          <div className="mb-6 grid gap-6 lg:grid-cols-2">
            <section className="card p-4 md:p-5">
              <h2 className="mb-3 text-base">Nejnavštěvovanější stránky</h2>
              <ul className="divide-y divide-line text-sm">
                {a.topPages.map((p) => (
                  <li key={p.label} className="flex items-center justify-between gap-3 py-2">
                    <span className="min-w-0 truncate">{p.label}</span>
                    <span className="font-semibold">{fmt(p.views)}</span>
                  </li>
                ))}
              </ul>
            </section>
            <section className="card p-4 md:p-5">
              <h2 className="mb-3 text-base">Nejsledovanější vozy</h2>
              {a.topVehicles.length === 0 ? (
                <p className="text-sm text-muted">Zatím nikdo neotevřel detail vozu.</p>
              ) : (
                <ul className="divide-y divide-line text-sm">
                  {a.topVehicles.map((p) => (
                    <li key={p.label} className="flex items-center justify-between gap-3 py-2">
                      <span className="min-w-0 truncate">{p.label}</span>
                      <span className="font-semibold">{fmt(p.views)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        </>
      )}

      <section className="card p-4 text-sm text-muted md:p-5">
        <h2 className="mb-2 text-base text-fg">Jak se měří</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>Měření je anonymní: bez cookies, bez ukládání IP adresy a bez čehokoli v zařízení návštěvníka. Respektuje se nastavení „Do Not Track“.</li>
          <li>Návštěvník se pozná jen podle jednodenního anonymního otisku. Druhý den je to jiný otisk, takže člověk, který přijde ve více dnech, se počítá jako dva návštěvníci.</li>
          <li><strong>Návštěva</strong> = pohyb jednoho návštěvníka po webu bez pauzy delší než 30 minut. <strong>Konverze</strong> = návštěva, při které návštěvník klepnul na telefon, WhatsApp nebo e-mail, nebo odeslal poptávku či objednávku.</li>
          <li>Neměří se roboti ani vy, když jste přihlášeni do administrace. Data se po 13 měsících mažou.</li>
        </ul>
      </section>
    </>
  );
}
