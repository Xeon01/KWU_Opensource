import { Link } from 'react-router-dom';
import {
  ArrowRight, ArrowUpRight, CalendarDays, CircleDollarSign, Compass, CreditCard,
  MapPin, Plus, Receipt, Sparkles, UsersRound, Wallet, ChevronRight, Plane,
  Sun, CheckCircle2, MapPinned,
} from 'lucide-react';
import Button from '../../components/ui/Button.jsx';
import Badge from '../../components/ui/Badge.jsx';
import Card from '../../components/ui/Card.jsx';
import PageHeader from '../../components/ui/PageHeader.jsx';
import { demoTrips, demoActivity } from '../../data/demo.js';
import { DEMO_TRIP_ID, PATHS } from '../../routes/paths.js';
import { formatWon } from '../../utils/format.js';
import { useDemo } from '../../contexts/DemoContext.jsx';

const quickActions = [
  { title: '일정 확인', detail: '함께 계획하는 여정', icon: CalendarDays, tone: 'mint', to: PATHS.schedule(DEMO_TRIP_ID) },
  { title: '지출 기록', detail: '쓴 돈 꼼꼼히 관리', icon: Wallet, tone: 'peach', to: PATHS.expenses(DEMO_TRIP_ID) },
  { title: '정산 현황', detail: '간편하게 비용 나누기', icon: CreditCard, tone: 'lavender', to: PATHS.settlement(DEMO_TRIP_ID) },
  { title: '장소 둘러보기', detail: '우리 여행지 한눈에', icon: MapPinned, tone: 'sky', to: PATHS.places(DEMO_TRIP_ID) },
];

function AvatarStack({ initials = [] }) {
  return (
    <div className="avatar-stack" aria-label={`참가자 ${initials.length}명`}>
      {initials.map((text, index) => <span key={`${text}-${index}`} className={`avatar-stack__item avatar-stack__item--${index % 4}`}>{text}</span>)}
    </div>
  );
}

