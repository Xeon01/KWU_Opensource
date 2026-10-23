import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation, Link } from 'react-router-dom';
import {
  LayoutDashboard, MapPin, CalendarDays, Receipt, ArrowLeftRight,
  ChartNoAxesColumn, Plus, Menu, X, ChevronRight, Compass, LogIn,
  CircleHelp, UserRound, ArrowUpRight,
} from 'lucide-react';
import Brand from './Brand.jsx';
import { DEMO_TRIP_ID, PATHS } from '../../routes/paths.js';
import { useDemo } from '../../contexts/DemoContext.jsx';

const navigation = [
  { title: '대시보드', icon: LayoutDashboard, href: PATHS.dashboard, end: true },
  { title: '내 여행', icon: Compass, href: PATHS.trips },
];
const tripNavigation = [
  { title: '일정 관리', icon: CalendarDays, href: PATHS.schedule(DEMO_TRIP_ID) },
  { title: '장소 / 지도', icon: MapPin, href: PATHS.places(DEMO_TRIP_ID) },
  { title: '지출 내역', icon: Receipt, href: PATHS.expenses(DEMO_TRIP_ID) },
  { title: '자동 정산', icon: ArrowLeftRight, href: PATHS.settlement(DEMO_TRIP_ID) },
  { title: '통계 보기', icon: ChartNoAxesColumn, href: PATHS.statistics(DEMO_TRIP_ID) },
];

function NavigationLink({ title, icon: Icon, href, end, onNavigate }) {
  return (
    <NavLink end={end} to={href} className={({ isActive }) => `side-link${isActive ? ' side-link--active' : ''}`} onClick={onNavigate}>
      <Icon size={19} strokeWidth={1.8} aria-hidden="true" />
      <span>{title}</span>
      <ChevronRight className="side-link__chevron" size={15} aria-hidden="true" />
    </NavLink>
  );
}

export default function AppLayout() {
  const { demoName, exitDemo } = useDemo();
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  return (
    <div className="app-shell">
      {menuOpen && <button className="sidebar-scrim" aria-label="탐색 메뉴 닫기" onClick={() => setMenuOpen(false)} />}
      <aside className={`sidebar${menuOpen ? ' sidebar--open' : ''}`} aria-label="주요 탐색 메뉴">
        <div className="sidebar__top">
          <Brand />
          <button type="button" className="icon-button sidebar__close" aria-label="탐색 메뉴 닫기" onClick={() => setMenuOpen(false)}><X size={20} /></button>
        </div>
        <div className="sidebar__nav-wrap">
          <p className="sidebar__label">WORKSPACE</p>
          <nav className="sidebar__nav" aria-label="워크스페이스">
            {navigation.map((item) => <NavigationLink key={item.href} {...item} onNavigate={() => setMenuOpen(false)} />)}
          </nav>
          <div className="sidebar__separator" />
          <div className="sidebar__group-heading">
            <p className="sidebar__label">여행 메뉴 <span className="sidebar__demo-label">데모</span></p>
            <Link className="sidebar__small-add" to={PATHS.trips} aria-label="여행 관리 페이지로 이동"><Plus size={16} /></Link>
          </div>
          <nav className="sidebar__nav" aria-label="여행 기능">
            {tripNavigation.map((item) => <NavigationLink key={item.href} {...item} onNavigate={() => setMenuOpen(false)} />)}
          </nav>
          <div className="sidebar__tip">
            <span className="sidebar__tip-icon"><Compass size={20} /></span>
            <strong>여행 준비도 한곳에서</strong>
            <p>일정과 지출을 함께 관리하는 N-Trip을 만나보세요.</p>
            <Link to={PATHS.trips}>여행 둘러보기 <ArrowUpRight size={15} /></Link>
          </div>
        </div>
        <div className="sidebar__bottom">
          <div className="sidebar__help"><CircleHelp size={17} /> <span>프론트엔드 데모 화면</span></div>
          <div className="sidebar__profile">
            <span className="profile-avatar"><UserRound size={19} /></span>
            <span className="sidebar__profile-copy"><strong>{demoName || '방문자'}</strong><small>{demoName ? '데모 체험 중' : '로그인 전'}</small></span>
            {demoName ? (
              <button type="button" className="profile-action" onClick={exitDemo} title="데모 종료" aria-label="데모 종료"><X size={18} /></button>
            ) : (
              <Link className="profile-action" to={PATHS.login} title="로그인 화면" aria-label="로그인 화면"><LogIn size={18} /></Link>
            )}
          </div>
        </div>
      </aside>
      <div className="app-main">
        <header className="topbar">
          <div className="topbar__left">
            <button type="button" className="icon-button topbar__menu" aria-label="탐색 메뉴 열기" aria-expanded={menuOpen} onClick={() => setMenuOpen(true)}><Menu size={22} /></button>
            <span className="topbar__crumb">내 워크스페이스</span><ChevronRight size={15} className="topbar__chevron" aria-hidden="true" /><span className="topbar__current">N-Trip</span>
          </div>
          <div className="topbar__right">
            <span className="topbar__demo"><span /> DEMO MODE</span>
            {!demoName && <Link to={PATHS.login} className="topbar__login">로그인 <ArrowUpRight size={15} /></Link>}
            <span className="topbar__avatar" aria-label="게스트 사용자"><UserRound size={20} /></span>
          </div>
        </header>
        <main className="app-content" id="main-content"><Outlet /></main>
        <footer className="app-footer"><span>© 2026 N-Trip</span><span>KWU Opensource · 프론트엔드 시연용</span></footer>
      </div>
      <nav className="mobile-tabs" aria-label="모바일 주요 메뉴">
        <NavLink to={PATHS.dashboard} className={({ isActive }) => isActive ? 'mobile-tabs__active' : ''}><LayoutDashboard size={20} /><span>홈</span></NavLink>
        <NavLink to={PATHS.trips} className={({ isActive }) => isActive ? 'mobile-tabs__active' : ''}><Compass size={20} /><span>여행</span></NavLink>
        <NavLink to={PATHS.expenses(DEMO_TRIP_ID)} className={({ isActive }) => isActive ? 'mobile-tabs__active' : ''}><Receipt size={20} /><span>지출</span></NavLink>
        <NavLink to={PATHS.settlement(DEMO_TRIP_ID)} className={({ isActive }) => isActive ? 'mobile-tabs__active' : ''}><ArrowLeftRight size={20} /><span>정산</span></NavLink>
      </nav>
    </div>
  );
}
