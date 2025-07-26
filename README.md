This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

### 환경 설정

1. 환경 변수 파일 복사:
```bash
cp .env.local.example .env.local
```

2. 필요에 따라 `.env.local`에서 포트 설정을 수정하세요:
```bash
NEXT_PUBLIC_FRONTEND_PORT=3000  # 프론트엔드 포트
NEXT_PUBLIC_BACKEND_PORT=4000   # 백엔드 포트
```

### 서버 실행

기본 포트로 실행:
```bash
npm run dev
# 또는
node server.js
```

사용자 정의 포트로 실행:
```bash
# 포트 8080으로 실행
node server.js -p 8080
# 또는
node server.js --port=8080
# 또는 환경변수 사용
PORT=8080 node server.js
```

Open [https://localhost:3000](https://localhost:3000) with your browser to see the result (기본 포트 사용 시).

### 포트 설정 옵션

1. **명령어 인자**: `node server.js -p 8080` (최우선)
2. **환경 변수**: `PORT=8080 node server.js` 
3. **기본값**: `3000`

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

