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

/** Server-side / OAuth — public Render API URL */
export function getBackendBase(): string {
  const url = readBackendUrl();
  if (!url) {
    throw new Error(
      "Set NEXT_PUBLIC_BACKEND_URL (and BACKEND_URL for rewrites) to your Render URL, e.g. https://e-commers-backend.onrender.com"
    );
  }
  return url;
}

/** Browser — Render URL or same-origin /express proxy */
export function getClientBackendBase(): string {
  const url = readBackendUrl();
  if (url) return url;
  if (typeof window !== "undefined") return "/express";
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
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token && !headers.has("Authorization")) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }
  return fetch(backendUrl(path), { ...options, headers });
}

export function getGoogleSignInUrl() {
  return `${getBackendBase()}/api/auth/google`;
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
      `Cannot reach the API at ${getBackendBase()}. Check Render is running and NEXT_PUBLIC_BACKEND_URL on Vercel.`
    );
    return;
  }

  window.location.href = getGoogleSignInUrl();
}
