"use client";

import { Dialog } from "@headlessui/react";
import { useState } from "react";
import Image from "next/image";

export default function Page() {
  // "cheheomdan" | "gijadan" | null 타입으로 지정
  const [isOpen, setIsOpen] = useState(false);
  const [modalType, setModalType] = useState<"cheheomdan" | "gijadan" | null>(null);

  const openCheheomdan = () => {
    setModalType("cheheomdan");
    setIsOpen(true);
  };

  const openGijadan = () => {
    setModalType("gijadan");
    setIsOpen(true);
  };

  const close = () => {
    setIsOpen(false);
    setModalType(null);
  };

  const content = {
    cheheomdan: {
      title: "체험단이란?",
      imgUrl: "/images/cheheomdan.png",
      description: "체험단은 실제로 제품, 서비스를 경험하고 후기를 공유하는 그룹입니다.",
    },
    gijadan: {
      title: "기자단이란?",
      imgUrl: "/images/gijadan.png",
      description: "기자단은 다양한 현장을 취재하고 기사를 작성하는 그룹입니다.",
    },
  };

  // modalType이 null이면 content[modalType] 접근 시 오류가 나므로 조건부로 사용
  const currentContent = modalType ? content[modalType] : null;

  return (
    <>
      <section className="text-center mt-8">
        <span onClick={openCheheomdan} className="cursor-pointer text-blue-500 px-2">
          체험단
        </span>
        /
        <span onClick={openGijadan} className="cursor-pointer text-green-500 px-2">
          기자단
        </span>
      </section>

      {/* Headless UI Dialog */}
      <Dialog open={isOpen} onClose={close}>
        {/* 어두운 배경 */}
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        {/* Dialog를 화면 중앙에 배치 */}
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            {/* modalType이 존재하면(즉 cheheomdan 혹은 gijadan일 때)만 내용 표시 */}
            {currentContent && (
              <>
                <Dialog.Title className="text-xl font-bold text-gray-900 mb-4">
                  {currentContent.title}
                </Dialog.Title>

                {/* 이미지 */}
                <Image
                  src={currentContent.imgUrl}
                  alt={currentContent.title}
                  width={400}
                  height={300}
                  className="rounded-md my-2 object-cover"
                />

                {/* 설명 문구 */}
                <p className="text-gray-800 mt-2">{currentContent.description}</p>

                {/* 닫기 버튼 */}
                <button
                  onClick={close}
                  className="mt-4 bg-gray-700 text-white px-4 py-2 rounded focus:outline-none"
                >
                  닫기
                </button>
              </>
            )}
          </Dialog.Panel>
        </div>
      </Dialog>

      {/* 임의로 하단에 두 개의 버튼을 배치해서 모달 열기 테스트 가능 */}
      <div className="flex justify-center mt-4 gap-2">
        <button 
          onClick={openCheheomdan}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          체험단 열기
        </button>
        <button 
          onClick={openGijadan}
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          기자단 열기
        </button>
      </div>
    </>
  );
}
