/*
  Warnings:

  - You are about to drop the `MediaAsset` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `coverId` on the `ClientAlbum` table. All the data in the column will be lost.
  - You are about to drop the column `imageId` on the `ClientAlbumImage` table. All the data in the column will be lost.
  - You are about to drop the column `imageId` on the `PortfolioItem` table. All the data in the column will be lost.
  - You are about to drop the column `imageId` on the `Story` table. All the data in the column will be lost.
  - You are about to drop the column `thumbnailId` on the `Video` table. All the data in the column will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "MediaAsset";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "NewsletterCampaign" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "previewText" TEXT,
    "heroImage" TEXT,
    "body" TEXT NOT NULL,
    "ctaLabel" TEXT,
    "ctaHref" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "recipientCount" INTEGER NOT NULL DEFAULT 0,
    "sentAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ClientAlbum" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "coverSrc" TEXT,
    "shootingDate" DATETIME,
    "location" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "passwordHash" TEXT,
    "allowDownload" BOOLEAN NOT NULL DEFAULT false,
    "allowShare" BOOLEAN NOT NULL DEFAULT true,
    "expiresAt" DATETIME,
    "clientId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ClientAlbum_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_ClientAlbum" ("allowDownload", "allowShare", "clientId", "coverSrc", "createdAt", "description", "expiresAt", "id", "location", "passwordHash", "shootingDate", "slug", "status", "title", "updatedAt") SELECT "allowDownload", "allowShare", "clientId", "coverSrc", "createdAt", "description", "expiresAt", "id", "location", "passwordHash", "shootingDate", "slug", "status", "title", "updatedAt" FROM "ClientAlbum";
DROP TABLE "ClientAlbum";
ALTER TABLE "new_ClientAlbum" RENAME TO "ClientAlbum";
CREATE UNIQUE INDEX "ClientAlbum_slug_key" ON "ClientAlbum"("slug");
CREATE TABLE "new_ClientAlbumImage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "albumId" TEXT NOT NULL,
    "imageSrc" TEXT NOT NULL,
    "title" TEXT,
    "alt" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "selected" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ClientAlbumImage_albumId_fkey" FOREIGN KEY ("albumId") REFERENCES "ClientAlbum" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_ClientAlbumImage" ("albumId", "alt", "createdAt", "id", "imageSrc", "order", "selected", "title", "updatedAt") SELECT "albumId", "alt", "createdAt", "id", "imageSrc", "order", "selected", "title", "updatedAt" FROM "ClientAlbumImage";
DROP TABLE "ClientAlbumImage";
ALTER TABLE "new_ClientAlbumImage" RENAME TO "ClientAlbumImage";
CREATE TABLE "new_PortfolioItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "location" TEXT,
    "date" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,
    "tags" TEXT,
    "imageSrc" TEXT NOT NULL,
    "categoryId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PortfolioItem_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "PortfolioCategory" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_PortfolioItem" ("categoryId", "createdAt", "date", "description", "featured", "id", "imageSrc", "location", "order", "slug", "status", "tags", "title", "updatedAt") SELECT "categoryId", "createdAt", "date", "description", "featured", "id", "imageSrc", "location", "order", "slug", "status", "tags", "title", "updatedAt" FROM "PortfolioItem";
DROP TABLE "PortfolioItem";
ALTER TABLE "new_PortfolioItem" RENAME TO "PortfolioItem";
CREATE UNIQUE INDEX "PortfolioItem_slug_key" ON "PortfolioItem"("slug");
CREATE TABLE "new_Story" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "excerpt" TEXT,
    "content" TEXT,
    "readTime" TEXT,
    "author" TEXT,
    "date" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,
    "tags" TEXT,
    "imageSrc" TEXT NOT NULL,
    "categoryId" TEXT,
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Story_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "StoryCategory" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Story" ("author", "categoryId", "content", "createdAt", "date", "excerpt", "featured", "id", "imageSrc", "order", "readTime", "seoDescription", "seoTitle", "slug", "status", "tags", "title", "updatedAt") SELECT "author", "categoryId", "content", "createdAt", "date", "excerpt", "featured", "id", "imageSrc", "order", "readTime", "seoDescription", "seoTitle", "slug", "status", "tags", "title", "updatedAt" FROM "Story";
DROP TABLE "Story";
ALTER TABLE "new_Story" RENAME TO "Story";
CREATE UNIQUE INDEX "Story_slug_key" ON "Story"("slug");
CREATE TABLE "new_Video" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "vimeoUrl" TEXT,
    "vimeoId" TEXT,
    "duration" TEXT,
    "date" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,
    "thumbnailSrc" TEXT NOT NULL,
    "categoryId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Video_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "VideoCategory" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Video" ("categoryId", "createdAt", "date", "description", "duration", "featured", "id", "order", "slug", "status", "thumbnailSrc", "title", "updatedAt", "vimeoId", "vimeoUrl") SELECT "categoryId", "createdAt", "date", "description", "duration", "featured", "id", "order", "slug", "status", "thumbnailSrc", "title", "updatedAt", "vimeoId", "vimeoUrl" FROM "Video";
DROP TABLE "Video";
ALTER TABLE "new_Video" RENAME TO "Video";
CREATE UNIQUE INDEX "Video_slug_key" ON "Video"("slug");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
