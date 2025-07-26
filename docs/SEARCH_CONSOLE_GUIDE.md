# 검색 콘솔 등록 가이드

## 0. 로컬 개발 환경에서 테스트하기 (Cloudflare Tunnel)

### Cloudflare Tunnel 설정
로컬 개발 환경에서 검색 콘솔을 테스트하려면 외부 접근 가능한 URL이 필요합니다.

#### 1단계: Cloudflared 설치 (처음 한 번만)
```bash
# macOS (Homebrew)
brew install cloudflared

# 또는 직접 다운로드
curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-darwin-amd64.tgz | tar -xzf -
```

#### 2단계: Next.js 애플리케이션 실행
```bash
# Next.js 개발 서버 실행
npm run dev
# 또는
yarn dev

# 기본적으로 http://localhost:3000 에서 실행됩니다
```

#### 3단계: Cloudflare Tunnel 실행

**방법 A: 임시 터널 (권장 - 간단함)**
```bash
# 새 터미널에서 실행 (my-frontend 폴더에서)
cd ~/Projects/my-frontend
npm run dev  # 먼저 Next.js 실행

# 다른 터미널에서
cloudflared tunnel --url http://localhost:3000

# 또는 npx 사용 (설치 없이)
npx cloudflared tunnel --url http://localhost:3000
```

**방법 B: Named 터널 (복잡함 - 고급 사용자용)**
```bash
# ⚠️ 주의: Named 터널은 추가 설정이 필요합니다!

# 1. Cloudflare 로그인 (처음 한 번만)
cloudflared tunnel login

# 2. 터널 생성 (처음 한 번만)
cloudflared tunnel create wiz25

# 3. DNS 설정 (Cloudflare 대시보드에서 CNAME 레코드 추가 필요)
# 4. 설정 파일 생성 (~/.cloudflared/config.yml)
# 5. 터널 실행
cloudflared tunnel run wiz25
```

> **⚠️ Named 터널 오류 해결:**
> - `tunnel credentials` 오류: origin certificate가 필요합니다
> - `cloudflared tunnel login` 명령으로 먼저 인증하세요
> - DNS 설정과 config.yml 파일 생성이 필요합니다
> - **로컬 테스트에는 방법 A (Quick 터널)를 권장합니다**

**문제 해결:**
- `Error 1033`: 터널은 생성되었지만 Next.js 앱이 실행되지 않았을 때 발생
- 해결 방법: `npm run dev`로 Next.js 앱을 먼저 실행한 후 터널 실행

#### 4단계: 생성된 URL 확인
터미널에서 다음과 같은 메시지가 나타납니다:
```
2024-07-17T12:00:00Z INF Thank you for trying Cloudflare Tunnel. Doing so, without a Cloudflare account, is a quick way to...
2024-07-17T12:00:00Z INF Your quick Tunnel: https://abc123.trycloudflare.com
2024-07-17T12:00:00Z INF It may take a minute or two before your tunnel is accessible.
```

### 임시 도메인으로 테스트
1. **생성된 URL 사용**: `https://abc123.trycloudflare.com`
2. **브라우저에서 접속 확인**: 로컬 Next.js 앱이 외부에서 접근 가능한지 확인
3. **검색 콘솔 등록**: 이 URL로 Google Search Console과 네이버 서치어드바이저에 등록
4. **인증 파일 확인**: 
   - `https://abc123.trycloudflare.com/google-verification.html`
   - `https://abc123.trycloudflare.com/naver-verification.html`

### 주의사항
- 🔄 **URL 변경**: 터널을 재시작할 때마다 URL이 바뀝니다
- ⏰ **임시 사용**: 개발/테스트 목적으로만 사용하세요
- 🚀 **배포 시**: 실제 도메인으로 다시 등록해야 합니다
- 🔒 **보안**: 민감한 정보는 터널로 노출하지 마세요

## 1. Google Search Console 등록

### 1단계: Google Search Console 접속
1. https://search.google.com/search-console 접속
2. Google 계정으로 로그인

### 2단계: 속성 추가
1. "속성 추가" 클릭
2. "URL 접두어" 선택
3. `https://lakabe.com` 입력

### 3단계: 소유권 확인
다음 중 하나의 방법 선택:

#### 방법 1: HTML 파일 업로드
1. Google에서 제공하는 HTML 파일 다운로드
2. `public/` 폴더에 업로드
3. 브라우저에서 접근 가능한지 확인

#### 방법 2: 메타 태그 추가
1. Google에서 제공하는 메타 태그 복사
2. `src/app/layout.tsx`의 metadata에 추가:
```typescript
verification: {
  google: "YOUR_GOOGLE_VERIFICATION_CODE",
}
```

#### 방법 3: DNS 레코드 추가
1. 도메인 관리자에서 TXT 레코드 추가
2. Google에서 제공하는 값 입력

### 4단계: 사이트맵 제출
1. "사이트맵" 메뉴 클릭
2. `https://lakabe.com/sitemap.xml` 입력
3. "제출" 클릭

## 2. 네이버 서치어드바이저 등록

### 1단계: 네이버 서치어드바이저 접속
1. https://searchadvisor.naver.com 접속
2. 네이버 계정으로 로그인

### 2단계: 사이트 등록
1. "웹마스터 도구" 클릭
2. "사이트 등록" 클릭
3. `https://lakabe.com` 입력

### 3단계: 사이트 소유 확인
다음 중 하나의 방법 선택:

#### 방법 1: HTML 파일 업로드
1. 네이버에서 제공하는 HTML 파일 다운로드
2. `public/` 폴더에 업로드

#### 방법 2: 메타 태그 추가
1. 네이버에서 제공하는 메타 태그 복사
2. `src/app/layout.tsx`의 metadata에 추가:
```typescript
verification: {
  other: {
    "naver-site-verification": "YOUR_NAVER_VERIFICATION_CODE",
  },
}
```

### 4단계: 사이트맵 제출
1. "사이트맵 제출" 클릭
2. `https://lakabe.com/sitemap.xml` 입력
3. "확인" 클릭

## 3. 추가 설정

### RSS 피드 제출 (네이버)
1. "RSS 제출" 클릭
2. `https://lakabe.com/rss.xml` 입력

### 로봇룰 확인
1. "로봇룰 검증" 클릭
2. `https://lakabe.com/robots.txt` 입력

### 수집 요청
1. "웹 페이지 수집" 클릭
2. 주요 페이지 URL 입력하여 수집 요청

## 4. 모니터링 설정

### Google Search Console 대시보드 확인 항목
- 검색 결과 성능
- 색인 생성 상태
- 모바일 사용성
- 페이지 경험
- 사이트맵 처리 상태

### 네이버 서치어드바이저 대시보드 확인 항목
- 검색 노출 현황
- 키워드 순위
- 사이트맵 처리 상태
- 수집 현황

## 5. 주의사항

1. **인증 파일 보안**: 인증 파일은 삭제하지 말고 계속 유지
2. **사이트맵 업데이트**: 새로운 페이지 추가 시 사이트맵 자동 업데이트 확인
3. **정기 모니터링**: 주 1회 이상 검색 콘솔 상태 확인
4. **에러 처리**: 색인 생성 오류 발생 시 즉시 수정
