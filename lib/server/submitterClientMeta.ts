import "server-only";

const MAX_IP_LEN = 64;
const MAX_UA_LEN = 2048;

/**
 * Klient-IP fra reverse proxy (Vercel, Cloudflare, nginx).
 * Kan være upresis (VPN, delt NAT); kun til intern bruk.
 */
export function clientIpFromRequest(req: Request): string | null {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) {
    const first = xff.split(",")[0]?.trim();
    if (first) return first.slice(0, MAX_IP_LEN);
  }
  const real = req.headers.get("x-real-ip")?.trim();
  if (real) return real.slice(0, MAX_IP_LEN);
  const cf = req.headers.get("cf-connecting-ip")?.trim();
  if (cf) return cf.slice(0, MAX_IP_LEN);
  return null;
}

export function userAgentFromRequest(req: Request): string | null {
  const ua = req.headers.get("user-agent")?.trim();
  if (!ua) return null;
  return ua.slice(0, MAX_UA_LEN);
}
