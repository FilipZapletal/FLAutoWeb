/**
 * Seed: katalog výbavy, první admin (z .env) a DEMO vozy.
 * Spuštění: `npm run db:seed` (lze opakovat – nic neduplikuje).
 *
 * DEMO DATA: vozy a fotky níže jsou ukázkové, nejde o skutečnou nabídku.
 * Před spuštěním webu je smažte nebo nahraďte v administraci.
 */
import "dotenv/config";
import { hash } from "@node-rs/argon2";
import { PrismaPg } from "@prisma/adapter-pg";
import sharp from "sharp";
import { PrismaClient, type EquipmentCategory, type Prisma } from "../src/generated/prisma/client";
import { processVehicleImage } from "../src/lib/images/process";

const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });

const EQUIPMENT: Record<EquipmentCategory, string[]> = {
  BEZPECNOST: ["ABS", "ESP", "Airbagy", "Asistent jízdního pruhu", "Hlídání mrtvého úhlu"],
  KOMFORT: ["Klimatizace", "Vyhřívaná sedadla", "Kožený interiér", "Tempomat", "Parkovací kamera"],
  MULTIMEDIA: ["Apple CarPlay", "Android Auto", "Bluetooth", "Navigace"],
  EXTERIER: ["LED světla", "Alu kola", "Tažné zařízení"],
};

type DemoVehicle = Omit<Prisma.VehicleCreateInput, "currentPrice" | "slug"> & { slug: string; equipment: string[] };

const month = (s: string) => new Date(`${s}-01T00:00:00.000Z`);

const DEMO_VEHICLES: DemoVehicle[] = [
  {
    slug: "bmw-320d-xdrive-2021",
    brand: "BMW",
    model: "320d xDrive",
    version: "M Sport",
    price: 549_900,
    year: 2021,
    registrationDate: month("2021-04"),
    mileage: 125_000,
    fuel: "DIESEL",
    transmission: "AUTOMAT",
    drive: "AWD",
    bodyType: "SEDAN",
    engineVolume: 1995,
    power: 140,
    color: "Šedá",
    vin: "WBA8E1C50MA000001",
    stk: month("2026-08"),
    owners: 2,
    origin: "ČR",
    seats: 5,
    doors: 4,
    status: "DOSTUPNE",
    featured: true,
    description: "DEMO – ukázkový vůz. Prověřený vůz po pravidelném servisu, nekuřácké vozidlo, kompletní servisní historie.",
    equipment: ["ABS", "ESP", "Airbagy", "Klimatizace", "Navigace", "Kožený interiér", "Tempomat", "LED světla"],
  },
  {
    slug: "skoda-octavia-2022",
    brand: "Škoda",
    model: "Octavia",
    version: "2.0 TDI Style",
    price: 459_900,
    salePrice: 429_900,
    year: 2022,
    registrationDate: month("2022-03"),
    mileage: 68_000,
    fuel: "DIESEL",
    transmission: "MANUAL",
    drive: "PREDNI",
    bodyType: "KOMBI",
    engineVolume: 1968,
    power: 110,
    color: "Bílá",
    vin: "TMBJJ7NE0N0000002",
    stk: month("2027-11"),
    owners: 1,
    origin: "ČR",
    seats: 5,
    doors: 5,
    status: "DOSTUPNE",
    featured: true,
    description: "DEMO – ukázkový vůz. 1. majitel, ČR původ, garážováno, nová sada pneu.",
    equipment: ["ABS", "ESP", "Airbagy", "Klimatizace", "Parkovací kamera", "Apple CarPlay", "Android Auto", "Vyhřívaná sedadla"],
  },
  {
    slug: "audi-a6-2020",
    brand: "Audi",
    model: "A6",
    version: "40 TDI quattro",
    price: 729_900,
    year: 2020,
    registrationDate: month("2020-06"),
    mileage: 98_000,
    fuel: "DIESEL",
    transmission: "AUTOMAT",
    drive: "AWD",
    bodyType: "SEDAN",
    engineVolume: 1968,
    power: 150,
    color: "Černá",
    vin: "WAUZZZ4G0LN000003",
    stk: month("2026-05"),
    owners: 1,
    origin: "Dovoz",
    seats: 5,
    doors: 4,
    status: "REZERVOVANO",
    featured: true,
    description: "DEMO – ukázkový vůz. Plná výbava, matrix LED, vzduchové odpružení.",
    equipment: ["ABS", "ESP", "Airbagy", "Asistent jízdního pruhu", "Klimatizace", "Navigace", "Kožený interiér", "Alu kola", "LED světla"],
  },
  {
    slug: "volkswagen-passat-2019",
    brand: "Volkswagen",
    model: "Passat",
    version: "2.0 TDI Business",
    price: 389_900,
    year: 2019,
    registrationDate: month("2019-09"),
    mileage: 142_000,
    fuel: "DIESEL",
    transmission: "AUTOMAT",
    drive: "PREDNI",
    bodyType: "KOMBI",
    engineVolume: 1968,
    power: 110,
    color: "Stříbrná",
    vin: "WVWZZZ3CZKE000004",
    stk: month("2027-02"),
    owners: 3,
    origin: "ČR",
    seats: 5,
    doors: 5,
    status: "PRODANO",
    soldAt: new Date(),
    description: "DEMO – ukázkový vůz. Firemní vůz, pravidelně servisovaný, tažné zařízení.",
    equipment: ["ABS", "ESP", "Airbagy", "Klimatizace", "Tažné zařízení", "Bluetooth", "Tempomat"],
  },
];

