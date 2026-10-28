-- CreateTable
CREATE TABLE "service_comparisons" (
    "id" SERIAL NOT NULL,
    "service_id" INTEGER NOT NULL,
    "caption" TEXT,
    "before_key" TEXT NOT NULL,
    "after_key" TEXT NOT NULL,
    "width" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "service_comparisons_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "service_comparisons_service_id_sort_order_idx" ON "service_comparisons"("service_id", "sort_order");

-- AddForeignKey
ALTER TABLE "service_comparisons" ADD CONSTRAINT "service_comparisons_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Stejně jako ostatní tabulky: Supabase Data API (anon/authenticated) k ní nemá přístup.
ALTER TABLE "service_comparisons" ENABLE ROW LEVEL SECURITY;
