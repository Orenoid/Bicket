-- CreateTable
CREATE TABLE "counter" (
    "entity_name" TEXT NOT NULL,
    "current_value" BIGINT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "counter_pkey" PRIMARY KEY ("entity_name")
);
