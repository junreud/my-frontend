"use client";

import { Tab } from "@headlessui/react";
import { Fragment } from "react";

export default function WorkMethod() {
  return (
    <section className="p-4">
      <h2 className="mb-4 text-xl font-semibold">작업방식</h2>

      {/* Headless UI의 Tab.Group으로 전체 탭을 감싸줍니다. */}
      <Tab.Group>
        <div className="flex">
          {/* ─────────── 왼쪽: Tab List ─────────── */}
          <Tab.List className="w-1/4 border-r pr-4">
            <ul className="space-y-2 text-sm">
              {/* 리워드 탭 */}
              <Tab as={Fragment}>
                {({ selected }) => (
                  <li
                    className={
                      selected
                        ? "font-black text-base cursor-pointer"
                        : "cursor-pointer"
                    }
                  >
                    리워드
                  </li>
                )}
              </Tab>

              {/* 블로그배포 탭 */}
              <Tab as={Fragment}>
                {({ selected }) => (
                  <li
                    className={
                      selected
                        ? "font-black text-base cursor-pointer"
                        : "cursor-pointer"
                    }
                  >
                    블로그배포
                  </li>
                )}
              </Tab>

              {/* 슬롯 탭 */}
              <Tab as={Fragment}>
                {({ selected }) => (
                  <li
                    className={
                      selected
                        ? "font-black text-base cursor-pointer"
                        : "cursor-pointer"
                    }
                  >
                    슬롯
                  </li>
                )}
              </Tab>
            </ul>
          </Tab.List>

          {/* ─────────── 오른쪽: Tab Panels ─────────── */}
          <Tab.Panels className="w-3/4 pl-4">
            {/* 리워드 패널 */}
            <Tab.Panel>
              <div className="mb-2 h-36 w-full bg-gray-300 flex items-center justify-center">
                <span className="text-gray-700">이미지 or 정보 (리워드)</span>
              </div>
              <p className="text-sm text-gray-700">
                리워드 작업 방식에 대한 설명이 들어갑니다.
              </p>
            </Tab.Panel>

            {/* 블로그배포 패널 */}
            <Tab.Panel>
              <div className="mb-2 h-36 w-full bg-gray-300 flex items-center justify-center">
                <span className="text-gray-700">이미지 or 정보 (블로그배포)</span>
              </div>
              <p className="text-sm text-gray-700">
                블로그배포 작업 방식에 대한 설명이 들어갑니다.
              </p>
            </Tab.Panel>

            {/* 슬롯 패널 */}
            <Tab.Panel>
              <div className="mb-2 h-36 w-full bg-gray-300 flex items-center justify-center">
                <span className="text-gray-700">이미지 or 정보 (슬롯)</span>
              </div>
              <p className="text-sm text-gray-700">
                슬롯 작업 방식에 대한 설명이 들어갑니다.
              </p>
            </Tab.Panel>
          </Tab.Panels>
        </div>
      </Tab.Group>
    </section>
  );
}
