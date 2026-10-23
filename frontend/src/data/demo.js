/**
 * Demonstration-only data. Do not pass these records to a production API.
 * Feature owners replace examples with data fetched from their own services.
 */
export const demoTrips = [
  {
    id: 'demo-jeju',
    name: '제주에서 보내는 가을',
    location: '대한민국 · 제주',
    dateLabel: '11월 12일 – 11월 15일',
    dateStart: '2026-11-12',
    dates: '3박 4일',
    participants: ['현', '유', '윤', '필'],
    count: 4,
    state: '다가오는 여행',
    visual: 'jeju',
    emoji: '🌴',
    budget: 1250000,
    spent: 785000,
    progress: 63,
  },
  {
    id: 'demo-osaka',
    name: '오사카 맛집 탐방',
    location: '일본 · 오사카',
    dateLabel: '12월 20일 – 12월 24일',
    dateStart: '2026-12-20',
    dates: '4박 5일',
    participants: ['현', '민', '서'],
    count: 3,
    state: '준비 중',
    visual: 'osaka',
    emoji: '🏯',
    budget: 980000,
    spent: 210000,
    progress: 21,
  },
];

export const demoActivity = [
  { id: 1, icon: 'receipt', title: '제주 여행 지출 기록', description: '식비 · 4명 참여', value: '₩68,000', color: 'peach' },
  { id: 2, icon: 'calendar', title: '제주 여행 일정', description: '일정 관리 기능 연결 예정', value: '11.12', color: 'mint' },
  { id: 3, icon: 'users', title: '오사카 여행 참가자', description: '참가자 관리 기능 연결 예정', value: '3명', color: 'lavender' },
];
