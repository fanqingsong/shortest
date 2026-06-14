/**
 * Builds Context lines for the initial test prompt, including explicit auth credentials
 * when callers wrap credentials in `authPayload`.
 */
export function formatPayloadContextLines(payload: unknown): string[] {
  if (payload == null) {
    return [];
  }

  const lines = [`Context: ${JSON.stringify(payload)}`];

  if (typeof payload === "object" && payload !== null && "authPayload" in payload) {
    const authPayload = (payload as { authPayload?: unknown }).authPayload;
    if (authPayload != null) {
      lines.push(`Auth credentials: ${JSON.stringify(authPayload)}`);
    }
  }

  return lines;
}
