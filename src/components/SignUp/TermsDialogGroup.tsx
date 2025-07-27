import React from "react";
import { Dialog, Transition } from "@headlessui/react";

// 약관 전문 텍스트 (예시)
import { SERVICE_TERM_TEXT } from "@/app/terms/serviceTerm";
import { PRIVACY_TERM_TEXT } from "@/app/terms/privacyTerm";
import { AUTH_TERM_TEXT } from "@/app/terms/authTerm";
import { THIRD_PARTY_TERM_TEXT } from "@/app/terms/thirdPartyTerm";
import { MARKETING_TERM_TEXT } from "@/app/terms/marketingTerm";

// 부모에서 전달받는 타입
export type DialogOpenType =
  | "serviceTerm"
  | "privacyTerm"
  | "authTerm"
  | "thirdPartyTerm"
  | "marketingTerm"
  | null;

interface TermsDialogGroupProps {
  dialogOpen: DialogOpenType;
  setDialogOpen: (val: DialogOpenType) => void;
}

export default function TermsDialogGroup({
  dialogOpen,
  setDialogOpen,
}: TermsDialogGroupProps) {
  return (
    <>
      {/* (1) 서비스 이용약관 모달 */}
      <Transition appear show={dialogOpen === "serviceTerm"} as={React.Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setDialogOpen(null)}>
          <Transition.Child
            as={React.Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25"/>
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Transition.Child
                as={React.Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md rounded bg-white p-6 shadow-lg">
                  <Dialog.Title className="text-lg font-medium text-gray-900">
                    서비스 이용약관
                  </Dialog.Title>
                  <div className="mt-2 text-sm text-gray-600 whitespace-pre-wrap">
                    {SERVICE_TERM_TEXT}
                  </div>
                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={() => setDialogOpen(null)}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
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

      {/* (2) 개인정보 처리방침 모달 */}
      <Transition appear show={dialogOpen === "privacyTerm"} as={React.Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setDialogOpen(null)}>
          <Transition.Child
            as={React.Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25"/>
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Transition.Child
                as={React.Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md rounded bg-white p-6 shadow-lg">
                  <Dialog.Title className="text-lg font-medium text-gray-900">
                    개인정보 처리방침
                  </Dialog.Title>
                  <div className="mt-2 text-sm text-gray-600 whitespace-pre-wrap">
                    {PRIVACY_TERM_TEXT}
                  </div>
                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={() => setDialogOpen(null)}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
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

      {/* (3) 본인인증 관련 동의 모달 */}
      <Transition appear show={dialogOpen === "authTerm"} as={React.Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setDialogOpen(null)}>
          <Transition.Child
            as={React.Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25"/>
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Transition.Child
                as={React.Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md rounded bg-white p-6 shadow-lg">
                  <Dialog.Title className="text-lg font-medium text-gray-900">
                    본인인증 관련 동의
                  </Dialog.Title>
                  <div className="mt-2 text-sm text-gray-600 whitespace-pre-wrap">
                    {AUTH_TERM_TEXT}
                  </div>
                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={() => setDialogOpen(null)}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
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

      {/* (4) 개인정보 제3자 제공 동의 모달 */}
      <Transition appear show={dialogOpen === "thirdPartyTerm"} as={React.Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setDialogOpen(null)}>
          <Transition.Child
            as={React.Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25"/>
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Transition.Child
                as={React.Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md rounded bg-white p-6 shadow-lg">
                  <Dialog.Title className="text-lg font-medium text-gray-900">
                    개인정보 제3자 제공 동의
                  </Dialog.Title>
                  <div className="mt-2 text-sm text-gray-600 whitespace-pre-wrap">
                    {THIRD_PARTY_TERM_TEXT}
                  </div>
                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={() => setDialogOpen(null)}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
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

      {/* (5) 마케팅 동의 모달 */}
      <Transition appear show={dialogOpen === "marketingTerm"} as={React.Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setDialogOpen(null)}>
          <Transition.Child
            as={React.Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25"/>
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Transition.Child
                as={React.Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md rounded bg-white p-6 shadow-lg">
                  <Dialog.Title className="text-lg font-medium text-gray-900">
                    마케팅 및 광고성 정보 수신 동의
                  </Dialog.Title>
                  <div className="mt-2 text-sm text-gray-600 whitespace-pre-wrap">
                    {MARKETING_TERM_TEXT}
                  </div>
                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={() => setDialogOpen(null)}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
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
    </>
  );
}
