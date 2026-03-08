/**
 * Cookie-based storage helpers for auth data.
 * Cookies survive cross-origin OAuth redirects more reliably
 * than localStorage/sessionStorage.
 */

export function setCookie(
  name: string,
  value: string,
  maxAgeSec = 86400 * 7,
): void {
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAgeSec}; SameSite=Lax`;
}

export function getCookie(name: string): string | null {
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.split("=").slice(1).join("=")) : null;
}

export function removeCookie(name: string): void {
  document.cookie = `${name}=; path=/; max-age=0`;
}
