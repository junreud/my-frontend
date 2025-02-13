"use client";

import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { useState } from "react";

/**
 * 기본 모달 레이아웃 (사진 + 문장)
 */
export default function Page() {
  // 어떤 모달을 열지 구분하기 위한 state
  const [isOpen, setIsOpen] = useState(false);
  const [modalType, setModalType] = useState<"cheheomdan" | "gijadan" | null>(
    null
  );

  function openCheheomdan() {
    setModalType("cheheomdan");
    setIsOpen(true);
  }

  function openGijadan() {
    setModalType("gijadan");
    setIsOpen(true);
  }

  function close() {
    setIsOpen(false);
    setModalType(null);
  }

  // 모달에 들어갈 내용(예시)
  const content = {
    cheheomdan: {
      title: "체험단이란?",
      imgUrl: "/images/cheheomdan.png", // 임의로 경로 지정
      description:
        "체험단은 실제로 제품이나 서비스를 사용해본 후 후기를 작성하는 그룹입니다. (예시 설명)",
    },
    gijadan: {
      title: "기자단이란?",
      imgUrl: "/images/gijadan.png", // 임의로 경로 지정
      description:
        "기자단은 다양한 현장을 취재하고 기사를 작성하는 역할을 맡은 그룹입니다. (예시 설명)",
    },
  };

  // 현재 모달에 표시할 정보
  const currentContent = modalType ? content[modalType] : null;

  return (
    <>
      <section className="bg-black text-white px-6 py-8 sm:p-8">
        <div className="text-center text-base sm:text-lg">
          <span
            className="text-red-500 font-bold cursor-pointer mr-2"
            onClick={openCheheomdan}
          >
            체험단
          </span>
          /
          <span
            className="text-blue-500 font-bold cursor-pointer ml-2"
            onClick={openGijadan}
          >
            기자단
          </span>
          <p className="mt-2 text-sm sm:text-base">“무엇인지 궁금하다면 클릭!”</p>
        </div>
      </section>

      {/* Headless UI Dialog */}
      <Dialog
        open={isOpen}
        as="div"
        className="relative z-10 focus:outline-none"
        onClose={close}
      >
        <div className="fixed inset-0 bg-black/50" aria-hidden="true" />
        {/* 배경: 반투명 배경 (원하시면 삭제 가능) */}

        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          {/* Dialog 정중앙 배치 */}
          <div className="flex min-h-full items-center justify-center p-4">
            <DialogPanel
              // 기본 Transition 효과
              transition
              className="w-full max-w-md rounded-xl bg-white/5 p-6 backdrop-blur-2xl duration-300 ease-out
                         data-[closed]:transform data-[closed]:scale-95 data-[closed]:opacity-0"
            >
              {/* 모달 상단 타이틀 */}
              <DialogTitle
                as="h3"
                className="text-lg font-semibold text-white mb-4"
              >
                {currentContent?.title ?? ""}
              </DialogTitle>

              {/* 이미지 + 본문 내용 */}
              {currentContent && (
                <div className="space-y-4 text-sm text-white/80">
                  {/* 이미지 */}
                  <img
                    src={currentContent.imgUrl}
                    alt={currentContent.title}
                    className="w-full h-auto rounded-md"
                  />

                  {/* 설명 문구 */}
                  <p>{currentContent.description}</p>
                </div>
              )}

              {/* 닫기 버튼 */}
              <div className="mt-6">
                <button
                  className="inline-flex items-center gap-2 rounded-md bg-gray-700 py-1.5 px-3 text-sm font-semibold text-white shadow-inner shadow-white/10 
                             hover:bg-gray-600 focus:outline-none focus:ring focus:ring-gray-300"
                  onClick={close}
                >
                  닫기
                </button>
              </div>
            </DialogPanel>
          </div>
        </div>
      </Dialog>
    </>
  );
}
