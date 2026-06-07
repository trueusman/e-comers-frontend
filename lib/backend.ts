function stripSlash(url: string) {
  return url.replace(/\/$/, "");
}

function readBackendUrl(): string {
  const url = (
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    process.env.BACKEND_URL ||
    ""
  ).trim();
  return url ? stripSlash(url) : "";
}

/** Server-side — public API URL */
export function getBackendBase(): string {
  const url = readBackendUrl();
  if (!url) {
    throw new Error(
      "Set NEXT_PUBLIC_BACKEND_URL (and BACKEND_URL for rewrites) to your API URL, e.g. https://e-commers-backend-cyan.vercel.app"
    );
  }
  return url;
}

function isLocalFrontend(): boolean {
  if (typeof window === "undefined") return false;
  return /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(
    window.location.origin
  );
}

/** Browser — same-origin /express proxy (avoids CORS); optional direct URL in local dev */
export function getClientBackendBase(): string {
  if (typeof window !== "undefined") {
    const devOverride = (
      process.env.NEXT_PUBLIC_DEV_BACKEND_URL || ""
    ).trim();

    if (process.env.NODE_ENV !== "production" && isLocalFrontend() && devOverride) {
      return stripSlash(devOverride);
    }

    return "/express";
  }

  const url = readBackendUrl();
  if (url) return url;
  return getBackendBase();
}

export const BACKEND_BASE = readBackendUrl();

export function backendUrl(path: string) {
  if (path.startsWith("http")) return path;
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const base =
    typeof window !== "undefined" ? getClientBackendBase() : getBackendBase();
  return `${base}${normalizedPath}`;
}

export async function backendFetch(path: string, options: RequestInit = {}) {
  const headers = new Headers(options.headers || {});
  
  // For client-side requests, always send cookies
  const finalOptions: RequestInit = {
    ...options,
    headers,
    credentials: "include" as RequestCredentials,
  };
  
  return fetch(backendUrl(path), finalOptions);
}

export function getGoogleSignInUrl() {
  return `${getClientBackendBase()}/api/auth/google`;
}

export async function startGoogleSignIn(onError: (message: string) => void) {
  try {
    const res = await fetch(backendUrl("/api/auth/google/status"));
    const data = await res.json().catch(() => ({}));

    if (!res.ok || !data.configured) {
      onError(
        data.message ||
          "Google Sign-In is not set up on the API server (GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET)."
      );
      return;
    }
  } catch {
    onError(
      `Cannot reach the API at ${getBackendBase()}. Check the backend is deployed and NEXT_PUBLIC_BACKEND_URL is set on Vercel.`
    );
    return;
  }

  window.location.href = getGoogleSignInUrl();
}
