-- AlterTable
ALTER TABLE "admins" ADD COLUMN     "session_version" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "rate_limits" (
    "key" TEXT NOT NULL,
    "count" INTEGER NOT NULL,
    "reset_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rate_limits_pkey" PRIMARY KEY ("key")
);

-- CreateIndex
CREATE INDEX "rate_limits_reset_at_idx" ON "rate_limits"("reset_at");

-- Row Level Security na všech tabulkách (bez policies). Supabase Data API (anon/authenticated)
-- k nim tak nemá přístup; aplikace se připojuje jako vlastník tabulek a RLS ji neomezuje.
-- Na produkci je část už zapnutá souborem supabase-setup.sql – příkaz je idempotentní.
ALTER TABLE "admins" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "analytics_events" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "equipment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "leads" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "push_subscriptions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "rate_limits" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "reviews" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "services" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "settings" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "vehicle_equipment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "vehicle_images" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "vehicles" ENABLE ROW LEVEL SECURITY;
