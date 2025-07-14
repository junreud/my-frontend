# 검색 콘솔 등록 가이드

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
