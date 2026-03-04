function base64UrlToBase64(value: string) {
  let normalized = value.replace(/-/g, "+").replace(/_/g, "/");

  while (normalized.length % 4 !== 0) {
    normalized += "=";
  }

  return normalized;
}

export function readJwtPayload(token: string) {
  const segments = token.split(".");
  if (segments.length < 2) {
    return null;
  }

  try {
    const payload = Buffer.from(base64UrlToBase64(segments[1] || ""), "base64")
      .toString("utf8")
      .trim();

    if (!payload) {
      return null;
    }

    const parsed = JSON.parse(payload);
    return parsed && typeof parsed === "object"
      ? (parsed as Record<string, unknown>)
      : null;
  } catch {
    return null;
  }
}
