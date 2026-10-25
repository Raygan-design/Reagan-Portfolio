// Use the actual request origin as well as the configured canonical address.
// This keeps same-origin forms working on both the custom domain and Vercel alias.
export function verifiedRequestOrigin(request: Request, canonicalUrl?: string): string | null {
  const origin = request.headers.get('origin');
  if (!origin || origin === 'null') return null;
  const allowed = [new URL(request.url).origin];
  if (canonicalUrl) allowed.push(new URL(canonicalUrl).origin);
  return allowed.includes(origin) ? origin : null;
}
