import { useParams, Link } from 'react-router-dom';
import { CalendarDays, MapPin, Receipt, ArrowLeftRight, ChartNoAxesColumn, Compass, UsersRound, ArrowLeft, ArrowRight, Wrench } from 'lucide-react';
import Badge from '../components/ui/Badge.jsx';
import PageHeader from '../components/ui/PageHeader.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import { DEMO_TRIP_ID, PATHS } from '../routes/paths.js';

/** Integration slots for team-owned pages. Replace route elements in App.jsx as PRs arrive. */
const features = {
  trips: { title: '내 여행', owner: '송유홍', icon: Compass, description: '여행 생성과 참가자 초대·관리 기능을 연결할 자리입니다.' },
  trip: { title: '여행 상세', owner: '송유홍', icon: UsersRound, description: '여행 상세 정보 및 참가자 관리 기능을 연결할 자리입니다.' },
  schedule: { title: '일정 관리', owner: '송유홍', icon: CalendarDays, description: '여행 일정 등록·수정·삭제 및 캘린더 화면을 연결할 자리입니다.' },
  places: { title: '장소 / 지도', owner: '최필립', icon: MapPin, description: '여행 장소 검색·지도·날씨·환율 화면을 연결할 자리입니다.' },
  expenses: { title: '지출 내역', owner: '양윤정', icon: Receipt, description: '지출 등록·수정·삭제 및 참가자별 비용 분배를 연결할 자리입니다.' },
  settlement: { title: '자동 정산', owner: '양윤정', icon: ArrowLeftRight, description: '정산 계산과 송금 관계 최소화 알고리즘을 연결할 자리입니다.' },
  statistics: { title: '여행 통계', owner: '진미주', icon: ChartNoAxesColumn, description: '개인별·카테고리별 지출 통계와 차트를 연결할 자리입니다.' },
};

export default function FeaturePlaceholderPage({ feature }) {
  const { tripId } = useParams();
  const definition = features[feature];
  const Icon = definition.icon;
  const isDemoTrip = !tripId || tripId === DEMO_TRIP_ID || tripId === 'demo-osaka';

  return (
    <div className="feature-page">
      <Link to={PATHS.dashboard} className="feature-page__back"><ArrowLeft size={16} /> 대시보드로 돌아가기</Link>
      <PageHeader eyebrow="FEATURE INTEGRATION" title={definition.title} description={definition.description} />
      <div className="feature-panel">
        <div className="feature-panel__header"><Badge tone="sand">팀원 기능 연결 대기</Badge><span><Wrench size={15} /> 담당: {definition.owner}</span></div>
        <EmptyState icon={Icon} title="이 페이지는 아직 준비 중이에요" description="공통 레이아웃과 경로는 구성되었습니다. 담당 팀원의 컴포넌트가 완성되면 이 화면을 교체합니다." action="대시보드로 돌아가기" to={PATHS.dashboard} />
        {!isDemoTrip && <p className="feature-panel__note">현재 입력한 여행 ID는 실제 서버에서 확인하지 않았습니다. 백엔드 연결 후 존재 여부를 검증해야 합니다.</p>}
      </div>
      <div className="feature-page__helper"><strong>프론트엔드 통합 안내</strong><p>담당 팀원은 <code>src/App.jsx</code>의 해당 라우트에 컴포넌트를 등록하고, <code>src/components/ui/</code>의 공통 UI와 <code>src/routes/paths.js</code>의 경로를 사용해 주세요.</p><Link to={PATHS.schedule(DEMO_TRIP_ID)}>일정 관리 경로 확인 <ArrowRight size={15} /></Link></div>
    </div>
  );
}
