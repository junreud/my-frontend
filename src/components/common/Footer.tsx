// components/Footer.jsx
"use client";
import React, { useState } from "react";
import { Dialog, Transition } from "@headlessui/react";

// 약관 내용이 담긴 파일(예: serviceTerm.ts, privacyTerm.ts 등)에서 가져옵니다.
// 실제 경로와 export 이름은 프로젝트 구조에 맞게 변경하세요.
import { SERVICE_TERM_TEXT } from "@/app/terms/serviceTerm";
import { PRIVACY_TERM_TEXT } from "@/app/terms/privacyTerm";
import { AUTH_TERM_TEXT } from "@/app/terms/authTerm";
import { THIRD_PARTY_TERM_TEXT } from "@/app/terms/thirdPartyTerm";
import { MARKETING_TERM_TEXT } from "@/app/terms/marketingTerm";

export default function Footer() {
  
  const [dialogOpen, setDialogOpen] = useState<string | null>(null);

  const getDialogContent = () => {
    switch (dialogOpen) {
      case "serviceTerm":
        return { title: "서비스 이용약관", content: SERVICE_TERM_TEXT };
      case "privacyTerm":
        return { title: "개인정보 처리방침", content: PRIVACY_TERM_TEXT };
      case "authTerm":
        return { title: "본인인증 관련 동의", content: AUTH_TERM_TEXT };
      case "thirdPartyTerm":
        return { title: "개인정보 제3자 제공", content: THIRD_PARTY_TERM_TEXT };
      case "marketingTerm":
        return { title: "마케팅 정보 수신 동의", content: MARKETING_TERM_TEXT };
      default:
        return { title: "", content: "" };
    }
  };



  return (
    <footer className="bg-gray-50 text-gray-600 px-6 py-10">
      {/* 상단 4개 컬럼 섹션 */}
      <div className="max-w-screen-xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-8 text-sm">
        {/* 서비스 컬럼 */}
        <div>
          <h2 className="mb-4 font-semibold text-gray-800">서비스</h2>
          <ul className="space-y-2">
            <li><a className="hover:underline" href="/service">서비스 소개</a></li>
            <li><a className="hover:underline" href="/estimate">견적 문의</a></li>
            <li><a className="hover:underline" href="/blog">블로그</a></li>
          </ul>
        </div>

        {/* 회사 컬럼 */}
        <div>
          <h2 className="mb-4 font-semibold text-gray-800">회사</h2>
          <ul className="space-y-2">
            <li><a className="hover:underline" href="/about">About</a></li>
            <li><a className="hover:underline" href="/company-info">회사소개</a></li>
            <li><a className="hover:underline" href="/faq">자주 묻는 질문</a></li>
          </ul>
        </div>

        {/* 고객지원 컬럼 */}
        <div>
          <h2 className="mb-4 font-semibold text-gray-800">고객지원</h2>
          <ul className="space-y-2">
            <li><a className="hover:underline" href="/support">고객지원</a></li>
            <li><a className="hover:underline" href="/faq">FAQ</a></li>
            <li><a className="hover:underline" href="/estimate">견적 문의</a></li>
          </ul>
        </div>

        {/* 고객센터 컬럼 */}
        <div>
          <h2 className="mb-4 font-semibold text-gray-800">고객센터</h2>
          <ul className="space-y-2">
            <li>전화: 070-8064-1793</li>
            <li>이메일(대표): growthjun@gmail.com</li>
            <li>개인정보 보호 책임자: 김준석 (010-8079-0063)</li>
            <li><a className="hover:underline" href="/support">문의하기</a></li>
          </ul>
        </div>
      </div>

      {/* 구분선 */}
      <div className="max-w-screen-xl mx-auto mt-8 border-t border-gray-200" />

      {/* 하단 회사 정보 섹션 */}
      <div className="max-w-screen-xl mx-auto mt-6 text-xs text-gray-500 space-y-2">
        <p>
          <strong className="text-gray-700">㈜라카비</strong> | 사업자등록번호 : 218-20-44209 | 대표 : 오희태
        </p>
        <p>주소 : 서울특별시 관악구 은천로 25, 7층 b-2호 (봉천동, 정암빌딩)</p>
        <p>대표 연락처 : 070-8064-1793 | 대표 이메일 : growthjun@gmail.com</p>
        <p>개인정보 보호 책임자 : 김준석 / 대표이사 / 010-1223-5816</p>

        {/* 약관 링크 (모달 오픈) */}
        <div className="mt-4 flex flex-wrap gap-4 text-gray-600">
          <button
            onClick={() => setDialogOpen("serviceTerm")}
            className="underline hover:text-gray-800"
          >
            서비스 이용약관
          </button>
          <button
            onClick={() => setDialogOpen("privacyTerm")}
            className="underline hover:text-gray-800"
          >
            개인정보 처리방침
          </button>
          <button
            onClick={() => setDialogOpen("authTerm")}
            className="underline hover:text-gray-800"
          >
            본인인증 동의
          </button>
          <button
            onClick={() => setDialogOpen("thirdPartyTerm")}
            className="underline hover:text-gray-800"
          >
            개인정보 제3자 제공
          </button>
          <button
            onClick={() => setDialogOpen("marketingTerm")}
            className="underline hover:text-gray-800"
          >
            마케팅 정보 수신 동의
          </button>
        </div>

        <p className="mt-4">
          <a
            href="https://www.instagram.com/lakabe_ads"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mr-3 hover:underline"
          >
            인스타그램(@lakabe_ads)
          </a>
        </p>
        <p className="text-gray-400 mt-4">
          ⓒ 2025 LAKABE Corporation. All rights reserved.
        </p>
      </div>

      {/* 모달 */}
      <Transition appear show={dialogOpen !== null} as={React.Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setDialogOpen(null)}>
          <Transition.Child
            as={React.Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-150"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={React.Fragment}
                enter="ease-out duration-200"
                enterFrom="opacity-0 translate-y-4 scale-95"
                enterTo="opacity-100 translate-y-0 scale-100"
                leave="ease-in duration-150"
                leaveFrom="opacity-100 translate-y-0 scale-100"
                leaveTo="opacity-0 translate-y-4 scale-95"
              >
                <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title as="h3" className="text-xl font-bold mb-4 text-gray-800">
                    {getDialogContent().title}
                  </Dialog.Title>
                  <div className="h-96 overflow-auto whitespace-pre-wrap text-sm text-gray-700">
                    {getDialogContent().content}
                  </div>
                  <div className="mt-6 text-right">
                    <button
                      type="button"
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                      onClick={() => setDialogOpen(null)}
                    >
                      닫기
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </footer>
  );
}
