-- Persistent, versioned assessment for each Vercel Blob image.
CREATE TABLE "BlobImageOptimization" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "pathname" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3),
    "storedSize" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "contentType" TEXT,
    "format" TEXT,
    "width" INTEGER,
    "height" INTEGER,
    "projectedSize" DOUBLE PRECISION,
    "projectedSavingBytes" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "projectedSavingPercent" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "policyIssues" JSONB,
    "status" TEXT NOT NULL DEFAULT 'UNKNOWN',
    "policyVersion" INTEGER NOT NULL DEFAULT 0,
    "referenced" BOOLEAN NOT NULL DEFAULT false,
    "presentInStorage" BOOLEAN NOT NULL DEFAULT true,
    "note" TEXT,
    "checkedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BlobImageOptimization_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "BlobImageOptimization_url_key"
ON "BlobImageOptimization"("url");

CREATE INDEX "BlobImageOptimization_presentInStorage_status_policyVersion_idx"
ON "BlobImageOptimization"("presentInStorage", "status", "policyVersion");

CREATE INDEX "BlobImageOptimization_presentInStorage_uploadedAt_idx"
ON "BlobImageOptimization"("presentInStorage", "uploadedAt");

CREATE INDEX "BlobImageOptimization_referenced_idx"
ON "BlobImageOptimization"("referenced");
