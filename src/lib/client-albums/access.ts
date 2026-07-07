import { createHash } from "crypto";

function sha256(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

export function hashAlbumPassword(password: string) {
  return sha256(password);
}

export function verifyAlbumPassword(password: string, passwordHash: string) {
  return hashAlbumPassword(password) === passwordHash;
}

export function getAlbumAccessCookieName(albumId: string) {
  return `ov_album_access_${albumId}`;
}

export function getAlbumAccessToken(albumId: string, passwordHash: string) {
  return sha256(`${albumId}:${passwordHash}:odyssea-vision-client-album`);
}
