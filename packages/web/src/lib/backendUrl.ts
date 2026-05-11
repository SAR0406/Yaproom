const LOCAL_BACKEND_ORIGIN = 'http://localhost:4000';

export function resolveBackendOrigin(): string {
  const configured = process.env.NEXT_PUBLIC_SOCKET_URL?.trim();
  if (configured) {
    try {
      return new URL(configured).origin;
    } catch {
      return configured.replace(/\/+$/, '');
    }
  }

  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1') {
      return LOCAL_BACKEND_ORIGIN;
    }
    return window.location.origin;
  }

  return LOCAL_BACKEND_ORIGIN;
}