const escapeXml = (s: string) => s.replace(/[<>&"]/g, (c) => `&#${c.charCodeAt(0)};`);

/** Zástupná „fotka“ s jasným označením DEMO. */
function demoPhoto(title: string, index: number) {
  const hues = [220, 0, 200];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1000">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="hsl(${hues[index % 3]},8%,22%)"/><stop offset="1" stop-color="#0b0c0e"/>
  </linearGradient></defs>
  <rect width="1600" height="1000" fill="url(#g)"/>
  <path d="M260 640 Q300 520 470 500 L640 400 Q760 350 980 360 Q1120 370 1220 470 L1340 500 Q1400 520 1400 600 L1400 650 L260 650 Z"
        fill="none" stroke="#e0212f" stroke-width="10" stroke-linejoin="round" opacity="0.85"/>
  <circle cx="500" cy="660" r="80" fill="#151517" stroke="#9a9a9f" stroke-width="10"/>
  <circle cx="1170" cy="660" r="80" fill="#151517" stroke="#9a9a9f" stroke-width="10"/>
  <text x="800" y="180" text-anchor="middle" font-family="Arial, sans-serif" font-size="64" font-weight="700" fill="#f2f2f3">${escapeXml(title)}</text>
  <text x="800" y="870" text-anchor="middle" font-family="Arial, sans-serif" font-size="44" fill="#9a9a9f">DEMO FOTO ${index + 1} – nahraďte skutečnou fotografií</text>
</svg>`;
  return sharp(Buffer.from(svg)).jpeg({ quality: 90 }).toBuffer();
}

async function seedEquipment() {
  for (const [category, names] of Object.entries(EQUIPMENT) as [EquipmentCategory, string[]][]) {
    for (const [i, name] of names.entries()) {
      await db.equipment.upsert({
        where: { category_name: { category, name } },
        create: { category, name, sortOrder: i },
        update: { sortOrder: i },
      });
    }
  }
}

async function seedAdmin() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) {
    console.warn("⚠ ADMIN_EMAIL / ADMIN_PASSWORD nejsou v .env – admin nebyl vytvořen.");
    return;
  }
  if (password.length < 10) throw new Error("ADMIN_PASSWORD musí mít alespoň 10 znaků.");
  const passwordHash = await hash(password);
  await db.admin.upsert({ where: { email }, create: { email, passwordHash }, update: { passwordHash } });
  console.log(`✓ Admin ${email} (heslo z ADMIN_PASSWORD)`);
}

async function seedVehicles() {
  const equipment = await db.equipment.findMany();
  const equipmentId = (name: string) => equipment.find((e) => e.name === name)?.id;

  for (const { equipment: names, ...v } of DEMO_VEHICLES) {
    const data = { ...v, currentPrice: v.salePrice ?? v.price };
    const vehicle = await db.vehicle.upsert({ where: { slug: v.slug }, create: data, update: {} });

    const ids = names.map(equipmentId).filter((id): id is number => id !== undefined);
    await db.vehicleEquipment.createMany({
      data: ids.map((id) => ({ vehicleId: vehicle.id, equipmentId: id })),
      skipDuplicates: true,
    });

    if ((await db.vehicleImage.count({ where: { vehicleId: vehicle.id } })) === 0) {
      for (let i = 0; i < 3; i++) {
        const img = await processVehicleImage(vehicle.id, await demoPhoto(`${v.brand} ${v.model}`, i));
        await db.vehicleImage.create({
          data: { vehicleId: vehicle.id, ...img, sortOrder: i, isMain: i === 0, alt: `${v.brand} ${v.model} – demo fotografie ${i + 1}` },
        });
      }
    }
    console.log(`✓ DEMO vůz ${v.brand} ${v.model} → /vozy/${vehicle.slug}`);
  }
}

async function main() {
  await seedEquipment();
  console.log("✓ Katalog výbavy");
  await seedAdmin();
  if (process.env.SEED_DEMO_VEHICLES !== "0") await seedVehicles();
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
