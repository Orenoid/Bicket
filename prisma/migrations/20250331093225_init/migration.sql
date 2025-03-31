-- CreateTable
CREATE TABLE "property" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL,
    "config" JSONB,
    "deletable" BOOLEAN NOT NULL DEFAULT true,
    "nullable" BOOLEAN NOT NULL,
    "readonly" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "property_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "property_single_value" (
    "id" TEXT NOT NULL,
    "issue_id" TEXT NOT NULL,
    "property_id" TEXT NOT NULL,
    "property_type" TEXT NOT NULL,
    "value" TEXT,
    "number_value" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "property_single_value_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "property_multi_value" (
    "id" TEXT NOT NULL,
    "issue_id" TEXT NOT NULL,
    "property_id" TEXT NOT NULL,
    "property_type" TEXT NOT NULL,
    "value" TEXT,
    "number_value" DOUBLE PRECISION,
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "property_multi_value_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "property_single_value_issue_id_idx" ON "property_single_value"("issue_id");

-- CreateIndex
CREATE INDEX "property_single_value_property_id_idx" ON "property_single_value"("property_id");

-- CreateIndex
CREATE UNIQUE INDEX "property_single_value_issue_id_property_id_key" ON "property_single_value"("issue_id", "property_id");

-- CreateIndex
CREATE INDEX "property_multi_value_issue_id_idx" ON "property_multi_value"("issue_id");

-- CreateIndex
CREATE INDEX "property_multi_value_property_id_idx" ON "property_multi_value"("property_id");

-- CreateIndex
CREATE UNIQUE INDEX "property_multi_value_issue_id_property_id_position_key" ON "property_multi_value"("issue_id", "property_id", "position");
