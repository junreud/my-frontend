# Marketing Keyword Dashboard

## 🎯 프로젝트 개요

marketing-keyword-dashboard는 **로컬 비즈니스의 검색 순위 추적 및 SEO 최적화**를 위한 종합 마케팅 대시보드입니다. 네이버, 구글 등 주요 검색 플랫폼에서의 키워드 순위를 실시간 모니터링하고, 효과적인 SEO 전략 수립을 도와줍니다.

## 🚀 핵심 기능

### 📊 키워드 관리 및 분석
- **실시간 순위 추적**: 네이버, 구글 등 주요 검색엔진에서의 키워드 순위 실시간 모니터링
- **AI 키워드 생성**: ChatGPT 기반 스마트 키워드 추천 시스템
- **순위 변화 알림**: 키워드 순위 변동 시 즉시 알림
- **키워드 히스토리**: 시간별/일별/월별 순위 변화 추이 분석

### 🏢 비즈니스 관리
- **업체 정보 관리**: 다중 비즈니스 계정 통합 관리
- **지역별 분석**: 지역 기반 검색 결과 분석
- **경쟁사 모니터링**: 동일 키워드 경쟁업체 순위 추적

### 📈 SEO 최적화
- **SEO 분석 리포트**: 웹사이트 SEO 점수 및 개선 사항 제안
- **검색량 분석**: 키워드별 월간 검색량 데이터
- **콘텐츠 최적화**: SEO 친화적 콘텐츠 작성 가이드

### 📱 사용자 경험
- **반응형 디자인**: 모바일, 태블릿, 데스크톱 최적화
- **실시간 대시보드**: 직관적인 차트 및 그래프
- **커스터마이징**: 개인화된 대시보드 레이아웃

## 🛠 기술 스택

### Frontend Framework
- **Next.js 15.1.6**: React 기반 풀스택 프레임워크
- **React 19**: 최신 React 기능 활용
- **TypeScript**: 타입 안정성 보장

### UI/UX Library
- **Tailwind CSS**: 유틸리티 기반 CSS 프레임워크
- **Radix UI**: 접근성 최적화 컴포넌트 라이브러리
- **Framer Motion**: 부드러운 애니메이션 구현
- **Lucide React**: 아이콘 라이브러리

### 데이터 시각화
- **Chart.js & React-Chartjs-2**: 차트 및 그래프
- **FullCalendar**: 일정 관리 기능
- **React DnD**: 드래그 앤 드롭 인터페이스

### 데스크톱 앱
- **Electron 38.1.0**: 크로스 플랫폼 데스크톱 앱 지원

## 📁 폴더 구조

```
my-frontend/
├── src/
│   ├── components/           # 재사용 가능한 UI 컴포넌트
│   │   ├── ui/              # 기본 UI 컴포넌트 (Button, Input 등)
│   │   ├── dashboard/       # 대시보드 관련 컴포넌트
│   │   ├── keywords/        # 키워드 관리 컴포넌트
│   │   └── seo/            # SEO 분석 컴포넌트
│   ├── pages/              # Next.js 페이지
│   │   ├── api/            # API 라우트
│   │   ├── dashboard/      # 대시보드 페이지
│   │   └── keywords/       # 키워드 관리 페이지
│   ├── lib/                # 유틸리티 및 설정
│   │   ├── api.ts          # API 클라이언트
│   │   ├── auth.ts         # 인증 로직
│   │   └── utils.ts        # 공통 유틸리티
│   ├── hooks/              # 커스텀 React 훅
│   ├── styles/             # 전역 스타일
│   └── types/              # TypeScript 타입 정의
├── public/                 # 정적 파일
├── electron/               # Electron 메인 프로세스
│   └── main.js            # Electron 앱 진입점
└── docs/                  # 프로젝트 문서
```

## 🔧 개발 환경 설정

### 필수 요구사항
- Node.js 18+ 
- npm 또는 yarn
- Git

### 설치 및 실행

```bash
# 저장소 클론
git clone [repository-url]
cd my-frontend

# 의존성 설치
npm install

# 개발 서버 실행 (HTTPS)
npm run dev

# 프로덕션 빌드
npm run build

# 데스크톱 앱 빌드
npm run electron:build
```

### 환경 변수 설정
`.env.local` 파일을 생성하고 다음 변수들을 설정하세요:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_ENV=development
```

## 📱 데스크톱 앱

### 지원 플랫폼
- **macOS**: Apple Silicon 및 Intel 프로세서
- **Windows**: Windows 10/11 (64-bit)
- **Linux**: Ubuntu, Debian, CentOS 등

### 빌드 명령어
```bash
# 개발용 Electron 실행
npm run electron:dev

# 프로덕션 빌드
npm run electron:build

# 플랫폼별 빌드
npm run electron:build:mac
npm run electron:build:win
npm run electron:build:linux
```

## 🔐 보안 및 인증

- **JWT 기반 인증**: 안전한 사용자 세션 관리
- **OAuth 지원**: Google, 네이버 소셜 로그인
- **HTTPS 강제**: 모든 통신 암호화
- **CORS 설정**: 크로스 오리진 요청 보안

## 🤝 기여하기

1. 이 저장소를 포크합니다
2. 새 기능 브랜치를 생성합니다 (`git checkout -b feature/amazing-feature`)
3. 변경사항을 커밋합니다 (`git commit -m 'Add amazing feature'`)
4. 브랜치에 푸시합니다 (`git push origin feature/amazing-feature`)
5. Pull Request를 생성합니다

## 📞 지원 및 문의

프로젝트 관련 문의사항이나 버그 리포트는 GitHub Issues를 통해 제출해 주세요.

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 `LICENSE` 파일을 참조하세요.

---

**Marketing Keyword Dashboard**는 디지털 마케팅 효율성을 극대화하고 검색 엔진 최적화를 통한 비즈니스 성장을 지원합니다.