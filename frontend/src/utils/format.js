export function formatWon(value) {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new TypeError('formatWon expects a finite number');
  }
  return `₩${Math.round(value).toLocaleString('ko-KR')}`;
}

export function getInitials(name = '') {
  const normalized = String(name).trim();
  return normalized.length ? normalized.slice(0, 1).toUpperCase() : '?';
}
