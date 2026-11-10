const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateLogin({ email, password }) {
  if (!EMAIL_PATTERN.test(String(email || '').trim())) return '올바른 이메일 주소를 입력해 주세요.';
  if (!password) return '비밀번호를 입력해 주세요.';
  return '';
}

export function validateSignup({ name, email, password, confirmPassword }) {
  if (!String(name || '').trim()) return '이름을 입력해 주세요.';
  if (!EMAIL_PATTERN.test(String(email || '').trim())) return '올바른 이메일 주소를 입력해 주세요.';
  if (String(password || '').length < 8) return '비밀번호는 8자 이상으로 입력해 주세요.';
  if (password !== confirmPassword) return '비밀번호 확인이 일치하지 않습니다.';
  return '';
}
