import { Compass } from 'lucide-react';
import Button from '../components/ui/Button.jsx';
import Brand from '../components/layout/Brand.jsx';
import { PATHS } from '../routes/paths.js';

export default function NotFoundPage() {
  return (
    <div className="not-found">
      <Brand />
      <div className="not-found__icon"><Compass size={47} strokeWidth={1.6} /></div>
      <p className="eyebrow">PAGE NOT FOUND</p>
      <h1>404</h1>
      <h2>길을 조금 잃었나 봐요.</h2>
      <p>요청하신 페이지를 찾을 수 없습니다. 다시 여행을 시작해 볼까요?</p>
      <Button to={PATHS.dashboard}>대시보드로 가기</Button>
    </div>
  );
}
