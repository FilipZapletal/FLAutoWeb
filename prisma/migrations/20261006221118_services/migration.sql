-- CreateEnum
CREATE TYPE "ServiceIcon" AS ENUM ('CAR', 'WRENCH', 'SPARKLE', 'SHIELD');

-- CreateTable
CREATE TABLE "services" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "previous_slugs" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "tag" TEXT,
    "icon" "ServiceIcon" NOT NULL DEFAULT 'WRENCH',
    "summary" TEXT NOT NULL,
    "items" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "description" TEXT,
    "prices" JSONB NOT NULL DEFAULT '[]',
    "price_note" TEXT,
    "meta_title" TEXT,
    "meta_description" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "services_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "services_slug_key" ON "services"("slug");

-- CreateIndex
CREATE INDEX "services_published_sort_order_idx" ON "services"("published", "sort_order");

-- Výchozí čtyři služby (dříve napevno ve stránce /servis)
INSERT INTO "services" ("title", "slug", "tag", "icon", "summary", "items", "sort_order", "updated_at") VALUES
('Dovoz aut z EU', 'dovoz-aut-z-eu', 'Dovoz na klíč', 'CAR',
 'Individuální dovoz prověřených automobilů z Německa a zemí EU na přání, včetně nabídky kvalitních ojetých vozů.',
 ARRAY['Vyhledání a prověření vozu v zahraničí (historie, nájezd, tachometr)', 'Kompletní fyzická kontrola technického stavu před koupí', 'Doprava vozidla do ČR a zajištění přepisu', 'Kompletní dovozová STK, emise a přihlášení na české SPZ', 'Pomoc s financováním i pojištěním vozidla'],
 0, CURRENT_TIMESTAMP),
('Autoservis & Pneuservis', 'autoservis-pneuservis', 'Rychle & spolehlivě', 'WRENCH',
 'Pravidelná údržba, diagnostika, opravy mechanických částí a kompletní servis pneumatik.',
 ARRAY['Výměna motorového oleje, filtrů a provozních kapalin', 'Kontrola a výměna brzdových destiček, kotoučů a brzdové kapaliny', 'Kompletní pneuservis – přezouvání a vyvažování kol', 'Opravy defektů pneumatik a sezónní uskladnění'],
 1, CURRENT_TIMESTAMP),
('Ruční mytí & čištění interiéru', 'rucni-myti-cisteni-interieru', 'Špičková čistota', 'SPARKLE',
 'Prémiová a šetrná péče o karoserii i vnitřek vozu s důrazem na každý detail.',
 ARRAY['Šetrné vícefázové ruční mytí karoserie s pH neutrální chemií', 'Hloubkové mokré tepování sedadel, koberců a kufru', 'Čištění, výživa a impregnace kožených sedadel', 'Mytí a odmaštění oken bez šmouh zevnitř i zvenčí', 'Dezinfekce interiéru a klimatizace ozonem'],
 2, CURRENT_TIMESTAMP),
('Příprava na STK & emise', 'priprava-na-stk-emise', 'Bez starostí', 'SHIELD',
 'Kompletní příprava vozidla a bezstarostné vyřízení technické kontroly bez čekání.',
 ARRAY['Základní před-prohlídka vozidla podle metodiky STK', 'Kontrola a seřízení světel, brzdové soustavy a řízení', 'Kontrola podvozku, výfukového potrubí a emisního systému', 'Rychlé odstranění případných nedostatků před prohlídkou'],
 3, CURRENT_TIMESTAMP);
