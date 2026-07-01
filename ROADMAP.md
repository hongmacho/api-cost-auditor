# API 비용 분석 플랫폼 - ROADMAP

## 개요
6주 Sprint 기반 개발 계획. Sprint별 완료기준, DB 스키마, 컴포넌트 구조를 명시.

---

## Sprint 0: 프로젝트 초기화 (1주)

### 목표
- Next.js 15 프로젝트 생성 및 의존성 설치
- Drizzle ORM + SQLite 설정
- 디렉토리 구조 정렬
- TypeScript 및 ESLint 설정

### 완료 기준
- [ ] Next.js 앱 생성 (`create-next-app`)
- [ ] Drizzle ORM + better-sqlite3 설치
- [ ] DB 스키마 정의 (8개 테이블)
- [ ] Seed 데이터 작성 (테스트용)
- [ ] TypeScript `tsc --noEmit` 0 에러
- [ ] ESLint `npm run lint` 0 에러

### DB 스키마
```sql
-- Users 테이블
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  currency TEXT DEFAULT 'USD',
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- APIs 테이블
CREATE TABLE apis (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  name TEXT NOT NULL,
  provider TEXT NOT NULL,
  monthlyBudget REAL,
  status TEXT DEFAULT 'active',
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id)
);

-- APICosts 테이블
CREATE TABLE api_costs (
  id TEXT PRIMARY KEY,
  apiId TEXT NOT NULL,
  month TEXT NOT NULL,
  cost REAL NOT NULL,
  usage INTEGER,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (apiId) REFERENCES apis(id)
);

-- Teams 테이블
CREATE TABLE teams (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  name TEXT NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id)
);

-- TeamAPIs 테이블
CREATE TABLE team_apis (
  id TEXT PRIMARY KEY,
  teamId TEXT NOT NULL,
  apiId TEXT NOT NULL,
  allocatedBudget REAL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (teamId) REFERENCES teams(id),
  FOREIGN KEY (apiId) REFERENCES apis(id)
);

-- Alerts 테이블
CREATE TABLE alerts (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  type TEXT NOT NULL,
  threshold REAL,
  channel TEXT DEFAULT 'in-app',
  isActive BOOLEAN DEFAULT true,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id)
);

-- AlertHistories 테이블
CREATE TABLE alert_histories (
  id TEXT PRIMARY KEY,
  alertId TEXT NOT NULL,
  triggerDate DATETIME NOT NULL,
  message TEXT,
  status TEXT DEFAULT 'sent',
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (alertId) REFERENCES alerts(id)
);
```

### 컴포넌트 구조
```
src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx (대시보드)
│   ├── dashboard/
│   │   └── page.tsx
│   ├── apis/
│   │   ├── page.tsx (목록)
│   │   └── [id]/
│   │       └── page.tsx (상세)
│   ├── teams/
│   │   └── page.tsx
│   ├── alerts/
│   │   └── page.tsx
│   ├── settings/
│   │   └── page.tsx
│   └── api/
│       ├── apis/
│       ├── teams/
│       └── alerts/
├── components/
│   ├── ui/
│   ├── layout/
│   ├── dashboard/
│   └── common/
├── lib/
│   ├── db.ts
│   └── utils.ts
├── db/
│   ├── schema.ts
│   └── seed.ts
└── types/
    └── index.ts
```

---

## Sprint 1: 기본 UI & 데이터 모델 (1주)

### 목표
- shadcn/ui 설치 및 레이아웃 구성
- 모든 페이지 뼈대 작성
- Repository 패턴 구현
- Seed 데이터로 기본 기능 테스트

### 완료 기준
- [ ] shadcn/ui 설치 (Button, Card, Input, Select 등 기본 컴포넌트)
- [ ] 레이아웃 컴포넌트 (Header, Sidebar, Footer)
- [ ] 6개 페이지 스켈레톤 작성
- [ ] 한국어 UI 텍스트 100% 적용
- [ ] Repository 패턴 (UserRepository, APIRepository 등)
- [ ] API 라우트 스켈레톤 (GET /api/apis, POST /api/apis 등)

