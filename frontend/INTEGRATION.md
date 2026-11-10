# N-Trip 프론트엔드 연동 가이드

이 프로젝트는 **하나의 React SPA**를 모든 팀원이 공유합니다. 각 기능의 담당자는
자신의 `features/` 컴포넌트와 서비스 코드를 작성한 후, 장현규가 관리하는 공통
레이아웃에 연결합니다.

## 1. 저장소 구조

```text
frontend/
├── index.html
├── package.json
├── vite.config.js
├── .env.example
├── src/
│   ├── main.jsx                      # Router / Provider
│   ├── App.jsx                       # 전체 라우트 정의
│   ├── styles.css                    # 공통 스타일 · 반응형
│   ├── routes/paths.js               # URL 경로 함수
│   ├── components/ui/                 # 공통 UI 컴포넌트
│   ├── components/layout/             # 공통 네비게이션 / 레이아웃
│   ├── contexts/DemoContext.jsx      # *실제 인증이 아닌* 데모 모드
│   ├── features/auth/                 # 로그인 / 회원가입 UI
│   ├── features/dashboard/            # 대시보드
│   ├── pages/                         # 404 및 임시 연결 화면
│   ├── data/demo.js                   # 샘플 여행 데이터
│   ├── services/                      # API 호출 경계
│   └── utils/                         # 공통 유틸
└── tests/                             # Node.js 유닛 테스트
```

## 2. 기능 담당자별 연결 지점

| 기능 | 담당 | URL | 예시 컴포넌트 위치 |
|---|---|---|---|
| 여행 목록 및 생성 | 송유홍 | `/trips` | `features/trips/TripsPage.jsx` |
| 여행 상세/참가자 | 송유홍 | `/trips/:tripId` | `features/trips/TripDetailPage.jsx` |
| 일정/캘린더 | 송유홍 | `/trips/:tripId/schedule` | `features/schedule/SchedulePage.jsx` |
| 지도/장소 | 최필립 | `/trips/:tripId/places` | `features/places/PlacesPage.jsx` |
| 지출 관리 | 양윤정 | `/trips/:tripId/expenses` | `features/expenses/ExpensesPage.jsx` |
| 자동 정산 | 양윤정 | `/trips/:tripId/settlement` | `features/settlement/SettlementPage.jsx` |
| 지출 통계 | 진미주 | `/trips/:tripId/statistics` | `features/statistics/StatisticsPage.jsx` |

`src/routes/paths.js`를 사용해 링크를 생성하세요. 다음 예처럼 `App.jsx`에서
임시 페이지를 실제 페이지로 바꾸면 공통 사이드바와 모바일 탭이 적용됩니다.

```jsx
// 예시이며 컴포넌트 파일은 담당 팀원이 작성합니다.
import SchedulePage from './features/schedule/SchedulePage.jsx';

<Route path="/trips/:tripId/schedule" element={<SchedulePage />} />
```

라우트 매개변수 `tripId`는 `useParams()`로 받을 수 있습니다. 예시 ID
`demo-jeju`와 `demo-osaka`는 실재하는 서버 레코드가 아닙니다.

## 3. 공통 컴포넌트 사용

```jsx
import Button from './components/ui/Button.jsx';
import Card from './components/ui/Card.jsx';

export default function Example() {
  return (
    <Card>
      <h2>여행 기능</h2>
      <Button to="/trips">내 여행으로</Button>
    </Card>
  );
}
```

공통 UI: `Button`, `Input`, `Card`, `Badge`, `EmptyState`, `PageHeader`.
기본 디자인 토큰은 `src/styles.css`의 `:root`에 정의되어 있습니다. 공통
`btn`, `card` 같은 클래스 이름을 재정의하지 말고 기능별 prefix를 붙이세요.

## 4. API 연결 시 반드시 합의할 사항

제안서에는 **인증 엔드포인트·데이터 형태·인증 방식·실제 API 주소가
정의되어 있지 않습니다**. 이를 임의로 확정해서 다른 코드에 박아 넣지 마세요.

- 로그인/회원가입 API 경로, 요청/응답 JSON
- 인증 방식(세션 쿠키/JWT), 토큰 처리와 만료 정책
- 공통 오류 형식과 HTTP 상태 코드
- 여행/참가자/일정/지출/통계 데이터 스키마
- 통화·금액 처리 방식(부동소수점 대신 정수 최소 단위 권장)
- CORS/환경변수 관리

`src/services/apiClient.js`는 공통 HTTP 요청 래퍼의 초기 버전입니다.
`src/services/authService.js`는 **연동 전 명시적 오류를 반환**합니다.
로그인/회원가입 화면을 눌러도 서버 데이터가 변경되거나 계정이 생성되지 않습니다.
`DemoContext`는 시연용으로 이름만 브라우저 `sessionStorage`에 저장하며,
절대로 사용자 인증을 대신하지 않습니다.

## 5. PR / 코드 리뷰 기준

1. `feature/기능명` 브랜치에서 기능을 개발합니다.
2. 공통 레이아웃·라우터·전역 CSS를 대규모로 수정할 경우 장현규에게 먼저 알립니다.
3. 기능별 PR을 작게 만듭니다. 백엔드가 없다면 mock과 TODO를 명확히 표시합니다.
4. `cd frontend && npm test && npm run build`가 통과해야 합니다.
5. 최소 한 명이 리뷰한 후 `main`에 병합합니다.
6. 페이지가 모바일/태블릿/PC에서 깨지지 않는지 확인합니다.

## 6. 현재 남은 일

- `npm install` 후 `package-lock.json` 생성 및 Git 추적
- `npm run build`와 실제 브라우저(모바일 포함) 실행 확인
- 백엔드 API 계약 확정 후 실제 인증 추가
- 데모 데이터를 실제 서버 응답으로 교체
- 각 팀원의 기능 PR 연결 및 최종 회귀 테스트
