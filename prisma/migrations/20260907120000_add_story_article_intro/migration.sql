-- Add an optional, independent introduction to Story articles.
ALTER TABLE "Story"
ADD COLUMN "articleIntro" TEXT;
