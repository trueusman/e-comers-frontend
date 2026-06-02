export const BACKEND_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

export function backendUrl(path: string) {
  if (path.startsWith("http")) return path;
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${BACKEND_BASE}${normalizedPath}`;
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
  return backendUrl("/api/auth/google");
}

/** Redirect to Google OAuth via Express backend (saves user in MongoDB). */
export async function startGoogleSignIn(onError: (message: string) => void) {
  try {
    const res = await fetch(backendUrl("/api/auth/google/status"));
    const data = await res.json().catch(() => ({}));

    if (!res.ok || !data.configured) {
      onError(
        data.message ||
          "Google Sign-In is not set up. Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in e-commerce-backend/.env"
      );
      return;
    }
  } catch {
    onError(
      "Cannot reach the API server. Start the backend: cd e-commerce-backend && npm run dev"
    );
    return;
  }

  window.location.href = getGoogleSignInUrl();
}
