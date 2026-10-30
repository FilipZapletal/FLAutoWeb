-- Přesný čas termínu místo části dne (dopoledne/odpoledne). Starší objednávky si část dne ponechají.
ALTER TABLE "leads" ADD COLUMN "preferred_time" TEXT;
ALTER TABLE "leads" ADD COLUMN "confirmed_time" TEXT;
