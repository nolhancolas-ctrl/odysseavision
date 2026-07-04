export function extractVimeoId(value?: string | null) {
  if (!value) return "";

  const input = value.trim();

  if (/^\d+$/.test(input)) {
    return input;
  }

  const playerMatch = input.match(/player\.vimeo\.com\/video\/(\d+)/);
  if (playerMatch?.[1]) {
    return playerMatch[1];
  }

  const vimeoMatch = input.match(/vimeo\.com\/(?:.*\/)?(\d+)(?:$|[/?#])/);
  if (vimeoMatch?.[1]) {
    return vimeoMatch[1];
  }

  const looseMatch = input.match(/\/(\d{6,})(?:$|[/?#])/);
  return looseMatch?.[1] ?? "";
}

export function getVimeoEmbedUrl(
  vimeoUrl?: string | null,
  vimeoId?: string | null,
) {
  const id = vimeoId?.trim() || extractVimeoId(vimeoUrl);

  if (!id) return "";

  return `https://player.vimeo.com/video/${id}?title=0&byline=0&portrait=0`;
}

export function getVimeoWatchUrl(
  vimeoUrl?: string | null,
  vimeoId?: string | null,
) {
  const url = vimeoUrl?.trim();

  if (url) return url;

  const id = vimeoId?.trim();

  return id ? `https://vimeo.com/${id}` : "";
}


export function isPlaceholderVimeoId(value?: string | null) {
  if (!value) return false;

  const id = extractVimeoId(value);

  return /^10000000\d$/.test(id);
}

export function isPlayableVimeo(
  vimeoUrl?: string | null,
  vimeoId?: string | null,
) {
  const id = vimeoId?.trim() || extractVimeoId(vimeoUrl);

  return Boolean(id) && !isPlaceholderVimeoId(id);
}
