import { Agent, fetch as undiciFetch } from "undici";

/**
 * Outbound connections prefer IPv4. Fixes some Windows setups where Node
 * resolves *.supabase.co to IPv6 first and `fetch` fails with "TypeError: fetch failed"
 * while Chrome still works.
 */
const agent = new Agent({
  connect: { family: 4 },
});

export function fetchPreferIpv4(
  input: Parameters<typeof undiciFetch>[0],
  init?: Parameters<typeof undiciFetch>[1],
): ReturnType<typeof undiciFetch> {
  return undiciFetch(input, {
    ...init,
    dispatcher: agent,
  });
}
