const DEFAULT_API_BASE_URL = 'http://127.0.0.1:3000';

export function readApiBaseUrl(
  env: { VITE_API_BASE_URL?: string } = import.meta.env,
): string {
  return env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL;
}
