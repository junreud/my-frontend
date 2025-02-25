// app/add-info/page.tsx or pages/add-info.js
"use client";

import LogInHeader from '@/components/LogInPage/LogInHeader';
import SocialAddInfoForm from '@/components/LogInPage/SocialAddInfoForm';

export default function SocialAddInfo() {
  return (
    <>
        <LogInHeader />
        <SocialAddInfoForm />
    </>
  );
}
