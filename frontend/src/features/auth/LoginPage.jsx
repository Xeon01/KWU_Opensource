import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, LockKeyhole, Mail, Sparkles } from 'lucide-react';
import Button from '../../components/ui/Button.jsx';
import Input from '../../components/ui/Input.jsx';
import { signIn } from '../../services/authService.js';
import { useDemo } from '../../contexts/DemoContext.jsx';
import { PATHS } from '../../routes/paths.js';
import { validateLogin } from '../../utils/validation.js';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);
  const { enterDemo } = useDemo();
  const navigate = useNavigate();

  const update = (key) => (e) => { setForm((previous) => ({ ...previous, [key]: e.target.value })); setError(''); };

  async function onSubmit(e) {
    e.preventDefault();
    const issue = validateLogin(form);
    if (issue) { setError(issue); return; }
    setPending(true);
    try { await signIn(form); }
    catch (err) { setError(err instanceof Error ? err.message : '로그인 요청에 실패했습니다.'); }
    finally { setPending(false); }
  }

  function onDemo() { enterDemo('여행자'); navigate(PATHS.dashboard); }

  return (
    <div className="auth-form">
      <div className="auth-form__mark"><Sparkles size={22} /></div>
      <p className="eyebrow">WELCOME BACK</p>
      <h2>다시 만나 반가워요! <span aria-hidden="true">👋</span></h2>
      <p className="auth-form__subtitle">우리의 다음 여행을 함께 준비해 볼까요?</p>
      <form onSubmit={onSubmit} noValidate>
        <Input label="이메일" autoComplete="email" name="email" type="email" icon={Mail} placeholder="name@example.com" value={form.email} onChange={update('email')} required />
        <Input label="비밀번호" autoComplete="current-password" name="password" type="password" icon={LockKeyhole} placeholder="비밀번호를 입력해 주세요" value={form.password} onChange={update('password')} required />
        {error && <p className="form-alert" role="alert">{error}</p>}
        <Button type="submit" className="auth-form__submit" disabled={pending}>로그인 <ArrowRight size={18} /></Button>
      </form>
      <div className="auth-divider"><span>또는</span></div>
      <Button variant="outline" className="auth-form__demo" onClick={onDemo} icon={Sparkles}>데모 화면 둘러보기</Button>
      <p className="auth-form__switch">아직 계정이 없으신가요? <Link to={PATHS.signup}>회원가입</Link></p>
      <div className="auth-notice"><strong>안내 · 프론트엔드 시연 버전</strong><br />로그인 API가 연결되기 전으로, 실제 인증은 지원하지 않습니다. 데모는 계정을 생성하지 않습니다.</div>
    </div>
  );
}
