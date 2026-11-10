/**
 * Common transport layer. Do not assume endpoint paths without a backend API contract.
 * Feature owners may import request() after agreeing on API paths and schemas.
 */
const BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

export async function request(path, { headers, ...options } = {}) {
  if (!BASE_URL) {
    throw new Error('백엔드 API 주소가 설정되지 않았습니다. frontend/.env.example을 확인해 주세요.');
  }
  if (typeof path !== 'string' || !path.startsWith('/')) {
    throw new Error('API 경로는 /로 시작해야 합니다.');
  }
  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: { ...(options.body ? { 'Content-Type': 'application/json' } : {}), ...headers },
  });
  if (!response.ok) {
    // Do not expose raw server error bodies in user-facing messages.
    throw new Error(`요청을 처리하지 못했습니다. (${response.status})`);
  }
  if (response.status === 204) return null;
  return response.json();
}
