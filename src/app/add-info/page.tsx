"use client";

import { Suspense } from 'react';
import LogInHeader from '@/components/LogInPage/LogInHeader';
import AddInfoForm from '@/components/LogInPage/AddInfoForm';

export default function AddInfo() {
  return (
    <>
        <LogInHeader />
        <Suspense fallback={<div>로딩 중...</div>}>
            <AddInfoForm />
        </Suspense>
    </>
  );
}