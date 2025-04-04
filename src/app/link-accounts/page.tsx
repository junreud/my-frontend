// src/app/link-accounts/page.tsx

import LogInNavbar from "@/components/LogInPage/LogInHeader";
import LinkAccountLoginBox from "@/components/LogInPage/LinkAccountsBox";

/**
 * Next.js 13 App Router 방식:
 * - `page.tsx` 컴포넌트는 (props: { searchParams: { [key: string]: string } }) 형식으로
 *   서버에서 쿼리 파라미터를 받을 수 있다.
 */
export default async function LoginPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | undefined>> | undefined;
}) {
  // searchParams가 Promise일 가능성이 있으므로 await 처리
  const resolvedSearchParams = (await searchParams) || {};
  const email = resolvedSearchParams.email || "";
  const googleSub = resolvedSearchParams.googleSub || "";

  console.log("[SSR] link-accounts page received email:", email);
  console.log("[SSR] link-accounts page received googleSub:", googleSub);

  return (
    <>
      <LogInNavbar />
      <div className="w-full max-w-md px-4">
        <LinkAccountLoginBox defaultEmail={email} />
      </div>
    </>
  );
}