ALTER TABLE "BlobImageOptimization"
ADD COLUMN IF NOT EXISTS "contentHash" TEXT;

CREATE INDEX IF NOT EXISTS "BlobImageOptimization_contentHash_idx"
ON "BlobImageOptimization"("contentHash");