function TripCard({ trip }) {
  return (
    <Card className="trip-card">
      <div className={`trip-card__visual trip-card__visual--${trip.visual}`}>
        <div className="trip-card__art" aria-hidden="true">
          <span className="trip-card__sun" />
          <span className="trip-card__land trip-card__land--back" />
          <span className="trip-card__land trip-card__land--front" />
        </div>
        <span className="trip-card__place-badge"><MapPin size={12} /> {trip.location}</span>
        <span className="trip-card__emblem" aria-hidden="true">{trip.emoji}</span>
      </div>
      <div className="trip-card__body">
        <div className="trip-card__head"><Badge tone={trip.visual === 'jeju' ? 'mint' : 'sand'}>{trip.state}</Badge><span className="trip-card__dates">{trip.dates}</span></div>
        <h3>{trip.name}</h3>
        <p className="trip-card__date"><CalendarDays size={15} /> {trip.dateLabel}</p>
        <div className="trip-card__rule" />
        <div className="trip-card__people"><AvatarStack initials={trip.participants} /><span>{trip.count}명이 함께해요</span></div>
        <div className="trip-card__budget"><span>예산 사용</span><strong>{formatWon(trip.spent)} <small>/ {formatWon(trip.budget)}</small></strong></div>
        <div className="progress" role="progressbar" aria-label={`${trip.name} 예산 사용률`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={trip.progress}><span style={{ width: `${trip.progress}%` }} /></div>
        <Link to={PATHS.trip(trip.id)} className="trip-card__link">여행 자세히 보기 <ArrowUpRight size={17} /></Link>
      </div>
    </Card>
  );
}

function ActivityIcon({ type }) {
  if (type === 'calendar') return <CalendarDays size={19} />;
  if (type === 'users') return <UsersRound size={19} />;
  return <Receipt size={19} />;
}

export default function DashboardPage() {
  const { demoName } = useDemo();

  return (
    <div className="dashboard">
      <div className="dashboard__welcome">
        <PageHeader
          eyebrow="YOUR TRAVEL WORKSPACE"
          title={<>반가워요, {demoName || '여행자'}님 <span className="wave-emoji" aria-hidden="true">👋</span></>}
          description="모든 여행의 시작부터 마지막 정산까지, 함께 준비해요."
          action={<Button to={PATHS.trips} icon={Plus}>새 여행 만들기</Button>}
        />
      </div>

      <div className="demo-banner" role="note"><span className="demo-banner__dot" /><strong>미리보기 화면</strong> 표시된 여행·금액·참가자는 예시 데이터이며, 실제 저장 또는 정산되지 않습니다.</div>

      <section className="hero-card" aria-labelledby="hero-title">
        <div className="hero-card__copy">
          <span className="hero-card__eyebrow"><Sparkles size={14} /> ALL YOUR TRIPS IN ONE PLACE</span>
          <h2 id="hero-title">좋은 여행은<br /><span>쉬운 준비</span>에서 시작돼요.</h2>
          <p>여행 일정과 공동 지출을 한곳에서 관리하고, 소중한 사람들과 여행에만 집중하세요.</p>
          <Button to={PATHS.trips} variant="white" icon={Compass}>내 여행 둘러보기 <ArrowRight size={16} /></Button>
        </div>
        <div className="hero-card__visual" aria-hidden="true">
          <div className="hero-orbit hero-orbit--one" /><div className="hero-orbit hero-orbit--two" />
          <div className="hero-plane"><Plane size={48} strokeWidth={1.5} /></div>
          <div className="hero-ticket">
            <div className="hero-ticket__top"><span>YOUR NEXT STOP</span><Sun size={17} /></div>
            <div className="hero-ticket__big">JEJU <span>✦</span></div>
            <div className="hero-ticket__line" />
            <div className="hero-ticket__bottom"><span>SEOUL <small>ICN</small></span><ArrowRight size={18}/><span>JEJU <small>CJU</small></span></div>
            <div className="hero-ticket__date">NOV 12 — NOV 15, 2026</div>
          </div>
          <div className="hero-check"><CheckCircle2 size={18} /> 여행 계획 준비 완료!</div>
        </div>
      </section>

      <section className="stats-grid" aria-label="데모 여행 현황">
        <Card className="stat-card"><div className="stat-card__icon stat-card__icon--mint"><Compass size={23} /></div><div><span>준비 중인 여행</span><strong>02 <small>개</small></strong><p>다가올 설레는 여행들</p></div></Card>
        <Card className="stat-card"><div className="stat-card__icon stat-card__icon--lavender"><UsersRound size={23} /></div><div><span>함께하는 친구들</span><strong>07 <small>명</small></strong><p>여행별 참가자 수 합계</p></div></Card>
        <Card className="stat-card"><div className="stat-card__icon stat-card__icon--peach"><CircleDollarSign size={23} /></div><div><span>기록된 여행 경비</span><strong>{formatWon(demoTrips.reduce((sum, trip) => sum + trip.spent, 0))}</strong><p>예시 지출 합계</p></div></Card>
      </section>

      <section className="dashboard-section" aria-labelledby="quick-actions-title">
        <div className="section-heading"><div><p className="eyebrow">SHORTCUTS</p><h2 id="quick-actions-title">빠른 시작 <span aria-hidden="true">⚡</span></h2><p>필요한 기능으로 바로 이동하세요.</p></div></div>
        <div className="quick-grid">
          {quickActions.map(({ title, detail, icon: Icon, tone, to }) => (
            <Link to={to} className="quick-card" key={title}>
              <span className={`quick-card__icon quick-card__icon--${tone}`}><Icon size={23} strokeWidth={1.8} /></span>
              <strong>{title}</strong><small>{detail}</small>
              <span className="quick-card__arrow"><ArrowUpRight size={17} /></span>
            </Link>
          ))}
        </div>
      </section>

      <section className="dashboard-section" aria-labelledby="upcoming-title">
        <div className="section-heading section-heading--row"><div><p className="eyebrow">UPCOMING TRIPS</p><h2 id="upcoming-title">다가오는 여행 <span aria-hidden="true">🧳</span></h2><p>함께 준비하고 있는 여행을 확인해 보세요.</p></div><Link to={PATHS.trips} className="section-heading__link">모든 여행 보기 <ArrowRight size={17} /></Link></div>
        <div className="trip-grid">{demoTrips.map((trip) => <TripCard key={trip.id} trip={trip} />)}</div>
      </section>

      <section className="dashboard-bottom" aria-label="최근 활동과 안내">
        <Card className="activity-card">
          <div className="bottom-heading"><div><p className="eyebrow">RECENT ACTIVITY</p><h2>최근 활동 <span className="activity-card__demo">예시</span></h2></div><span className="bottom-heading__icon"><ChevronRight size={20} /></span></div>
          <div className="activity-list">
            {demoActivity.map((activity) => <div className="activity" key={activity.id}><span className={`activity__icon activity__icon--${activity.color}`}><ActivityIcon type={activity.icon} /></span><span className="activity__text"><strong>{activity.title}</strong><small>{activity.description}</small></span><span className="activity__value">{activity.value}</span></div>)}
          </div>
        </Card>
        <div className="tip-card">
          <span className="tip-card__icon"><Sparkles size={22} /></span>
          <span className="tip-card__overline">N-TRIP TIP</span>
          <h2>여행 끝, 정산 걱정도 끝!</h2>
          <p>누가 얼마나 썼는지 기록하고, 자동 정산 기능을 연결하면 더욱 편리해져요.</p>
          <Link to={PATHS.settlement(DEMO_TRIP_ID)}>정산 메뉴 보기 <ArrowRight size={17} /></Link>
          <span className="tip-card__deco" aria-hidden="true">✳</span>
        </div>
      </section>
    </div>
  );
}
