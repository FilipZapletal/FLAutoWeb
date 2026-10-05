-- CreateEnum
CREATE TYPE "VehicleStatus" AS ENUM ('DOSTUPNE', 'REZERVOVANO', 'PRODANO', 'SKRYTE');

-- CreateEnum
CREATE TYPE "Fuel" AS ENUM ('BENZIN', 'DIESEL', 'HYBRID', 'PLUGIN_HYBRID', 'ELEKTRO', 'LPG_CNG');

-- CreateEnum
CREATE TYPE "Transmission" AS ENUM ('MANUAL', 'AUTOMAT');

-- CreateEnum
CREATE TYPE "Drive" AS ENUM ('PREDNI', 'ZADNI', 'AWD');

-- CreateEnum
CREATE TYPE "BodyType" AS ENUM ('HATCHBACK', 'SEDAN', 'KOMBI', 'SUV', 'MPV', 'KUPE', 'KABRIOLET', 'UZITKOVE');

-- CreateEnum
CREATE TYPE "EquipmentCategory" AS ENUM ('BEZPECNOST', 'KOMFORT', 'MULTIMEDIA', 'EXTERIER');

-- CreateEnum
CREATE TYPE "MediaType" AS ENUM ('IMAGE', 'VIDEO', 'PANO360');

-- CreateEnum
CREATE TYPE "LeadType" AS ENUM ('INTEREST', 'TEST_DRIVE', 'RESERVATION', 'FINANCING', 'TRADE_IN', 'CALLBACK', 'SERVICE');

-- CreateEnum
CREATE TYPE "LeadStatus" AS ENUM ('NEW', 'CONTACTED', 'NEGOTIATION', 'RESERVED', 'SOLD', 'LOST');

-- CreateTable
CREATE TABLE "vehicles" (
    "id" SERIAL NOT NULL,
    "brand" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "version" TEXT,
    "price" INTEGER NOT NULL,
    "sale_price" INTEGER,
    "current_price" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "registration_date" DATE,
    "mileage" INTEGER NOT NULL,
    "fuel" "Fuel" NOT NULL,
    "transmission" "Transmission" NOT NULL,
    "drive" "Drive",
    "body_type" "BodyType" NOT NULL,
    "engine_volume" INTEGER,
    "power" INTEGER,
    "color" TEXT,
    "vin" TEXT,
    "stk" DATE,
    "owners" INTEGER,
    "origin" TEXT,
    "consumption" TEXT,
    "emissions" TEXT,
    "seats" INTEGER,
    "doors" INTEGER,
    "description" TEXT,
    "status" "VehicleStatus" NOT NULL DEFAULT 'DOSTUPNE',
    "slug" TEXT NOT NULL,
    "previous_slugs" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "sold_at" TIMESTAMP(3),
    "archived_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vehicles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehicle_images" (
    "id" SERIAL NOT NULL,
    "vehicle_id" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "storage_key" TEXT NOT NULL,
    "width" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    "alt" TEXT,
    "media_type" "MediaType" NOT NULL DEFAULT 'IMAGE',
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_main" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vehicle_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "equipment" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "category" "EquipmentCategory" NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "equipment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehicle_equipment" (
    "vehicle_id" INTEGER NOT NULL,
    "equipment_id" INTEGER NOT NULL,

    CONSTRAINT "vehicle_equipment_pkey" PRIMARY KEY ("vehicle_id","equipment_id")
);

-- CreateTable
CREATE TABLE "leads" (
    "id" SERIAL NOT NULL,
    "vehicle_id" INTEGER,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "type" "LeadType" NOT NULL,
    "message" TEXT,
    "status" "LeadStatus" NOT NULL DEFAULT 'NEW',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "leads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admins" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "settings" (
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "settings_pkey" PRIMARY KEY ("key")
);

-- CreateIndex
CREATE UNIQUE INDEX "vehicles_slug_key" ON "vehicles"("slug");

-- CreateIndex
CREATE INDEX "vehicles_status_archived_at_idx" ON "vehicles"("status", "archived_at");

-- CreateIndex
CREATE INDEX "vehicles_brand_model_idx" ON "vehicles"("brand", "model");

-- CreateIndex
CREATE INDEX "vehicles_current_price_idx" ON "vehicles"("current_price");

-- CreateIndex
CREATE INDEX "vehicles_year_idx" ON "vehicles"("year");

-- CreateIndex
CREATE INDEX "vehicles_mileage_idx" ON "vehicles"("mileage");

-- CreateIndex
CREATE INDEX "vehicle_images_vehicle_id_sort_order_idx" ON "vehicle_images"("vehicle_id", "sort_order");

-- CreateIndex
CREATE UNIQUE INDEX "equipment_category_name_key" ON "equipment"("category", "name");

-- CreateIndex
CREATE INDEX "leads_status_created_at_idx" ON "leads"("status", "created_at");

-- CreateIndex
CREATE INDEX "leads_type_idx" ON "leads"("type");

-- CreateIndex
CREATE UNIQUE INDEX "admins_email_key" ON "admins"("email");

-- AddForeignKey
ALTER TABLE "vehicle_images" ADD CONSTRAINT "vehicle_images_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicle_equipment" ADD CONSTRAINT "vehicle_equipment_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicle_equipment" ADD CONSTRAINT "vehicle_equipment_equipment_id_fkey" FOREIGN KEY ("equipment_id") REFERENCES "equipment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leads" ADD CONSTRAINT "leads_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
