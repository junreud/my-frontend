"use client";

import React from "react";
import LogInNavbar from "@/components/LogInPage/LogInHeader";
import LinkAccountLoginBox  from "@/components/LogInPage/LinkAccountsBox";
import { useSearchParams } from "next/navigation";

export default function LoginPage() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const googleSub = searchParams.get("googleSub") || "";


  // 이 부분에서 콘솔로 확인
  console.log("link-accounts page received email:", email);
  console.log("link-accounts page received googleSub:", googleSub);

  return (
    <>
      <LogInNavbar />
      <LinkAccountLoginBox defaultEmail={email}/>
    </>
  );
}