### 핵심 컴포넌트
- `<Header />` - 상단 네비게이션
- `<Sidebar />` - 좌측 메뉴 (Dashboard, APIs, Teams, Alerts, Settings)
- `<Card />` - 통계 카드 (총 비용, 월간 변화 등)
- `<Table />` - API 목록 테이블
- `<Chart />` - 비용 차트 (바, 라인, 파이)

### 디렉토리 추가
```
src/
├── repositories/
│   ├── userRepository.ts
│   ├── apiRepository.ts
│   ├── costRepository.ts
│   ├── teamRepository.ts
│   └── alertRepository.ts
└── services/
    └── costService.ts
```

---

## Sprint 2: 대시보드 & 통계 (1주)

### 목표
- 대시보드 화면 완성
- 비용 통계 계산 로직
- 차트 렌더링 (Recharts 사용)
- 로딩 및 에러 상태 처리

### 완료 기준
- [ ] 대시보드 페이지 완성
  - 월간 총 비용 (큰 숫자)
  - 월간 변화율 (지난달 대비)
  - 상위 5개 API 바 차트
  - 월간 추세 라인 차트
  - 팀별 비용 분포 파이 차트
- [ ] Recharts 통합
- [ ] 로딩 상태 (스켈레톤)
- [ ] 에러 상태 (에러 메시지 표시)
- [ ] 빈 상태 (API 데이터 없을 때)

### 핵심 함수
- `calculateMonthlyCost()` - 특정 월 총 비용
- `calculateCostTrend()` - 지난 3개월 추세
- `getTop5APIs()` - 비용 상위 5개 API
- `getTeamCostDistribution()` - 팀별 비용 분포

### 의존성
- `recharts` - 차트 라이브러리

---

## Sprint 3: API 목록 & 검색/필터 (1주)

### 목표
- API 목록 페이지 완성
- 검색 기능
- 필터링 기능 (비용 범위, 상태)
- 정렬 기능 (비용, 사용량)

### 완료 기준
- [ ] API 목록 테이블 렌더링
- [ ] 검색 입력 (API 이름)
- [ ] 필터 드롭다운
  - 상태 (활성, 비활성)
  - 비용 범위 (0-100, 100-1000 등)
- [ ] 정렬 기능 (비용 높은 순, 사용량)
- [ ] 페이지네이션 (20개씩)
- [ ] 행 클릭 → 상세 페이지 이동

### 핵심 함수
- `searchAPIs(query: string)` - API 이름 검색
- `filterAPIs(filters)` - 필터 적용
- `sortAPIs(sortBy)` - 정렬
- `getAPIPaginated()` - 페이지네이션

---

## Sprint 4: API 상세 & 팀별 분석 (1주)

### 목표
- API 상세 페이지 완성
- 팀별 분석 페이지 완성
- API-팀 관계 설정
- 태그/라벨 관리

### 완료 기준
- [ ] API 상세 페이지
  - 기본 정보 (이름, 제공자)
  - 3개월 비용 기록
  - 월별 비용 그래프
  - 월별 사용량
  - 다음 월 예측 비용
  - 팀별 비용 분배 테이블
  - 태그 관리 (팀/프로젝트 라벨)
- [ ] 팀별 분석 페이지
  - 팀 리스트
  - 팀별 월간 비용
  - 팀별 비용 파이 차트
  - 팀이 사용하는 API 목록
- [ ] 태그 CRUD 기능

### 핵심 함수
- `getAPIDetail(apiId)` - API 상세 조회
- `predictNextMonthCost(apiId)` - 다음 월 비용 예측
- `allocateCostByTeam(apiId)` - 팀별 비용 분배
- `getTeamDetail(teamId)` - 팀별 상세 정보

