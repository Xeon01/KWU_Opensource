import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, LockKeyhole, Mail, UserRound, Sparkles } from 'lucide-react';
import Button from '../../components/ui/Button.jsx';
import Input from '../../components/ui/Input.jsx';
import { signUp } from '../../services/authService.js';
import { PATHS } from '../../routes/paths.js';
import { validateSignup } from '../../utils/validation.js';

const initialForm = { name: '', email: '', password: '', confirmPassword: '' };

export default function SignupPage() {
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);
  const update = (key) => (e) => { setForm((previous) => ({ ...previous, [key]: e.target.value })); setError(''); };

  async function onSubmit(e) {
    e.preventDefault();
    const issue = validateSignup(form);
    if (issue) { setError(issue); return; }
    setPending(true);
    try {
      await signUp({ name: form.name.trim(), email: form.email.trim(), password: form.password });
    } catch (err) {
      setError(err instanceof Error ? err.message : '회원가입 요청에 실패했습니다.');
    } finally { setPending(false); }
  }

  return (
    <div className="auth-form auth-form--signup">
      <div className="auth-form__mark"><Sparkles size={22} /></div>
      <p className="eyebrow">START YOUR JOURNEY</p>
      <h2>함께 떠날 준비 됐나요?</h2>
      <p className="auth-form__subtitle">N-Trip과 더 편리한 여행을 시작해 보세요.</p>
      <form onSubmit={onSubmit} noValidate>
        <Input label="이름" name="name" autoComplete="name" icon={UserRound} placeholder="이름을 입력해 주세요" value={form.name} onChange={update('name')} required />
        <Input label="이메일" name="email" autoComplete="email" type="email" icon={Mail} placeholder="name@example.com" value={form.email} onChange={update('email')} required />
        <Input label="비밀번호" name="password" autoComplete="new-password" type="password" icon={LockKeyhole} placeholder="8자 이상 입력해 주세요" value={form.password} onChange={update('password')} required />
        <Input label="비밀번호 확인" name="confirm-password" autoComplete="new-password" type="password" icon={LockKeyhole} placeholder="비밀번호를 다시 입력해 주세요" value={form.confirmPassword} onChange={update('confirmPassword')} required />
        {error && <p className="form-alert" role="alert">{error}</p>}
        <Button type="submit" className="auth-form__submit" disabled={pending}>회원가입 <ArrowRight size={18} /></Button>
      </form>
      <p className="auth-form__switch">이미 계정이 있으신가요? <Link to={PATHS.login}>로그인</Link></p>
      <div className="auth-notice"><strong>안내 · 프론트엔드 시연 버전</strong><br />서버 회원가입 API가 연결되지 않아 실제 계정을 생성하지 않습니다.</div>
    </div>
  );
}
