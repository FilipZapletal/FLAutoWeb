// České názvy hodnot z databáze. Sdílené pro web, admin i validaci.
import type {
  BodyType,
  Drive,
  EquipmentCategory,
  Fuel,
  LeadStatus,
  LeadType,
  ServiceIcon,
  TimeSlot,
  Transmission,
  VehicleStatus,
} from "@/generated/prisma/enums";

export const VEHICLE_STATUS_LABELS: Record<VehicleStatus, string> = {
  DOSTUPNE: "Dostupné",
  REZERVOVANO: "Rezervováno",
  PRODANO: "Prodáno",
  SKRYTE: "Skryté",
};

export const FUEL_LABELS: Record<Fuel, string> = {
  BENZIN: "Benzín",
  DIESEL: "Diesel",
  HYBRID: "Hybrid",
  PLUGIN_HYBRID: "Plug-in hybrid",
  ELEKTRO: "Elektro",
  LPG_CNG: "LPG / CNG",
};

export const TRANSMISSION_LABELS: Record<Transmission, string> = {
  MANUAL: "Manuální",
  AUTOMAT: "Automatická",
};

export const DRIVE_LABELS: Record<Drive, string> = {
  PREDNI: "Přední",
  ZADNI: "Zadní",
  AWD: "4x4",
};

export const BODY_TYPE_LABELS: Record<BodyType, string> = {
  HATCHBACK: "Hatchback",
  SEDAN: "Sedan",
  KOMBI: "Kombi",
  SUV: "SUV",
  MPV: "MPV",
  KUPE: "Kupé",
  KABRIOLET: "Kabriolet",
  UZITKOVE: "Užitkové",
};

export const EQUIPMENT_CATEGORY_LABELS: Record<EquipmentCategory, string> = {
  BEZPECNOST: "Bezpečnost",
  KOMFORT: "Komfort",
  MULTIMEDIA: "Multimédia",
  EXTERIER: "Exteriér",
};

export const LEAD_TYPE_LABELS: Record<LeadType, string> = {
  INTEREST: "Prohlídka",
  TEST_DRIVE: "Zkušební jízda",
  RESERVATION: "Rezervace",
  FINANCING: "Financování",
  TRADE_IN: "Protiúčet",
  CALLBACK: "Zavolat zpět",
  SERVICE: "Servis",
  WANTED_CAR: "Hledané auto",
};

/** Typy, které si zákazník vybírá ve formuláři u vozu (v tomto pořadí). Financování a protiúčet se nenabízí (staré poptávky těchto typů zůstávají čitelné v LEAD_TYPE_LABELS). */
export const VEHICLE_LEAD_TYPES = [
  "INTEREST",
  "RESERVATION",
  "CALLBACK",
] as const satisfies readonly LeadType[];

export const VEHICLE_LEAD_TYPE_OPTIONS: Record<(typeof VEHICLE_LEAD_TYPES)[number], string> = {
  INTEREST: "Mám zájem o prohlídku",
  RESERVATION: "Chci vůz rezervovat",
  CALLBACK: "Chci zavolat zpět",
};

export const TIME_SLOT_LABELS: Record<TimeSlot, string> = {
  DOPOLEDNE: "Dopoledne",
  ODPOLEDNE: "Odpoledne",
};

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  NEW: "Nová",
  CONTACTED: "Kontaktováno",
  NEGOTIATION: "V jednání",
  CONFIRMED: "Potvrzeno",
  RESERVED: "Rezervace",
  SOLD: "Prodáno",
  LOST: "Ztraceno",
};

/** Pořadí stavů ve výběru (Potvrzeno = domluvený termín, před jednáním o koupi). */
export const LEAD_STATUS_ORDER: LeadStatus[] = ["NEW", "CONTACTED", "CONFIRMED", "NEGOTIATION", "RESERVED", "SOLD", "LOST"];

export const ORIGIN_OPTIONS = ["ČR", "Dovoz"] as const;

export const SERVICE_ICON_LABELS: Record<ServiceIcon, string> = {
  CAR: "Auto",
  WRENCH: "Klíč (servis)",
  SPARKLE: "Jiskra (mytí)",
  SHIELD: "Štít (STK)",
};
