# FL Auto – technická specifikace (aktuální)

Doplňuje `zadani.md`. Referenční demo: `prototype/autobazar.html`.

## 1. Technologie (doporučení)

| Vrstva | Volba | Proč |
|---|---|---|
| Frontend | Next.js (App Router) + TypeScript | SSR/SSG pro SEO (slugy, meta, OG), komponenty, škálovatelnost |
| Styly | Tailwind CSS | prototyp je v Tailwindu, přímý přenos tokenů |
| Backend | Next.js route handlers (nebo Express) | jeden jazyk napříč projektem |
| Databáze | PostgreSQL (např. Supabase: DB + auth + storage) | relační data, minimum vlastního backendu |
| Fotky | S3-kompatibilní storage + sharp | resize, komprese, WebP/AVIF, thumbnails |
| E-mail | Resend / SMTP | notifikace o poptávkách |
| Hosting | Vercel / Netlify + Supabase | živý odkaz po každém commitu |

Lze zvolit jinak, pokud zůstane: SSR stránek vozů, relační DB, admin za loginem.

## 2. Značka a loga
- Název: **FL Auto**. Tagline: „Prodej · Servis · Mytí · STK" (v hlavičce jen na desktopu).
- `public/logo-dark.png` → tmavý režim, `public/logo-light.png` → světlý režim. Obě s průhledným pozadím.
- Hlavička: logo výšky ~40 px. Hero panel: velké logo na pravé straně pozadí, poloviční průhlednost v tmavém režimu, plynule prolnuté maskou (`linear-gradient` zleva), na mobilu skryté.
- Logo se přepíná přes CSS podle `data-theme`. **Pozor:** `display` nesmí být nastaven inline na `<img>`, přebíjí to CSS třídu.

## 3. Design systém

Font: nadpisy, tlačítka, labely a ceny **Oswald** (700, uppercase), běžný text **Inter**. Hranaté prvky (radius 2–4 px), tlačítka uppercase.

Tokeny (CSS proměnné na `:root`, přepínané atributem `data-theme="dark|light"`):

| Token | Tmavý | Světlý |
|---|---|---|
| `--bg` | `#0b0c0e` | `#f4f4f5` |
| `--card` | `#151517` | `#ffffff` |
| `--card2` (inputy) | `#1c1c1f` | `#f0f0f1` |
| `--line` | `#2a2a2e` | `#e2e2e4` |
| `--muted` | `#9a9a9f` | `#6b6b70` |
| `--fg` | `#f2f2f3` | `#141416` |
| `--acc` (červená) | `#e0212f` | `#d81b2a` |
| `--acc2` (hover) | `#ff4757` | – |
| zelená „Prodáno" | `#2ecc71` | `#2ecc71` |

Hero panel: tmavý `linear-gradient(135deg,#141416,#0b0c0e)`, světlý `linear-gradient(135deg,#ffffff,#e6e8ec)`. V obou režimech musí být nadpis plně čitelný (v prototypu byla chyba: tmavé písmo na tmavém panelu).

### Přepínač motivu (styl iOS)
- Malý přepínač 54×30 px, kulatý jezdec 26 px s jemným stínem, pohyb zleva doprava (vlevo světlý, vpravo tmavý) s animací ~0,3 s.
- Uvnitř ikony slunce a měsíce, `role="switch"` a `aria-checked`.
- Motiv se při načtení určí z `localStorage` (`ab_theme`), jinak ze systémového nastavení, a nastaví se atribut `data-theme` na `<html>`. Přepnutí neprovádí re-render, jen změní atribut (CSS zařídí animaci).

### Štítky statusu
Dostupné: bez štítku · **Rezervováno: červený** · **Prodáno: zelený** (tmavý text) · Skryté: veřejně nevidět. Štítek vlevo nahoře na fotce karty a pod cenou na detailu.

## 4. Stránky a obsah
Viz `zadani.md`. Z prototypu převzít texty hero, kategorií, servisních karet a kontaktu.

## 5. Databáze

```
vehicles
  id, brand, model, version, price, sale_price, year, registration_date,
  mileage, fuel, transmission, drive, body_type, engine_volume, power,
  color, vin, stk, owners, origin, consumption, emissions, seats, doors,
  description, status (DOSTUPNE|REZERVOVANO|PRODANO|SKRYTE),
  slug (unique), created_at, updated_at

vehicle_images   id, vehicle_id, url, sort_order, is_main, created_at
equipment        id, name, category
vehicle_equipment vehicle_id, equipment_id

leads
  id, vehicle_id (nullable), name, phone, email,
  type (INTEREST|TEST_DRIVE|RESERVATION|FINANCING|TRADE_IN|CALLBACK|SERVICE),
  message, status (NEW|CONTACTED|NEGOTIATION|RESERVED|SOLD|LOST), created_at

admins           id, email, password_hash, created_at
settings         key, value   (kontakt, otevírací doba, texty)
```

Poptávka ze Servisu se ukládá jako lead typu `SERVICE` s `vehicle_id = NULL` (do `name` jde značka a model vozu, do `message` poznámka).

## 6. API
```
GET    /api/vehicles           filtry přes query parametry, pagination
GET    /api/vehicles/:slug     veřejné, VIN maskovaný
POST   /api/vehicles           [admin]
PUT    /api/vehicles/:id       [admin]
DELETE /api/vehicles/:id       [admin]
GET    /api/leads              [admin]
POST   /api/leads              veřejné (poptávka u vozu i Servis), rate limit + validace
PUT    /api/leads/:id          [admin] změna stavu
GET    /api/settings           [admin]
PUT    /api/settings           [admin]
```

## 7. Demo data (označit jako demo)

| Vůz | Rok | Nájezd | Palivo | Převodovka | Výkon | Cena | Status |
|---|---|---|---|---|---|---|---|
| BMW 320d xDrive M Sport | 2021 | 125 000 km | Diesel | Automat | 140 kW | 549 900 Kč | Dostupné |
| Škoda Octavia 2.0 TDI Style | 2022 | 68 000 km | Diesel | Manuál | 110 kW | 459 900 Kč, **akce 429 900 Kč** | Dostupné |
| Audi A6 40 TDI quattro | 2020 | 98 000 km | Diesel | Automat | 150 kW | 729 900 Kč | Rezervováno |
| Volkswagen Passat 2.0 TDI Business | 2019 | 142 000 km | Diesel | Automat | 110 kW | 389 900 Kč | Prodáno |

U Octavie se veřejně zobrazuje jen 429 900 Kč, původní cena se nezobrazuje.

## 8. Prototyp vs. produkce

**Funguje v prototypu (reference):** katalog, filtry (značka, palivo, převodovka, karoserie, cena), řazení, detail, poptávka, Servis, kontakt, admin (dashboard, CRUD vozidel, změna statusu, leady), barevné štítky, světlý/tmavý režim.

**Nepřebírat:** localStorage jako databázi, heslo `admin123` napevno, `sessionStorage` login, loga jako base64, Tailwind CDN, hash routing, `SEED_VERSION` reset dat.

**Doplnit v produkci:** reálná DB a API, autentizace s hashem hesla, upload a optimalizace fotek, e-maily, plný set filtrů, galerie s fullscreen, pagination, SEO (meta, OG, schema.org, sitemap), maskování VIN na serveru, mapa a fotky na Kontaktu, reálné texty O nás a právní stránky.

**Fáze 2:** rezervace prohlídky, financování, protiúčet jako samostatný tok, oblíbené, porovnání, SMS/WhatsApp, Sauto/TipCars, sociální sítě, AI popisy (admin vždy schvaluje), VIN API, analytika.
