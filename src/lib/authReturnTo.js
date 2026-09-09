// Shared by authentication pages and any flow that resumes after sign-in.
// Only allow a safe path within this application as a redirect destination.

export function safeReturnTo() {
  const raw = new URLSearchParams(window.location.search).get("returnTo");

  if (!raw) {
    return "/";
  }

  try {
    const url = new URL(raw, window.location.origin);

    if (url.origin !== window.location.origin) {
      return "/";
    }

    const path = url.pathname + url.search + url.hash;

    if (
      !path.startsWith("/") ||
      path.startsWith("//") ||
      path.includes("\\")
    ) {
      return "/";
    }

    return path;
  } catch {
    return "/";
  }
}
