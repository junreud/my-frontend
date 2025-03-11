// src/app/link-accounts/page.tsx

import LogInNavbar from "@/components/LogInPage/LogInHeader";
import LinkAccountLoginBox from "@/components/LogInPage/LinkAccountsBox";

/**
 * Next.js 13 App Router 방식:
 * - `page.tsx` 컴포넌트는 (props: { searchParams: { [key: string]: string } }) 형식으로
 *   서버에서 쿼리 파라미터를 받을 수 있다.
 */
export default function LoginPage({
  searchParams,
}: {
  searchParams?: { email?: string; googleSub?: string };
}) {
  // 서버 사이드에서 쿼리 파라미터 추출
  const email = searchParams?.email || "";
  const googleSub = searchParams?.googleSub || "";

  // 콘솔 찍으면 "서버 콘솔"에 보임 (Node.js 환경)
  console.log("[SSR] link-accounts page received email:", email);
  console.log("[SSR] link-accounts page received googleSub:", googleSub);

  // 여긴 서버 컴포넌트이므로, useSearchParams 같은 브라우저 Hook 사용 불가
  // 대신에 쿼리 파라미터를 props로 받아서 활용

  return (
    <>
      <LogInNavbar />
      <div className="w-full max-w-md px-4">

      <LinkAccountLoginBox defaultEmail={email} />
      </div>
    </>
  );
}