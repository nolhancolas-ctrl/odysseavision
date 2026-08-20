const COMPRESSIBLE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

const TARGET_MAX_BYTES = 3.8 * 1024 * 1024;

type CompressionAttempt = {
  maxSize: number;
  quality: number;
};

const ATTEMPTS: CompressionAttempt[] = [
  { maxSize: 2200, quality: 0.84 },
  { maxSize: 1800, quality: 0.8 },
  { maxSize: 1400, quality: 0.76 },
];

function canUseCanvasCompression(file: File) {
  return COMPRESSIBLE_TYPES.has(file.type);
}

async function canvasToBlob(
  canvas: HTMLCanvasElement,
  quality: number,
): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob(resolve, "image/webp", quality);
  });
}

async function compressWithCanvas(
  file: File,
  attempt: CompressionAttempt,
): Promise<File | null> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(
    1,
    attempt.maxSize / Math.max(bitmap.width, bitmap.height),
  );

  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));

  const context = canvas.getContext("2d");

  if (!context) {
    bitmap.close();
    return null;
  }

  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  const blob = await canvasToBlob(canvas, attempt.quality);

  if (!blob) {
    return null;
  }

  const name = file.name.replace(/\.[a-z0-9]+$/i, ".webp");

  return new File([blob], name, {
    type: "image/webp",
    lastModified: Date.now(),
  });
}

export async function compressImageBeforeUpload(file: File): Promise<File> {
  if (!canUseCanvasCompression(file)) {
    return file;
  }

  let best = file;

  for (const attempt of ATTEMPTS) {
    try {
      const compressed = await compressWithCanvas(file, attempt);

      if (!compressed) {
        continue;
      }

      if (compressed.size < best.size) {
        best = compressed;
      }

      if (compressed.size <= TARGET_MAX_BYTES) {
        return compressed;
      }
    } catch {
      continue;
    }
  }

  return best;
}