---

## Sprint 5: 알림 & 설정 (1주)

### 목표
- 알림 기능 구현
- 사용자 설정 페이지
- 임계값 설정
- 비용 이상 감지 로직

### 완료 기준
- [ ] 알림 설정 페이지
  - 임계값 설정 (월간 총 비용, API별 비용)
  - 알림 채널 선택 (이메일, 인앱)
  - 알림 빈도 설정
  - 활성/비활성 토글
- [ ] 설정 페이지
  - 사용자 프로필 (이름, 이메일)
  - 통화 선택
  - API 키 관리
- [ ] 알림 이력 페이지
- [ ] 비용 이상 감지 로직
  - 임계값 초과 감지
  - 이상 징후 알림

### 핵심 함수
- `createAlert(alertData)` - 알림 생성
- `detectAnomalies()` - 비용 이상 감지
- `sendAlert(alertId)` - 알림 전송
- `getAlertHistory()` - 알림 이력

---

## Sprint 6: QA & 최종 마무리 (1주)

### 목표
- 전체 기능 테스트
- 버그 수정
- 성능 최적화
- 문서화 및 배포

### 완료 기준
- [ ] TypeScript 타입 체크 0 에러
- [ ] ESLint 0 에러
- [ ] 빌드 성공 (`npm run build`)
- [ ] 한국어 UI 100% 검증
- [ ] 반응형 디자인 검증 (Desktop, Tablet, Mobile)
- [ ] 모든 화면 스크린샷
- [ ] README.md 작성
- [ ] GitHub 리포지토리 생성 및 push

### QA 체크리스트
- [ ] 대시보드 통계 정확성
- [ ] 검색/필터 작동
- [ ] 모든 페이지 렌더링
- [ ] 에러 처리 및 에러 메시지
- [ ] 로딩 상태 표시
- [ ] 빈 상태 표시
- [ ] API 응답 시간 < 2초
- [ ] 모바일 뷰 가독성

---

## 기술 결정사항

### Database
- **선택**: SQLite + Drizzle ORM
- **이유**: 로컬 개발 간단, 스타트업 규모 충분, 배포 간편

### UI Framework
- **선택**: shadcn/ui + Tailwind CSS
- **이유**: 한국어 커스터마이징 용이, 모던 디자인, 접근성 좋음

### 상태 관리
- **선택**: React Context API
- **이유**: 규모 작음, 외부 의존성 최소화

### 차트 라이브러리
- **선택**: Recharts
- **이유**: React 친화적, 한국어 지원, 커스터마이징 용이

### API 스타일
- **선택**: REST API
- **이유**: 간단하고 안정적

---

## 리스크 관리

| 리스크 | 영향 | 해결책 |
|--------|------|--------|
| SQLite 성능 제한 | 데이터 많아질 경우 느려짐 | PostgreSQL 마이그레이션 계획 |
| 비용 계산 로직 복잡 | 부정확한 통계 | 테스트 케이스 충분히 작성 |
| API 연동 복잡 | 개발 지연 | Mock 데이터로 먼저 개발 |
| 한국어 UI 누락 | 사용자 만족도 저하 | 스프린트별 검증 체크리스트 |

---

## 의존성 & 외부 라이브러리

```json
{
  "dependencies": {
    "next": "^15.x",
    "react": "^18.x",
    "react-dom": "^18.x",
    "typescript": "^5.x",
    "tailwindcss": "^3.x",
    "drizzle-orm": "^0.x",
    "better-sqlite3": "^9.x",
    "recharts": "^2.x",
    "lucide-react": "^0.x"
  },
  "devDependencies": {
    "@types/node": "^20.x",
    "@types/react": "^18.x",
    "eslint": "^8.x",
    "shadcn-ui": "latest"
  }
}
```

---

**최종 배포일**: Sprint 6 완료 후 (약 6주)  
**상태**: 개발 준비 완료
