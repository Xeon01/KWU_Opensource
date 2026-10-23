import { Outlet } from 'react-router-dom';
import { Check, MapPinned, ReceiptText, UsersRound, ArrowLeft } from 'lucide-react';
import Brand from './Brand.jsx';
import { Link } from 'react-router-dom';
import { PATHS } from '../../routes/paths.js';

export default function AuthLayout() {
  return (
    <main className="auth-shell">
      <section className="auth-brand-panel" aria-label="N-Trip 소개">
        <div className="auth-brand-panel__inner">
          <Brand light />
          <div className="auth-brand-panel__body">
            <div className="auth-kicker"><span>✦</span> TRAVEL BETTER, TOGETHER</div>
            <h1>여행의 설렘은<br /><em>더 크게.</em><br />준비의 번거로움은<br />더 작게.</h1>
            <p>우리의 모든 여행을 하나의 공간에서. 일정부터 공동 지출과 정산까지 N-Trip과 함께하세요.</p>
            <div className="auth-highlights">
              <div><span><MapPinned size={18} /></span> 함께 만드는 여행 일정 <Check size={16} /></div>
              <div><span><ReceiptText size={18} /></span> 복잡한 지출도 한눈에 <Check size={16} /></div>
              <div><span><UsersRound size={18} /></span> 친구들과 간편하게 정산 <Check size={16} /></div>
            </div>
          </div>
          <div className="auth-brand-panel__footer">N-Trip <span>·</span> 2026 광운대학교 오픈소스 프로젝트</div>
        </div>
        <div className="auth-orb auth-orb--first" aria-hidden="true" /><div className="auth-orb auth-orb--second" aria-hidden="true" />
      </section>
      <section className="auth-form-panel">
        <div className="auth-form-panel__top"><Link to={PATHS.dashboard}><ArrowLeft size={16} /> 대시보드로 돌아가기</Link></div>
        <div className="auth-form-panel__content"><Outlet /></div>
        <p className="auth-form-panel__bottom">© 2026 N-Trip. Made for better journeys.</p>
      </section>
    </main>
  );
}
