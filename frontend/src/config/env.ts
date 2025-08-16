export function getApiBaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8787';

  // Only validate in browser environment for production builds
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
    const isDefault = !process.env.NEXT_PUBLIC_API_URL;
    const isLocal = url.includes('localhost') || url.includes('127.0.0.1');
    if (isDefault || isLocal) {
      console.warn(
        'Warning: NEXT_PUBLIC_API_URL is not set or pointing to localhost in production. Using default value.'
      );
    }
  }

  return url;
}
