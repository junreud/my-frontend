// app/add-info/page.tsx or pages/add-info.js
"use client";

import LogInHeader from '@/components/LogInPage/LogInHeader';
import AddInfoForm from '@/components/LogInPage/AddInfoForm';

export default function AddInfo() {
  return (
    <>
        <LogInHeader />
        <AddInfoForm />
    </>
  );
}
