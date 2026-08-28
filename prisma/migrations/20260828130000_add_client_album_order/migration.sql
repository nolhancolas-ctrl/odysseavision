ALTER TABLE "ClientAlbum"
ADD COLUMN "order" INTEGER NOT NULL DEFAULT 0;

WITH ranked_albums AS (
  SELECT
    "id",
    ROW_NUMBER() OVER (
      ORDER BY "shootingDate" DESC NULLS LAST, "createdAt" DESC
    ) - 1 AS "newOrder"
  FROM "ClientAlbum"
)
UPDATE "ClientAlbum"
SET "order" = ranked_albums."newOrder"
FROM ranked_albums
WHERE "ClientAlbum"."id" = ranked_albums."id";
